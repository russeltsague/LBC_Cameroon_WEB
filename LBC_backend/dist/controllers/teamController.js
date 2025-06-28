"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeam = exports.updateTeam = exports.getTeam = exports.getTeams = exports.createTeam = void 0;
const Team_1 = __importDefault(require("../models/Team"));
const createTeam = async (req, res) => {
    try {
        const team = await Team_1.default.create(req.body);
        res.status(201).json(team);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createTeam = createTeam;
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
        if (!team)
            res.status(404).json({ error: 'Team not found' });
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getTeam = getTeam;
const updateTeam = async (req, res) => {
    try {
        const team = await Team_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!team)
            res.status(404).json({ error: 'Team not found' });
        res.json(team);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateTeam = updateTeam;
const deleteTeam = async (req, res) => {
    try {
        const team = await Team_1.default.findByIdAndDelete(req.params.id);
        if (!team)
            res.status(404).json({ error: 'Team not found' });
        res.json({ message: 'Team deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteTeam = deleteTeam;
