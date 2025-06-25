import { Request, Response } from 'express';
import { Match, IMatch } from '../models/Match';
import Team, { ITeam } from '../models/Team';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { generateSchedule } from '../services/schedulerService';
import { updateClassification } from '../services/classificationService'; // Make sure this file exists
import mongoose from 'mongoose';

// Get all matches with optional category filter
export const getAllMatches = catchAsync(async (req: Request, res: Response) => {
  const { category, poule } = req.query;
  console.log('Getting matches for category:', category, 'poule:', poule);
  
  let query: any = {};
  if (category) {
    query.category = category;
  }
  
  // Add poule filter if provided
  if (poule) {
    query.poule = poule;
  }
  
  console.log('Query:', query);

  const matches = await Match.find(query)
    .populate({
      path: 'homeTeam',
      select: 'name category',
      model: 'Team'
    })
    .populate({
      path: 'awayTeam',
      select: 'name category',
      model: 'Team'
    })
    .sort({ date: 1, time: 1 });

  console.log('Fetched matches with populated teams:', matches);

  res.status(200).json({
    status: 'success',
    results: matches.length,
    data: matches,
  });
});

// Get a single match
export const getMatch = catchAsync(async (req: Request, res: Response) => {
  const match = await Match.findById(req.params.id)
    .populate({
      path: 'homeTeam',
      select: 'name category',
    })
    .populate({
      path: 'awayTeam',
      select: 'name category',
    });

  if (!match) {
    throw new AppError('Match not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: match,
  });
});

// Create a new match
export const createMatch = catchAsync(async (req: Request, res: Response) => {
  console.log('Creating match with data:', req.body);
  
  const {
    date,
    time,
    homeTeam,
    awayTeam,
    category,
    venue,
    status,
    homeScore,
    awayScore,
  } = req.body;

  try {
    // Validate teams exist
    const [homeTeamExists, awayTeamExists] = await Promise.all([
      Team.findById(homeTeam),
      Team.findById(awayTeam),
    ]);

    console.log('Team validation:', {
      homeTeamExists: !!homeTeamExists,
      awayTeamExists: !!awayTeamExists,
      homeTeam,
      awayTeam
    });

    if (!homeTeamExists || !awayTeamExists) {
      throw new AppError('One or both teams not found', 400);
    }

    // Validate teams are from the same category
    if (homeTeamExists.category !== category || awayTeamExists.category !== category) {
      throw new AppError('Teams must be from the same category as the match', 400);
    }

    const matchData = {
      date: new Date(date),
      time,
      homeTeam,
      awayTeam,
      category,
      venue,
      status,
      homeScore,
      awayScore,
    };

    console.log('Creating match with processed data:', matchData);

    const match = await Match.create(matchData);

    console.log('Match created:', match);

    const populatedMatch = await Match.findById((match as IMatch)._id)
      .populate({
        path: 'homeTeam',
        select: 'name category',
      })
      .populate({
        path: 'awayTeam',
        select: 'name category',
      });

    console.log('Populated match:', populatedMatch);

    res.status(201).json({
      status: 'success',
      data: populatedMatch,
    });
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
});

// Update a match
export const updateMatch = catchAsync(async (req: Request, res: Response) => {
  console.log('Updating match with data:', req.body);
  
  const {
    date,
    time,
    homeTeam,
    awayTeam,
    category,
    venue,
    status,
    homeScore,
    awayScore,
  } = req.body;

  try {
    // Validate teams exist if they're being updated
    if (homeTeam || awayTeam) {
      const [homeTeamExists, awayTeamExists] = await Promise.all([
        homeTeam ? Team.findById(homeTeam) : null,
        awayTeam ? Team.findById(awayTeam) : null,
      ]);

      console.log('Team validation:', {
        homeTeamExists: !!homeTeamExists,
        awayTeamExists: !!awayTeamExists,
        homeTeam,
        awayTeam
      });

      if ((homeTeam && !homeTeamExists) || (awayTeam && !awayTeamExists)) {
        throw new AppError('One or both teams not found', 400);
      }

      // Validate teams are from the same category
      if (homeTeam && homeTeamExists && homeTeamExists.category !== category) {
        throw new AppError('Home team must be from the same category as the match', 400);
      }
      if (awayTeam && awayTeamExists && awayTeamExists.category !== category) {
        throw new AppError('Away team must be from the same category as the match', 400);
      }
    }

    const updateData = Object.fromEntries(
      Object.entries({
        date: date ? new Date(date) : undefined,
        time,
        homeTeam,
        awayTeam,
        category,
        venue,
        status,
        homeScore,
        awayScore
      }).filter(([_, value]) => value !== undefined)
    );

    console.log('Updating match with processed data:', updateData);

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({
        path: 'homeTeam',
        select: 'name category',
      })
      .populate({
        path: 'awayTeam',
        select: 'name category',
      });

    console.log('Updated match:', match);

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    if (status === 'completed') {
      await updateClassification(req.params.id);
    }

    res.status(200).json({
      status: 'success',
      data: match,
    });
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
});

// Delete a match
export const deleteMatch = catchAsync(async (req: Request, res: Response) => {
  const match = await Match.findByIdAndDelete(req.params.id);

  if (!match) {
    throw new AppError('Match not found', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const generateCompetitionSchedule = catchAsync(async (req: Request, res: Response) => {
  const { category } = req.body;

  if (!category) {
    throw new AppError('Category is required', 400);
  }

  const teams = await Team.find({ category });
  if (teams.length < 2) {
    throw new AppError('At least 2 teams are required to generate a schedule', 400);
  }

  // TODO: Implement schedule generation logic
  // This is a placeholder for the actual implementation
  const schedule: IMatch[] = [];

  res.status(200).json({
    status: 'success',
    data: schedule,
  });
});
