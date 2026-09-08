import { Router } from 'express';
import { db } from '../repositories/db';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { recommendationService } from '../services/recommendationService';
import { notificationService } from '../services/notificationService';
import { capacityService } from '../services/capacityService';
import { Token, TokenCrop } from '../../src/shared/types';

const router = Router();

// Enforce farmer authorization
router.use(requireRole('FARMER'));

// Dashboard summary
router.get('/dashboard', async (req: AuthenticatedRequest, res) => {
  const farmer = req.user!;
  const profile = db.getFarmerProfile(farmer.id);
  const preferredCentreId = profile?.preferredCentreId || 'centre_suryapet';
  const centre = db.getCentreById(preferredCentreId) || db.getCentres()[0];

  const tokens = db.getTokens({ farmerId: farmer.id });
  const activeToken = db.getActiveTokenForFarmer(farmer.id);
  const transactions = db.getTransactions({ farmerId: farmer.id });
  const produce = db.getProduceListings().filter((p) => p.farmerId === farmer.id);

  // Default recommendation for preferred centre
  const recommendation = await recommendationService.getGoWaitRecommendation({
    centreId: centre?.id || 'centre_suryapet',
    farmerId: farmer.id,
  });

  const totalEarnings = transactions
    .filter((t) => t.paymentStatus === 'PAID')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  res.json({
    success: true,
    farmer,
    profile,
    activeToken,
    recentTokens: tokens.slice(0, 5),
    totalTokensCount: tokens.length,
    totalEarnings,
    recentTransactions: transactions.slice(0, 5),
    submittedProduceCount: produce.length,
    recommendation,
    preferredCentre: centre,
  });
});

// GO / WAIT Recommendation
router.get('/recommendation', async (req: AuthenticatedRequest, res) => {
  const centreId = (req.query.centreId as string) || req.farmerProfile?.preferredCentreId || 'centre_suryapet';
  const cropId = req.query.cropId as string | undefined;

  const result = await recommendationService.getGoWaitRecommendation({
    centreId,
    cropId,
    farmerId: req.user!.id,
  });

  res.json({ success: true, recommendation: result });
});

// Farmer's tokens
router.get('/tokens', (req: AuthenticatedRequest, res) => {
  const tokens = db.getTokens({ farmerId: req.user!.id });
  const activeToken = db.getActiveTokenForFarmer(req.user!.id);
  res.json({ success: true, tokens, activeToken });
});

// Book token (Supports MULTIPLE CROPS per token)
router.post('/tokens', async (req: AuthenticatedRequest, res) => {
  const farmer = req.user!;
  const profile = db.getFarmerProfile(farmer.id);

  // Business Rule: A farmer should have only one active token at a time
  const existingActive = db.getActiveTokenForFarmer(farmer.id);
  if (existingActive) {
    // If the active token was created in the last 5 minutes and matches the centre,
    // treat this as an idempotent retry/duplicate submission and return the existing token
    const tokenAgeMs = Date.now() - new Date(existingActive.createdAt).getTime();
    if (tokenAgeMs < 5 * 60 * 1000) {
      return res.status(200).json({
        success: true,
        token: existingActive,
        message: `Digital Token ${existingActive.tokenNumber} is already confirmed for this booking.`,
        wasExisting: true,
      });
    }

    return res.status(400).json({
      success: false,
      error: `Active Mandi Token Already in Progress. You have active token #${existingActive.tokenNumber} in status '${existingActive.status}' at ${existingActive.procurementCentreName}. You can only book a new slot after your current token is completed or cancelled.`,
      activeToken: existingActive,
    });
  }

  const {
    procurementCentreId,
    bookingDate = new Date().toISOString().split('T')[0],
    timeSlot = '10:00 AM - 11:30 AM',
    crops: inputCrops, // Array of { cropId, quantityQuintals }
    notes = '',
  } = req.body;

  if (!procurementCentreId) {
    return res.status(400).json({ success: false, error: 'Procurement centre is required' });
  }

  const centre = db.getCentreById(procurementCentreId);
  if (!centre) {
    return res.status(404).json({ success: false, error: 'Selected procurement centre not found' });
  }

  if (centre.operatingStatus === 'CLOSED' || centre.operatingStatus === 'TEMPORARILY_CLOSED') {
    return res.status(400).json({
      success: false,
      error: `${centre.name} is currently ${centre.operatingStatus.replace('_', ' ')}. Token booking is disabled for this mandi today.`,
    });
  }

  // Check 2-hour dynamic window slot capacity (15-30 farmers/window)
  const slotCheck = capacityService.validateSlotAvailability(procurementCentreId, bookingDate, timeSlot);
  if (!slotCheck.available) {
    return res.status(400).json({
      success: false,
      error: slotCheck.reason || `Slot ${timeSlot} on ${bookingDate} is completely full. Please pick another available time slot.`,
    });
  }

  if (!Array.isArray(inputCrops) || inputCrops.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Please add at least one crop and quantity for this token booking.',
    });
  }

  // Validate and build token crops
  const tokenId = `token_${Date.now()}`;
  let totalQuantity = 0;
  let totalEstimatedValue = 0;
  const processedCrops: TokenCrop[] = [];

  for (let i = 0; i < inputCrops.length; i++) {
    const item = inputCrops[i];
    const crop = db.getCropById(item.cropId);
    if (!crop) {
      return res.status(400).json({ success: false, error: `Invalid crop ID: ${item.cropId}` });
    }

    const qty = Number(item.quantityQuintals);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        error: `Please specify a valid positive quantity for crop ${crop.name}`,
      });
    }

    const estimatedValue = qty * crop.mspPerQuintal;
    totalQuantity += qty;
    totalEstimatedValue += estimatedValue;

    processedCrops.push({
      id: `tc_${tokenId}_${i + 1}`,
      tokenId,
      cropId: crop.id,
      cropName: crop.name,
      quantityQuintals: qty,
      unit: 'Quintal',
      grade: item.grade || 'Grade A',
      mspPerQuintal: crop.mspPerQuintal,
      estimatedTotalValue: estimatedValue,
    });
  }

  // Generate unique token number
  const codePrefix = centre.code.split('-')[1] || 'MND';
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const tokenNumber = `TK-${codePrefix}-${randomSuffix}`;

  // Calculate queue position & wait time
  const existingQueue = db.getTokens({ centreId: centre.id }).filter(
    (t) => ['WAITING', 'CALLED', 'ARRIVED'].includes(t.status)
  );
  const queuePosition = existingQueue.length + 1;
  const estimatedWaitMinutes = Math.min(180, queuePosition * 12);

  const newToken: Token = {
    id: tokenId,
    farmerId: farmer.id,
    farmerName: farmer.name,
    farmerPhone: farmer.phone,
    farmerVillage: profile?.village || farmer.location || 'Local Village',
    procurementCentreId: centre.id,
    procurementCentreName: centre.name,
    tokenNumber,
    bookingDate,
    timeSlot,
    status: 'WAITING',
    queuePosition,
    estimatedWaitMinutes,
    crops: processedCrops,
    totalQuantityQuintals: totalQuantity,
    totalEstimatedValue: Math.round(totalEstimatedValue),
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const savedToken = db.addToken(newToken);

  // Send confirmation notification to farmer
  await notificationService.sendNotification(
    farmer.id,
    `Token Confirmed: ${tokenNumber}`,
    `Your token ${tokenNumber} for ${centre.name} on ${bookingDate} (${timeSlot}) is confirmed. Total Produce: ${totalQuantity} Quintals across ${processedCrops.length} crop(s). Queue #${queuePosition}.`,
    'TOKEN_CONFIRMATION',
    { tokenId: savedToken.id, tokenNumber }
  );

  res.status(201).json({
    success: true,
    token: savedToken,
    message: `Digital Token ${tokenNumber} generated successfully!`,
  });
});

