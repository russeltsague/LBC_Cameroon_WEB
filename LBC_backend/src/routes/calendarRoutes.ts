import express from 'express';
import { requireAdminAuth } from '../middleware/authMiddleware';
import {
  getCalendars,
  getCalendar,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  updateMatchScore,
  migrateCalendarScores,
  recalculateAllStats
} from '../controllers/calendarController';

const router = express.Router();

// Get all calendars
router.get('/', requireAdminAuth, getCalendars);

// Get calendar by category
router.get('/:category', requireAdminAuth, getCalendar);

// Create new calendar
router.post('/', requireAdminAuth, createCalendar);

// Update match score in calendar - must come before /:id route
router.put('/match-score', requireAdminAuth, updateMatchScore);

// Update calendar
router.put('/:id', requireAdminAuth, updateCalendar);

// Delete calendar
router.delete('/:id', requireAdminAuth, deleteCalendar);

// Migration endpoint
router.post('/migrate-scores', requireAdminAuth, migrateCalendarScores);

// Recalculate all stats endpoint
router.post('/recalculate-all-stats', requireAdminAuth, recalculateAllStats);

export default router;
