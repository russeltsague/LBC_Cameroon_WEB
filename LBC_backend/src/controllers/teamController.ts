import { Request, Response } from 'express';
import Team from '../models/Team';
import { Calendar } from '../models/Calendar';
import Classification from '../models/Classification';
import bulkImportService from '../services/bulkImportService';

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Bulk import teams from JSON file
 * POST /api/teams/bulk-import
 */
export const bulkImportTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teams } = req.body;

    if (!teams || !Array.isArray(teams) || teams.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No teams data provided. Expected an array of team objects.'
      });
      return;
    }

    const result = await bulkImportService.importTeams(teams);

    res.json({
      success: true,
      message: `Import completed: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`,
      data: result
    });
  } catch (error: any) {
    console.error('Error in bulk import:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to import teams'
    });
  }
};

/**
 * Get sample JSON template for bulk import
 * GET /api/teams/bulk-import/template
 */
export const getBulkImportTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const template = bulkImportService.generateSampleTemplate();

    res.json({
      success: true,
      data: template
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate template'
    });
  }
};

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, poule } = req.query;

    let query: any = {};
    if (category) {
      query.category = category;
    }

    // Add poule filter if provided
    if (poule) {
      query.poule = poule;
    }

    const teams = await Team.find(query);
    res.json({
      success: true,
      data: teams
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404).json({
        success: false,
        error: 'Team not found'
      });
      return;
    }

    // Fetch calendar for the team's category to get matches
    const calendar = await Calendar.findOne({ category: team.category });

    let upcomingMatches: any[] = [];
    let pastMatches: any[] = [];

    if (calendar) {
      const teamName = team.name;
      const allMatches: any[] = [];

      // Helper to process matches
      const processMatch = (match: any, pouleName?: string, isPlayoff: boolean = false) => {
        // Check if team is involved
        const homeName = match.homeTeam.trim();
        const awayName = match.awayTeam.trim();

        if (homeName === teamName || awayName === teamName) {
          const matchData = {
            ...match.toObject ? match.toObject() : match,
            category: team.category,
            poule: pouleName,
            isPlayoff
          };

          // Determine status if not explicitly set
          if (!matchData.status) {
            if (matchData.homeScore !== undefined && matchData.awayScore !== undefined) {
              matchData.status = 'completed';
            } else {
              matchData.status = 'upcoming';
            }
          }

          allMatches.push(matchData);
        }
      };

      // Search in poules
      if (calendar.poules) {
        calendar.poules.forEach((poule: any) => {
          if (poule.journées) {
            poule.journées.forEach((journee: any) => {
              if (journee.matches) {
                journee.matches.forEach((match: any) => {
                  processMatch(match, poule.name);
                });
              }
            });
          }
        });
      }

      // Search in playoffs
      if (calendar.playoffs) {
        calendar.playoffs.forEach((playoff: any) => {
          if (playoff.matches) {
            playoff.matches.forEach((match: any) => {
              processMatch(match, 'Playoff', true);
            });
          }
        });
      }

      // Sort matches by date (if available) or just separate by status
      // Since date might be a string in Calendar, we try to parse it
      allMatches.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });

      upcomingMatches = allMatches.filter(m => m.status === 'upcoming' || m.status === 'live');
      pastMatches = allMatches.filter(m => m.status === 'completed');
    }

    // Fetch classification stats
    const classification = await Classification.findOne({ team: team._id });
    let classificationStats = null;

    if (classification) {
      const stats = classification.getFormattedStats();
      classificationStats = {
        played: stats.played,
        wins: stats.won,
        draws: stats.drawn,
        losses: stats.lost,
        forfeits: 0, // Classification model doesn't track forfeits explicitly in formatted stats
        points: stats.points,
        pointsFor: stats.goalsFor,
        pointsAgainst: stats.goalsAgainst,
        goalDifference: stats.goalDifference
      };
    }

    // Convert team to object to add extra fields
    const teamObj = team.toObject();

    res.json({
      success: true,
      data: {
        ...teamObj,
        upcomingMatches,
        pastMatches,
        classificationStats
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!team) {
      res.status(404).json({
        success: false,
        error: 'Team not found'
      });
      return;
    }
    res.json({
      success: true,
      data: team
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      res.status(404).json({
        success: false,
        error: 'Team not found'
      });
      return;
    }
    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};