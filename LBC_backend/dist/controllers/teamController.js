"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeam = exports.updateTeam = exports.getTeam = exports.getTeams = exports.getBulkImportTemplate = exports.bulkImportTeams = exports.createTeam = void 0;
const Team_1 = __importDefault(require("../models/Team"));
const Calendar_1 = require("../models/Calendar");
const Classification_1 = __importDefault(require("../models/Classification"));
const bulkImportService_1 = __importDefault(require("../services/bulkImportService"));
const createTeam = async (req, res) => {
    try {
        const team = await Team_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: team
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
exports.createTeam = createTeam;
/**
 * Bulk import teams from JSON file
 * POST /api/teams/bulk-import
 */
const bulkImportTeams = async (req, res) => {
    try {
        const { teams } = req.body;
        if (!teams || !Array.isArray(teams) || teams.length === 0) {
            res.status(400).json({
                success: false,
                error: 'No teams data provided. Expected an array of team objects.'
            });
            return;
        }
        const result = await bulkImportService_1.default.importTeams(teams);
        res.json({
            success: true,
            message: `Import completed: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`,
            data: result
        });
    }
    catch (error) {
        console.error('Error in bulk import:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to import teams'
        });
    }
};
exports.bulkImportTeams = bulkImportTeams;
/**
 * Get sample JSON template for bulk import
 * GET /api/teams/bulk-import/template
 */
const getBulkImportTemplate = async (req, res) => {
    try {
        const template = bulkImportService_1.default.generateSampleTemplate();
        res.json({
            success: true,
            data: template
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate template'
        });
    }
};
exports.getBulkImportTemplate = getBulkImportTemplate;
const getTeams = async (req, res) => {
    try {
        const { category, poule } = req.query;
        let query = {};
        if (category) {
            query.category = category;
        }
        // Add poule filter if provided
        if (poule) {
            query.poule = poule;
        }
        const teams = await Team_1.default.find(query);
        res.json({
            success: true,
            data: teams
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.getTeams = getTeams;
const getTeam = async (req, res) => {
    try {
        const team = await Team_1.default.findById(req.params.id);
        if (!team) {
            res.status(404).json({
                success: false,
                error: 'Team not found'
            });
            return;
        }
        // Fetch calendar for the team's category to get matches
        const calendar = await Calendar_1.Calendar.findOne({ category: team.category });
        let upcomingMatches = [];
        let pastMatches = [];
        if (calendar) {
            const teamName = team.name;
            const allMatches = [];
            // Helper to process matches
            const processMatch = (match, pouleName, isPlayoff = false) => {
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
                        }
                        else {
                            matchData.status = 'upcoming';
                        }
                    }
                    allMatches.push(matchData);
                }
            };
            // Search in poules
            if (calendar.poules) {
                calendar.poules.forEach((poule) => {
                    if (poule.journées) {
                        poule.journées.forEach((journee) => {
                            if (journee.matches) {
                                journee.matches.forEach((match) => {
                                    processMatch(match, poule.name);
                                });
                            }
                        });
                    }
                });
            }
            // Search in playoffs
            if (calendar.playoffs) {
                calendar.playoffs.forEach((playoff) => {
                    if (playoff.matches) {
                        playoff.matches.forEach((match) => {
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
        const classification = await Classification_1.default.findOne({ team: team._id });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.getTeam = getTeam;
const updateTeam = async (req, res) => {
    try {
        const team = await Team_1.default.findByIdAndUpdate(req.params.id, req.body, {
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
exports.updateTeam = updateTeam;
const deleteTeam = async (req, res) => {
    try {
        const team = await Team_1.default.findByIdAndDelete(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.deleteTeam = deleteTeam;
