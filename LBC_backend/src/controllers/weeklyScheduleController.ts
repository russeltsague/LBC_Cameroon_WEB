import { Request, Response } from 'express';
import WeeklySchedule, { IWeeklySchedule, IWeeklyMatch } from '../models/WeeklySchedule';
import Match from '../models/Match';
import Team from '../models/Team';
import { Calendar } from '../models/Calendar';
import mongoose from 'mongoose';

/**
 * Check if a match already exists across all weekly schedules
 */
const checkMatchExists = async (homeTeam: string, awayTeam: string, excludeScheduleId?: string) => {
  const query: any = {
    'matches': {
      $elemMatch: {
        $or: [
          { teams: new RegExp(`^${homeTeam}\\s+vs\\s+${awayTeam}$`, 'i') },
          { teams: new RegExp(`^${awayTeam}\\s+vs\\s+${homeTeam}$`, 'i') }
        ]
      }
    }
  };
  
  // Exclude current schedule if updating
  if (excludeScheduleId) {
    query._id = { $ne: excludeScheduleId };
  }
  
  const existingSchedules = await WeeklySchedule.find(query);
  return existingSchedules.length > 0;
};

/**
 * Get all weekly schedules
 * GET /api/weekly-schedules
 */
export const getAllWeeklySchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const schedules = await WeeklySchedule.find()
      .sort({ date: 1, venue: 1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error: any) {
    console.error('Error fetching weekly schedules:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch weekly schedules'
    });
  }
};

/**
 * Get weekly schedules by date range
 * GET /api/weekly-schedules/range?startDate&endDate
 */
export const getWeeklySchedulesByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
      return;
    }

    const schedules = await WeeklySchedule.find({
      date: {
        $gte: startDate as string,
        $lte: endDate as string
      }
    }).sort({ date: 1, venue: 1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error: any) {
    console.error('Error fetching weekly schedules by date range:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch weekly schedules'
    });
  }
};

/**
 * Create a new weekly schedule table
 * POST /api/weekly-schedules
 */
export const createWeeklySchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, venue, matches = [] } = req.body;

    if (!date || !venue) {
      res.status(400).json({
        success: false,
        error: 'Date and venue are required'
      });
      return;
    }

    // Check if a schedule already exists for this date and venue
    const existingSchedule = await WeeklySchedule.findOne({ date, venue });
    if (existingSchedule) {
      res.status(400).json({
        success: false,
        error: 'A schedule already exists for this date and venue'
      });
      return;
    }

    // Validate matches format and check for duplicates
    const duplicateMatches: string[] = [];
    for (const match of matches) {
      if (!match.category || !match.teams) {
        res.status(400).json({
          success: false,
          error: 'Each match must have category and teams'
        });
        return;
      }

      // Validate teams format
      if (!match.teams.includes(' vs ')) {
        res.status(400).json({
          success: false,
          error: `Invalid teams format: ${match.teams}. Must be "Team1 vs Team2"`
        });
        return;
      }

      // Check if match already exists in any schedule
      const [homeTeam, awayTeam] = match.teams.split(' vs ').map((team: string) => team.trim());
      const matchExists = await checkMatchExists(homeTeam, awayTeam);
      
      if (matchExists) {
        duplicateMatches.push(match.teams);
      }
    }

    // If there are duplicate matches, return error
    if (duplicateMatches.length > 0) {
      res.status(400).json({
        success: false,
        error: `The following matches are already scheduled in another date: ${duplicateMatches.join(', ')}. Each match can only be scheduled once.`,
        duplicateMatches
      });
      return;
    }

    const newSchedule = new WeeklySchedule({
      date,
      venue,
      matches,
      isExpanded: true
    });

    const savedSchedule = await newSchedule.save();

    res.status(201).json({
      success: true,
      data: savedSchedule,
      message: 'Weekly schedule created successfully'
    });
  } catch (error: any) {
    console.error('Error creating weekly schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create weekly schedule'
    });
  }
};

/**
 * Update a weekly schedule
 * PUT /api/weekly-schedules/:id
 */
