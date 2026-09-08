import { Router } from 'express';
import { db } from '../repositories/db';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { TokenStatus, OperatingStatus, Transaction, ProduceListing } from '../../src/shared/types';

const router = Router();

// Enforce official role
router.use(requireRole('PROCUREMENT_OFFICIAL'));

// Get official's assigned centre helper
function getAssignedCentre(req: AuthenticatedRequest) {
  const profile = db.getOfficialProfile(req.user!.id);
  const centreId = profile?.procurementCentreId || 'centre_suryapet';
  return db.getCentreById(centreId);
}

// Official dashboard
router.get('/dashboard', (req: AuthenticatedRequest, res) => {
  const centre = getAssignedCentre(req);
  if (!centre) {
    return res.status(404).json({ success: false, error: 'Assigned procurement centre not found' });
  }

  const allTokens = db.getTokens({ centreId: centre.id });
  const activeQueue = allTokens.filter((t) =>
    ['WAITING', 'CALLED', 'ARRIVED', 'PROCESSING'].includes(t.status)
  );

  // Compute crop-wise incoming quantities
  const cropMap: Record<string, { cropName: string; totalQuintals: number; tokenCount: number }> = {};
  for (const token of activeQueue) {
    for (const c of token.crops) {
      if (!cropMap[c.cropId]) {
        cropMap[c.cropId] = { cropName: c.cropName, totalQuintals: 0, tokenCount: 0 };
      }
      cropMap[c.cropId].totalQuintals += c.quantityQuintals;
      cropMap[c.cropId].tokenCount += 1;
    }
  }

  const cropSummaries = Object.values(cropMap);

  // Today's stats
  const completedToday = allTokens.filter((t) => t.status === 'COMPLETED').length;
  const waitingCount = allTokens.filter((t) => t.status === 'WAITING').length;
  const calledCount = allTokens.filter((t) => t.status === 'CALLED').length;
  const processingCount = allTokens.filter((t) => t.status === 'PROCESSING').length;

  res.json({
    success: true,
    centre,
    stats: {
      totalTokens: allTokens.length,
      activeQueueCount: activeQueue.length,
      waitingCount,
      calledCount,
      processingCount,
      completedToday,
      capacityUtilizationPercent: Math.min(
        100,
        Math.round((centre.currentLoadQuintals / centre.dailyCapacityQuintals) * 100)
      ),
    },
    cropSummaries,
    activeQueue,
  });
});

// All tokens for official's centre
router.get('/tokens', (req: AuthenticatedRequest, res) => {
  const centre = getAssignedCentre(req);
  if (!centre) {
    return res.status(404).json({ success: false, error: 'Assigned procurement centre not found' });
  }

  const status = req.query.status as string | undefined;
  const tokens = db.getTokens({ centreId: centre.id, status });
  res.json({ success: true, tokens, centre });
});

// Update token status (WAITING -> CALLED -> ARRIVED -> PROCESSING -> COMPLETED / CANCELLED)
router.patch('/tokens/:id/status', async (req: AuthenticatedRequest, res) => {
  const centre = getAssignedCentre(req);
  const token = db.getTokenById(req.params.id);

  if (!token) {
    return res.status(404).json({ success: false, error: 'Token not found' });
  }

  // Security: Official can only update tokens at their assigned centre
  if (token.procurementCentreId !== centre?.id) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized: Officials can only manage tokens belonging to their assigned procurement centre.',
    });
  }

  const { status, notes, weighbridgeNo = '3', moistureReading = 14.5 } = req.body;
  const validStatuses: TokenStatus[] = ['WAITING', 'CALLED', 'ARRIVED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status '${status}'` });
  }

  const updates: Partial<typeof token> = {
    status,
    notes: notes || token.notes,
  };

  if (status === 'CALLED') {
    updates.queuePosition = 1;
    updates.estimatedWaitMinutes = 5;
  } else if (status === 'ARRIVED') {
    updates.arrivalConfirmedAt = new Date().toISOString();
  } else if (status === 'PROCESSING') {
    updates.processingStartedAt = new Date().toISOString();
  } else if (status === 'COMPLETED') {
    updates.completedAt = new Date().toISOString();
    updates.queuePosition = 0;
  } else if (status === 'CANCELLED') {
    updates.cancelledAt = new Date().toISOString();
  }

  const updatedToken = db.updateToken(token.id, updates);

  // Notifications and ecosystem transactions upon status transitions:
  if (status === 'CALLED') {
    await notificationService.sendNotification(
      token.farmerId,
      `Token CALLED: Proceed to Weighbridge #${weighbridgeNo}`,
      `Your token ${token.tokenNumber} has been called at ${centre.name}. Please proceed with your vehicle to Weighbridge #${weighbridgeNo} immediately.`,
      'TOKEN_STATUS',
      { tokenId: token.id, tokenNumber: token.tokenNumber }
    );
  } else if (status === 'COMPLETED') {
    // 1. Generate procurement transaction for the farmer
    for (const cropItem of token.crops) {
      const txn: Transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        referenceNo: `TXN-KSC-${Date.now().toString().slice(-6)}`,
        type: 'PROCUREMENT',
        tokenId: token.id,
        farmerId: token.farmerId,
        farmerName: token.farmerName,
        officialId: req.user!.id,
        procurementCentreId: centre.id,
        procurementCentreName: centre.name,
        cropId: cropItem.cropId,
        cropName: cropItem.cropName,
        quantityQuintals: cropItem.quantityQuintals,
        unit: 'Quintal',
        ratePerQuintal: cropItem.mspPerQuintal,
        totalAmount: cropItem.estimatedTotalValue,
        paymentStatus: 'PAID',
        paymentMethod: 'Direct DBT Bank Transfer',
        utrNumber: `DBT${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
        transactionDate: new Date().toISOString().split('T')[0],
      };
      db.addTransaction(txn);

      // 2. Add verified lot to produce_listings for BUYERS to discover (Bridging the Ecosystem!)
      const listing: ProduceListing = {
        id: `lot_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        farmerId: token.farmerId,
        farmerMaskedName: `Farmer ${token.farmerName.charAt(0)}. (${token.farmerVillage})`,
        procurementCentreId: centre.id,
        procurementCentreName: centre.name,
        district: centre.district,
        state: centre.state,
        cropId: cropItem.cropId,
        cropName: cropItem.cropName,
        category: (db.getCropById(cropItem.cropId)?.category as any) || 'CEREALS',
        quantityQuintals: cropItem.quantityQuintals,
        unit: 'Quintal',
        pricePerQuintal: cropItem.mspPerQuintal + 25, // Fair market discovery price
        qualityGrade: (cropItem.grade as any) || 'Grade A',
        moistureContentPercent: Number(moistureReading) || 14.2,
        status: 'AVAILABLE',
        procuredDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      db.addProduceListing(listing);
    }

    // 3. Notify farmer of completion and DBT transfer
    await notificationService.sendNotification(
      token.farmerId,
      `Procurement Completed & Payment Dispatched: ${token.tokenNumber}`,
      `Procurement weighing completed successfully at ${centre.name}. Total ₹${token.totalEstimatedValue.toLocaleString('en-IN')} approved for Direct Benefit Transfer (DBT). Quality slip issued.`,
      'PAYMENT_RECEIVED',
      { tokenId: token.id, amount: token.totalEstimatedValue }
    );
  }

  res.json({
    success: true,
    token: updatedToken,
    message: `Token ${token.tokenNumber} marked as ${status}`,
  });
});

