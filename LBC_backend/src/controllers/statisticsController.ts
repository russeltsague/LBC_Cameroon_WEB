import { Request, Response } from 'express';
import statisticsService from '../services/statisticsService';
import Classification from '../models/Classification';
import Match from '../models/Match';
import { statsEmitter } from '../services/statisticsService';

// Helper function to get formatted statistics
const getFormattedStatistics = async (category: string, poule?: string) => {
  const query: any = { category };
  if (poule) query.poule = poule;

  const [classification, recentMatches] = await Promise.all([
    Classification.find(query)
      .populate('team', 'name logo')
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 })
      .lean(),
    Match.find({
      ...query,
      status: 'completed',
      $or: [
        { homeScore: { $exists: true } },
        { awayScore: { $exists: true } }
      ]
    })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .sort({ date: -1 })
      .limit(5)
      .lean()
  ]);

  // Calculate statistics
  const totalMatches = await Match.countDocuments(query);
  const completedMatches = await Match.countDocuments({ 
    ...query, 
    status: 'completed' 
  });
  const upcomingMatches = await Match.countDocuments({ 
    ...query, 
    status: 'scheduled' 
  });
  const liveMatches = await Match.countDocuments({ 
    ...query, 
    status: 'in_progress' 
  });

  return {
    classification: classification.map(team => ({
      position: team.position,
      team: team.team,
      played: team.gamesPlayed,
      won: team.wins,
      drawn: team.draws,
      lost: team.losses,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalDifference,
      points: team.points,
      form: team.form,
      cleanSheets: team.cleanSheets,
      failedToScore: team.failedToScore
    })),
    recentMatches,
    summary: {
      totalTeams: classification.length,
      totalMatches,
      completedMatches,
      upcomingMatches,
      liveMatches,
      completionRate: totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0
    }
  };
};

/**
 * Get team statistics
 * GET /api/statistics/team/:teamId
 */
export const getTeamStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { category, poule } = req.query;

    const query: any = { team: teamId };
    if (category) query.category = category;
    if (poule) query.poule = poule;

    const statistics = await Classification.findOne(query)
      .populate('team', 'name logo category')
      .lean();

    if (!statistics) {
      res.status(404).json({
        success: false,
        error: 'Team statistics not found for the specified criteria'
      });
      return;
    }

    // Get recent matches for the team
    const recentMatches = await Match.find({
      $or: [
        { homeTeam: teamId },
        { awayTeam: teamId }
      ],
      status: 'completed'
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .lean();

    // Calculate additional statistics
    const totalMatches = statistics.wins + statistics.draws + statistics.losses;
    const winPercentage = totalMatches > 0 ? (statistics.wins / totalMatches) * 100 : 0;
    const cleanSheetPercentage = totalMatches > 0 ? (statistics.cleanSheets / totalMatches) * 100 : 0;
    const avgGoalsScored = totalMatches > 0 ? (statistics.goalsFor / totalMatches) : 0;
    const avgGoalsConceded = totalMatches > 0 ? (statistics.goalsAgainst / totalMatches) : 0;

    res.json({
      success: true,
      data: {
        ...statistics,
        recentMatches,
        stats: {
          winPercentage: winPercentage.toFixed(1),
          cleanSheetPercentage: cleanSheetPercentage.toFixed(1),
          avgGoalsScored: avgGoalsScored.toFixed(1),
          avgGoalsConceded: avgGoalsConceded.toFixed(1),
          pointsPerGame: totalMatches > 0 ? (statistics.points / totalMatches).toFixed(2) : '0.00'
        }
      }
    });
  } catch (error: any) {
    console.error('Error getting team statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get team statistics'
    });
  }
};

/**
 * Get category statistics
 * GET /api/statistics/category/:category
 */