export const updateWeeklySchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, venue, matches, isExpanded } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid schedule ID'
      });
      return;
    }

    // Validate matches if provided
    if (matches) {
      const duplicateMatches: string[] = [];
      for (const match of matches) {
        if (!match.category || !match.teams) {
          res.status(400).json({
            success: false,
            error: 'Each match must have category and teams'
          });
          return;
        }

        if (!match.teams.includes(' vs ')) {
          res.status(400).json({
            success: false,
            error: `Invalid teams format: ${match.teams}. Must be "Team1 vs Team2"`
          });
          return;
        }

        // Check if match already exists in any other schedule
        const [homeTeam, awayTeam] = match.teams.split(' vs ').map((team: string) => team.trim());
        const matchExists = await checkMatchExists(homeTeam, awayTeam, id);
        
        if (matchExists) {
          duplicateMatches.push(match.teams);
        }
      }

      // If there are duplicate matches, return error
      if (duplicateMatches.length > 0) {
        res.status(400).json({
          success: false,
          error: `The following matches are already scheduled in another date: ${duplicateMatches.join(', ')}. Each match can only be scheduled once.`,
          duplicateMatches
        });
        return;
      }
    }

    const updatedSchedule = await WeeklySchedule.findByIdAndUpdate(
      id,
      { date, venue, matches, isExpanded },
      { new: true, runValidators: true }
    );

    if (!updatedSchedule) {
      res.status(404).json({
        success: false,
        error: 'Weekly schedule not found'
      });
      return;
    }

    res.json({
      success: true,
      data: updatedSchedule,
      message: 'Weekly schedule updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating weekly schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update weekly schedule'
    });
  }
};

/**
 * Delete a weekly schedule
 * DELETE /api/weekly-schedules/:id
 */
export const deleteWeeklySchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid schedule ID'
      });
      return;
    }

    const deletedSchedule = await WeeklySchedule.findByIdAndDelete(id);

    if (!deletedSchedule) {
      res.status(404).json({
        success: false,
        error: 'Weekly schedule not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Weekly schedule deleted successfully',
      data: { deletedSchedule }
    });
  } catch (error: any) {
    console.error('Error deleting weekly schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete weekly schedule'
    });
  }
};

/**
 * Add a match to a weekly schedule
 * POST /api/weekly-schedules/:id/matches
 */
export const addMatchToSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category, teams, groupNumber, terrain, journey } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid schedule ID'
      });
      return;
    }

    if (!category || !teams) {
      res.status(400).json({
        success: false,
        error: 'Category and teams are required'
      });
      return;
    }

    if (!teams.includes(' vs ')) {
      res.status(400).json({
        success: false,
        error: `Invalid teams format: ${teams}. Must be "Team1 vs Team2"`
      });
      return;
    }

    const schedule = await WeeklySchedule.findById(id);
    if (!schedule) {
      res.status(404).json({
        success: false,
        error: 'Weekly schedule not found'
      });
      return;
    }

    const newMatch: IWeeklyMatch = {
      category,
      teams,
      groupNumber: groupNumber || '',
      terrain: terrain || 'T1',
      journey: journey || '1',
      homeTeam: teams.split(' vs ')[0].trim(),
      awayTeam: teams.split(' vs ')[1].trim()
    } as any;

    schedule.matches.push(newMatch);
    await schedule.save();

    res.status(201).json({
      success: true,
      data: schedule,
      message: 'Match added to schedule successfully'
    });
  } catch (error: any) {
    console.error('Error adding match to schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add match to schedule'
    });
  }
};

/**
 * Update a match in a weekly schedule
 * PUT /api/weekly-schedules/:id/matches/:matchId
 */
export const updateMatchInSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, matchId } = req.params;
    const { category, teams, groupNumber, terrain, journey } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(matchId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid schedule ID or match ID'
      });
      return;
    }

    if (teams && !teams.includes(' vs ')) {
      res.status(400).json({
        success: false,
        error: `Invalid teams format: ${teams}. Must be "Team1 vs Team2"`
      });
      return;
    }

    const schedule = await WeeklySchedule.findById(id);
    if (!schedule) {
      res.status(404).json({
        success: false,
        error: 'Weekly schedule not found'
      });
      return;
    }

    const match = schedule.matches.find((m: any) => m._id.toString() === matchId);
    if (!match) {
      res.status(404).json({
        success: false,
        error: 'Match not found in schedule'
      });
      return;
    }

    // Update match fields
    if (category) match.category = category;
    if (teams) {
      match.teams = teams;
      match.homeTeam = teams.split(' vs ')[0].trim();
      match.awayTeam = teams.split(' vs ')[1].trim();
    }
    if (groupNumber !== undefined) match.groupNumber = groupNumber;
    if (terrain) match.terrain = terrain;
    if (journey) match.journey = journey;

    await schedule.save();

    res.json({
      success: true,
      data: schedule,
      message: 'Match updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating match in schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update match in schedule'
    });
  }
};

