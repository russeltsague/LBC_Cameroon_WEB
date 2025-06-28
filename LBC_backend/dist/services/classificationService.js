"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassification = void 0;
const Classification_1 = __importDefault(require("../models/Classification"));
const Match_1 = __importDefault(require("../models/Match"));
// FIBA classification rules:
// 1. Points (2 for win, 1 for loss, 0 for forfeit)
// 2. Head-to-head results
// 3. Goal difference
// 4. Goals scored
const updateClassification = async (matchId) => {
    try {
        const match = await Match_1.default.findById(matchId).populate('homeTeam awayTeam');
        if (!match || match.status !== 'completed')
            return;
        const category = match.category;
        // Get or create classification entries for both teams
        const homeClassification = await Classification_1.default.findOneAndUpdate({ team: match.homeTeam, category }, { $setOnInsert: {
                team: match.homeTeam,
                category,
                played: 0,
                wins: 0,
                losses: 0,
                pointsFor: 0,
                pointsAgainst: 0,
                points: 0,
                position: 0 // Set temporary position
            } }, { upsert: true, new: true });
        const awayClassification = await Classification_1.default.findOneAndUpdate({ team: match.awayTeam, category }, { $setOnInsert: {
                team: match.awayTeam,
                category,
                played: 0,
                wins: 0,
                losses: 0,
                pointsFor: 0,
                pointsAgainst: 0,
                points: 0,
                position: 0 // Set temporary position
            } }, { upsert: true, new: true });
        // Update match statistics
        if (match.homeScore !== undefined && match.awayScore !== undefined) {
            // Home team update
            homeClassification.played += 1;
            homeClassification.pointsFor += match.homeScore;
            homeClassification.pointsAgainst += match.awayScore;
            homeClassification.pointsDifference = homeClassification.pointsFor - homeClassification.pointsAgainst;
            // Away team update
            awayClassification.played += 1;
            awayClassification.pointsFor += match.awayScore;
            awayClassification.pointsAgainst += match.homeScore;
            awayClassification.pointsDifference = awayClassification.pointsFor - awayClassification.pointsAgainst;
            // Handle forfeits
            if (match.forfeit === 'home') {
                // Home team forfeits
                homeClassification.losses += 1;
                homeClassification.points += 0; // No points for forfeit
                awayClassification.wins += 1;
                awayClassification.points += 2;
            }
            else if (match.forfeit === 'away') {
                // Away team forfeits
                homeClassification.wins += 1;
                homeClassification.points += 2;
                awayClassification.losses += 1;
                awayClassification.points += 0; // No points for forfeit
            }
            else {
                // Normal match result
                if (match.homeScore > match.awayScore) {
                    homeClassification.wins += 1;
                    homeClassification.points += 2;
                    awayClassification.losses += 1;
                    awayClassification.points += 1;
                }
                else {
                    homeClassification.losses += 1;
                    homeClassification.points += 1;
                    awayClassification.wins += 1;
                    awayClassification.points += 2;
                }
            }
        }
        // Ensure position is set before saving
        if (typeof homeClassification.position !== 'number')
            homeClassification.position = 0;
        if (typeof awayClassification.position !== 'number')
            awayClassification.position = 0;
        await homeClassification.save();
        await awayClassification.save();
        // Update positions based on FIBA rules
        await calculatePositions(category);
    }
    catch (error) {
        console.error('Error updating classification:', error);
    }
};
exports.updateClassification = updateClassification;
const calculatePositions = async (category) => {
    const classifications = await Classification_1.default.find({ category })
        .populate('team')
        .sort({
        points: -1, // Points descending
        pointsDifference: -1, // Goal difference descending
        pointsFor: -1 // Goals scored descending
    });
    // Update positions
    for (let i = 0; i < classifications.length; i++) {
        classifications[i].position = i + 1;
        await classifications[i].save();
    }
};