// Update procurement centre operational status & capacity
router.patch('/centre/operational', (req: AuthenticatedRequest, res) => {
  const centre = getAssignedCentre(req);
  if (!centre) {
    return res.status(404).json({ success: false, error: 'Assigned procurement centre not found' });
  }

  const {
    operatingStatus,
    dailyCapacityQuintals,
    dailyTokenLimit,
    availableTokenSlots,
    windowCapacity,
    estimatedWaitingTimeMinutes,
    contactPhone,
    operatingHours,
  } = req.body;

  const updates: Partial<typeof centre> = {};
  if (operatingStatus) updates.operatingStatus = operatingStatus as OperatingStatus;
  if (dailyCapacityQuintals) updates.dailyCapacityQuintals = Number(dailyCapacityQuintals);
  if (dailyTokenLimit) updates.dailyTokenLimit = Number(dailyTokenLimit);
  if (windowCapacity) updates.windowCapacity = Math.max(5, Math.min(60, Number(windowCapacity)));
  if (typeof availableTokenSlots === 'number') updates.availableTokenSlots = Number(availableTokenSlots);
  if (typeof estimatedWaitingTimeMinutes === 'number') {
    updates.estimatedWaitingTimeMinutes = Number(estimatedWaitingTimeMinutes);
  }
  if (contactPhone) updates.contactPhone = contactPhone;
  if (operatingHours) updates.operatingHours = operatingHours;

  const updatedCentre = db.updateCentre(centre.id, updates);

  res.json({
    success: true,
    centre: updatedCentre,
    message: 'Operational parameters updated successfully. Live recommendations updated for farmers.',
  });
});

// Send broadcast notification to farmers waiting at this mandi
router.post('/broadcast', async (req: AuthenticatedRequest, res) => {
  const centre = getAssignedCentre(req);
  if (!centre) {
    return res.status(404).json({ success: false, error: 'Assigned procurement centre not found' });
  }

  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'Title and message are required' });
  }

  const count = await notificationService.broadcastToCentreFarmers(
    centre.id,
    title,
    message,
    'CENTRE_ALERT'
  );

  res.json({
    success: true,
    recipientsCount: count,
    message: `Broadcast message sent to ${count} active farmer(s) at ${centre.name}`,
  });
});

// Historical / Activity statistics
router.get('/stats', (req: AuthenticatedRequest, res) => {
  const centre = getAssignedCentre(req);
  if (!centre) {
    return res.status(404).json({ success: false, error: 'Assigned centre not found' });
  }

  const txns = db.getTransactions({ centreId: centre.id });
  const totalProcuredQuintals = txns.reduce((sum, t) => sum + t.quantityQuintals, 0);
  const totalDisbursedRupees = txns.reduce((sum, t) => sum + t.totalAmount, 0);

  res.json({
    success: true,
    centreName: centre.name,
    totalProcuredQuintals,
    totalDisbursedRupees,
    transactionsCount: txns.length,
    recentTransactions: txns.slice(0, 10),
  });
});

export default router;
