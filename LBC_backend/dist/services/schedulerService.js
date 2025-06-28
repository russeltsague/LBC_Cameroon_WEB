"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSchedule = void 0;
const Match_1 = __importDefault(require("../models/Match"));
const generateSchedule = async (teams, competition, rounds = 1) => {
    try {
        if (teams.length % 2 !== 0) {
            teams.push(null); // Add a dummy team for bye weeks
        }
        const teamCount = teams.length;
        const roundsTotal = rounds * (teamCount - 1);
        const matches = [];
        for (let round = 0; round < roundsTotal; round++) {
            for (let i = 0; i < teamCount / 2; i++) {
                const homeIndex = (round + i) % (teamCount - 1);
                let awayIndex = (teamCount - 1 - i + round) % (teamCount - 1);
                // Last team stays in the same place while others rotate
                if (i === 0) {
                    awayIndex = teamCount - 1;
                }
                const homeTeam = teams[homeIndex];
                const awayTeam = teams[awayIndex];
                // Skip matches with dummy team
                if (homeTeam && awayTeam) {
                    // Alternate home/away each round
                    const isHome = round % 2 === 0;
                    const match = {
                        homeTeam: isHome ? homeTeam._id : awayTeam._id,
                        awayTeam: isHome ? awayTeam._id : homeTeam._id,
                        date: calculateMatchDate(round),
                        venue: isHome ? homeTeam.arena : awayTeam.arena,
                        status: 'SCHEDULED',
                        round: round + 1,
                        competition
                    };
                    matches.push(match);
                }
            }
        }
        // Insert all matches
        await Match_1.default.insertMany(matches);
        return matches;
    }
    catch (error) {
        console.error('Error generating schedule:', error);
        throw error;
    }
};
exports.generateSchedule = generateSchedule;
const calculateMatchDate = (round) => {
    const date = new Date();
    date.setDate(date.getDate() + (round * 7)); // 7 days between rounds
    return date;
};