/**
 * Remove a match from a weekly schedule
 * DELETE /api/weekly-schedules/:id/matches/:matchId
 */
export const removeMatchFromSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, matchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(matchId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid schedule ID or match ID'
      });
      return;
    }

    const schedule = await WeeklySchedule.findById(id);
    if (!schedule) {
      res.status(404).json({
        success: false,
        error: 'Weekly schedule not found'
      });
      return;
    }

    const match = schedule.matches.find((m: any) => m._id.toString() === matchId);
    if (!match) {
      res.status(404).json({
        success: false,
        error: 'Match not found in schedule'
      });
      return;
    }

    schedule.matches = schedule.matches.filter((m: any) => m._id.toString() !== matchId);
    await schedule.save();

    res.json({
      success: true,
      data: schedule,
      message: 'Match removed from schedule successfully'
    });
  } catch (error: any) {
    console.error('Error removing match from schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove match from schedule'
    });
  }
};

/**
 * Save weekly schedule as actual matches
 * POST /api/weekly-schedules/:id/save-matches
 */
export const saveWeeklyScheduleAsMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid schedule ID'
      });
      return;
    }

    const schedule = await WeeklySchedule.findById(id);
    if (!schedule) {
      res.status(404).json({
        success: false,
        error: 'Weekly schedule not found'
      });
      return;
    }

    if (schedule.matches.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No matches to save in this schedule'
      });
      return;
    }

    const createdMatches = [];
    const errors = [];

    for (const weeklyMatch of schedule.matches) {
      try {
        // Debug logging
        console.log('Looking for teams:', {
          homeTeam: weeklyMatch.homeTeam,
          awayTeam: weeklyMatch.awayTeam,
          originalTeams: weeklyMatch.teams
        });
        
        // Find teams by name (case-insensitive)
        const homeTeamDoc = await Team.findOne({ 
          name: { $regex: new RegExp(`^${weeklyMatch.homeTeam}$`, 'i') }
        });
        const awayTeamDoc = await Team.findOne({ 
          name: { $regex: new RegExp(`^${weeklyMatch.awayTeam}$`, 'i') }
        });
        
        console.log('Found teams:', {
          homeTeamFound: !!homeTeamDoc,
          awayTeamFound: !!awayTeamDoc,
          homeTeamId: homeTeamDoc?._id,
          awayTeamId: awayTeamDoc?._id
        });

        if (!homeTeamDoc || !awayTeamDoc) {
          errors.push(`Teams not found: ${weeklyMatch.teams}`);
          continue;
        }

        // Check if match already exists
        const existingMatch = await Match.findOne({
          date: new Date(schedule.date),
          homeTeam: homeTeamDoc._id,
          awayTeam: awayTeamDoc._id,
          category: weeklyMatch.category
        });

        if (existingMatch) {
          errors.push(`Match already exists: ${weeklyMatch.teams}`);
          continue;
        }

        // Create the match
        const match = new Match({
          date: new Date(schedule.date),
          time: '10:00', // Default time
          homeTeam: homeTeamDoc._id,
          awayTeam: awayTeamDoc._id,
          category: weeklyMatch.category,
          venue: schedule.venue,
          terrain: weeklyMatch.terrain,
          poule: weeklyMatch.groupNumber,
          journee: parseInt(weeklyMatch.journey) || 1,
          status: 'upcoming'
        });

        await match.save();
        createdMatches.push(match);

      } catch (error: any) {
        errors.push(`Error creating match ${weeklyMatch.teams}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Successfully created ${createdMatches.length} matches`,
      data: {
        createdCount: createdMatches.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        createdMatches
      }
    });

    // Optionally delete the weekly schedule after saving matches
    // await WeeklySchedule.findByIdAndDelete(id);

  } catch (error: any) {
    console.error('Error saving weekly schedule as matches:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save weekly schedule as matches'
    });
  }
};