export const getCategoryStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { poule } = req.query;

    const stats = await getFormattedStatistics(category, poule as string | undefined);
    
    // Get top performers
    const topScorers = await Classification.aggregate([
      { $match: { category, ...(poule && { poule }) } },
      { $sort: { 'goalsFor': -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'teams',
          localField: 'team',
          foreignField: '_id',
          as: 'team'
        }
      },
      { $unwind: '$team' },
      {
        $project: {
          team: {
            _id: '$team._id',
            name: '$team.name',
            logo: '$team.logo'
          },
          goals: '$goalsFor',
          matches: { $add: ['$wins', '$draws', '$losses'] },
          goalsPerMatch: {
            $cond: [
              { $eq: [{ $add: ['$wins', '$draws', '$losses'] }, 0] },
              0,
              { $divide: ['$goalsFor', { $add: ['$wins', '$draws', '$losses'] }] }
            ]
          }
        }
      },
      { $sort: { goals: -1 } }
    ]);

    // Get most clean sheets
    const bestDefense = await Classification.aggregate([
      { $match: { category, ...(poule && { poule }) } },
      { $sort: { 'cleanSheets': -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'teams',
          localField: 'team',
          foreignField: '_id',
          as: 'team'
        }
      },
      { $unwind: '$team' },
      {
        $project: {
          team: {
            _id: '$team._id',
            name: '$team.name',
            logo: '$team.logo'
          },
          cleanSheets: 1,
          goalsAgainst: 1,
          matches: { $add: ['$wins', '$draws', '$losses'] },
          cleanSheetPercentage: {
            $multiply: [
              {
                $cond: [
                  { $eq: [{ $add: ['$wins', '$draws', '$losses'] }, 0] },
                  0,
                  {
                    $divide: [
                      '$cleanSheets',
                      { $add: ['$wins', '$draws', '$losses'] }
                    ]
                  }
                ]
              },
              100
            ]
          }
        }
      },
      { $sort: { cleanSheets: -1, goalsAgainst: 1 } }
    ]);

    // Get match results distribution
    const resultsDistribution = await Classification.aggregate([
      { $match: { category, ...(poule && { poule }) } },
      {
        $group: {
          _id: null,
          totalWins: { $sum: '$wins' },
          totalDraws: { $sum: '$draws' },
          totalLosses: { $sum: '$losses' },
          totalGoals: { $sum: '$goalsFor' },
          totalCleanSheets: { $sum: '$cleanSheets' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          totalMatches: { $add: ['$totalWins', '$totalDraws', '$totalLosses'] },
          wins: '$totalWins',
          draws: '$totalDraws',
          losses: '$totalLosses',
          avgGoalsPerMatch: {
            $cond: [
              { $eq: ['$totalMatches', 0] },
              0,
              { $divide: ['$totalGoals', '$totalMatches'] }
            ]
          },
          cleanSheetPercentage: {
            $cond: [
              { $eq: ['$totalMatches', 0] },
              0,
              { $multiply: [{ $divide: ['$totalCleanSheets', '$totalMatches'] }, 100] }
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        topScorers,
        bestDefense,
        resultsDistribution: resultsDistribution[0] || {}
      }
    });
  } catch (error: any) {
    console.error('Error getting category statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get category statistics'
    });
  }
};

/**
 * Get dashboard metrics
 * GET /api/statistics/dashboard
 */
export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await statisticsService.getDashboardMetrics();

    res.json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    console.error('Error getting dashboard metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get dashboard metrics'
    });
  }
};

/**
 * Get league statistics
 * GET /api/statistics/league
 */
export const getLeagueStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const statistics = await statisticsService.getLeagueStatistics();

    res.json({
      success: true,
      data: statistics
    });
  } catch (error: any) {
    console.error('Error getting league statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get league statistics'
    });
  }
};

/**
 * Get team trends
 * GET /api/statistics/team/:teamId/trends
 */
export const getTeamTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { limit } = req.query;

    const trends = await statisticsService.getTeamTrends(
      teamId,
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    console.error('Error getting team trends:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get team trends'
    });
  }
};
