import express from 'express';
import { updateTeamStatsFromCalendar } from '../services/teamStatsService';

const router = express.Router();

// Test team stats update
router.post('/team-stats', async (req, res) => {
  try {
    const { category } = req.body;
    console.log(`Test: Updating team stats for category: ${category}`);
    
    await updateTeamStatsFromCalendar(category);
    
    res.json({
      success: true,
      message: `Team stats updated for category: ${category}`
    });
  } catch (error: any) {
    console.error('Test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
