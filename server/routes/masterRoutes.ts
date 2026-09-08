import { Router } from 'express';
import { db } from '../repositories/db';
import { capacityService } from '../services/capacityService';

const router = Router();

// List all crops
router.get('/crops', (req, res) => {
  const crops = db.getCrops().filter((c) => c.activeStatus);
  res.json({ success: true, crops });
});

// List all procurement centres
router.get('/centres', (req, res) => {
  const centres = db.getCentres();
  res.json({ success: true, centres });
});

// Get dynamic 2-hour capacity slots for centre on a given date
router.get('/centres/:id/slots', (req, res) => {
  const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const slots = capacityService.getCentreSlotsForDate(req.params.id, dateStr);
  res.json({ success: true, centreId: req.params.id, date: dateStr, slots });
});

// Get specific centre details
router.get('/centres/:id', (req, res) => {
  const centre = db.getCentreById(req.params.id);
  if (!centre) {
    return res.status(404).json({ success: false, error: 'Procurement centre not found' });
  }
  res.json({ success: true, centre });
});

export default router;
