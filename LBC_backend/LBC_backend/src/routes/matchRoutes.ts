import express from 'express';
import {
  getAllMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  generateCompetitionSchedule,
} from '../controllers/matchController';

const router = express.Router();

// Get all matches with optional category filter
router.get('/', getAllMatches);

// Get a single match
router.get('/:id', getMatch);

// Create a new match
router.post('/', createMatch);

// Update a match
router.put('/:id', updateMatch);

// Delete a match
router.delete('/:id', deleteMatch);

// Generate competition schedule
router.post('/generate-schedule', generateCompetitionSchedule);

export default router;
