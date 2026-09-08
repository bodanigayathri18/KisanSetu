import { Router } from 'express';
import { db } from '../repositories/db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { User, UserRole } from '../../src/shared/types';
import { isValidLocation } from '../../src/shared/locations';

const router = Router();

// Demo accounts for instant 1-click switching
router.get('/demo-accounts', (req, res) => {
  const users = db.getUsers();
  const demoList = users.map((u) => {
    let subtitle = '';
    if (u.role === 'FARMER') {
      const prof = db.getFarmerProfile(u.id);
      subtitle = `${prof?.village || 'Village'}, ${prof?.district || 'District'} (${prof?.landAcres || 5} acres)${u.lowLiteracyMode ? ' • Low-Literacy Mode' : ''}`;
    } else if (u.role === 'PROCUREMENT_OFFICIAL') {
      const prof = db.getOfficialProfile(u.id);
      const centre = prof ? db.getCentreById(prof.procurementCentreId) : null;
      subtitle = `${prof?.designation || 'Official'} @ ${centre?.name || 'Mandi'}`;
    } else if (u.role === 'BUYER') {
      const prof = db.getBuyerProfile(u.id);
      subtitle = `${prof?.businessName || 'Business'} (${prof?.businessType || 'Buyer'})`;
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      preferredLanguage: u.preferredLanguage,
      lowLiteracyMode: u.lowLiteracyMode,
      subtitle,
    };
  });

  res.json({ success: true, accounts: demoList });
});

// Login
router.post('/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, error: 'Phone number or email is required' });
  }

  const user = db.getUserByPhoneOrEmail(identifier);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Account not found with this phone or email. Please check credentials or register.',
    });
  }

  const token = `ksc_sess_${user.id}`;
  const farmerProfile = user.role === 'FARMER' ? db.getFarmerProfile(user.id) : undefined;
  const officialProfile = user.role === 'PROCUREMENT_OFFICIAL' ? db.getOfficialProfile(user.id) : undefined;
  const buyerProfile = user.role === 'BUYER' ? db.getBuyerProfile(user.id) : undefined;

  res.json({
    success: true,
    token,
    user,
    farmerProfile,
    officialProfile,
    buyerProfile,
    message: `Welcome back, ${user.name}!`,
  });
});

// Switch demo user directly
router.post('/switch-demo', (req, res) => {
  const { userId } = req.body;
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Demo user not found' });
  }

  const token = `ksc_sess_${user.id}`;
  const farmerProfile = user.role === 'FARMER' ? db.getFarmerProfile(user.id) : undefined;
  const officialProfile = user.role === 'PROCUREMENT_OFFICIAL' ? db.getOfficialProfile(user.id) : undefined;
  const buyerProfile = user.role === 'BUYER' ? db.getBuyerProfile(user.id) : undefined;

  res.json({
    success: true,
    token,
    user,
    farmerProfile,
    officialProfile,
    buyerProfile,
  });
});

