import express from 'express';
import {
  getTeamStatistics,
  getCategoryStatistics,
  getDashboardMetrics,
  getLeagueStatistics,
  getTeamTrends
} from '../controllers/statisticsController';

const router = express.Router();

// Dashboard metrics
router.get('/dashboard', getDashboardMetrics);

// League statistics
router.get('/league', getLeagueStatistics);

// Team statistics
router.get('/team/:teamId', getTeamStatistics);

// Team trends
router.get('/team/:teamId/trends', getTeamTrends);

// Category statistics
router.get('/category/:category', getCategoryStatistics);

export default router;
