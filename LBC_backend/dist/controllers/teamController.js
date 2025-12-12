"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeam = exports.updateTeam = exports.getTeam = exports.getTeams = exports.getBulkImportTemplate = exports.bulkImportTeams = exports.createTeam = void 0;
const Team_1 = __importDefault(require("../models/Team"));
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
        res.json({
            success: true,
            data: team
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
