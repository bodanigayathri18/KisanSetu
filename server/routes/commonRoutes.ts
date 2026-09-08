import { Router } from 'express';
import { db } from '../repositories/db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { forecastingService, matchingService, assistantService } from '../services/futureServices';
import { Dispute } from '../../src/shared/types';

const router = Router();

// Get current user's notifications
router.get('/notifications', (req: AuthenticatedRequest, res) => {
  const userId = req.user ? req.user.id : 'user_farmer_1';
  const notifs = db.getNotifications(userId);
  const unreadCount = notifs.filter((n) => !n.read).length;
  res.json({ success: true, notifications: notifs, unreadCount });
});

// Mark single notification as read
router.patch('/notifications/:id/read', (req: AuthenticatedRequest, res) => {
  const userId = req.user ? req.user.id : 'user_farmer_1';
  const success = db.markNotificationAsRead(req.params.id, userId);
  res.json({ success });
});

// Mark all as read
router.post('/notifications/read-all', (req: AuthenticatedRequest, res) => {
  const userId = req.user ? req.user.id : 'user_farmer_1';
  const count = db.markAllNotificationsAsRead(userId);
  res.json({ success: true, markedCount: count });
});

// List disputes / grievances
router.get('/disputes', (req: AuthenticatedRequest, res) => {
  const userId = req.user ? req.user.id : 'user_farmer_1';
  const disputes = db.getDisputes(userId);
  res.json({ success: true, disputes });
});

// File dispute / grievance
router.post('/disputes', (req: AuthenticatedRequest, res) => {
  const { title, category = 'OTHER', description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, error: 'Title and description are required' });
  }

  const dispute: Dispute = {
    id: `disp_${Date.now()}`,
    ticketNumber: `DSP-${Date.now().toString().slice(-5)}`,
    userId: req.user ? req.user.id : 'guest_farmer',
    userRole: req.user ? req.user.role : 'FARMER',
    title,
    category,
    description,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  const saved = db.addDispute(dispute);
  res.status(201).json({ success: true, dispute: saved, message: 'Grievance ticket created successfully.' });
});

// Future AI Hook: Demand / Arrival Forecasting
router.get('/ai/forecast', requireAuth, async (req, res) => {
  const centreId = (req.query.centreId as string) || 'centre_suryapet';
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const forecast = await forecastingService.getArrivalForecast(centreId, date);
  res.json({ success: true, forecast });
});

// Future AI Hook: Farmer Assistant
router.post('/ai/assistant', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { prompt } = req.body;
  const reply = await assistantService.queryFarmerAssistant(
    prompt || 'When should I bring my paddy produce?',
    req.user!.preferredLanguage
  );
  res.json({ success: true, reply });
});

export default router;
