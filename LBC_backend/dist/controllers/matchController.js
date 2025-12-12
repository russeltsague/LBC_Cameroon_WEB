"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCompetitionSchedule = exports.deleteMatch = exports.updateMatch = exports.createMatch = exports.getMatch = exports.getAllMatches = void 0;
const Match_1 = __importDefault(require("../models/Match"));
const Team_1 = __importDefault(require("../models/Team"));
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const classificationService_1 = __importDefault(require("../services/classificationService"));
const validationService_1 = __importDefault(require("../services/validationService"));
// Get all matches with optional category filter
exports.getAllMatches = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { category, poule } = req.query;
    console.log('Getting matches for category:', category, 'poule:', poule);
    let query = {};
    if (category) {
        query.category = category;
    }
    // Add poule filter if provided
    if (poule) {
        query.poule = poule;
    }
    console.log('Query:', query);
    const matches = await Match_1.default.find(query)
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
exports.getMatch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const match = await Match_1.default.findById(req.params.id)
        .populate({
        path: 'homeTeam',
        select: 'name category',
    })
        .populate({
        path: 'awayTeam',
        select: 'name category',
    });
    if (!match) {
        throw new appError_1.AppError('Match not found', 404);
    }
    res.status(200).json({
        status: 'success',
        data: match,
    });
});
// Create a new match
exports.createMatch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    console.log('Creating match with data:', req.body);
    const { date, time, homeTeam, awayTeam, category, poule, venue, status, homeScore, awayScore, journee, forfeit } = req.body;
    if (journee === undefined || journee === null) {
        throw new appError_1.AppError('Journee (matchday) is required', 400);
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
        const validation = await validationService_1.default.validateMatchCreation(matchData);
        if (!validation.valid) {
            throw new appError_1.AppError(`Match validation failed: ${validation.errors.map(e => e.message).join(', ')}`, 400);
        }
        console.log('Creating match with processed data:', matchData);
        const match = await Match_1.default.create(matchData);
        console.log('Match created:', match);
        const populatedMatch = await Match_1.default.findById(match._id)
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
    }
    catch (error) {
        console.error('Error creating match:', error);
        throw error;
    }
});
// Update a match
exports.updateMatch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    console.log('Updating match with data:', req.body);
    const { date, time, homeTeam, awayTeam, category, poule, venue, status, homeScore, awayScore, journee, forfeit } = req.body;
    try {
        // Get existing match
        const existingMatch = await Match_1.default.findById(req.params.id);
        if (!existingMatch) {
            throw new appError_1.AppError('Match not found', 404);
        }
        // Build update data
        const updateData = {
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
        const validation = await validationService_1.default.validateMatchCreation(updateData);
        if (!validation.valid) {
            throw new appError_1.AppError(`Match validation failed: ${validation.errors.map(e => e.message).join(', ')}`, 400);
        }
        console.log('Updating match with processed data:', updateData);
        const match = await Match_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        })
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
            throw new appError_1.AppError('Match not found', 404);
        }
        // Trigger classification update if match is completed
        if (status === 'completed' && homeScore !== undefined && awayScore !== undefined) {
            await classificationService_1.default.updateClassification(req.params.id);
        }
        res.status(200).json({
            status: 'success',
            data: match,
        });
    }
    catch (error) {
        console.error('Error updating match:', error);
        throw error;
    }
});
// Delete a match
exports.deleteMatch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const match = await Match_1.default.findByIdAndDelete(req.params.id);
    if (!match) {
        throw new appError_1.AppError('Match not found', 404);
    }
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
exports.generateCompetitionSchedule = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { category } = req.body;
    if (!category) {
        throw new appError_1.AppError('Category is required', 400);
    }
    const teams = await Team_1.default.find({ category });
    if (teams.length < 2) {
        throw new appError_1.AppError('At least 2 teams are required to generate a schedule', 400);
    }
    // TODO: Implement schedule generation logic
    // This is a placeholder for the actual implementation
    const schedule = [];
    res.status(200).json({
        status: 'success',
        data: schedule,
    });
});
