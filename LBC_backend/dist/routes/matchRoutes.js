"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const matchController_1 = require("../controllers/matchController");
const router = express_1.default.Router();
// Get all matches with optional category filter
router.get('/', matchController_1.getAllMatches);
// Get a single match
router.get('/:id', matchController_1.getMatch);
// Create a new match
router.post('/', matchController_1.createMatch);
// Update a match
router.put('/:id', matchController_1.updateMatch);
// Delete a match
router.delete('/:id', matchController_1.deleteMatch);
// Generate competition schedule
router.post('/generate-schedule', matchController_1.generateCompetitionSchedule);
exports.default = router;
