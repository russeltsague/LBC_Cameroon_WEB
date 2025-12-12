import { Request, Response } from 'express';
import Match, { IMatch } from '../models/Match';
import Team, { ITeam } from '../models/Team';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import schedulerService from '../services/schedulerService';
import classificationService from '../services/classificationService';
import validationService from '../services/validationService';
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
    poule,
    venue,
    status,
    homeScore,
    awayScore,
    journee,
    forfeit
  } = req.body;

  if (journee === undefined || journee === null) {
    throw new AppError('Journee (matchday) is required', 400);
  }

  try {
    // Validate match data using ValidationService
    const matchData = {
      date: new Date(date),
      time,
      homeTeam,
      awayTeam,
      category,
      poule,
      venue,
      status,
      homeScore,
      awayScore,
      journee,
      forfeit
    };

    const validation = await validationService.validateMatchCreation(matchData);
    if (!validation.valid) {
      throw new AppError(
        `Match validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    console.log('Creating match with processed data:', matchData);

    const match = await Match.create(matchData);

    console.log('Match created:', match);

    const populatedMatch = await Match.findById((match as IMatch)._id)
      .populate({
        path: 'homeTeam',
        select: 'name category poule',
      })
      .populate({
        path: 'awayTeam',
        select: 'name category poule',
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
    poule,
    venue,
    status,
    homeScore,
    awayScore,
    journee,
    forfeit
  } = req.body;

  try {
    // Get existing match
    const existingMatch = await Match.findById(req.params.id);
    if (!existingMatch) {
      throw new AppError('Match not found', 404);
    }

    // Build update data
    const updateData: any = {
      _id: req.params.id,
      date: date ? new Date(date) : existingMatch.date,
      time: time !== undefined ? time : existingMatch.time,
      homeTeam: homeTeam || existingMatch.homeTeam,
      awayTeam: awayTeam || existingMatch.awayTeam,
      category: category || existingMatch.category,
      poule: poule !== undefined ? poule : existingMatch.poule,
      venue: venue !== undefined ? venue : existingMatch.venue,
      status: status !== undefined ? status : existingMatch.status,
      homeScore: homeScore !== undefined ? homeScore : existingMatch.homeScore,
      awayScore: awayScore !== undefined ? awayScore : existingMatch.awayScore,
      journee: journee !== undefined ? journee : existingMatch.journee,
      forfeit: forfeit !== undefined ? forfeit : existingMatch.forfeit
    };

    // Validate updated match data
    const validation = await validationService.validateMatchCreation(updateData);
    if (!validation.valid) {
      throw new AppError(
        `Match validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

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
        select: 'name category poule',
      })
      .populate({
        path: 'awayTeam',
        select: 'name category poule',
      });

    console.log('Updated match:', match);

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Trigger classification update if match is completed
    if (status === 'completed' && homeScore !== undefined && awayScore !== undefined) {
      await classificationService.updateClassification(req.params.id);
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
