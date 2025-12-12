import express from 'express';
import {
  generateSchedule,
  saveSchedule,
  getSchedulePreview,
  deleteSchedule
} from '../controllers/scheduleController';

const router = express.Router();

// Generate schedule preview
router.post('/generate', generateSchedule);

// Save generated schedule
router.post('/save', saveSchedule);

// Get schedule preview for category/poule
router.get('/preview/:category', getSchedulePreview);

// Delete schedule for category/poule
router.delete('/:category', deleteSchedule);

export default router;
