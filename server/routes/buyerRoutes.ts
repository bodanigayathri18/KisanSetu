import { Router } from 'express';
import { db } from '../repositories/db';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { matchingService } from '../services/futureServices';
import { Transaction } from '../../src/shared/types';

const router = Router();

// Enforce Buyer role
router.use(requireRole('BUYER'));

// Buyer dashboard summary
router.get('/dashboard', (req: AuthenticatedRequest, res) => {
  const buyer = req.user!;
  const buyerProfile = db.getBuyerProfile(buyer.id);

  const allAvailableListings = db.getProduceListings({ status: 'AVAILABLE' });
  const buyerOrders = db.getTransactions({ buyerId: buyer.id });

  const totalPurchasedQuintals = buyerOrders.reduce((sum, o) => sum + o.quantityQuintals, 0);
  const totalSpend = buyerOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Group available by crop
  const cropSummary: Record<string, { cropName: string; availableQuintals: number; lotsCount: number }> = {};
  for (const item of allAvailableListings) {
    if (!cropSummary[item.cropId]) {
      cropSummary[item.cropId] = { cropName: item.cropName, availableQuintals: 0, lotsCount: 0 };
    }
    cropSummary[item.cropId].availableQuintals += item.quantityQuintals;
    cropSummary[item.cropId].lotsCount += 1;
  }

  res.json({
    success: true,
    buyer,
    buyerProfile,
    stats: {
      availableLotsCount: allAvailableListings.length,
      myOrdersCount: buyerOrders.length,
      totalPurchasedQuintals,
      totalSpend,
    },
    cropSummary: Object.values(cropSummary),
    recentOrders: buyerOrders.slice(0, 5),
    featuredListings: allAvailableListings.slice(0, 4),
  });
});

// Browse listings with filters
router.get('/listings', (req: AuthenticatedRequest, res) => {
  const { cropId, district, centreId, minQty, maxQty, grade } = req.query;

  let listings = db.getProduceListings({
    cropId: cropId as string | undefined,
    district: district as string | undefined,
    centreId: centreId as string | undefined,
    status: 'AVAILABLE',
  });

  if (minQty) {
    listings = listings.filter((l) => l.quantityQuintals >= Number(minQty));
  }
  if (maxQty) {
    listings = listings.filter((l) => l.quantityQuintals <= Number(maxQty));
  }
  if (grade) {
    listings = listings.filter((l) => l.qualityGrade === grade);
  }

  res.json({ success: true, count: listings.length, listings });
});

// Single listing details
router.get('/listings/:id', (req: AuthenticatedRequest, res) => {
  const listing = db.getProduceListingById(req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, error: 'Produce listing not found' });
  }

  const centre = db.getCentreById(listing.procurementCentreId);
  const crop = db.getCropById(listing.cropId);

  res.json({
    success: true,
    listing,
    centre,
    crop,
  });
});

// Buyer matched recommendations (via matchingService AI-ready boundary)
router.get('/recommended-matches', async (req: AuthenticatedRequest, res) => {
  const matches = await matchingService.matchProduceForBuyer(req.user!.id);
  res.json({ success: true, matches });
});

