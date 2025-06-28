"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlayer = exports.updatePlayer = exports.getPlayersByTeam = exports.createPlayer = void 0;
const Player_1 = __importDefault(require("../models/Player"));
const createPlayer = async (req, res) => {
    try {
        const player = await Player_1.default.create(req.body);
        res.status(201).json(player);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createPlayer = createPlayer;
const getPlayersByTeam = async (req, res) => {
    try {
        const players = await Player_1.default.find({ teamId: req.params.teamId });
        res.json(players);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPlayersByTeam = getPlayersByTeam;
const updatePlayer = async (req, res) => {
    try {
        const player = await Player_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!player) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }
        res.json(player);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updatePlayer = updatePlayer;
const deletePlayer = async (req, res) => {
    try {
        const player = await Player_1.default.findByIdAndDelete(req.params.id);
        if (!player) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }
        res.json({ message: 'Player deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deletePlayer = deletePlayer;