// Cancel active token
router.post('/tokens/:id/cancel', async (req: AuthenticatedRequest, res) => {
  const token = db.getTokenById(req.params.id);
  if (!token) {
    return res.status(404).json({ success: false, error: 'Token not found' });
  }

  if (token.farmerId !== req.user!.id) {
    return res.status(403).json({ success: false, error: 'Unauthorized to cancel this token' });
  }

  if (token.status === 'COMPLETED') {
    return res.status(400).json({ success: false, error: 'Completed procurement tokens cannot be cancelled' });
  }

  if (token.status === 'PROCESSING') {
    return res.status(400).json({
      success: false,
      error: 'Produce is already under weighing/processing. Cancellation is no longer permitted.',
    });
  }

  const updated = db.updateToken(token.id, {
    status: 'CANCELLED',
    cancelledAt: new Date().toISOString(),
    cancellationReason: req.body.reason || 'Cancelled by farmer',
  });

  await notificationService.sendNotification(
    req.user!.id,
    `Token Cancelled: ${token.tokenNumber}`,
    `Your token booking ${token.tokenNumber} has been cancelled. You may now book a new token when ready.`,
    'TOKEN_STATUS',
    { tokenId: token.id }
  );

  res.json({
    success: true,
    token: updated,
    message: 'Token cancelled successfully. You can now book another token slot.',
  });
});

// Farmer's submitted produce listings
router.get('/produce', (req: AuthenticatedRequest, res) => {
  const listings = db.getProduceListings().filter((p) => p.farmerId === req.user!.id);
  res.json({ success: true, listings });
});

// Farmer's procurement transactions & earnings
router.get('/transactions', (req: AuthenticatedRequest, res) => {
  const txns = db.getTransactions({ farmerId: req.user!.id });
  const totalEarned = txns
    .filter((t) => t.paymentStatus === 'PAID')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const pendingPayments = txns
    .filter((t) => t.paymentStatus !== 'PAID')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  res.json({
    success: true,
    transactions: txns,
    stats: {
      totalEarned,
      pendingPayments,
      count: txns.length,
    },
  });
});

// Update farmer profile
router.post('/profile', (req: AuthenticatedRequest, res) => {
  const { village, district, state, preferredCentreId, landAcres, kisanCardNo, primaryCrops } = req.body;
  const existing = db.getFarmerProfile(req.user!.id);

  const updated = db.addOrUpdateFarmerProfile({
    id: existing?.id || `prof_${req.user!.id}`,
    userId: req.user!.id,
    village: village ?? existing?.village ?? 'Village',
    district: district ?? existing?.district ?? req.user!.district,
    state: state ?? existing?.state ?? req.user!.state,
    preferredCentreId: preferredCentreId ?? existing?.preferredCentreId ?? 'centre_suryapet',
    landAcres: Number(landAcres) || existing?.landAcres || 5,
    kisanCardNo: kisanCardNo ?? existing?.kisanCardNo,
    primaryCrops: primaryCrops ?? existing?.primaryCrops,
    totalEarnings: existing?.totalEarnings || 0,
  });

  res.json({ success: true, profile: updated });
});

export default router;
