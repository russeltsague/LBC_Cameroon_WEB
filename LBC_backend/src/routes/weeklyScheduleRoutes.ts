import { Router } from 'express';
import {
  getAllWeeklySchedules,
  getWeeklySchedulesByDateRange,
  createWeeklySchedule,
  updateWeeklySchedule,
  deleteWeeklySchedule,
  addMatchToSchedule,
  updateMatchInSchedule,
  removeMatchFromSchedule,
  saveWeeklyScheduleAsMatches
} from '../controllers/weeklyScheduleController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

/**
 * Weekly Schedule Routes
 */

// Get all weekly schedules
router.get('/', getAllWeeklySchedules);

// Get weekly schedules by date range
router.get('/range', getWeeklySchedulesByDateRange);

// Create a new weekly schedule
router.post('/', createWeeklySchedule);

// Update a weekly schedule
router.put('/:id', updateWeeklySchedule);

// Delete a weekly schedule
router.delete('/:id', deleteWeeklySchedule);

// Add a match to a weekly schedule
router.post('/:id/matches', addMatchToSchedule);

// Update a match in a weekly schedule
router.put('/:id/matches/:matchId', updateMatchInSchedule);

// Remove a match from a weekly schedule
router.delete('/:id/matches/:matchId', removeMatchFromSchedule);

// Save weekly schedule as actual matches
router.post('/:id/save-matches', saveWeeklyScheduleAsMatches);

export default router;