// Register
router.post('/register', (req, res) => {
  const {
    name,
    email,
    phone,
    role,
    preferredLanguage = 'en',
    lowLiteracyMode = false,
    district = 'Suryapet',
    mandal = '',
    village = '',
    state = 'Telangana',
    pattaPassbookNumber = '',
    businessName = '',
    businessType = 'Wholesaler',
    gstNumber = '',
    procurementCentreId = 'centre_suryapet',
    designation = 'Procurement Officer',
    landAcres = 5,
  } = req.body;

  if (!name || !phone || !role) {
    return res.status(400).json({ success: false, error: 'Name, phone number, and role are required.' });
  }

  // Check location validity
  if (!isValidLocation(district, mandal || undefined, village || undefined)) {
    return res.status(400).json({
      success: false,
      error: `Please select a valid location from the official Telangana hierarchy (District: ${district}).`,
    });
  }

  // Farmer specific validations
  if (role === 'FARMER') {
    // 1. Land size validation: must be a non-negative number
    const numericLand = Number(landAcres);
    if (isNaN(numericLand) || numericLand < 0) {
      return res.status(400).json({
        success: false,
        error: 'Land size cannot be negative. Please enter a valid number of acres (0 or greater).',
      });
    }

    // 2. Passbook requirement: Patta passbook number is mandatory
    if (!pattaPassbookNumber || !String(pattaPassbookNumber).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Patta passbook number is required for farmer registration.',
      });
    }
  }

  // Check existing user
  if (db.getUserByPhoneOrEmail(phone) || (email && db.getUserByPhoneOrEmail(email))) {
    return res.status(409).json({ success: false, error: 'An account with this phone or email already exists.' });
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newUser: User = {
    id: userId,
    name: String(name).trim(),
    email: email ? String(email).trim() : `${phone}@kisanconnect.gov.in`,
    phone: String(phone).trim(),
    role: role as UserRole,
    preferredLanguage,
    lowLiteracyMode: Boolean(lowLiteracyMode),
    location: village ? `${village}, ${mandal ? mandal + ', ' : ''}${district}` : district,
    district,
    mandal,
    village,
    state,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addUser(newUser);

  // Create associated profile
  let farmerProfile;
  let officialProfile;
  let buyerProfile;

  if (role === 'FARMER') {
    const validLandAcres = Math.max(0, Number(landAcres) || 0);
    farmerProfile = db.addOrUpdateFarmerProfile({
      id: `prof_${userId}`,
      userId,
      village: village || 'Local Village',
      mandal: mandal || '',
      district,
      state,
      preferredCentreId: procurementCentreId || 'centre_suryapet',
      landAcres: validLandAcres,
      landSizeAcres: validLandAcres,
      pattaPassbookNumber: String(pattaPassbookNumber).trim().toUpperCase(),
      passbookStatus: 'PROVIDED',
      totalEarnings: 0,
    });
  } else if (role === 'PROCUREMENT_OFFICIAL') {
    officialProfile = db.addOrUpdateOfficialProfile({
      id: `prof_${userId}`,
      userId,
      procurementCentreId: procurementCentreId || 'centre_suryapet',
      designation: designation || 'Procurement Officer',
      permissions: ['VERIFY_TOKEN', 'UPDATE_CAPACITY', 'CALL_TOKEN', 'COMPLETE_PROCUREMENT'],
    });
  } else if (role === 'BUYER') {
    buyerProfile = db.addOrUpdateBuyerProfile({
      id: `prof_${userId}`,
      userId,
      businessName: businessName || `${name} Agri Ventures`,
      businessType: (businessType as any) || 'Wholesaler',
      location: `${district}, ${state}`,
      gstNumber: gstNumber || `36${Math.random().toString(36).substring(2, 7).toUpperCase()}1Z4`,
      contactEmail: email || `${phone}@buyer.com`,
      contactPhone: phone,
    });
  }

  const token = `ksc_sess_${newUser.id}`;

  res.status(201).json({
    success: true,
    token,
    user: newUser,
    farmerProfile,
    officialProfile,
    buyerProfile,
    message: 'Account registered successfully!',
  });
});

// Current user profile
router.get('/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.json({
      success: true,
      authenticated: false,
      user: null,
      farmerProfile: null,
      officialProfile: null,
      buyerProfile: null,
    });
  }

  res.json({
    success: true,
    authenticated: true,
    user: req.user,
    farmerProfile: req.farmerProfile || null,
    officialProfile: req.officialProfile || null,
    buyerProfile: req.buyerProfile || null,
  });
});

// Update settings (language, low literacy mode)
router.patch('/settings', (req: AuthenticatedRequest, res) => {
  const targetUser = req.user || db.getUserById('user_farmer_1');
  if (!targetUser) {
    return res.json({ success: true, message: 'Settings saved locally' });
  }

  const { preferredLanguage, lowLiteracyMode } = req.body;
  const updates: Partial<User> = {};
  if (preferredLanguage) updates.preferredLanguage = preferredLanguage;
  if (typeof lowLiteracyMode === 'boolean') updates.lowLiteracyMode = lowLiteracyMode;

  const updated = db.updateUser(targetUser.id, updates);
  res.json({ success: true, user: updated || targetUser });
});

// Reset demo data
router.post('/reset-demo', (req, res) => {
  db.resetDemoData();
  res.json({ success: true, message: 'Demo data has been reset to initial seed values' });
});

export default router;