// Execute purchase / order request
router.post('/purchase', async (req: AuthenticatedRequest, res) => {
  const { listingId, quantityQuintals, offerPricePerQuintal, deliveryNotes = '' } = req.body;
  const listing = db.getProduceListingById(listingId);

  if (!listing) {
    return res.status(404).json({ success: false, error: 'Listing not found' });
  }

  if (listing.status !== 'AVAILABLE') {
    return res.status(400).json({
      success: false,
      error: `This produce lot is currently ${listing.status} and cannot be purchased.`,
    });
  }

  const qty = Number(quantityQuintals) || listing.quantityQuintals;
  if (qty <= 0 || qty > listing.quantityQuintals) {
    return res.status(400).json({
      success: false,
      error: `Invalid purchase quantity. Available quantity is ${listing.quantityQuintals} Quintals.`,
    });
  }

  const rate = Number(offerPricePerQuintal) || listing.pricePerQuintal;
  const totalAmount = qty * rate;
  const buyer = req.user!;
  const buyerProfile = db.getBuyerProfile(buyer.id);

  // Mark listing as SOLD (or adjust quantity if partial)
  if (qty >= listing.quantityQuintals) {
    db.updateProduceListing(listing.id, { status: 'SOLD' });
  } else {
    db.updateProduceListing(listing.id, {
      quantityQuintals: listing.quantityQuintals - qty,
    });
  }

  // Create purchase transaction
  const txnId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const referenceNo = `INV-BYR-${Date.now().toString().slice(-6)}`;
  const txn: Transaction = {
    id: txnId,
    referenceNo,
    type: 'BUYER_PURCHASE',
    listingId: listing.id,
    farmerId: listing.farmerId,
    farmerName: listing.farmerMaskedName,
    buyerId: buyer.id,
    buyerBusinessName: buyerProfile?.businessName || buyer.name,
    procurementCentreId: listing.procurementCentreId,
    procurementCentreName: listing.procurementCentreName,
    cropId: listing.cropId,
    cropName: listing.cropName,
    quantityQuintals: qty,
    unit: 'Quintal',
    ratePerQuintal: rate,
    totalAmount,
    paymentStatus: 'PAID',
    paymentMethod: 'Agri-Escrow Direct Settlement',
    utrNumber: `ESCROW${Date.now()}`,
    transactionDate: new Date().toISOString().split('T')[0],
  };

  const savedTxn = db.addTransaction(txn);

  // Notify Buyer
  await notificationService.sendNotification(
    buyer.id,
    `Purchase Confirmed: ${listing.cropName}`,
    `Purchase of ${qty} Quintals of ${listing.cropName} from ${listing.procurementCentreName} confirmed. Invoice #${referenceNo} generated. Total: ₹${totalAmount.toLocaleString('en-IN')}.`,
    'BUYER_REQUEST',
    { txnId: savedTxn.id, referenceNo }
  );

  // Notify Farmer (if linked)
  if (listing.farmerId) {
    await notificationService.sendNotification(
      listing.farmerId,
      `Buyer Interest & Secondary Purchase Realized`,
      `Lot ${listing.cropName} procured at ${listing.procurementCentreName} was successfully allocated to certified wholesale buyer ${buyerProfile?.businessName || 'Agri Buyer'}.`,
      'BUYER_REQUEST'
    );
  }

  res.status(201).json({
    success: true,
    transaction: savedTxn,
    message: `Purchase confirmed! Invoice ${referenceNo} has been generated.`,
  });
});

// Buyer order history
router.get('/orders', (req: AuthenticatedRequest, res) => {
  const orders = db.getTransactions({ buyerId: req.user!.id });
  res.json({ success: true, count: orders.length, orders });
});

// Update buyer profile
router.post('/profile', (req: AuthenticatedRequest, res) => {
  const { businessName, businessType, location, gstNumber, contactEmail, contactPhone } = req.body;
  const existing = db.getBuyerProfile(req.user!.id);

  const updated = db.addOrUpdateBuyerProfile({
    id: existing?.id || `prof_${req.user!.id}`,
    userId: req.user!.id,
    businessName: businessName || existing?.businessName || `${req.user!.name} Traders`,
    businessType: businessType || existing?.businessType || 'Wholesaler',
    location: location || existing?.location || req.user!.location,
    gstNumber: gstNumber || existing?.gstNumber || '36AABCS1429B1Z8',
    contactEmail: contactEmail || existing?.contactEmail || req.user!.email,
    contactPhone: contactPhone || existing?.contactPhone || req.user!.phone,
  });

  res.json({ success: true, profile: updated });
});

export default router;
