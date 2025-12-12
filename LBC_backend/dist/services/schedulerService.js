"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Match_1 = __importDefault(require("../models/Match"));
const Team_1 = __importDefault(require("../models/Team"));
const validationService_1 = __importDefault(require("./validationService"));
class SchedulerService {
    /**
     * Generate a complete schedule using round-robin algorithm
     */
    async generateSchedule(options) {
        const { category, poule, startDate, daysBetweenMatches, timeSlots, defaultVenue } = options;
        // Validate category and poule
        const categoryValidation = await validationService_1.default.validateCategoryPoule(category, poule);
        if (!categoryValidation.valid) {
            throw new Error(categoryValidation.errors.map(e => e.message).join(', '));
        }
        // Validate sufficient teams
        const teamsValidation = await validationService_1.default.validateSufficientTeams(category, poule);
        if (!teamsValidation.valid) {
            throw new Error(teamsValidation.errors.map(e => e.message).join(', '));
        }
        // Fetch teams
        const query = { category };
        if (poule) {
            query.poule = poule;
        }
        const teams = await Team_1.default.find(query).sort({ name: 1 });
        if (teams.length < 2) {
            throw new Error('At least 2 teams are required to generate a schedule');
        }
        // Generate matches using round-robin algorithm
        const matches = this.generateRoundRobinMatches(teams, category, poule, startDate, daysBetweenMatches, timeSlots, defaultVenue);
        const journees = teams.length % 2 === 0 ? teams.length - 1 : teams.length;
        const endDate = this.calculateEndDate(startDate, journees, daysBetweenMatches);
        return {
            matches,
            totalMatches: matches.length,
            journees,
            startDate,
            endDate,
            category,
            poule
        };
    }
    /**
     * Generate round-robin matches
     * Each team plays every other team exactly once
     */
    generateRoundRobinMatches(teams, category, poule, startDate, daysBetweenMatches, timeSlots, defaultVenue) {
        const matches = [];
        const teamList = [...teams];
        // Handle odd number of teams by adding a "bye" (null)
        const hasBye = teamList.length % 2 !== 0;
        if (hasBye) {
            teamList.push(null);
        }
        const numTeams = teamList.length;
        const numRounds = numTeams - 1;
        const matchesPerRound = numTeams / 2;
        // Round-robin algorithm using rotation method
        for (let round = 0; round < numRounds; round++) {
            const roundMatches = [];
            for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex++) {
                let homeIndex;
                let awayIndex;
                if (matchIndex === 0) {
                    // First match: fixed team vs rotating team
                    homeIndex = 0;
                    awayIndex = numTeams - 1 - round;
                }
                else {
                    // Other matches: rotating teams
                    homeIndex = (round + matchIndex) % (numTeams - 1);
                    if (homeIndex === 0)
                        homeIndex = numTeams - 1;
                    awayIndex = (numTeams - 1 - round - matchIndex + numTeams - 1) % (numTeams - 1);
                    if (awayIndex === 0)
                        awayIndex = numTeams - 1;
                }
                const homeTeam = teamList[homeIndex];
                const awayTeam = teamList[awayIndex];
                // Skip matches with bye
                if (!homeTeam || !awayTeam) {
                    continue;
                }
                // Alternate home/away for fairness
                const shouldSwap = round % 2 === 1 && matchIndex % 2 === 0;
                const finalHomeTeam = shouldSwap ? awayTeam : homeTeam;
                const finalAwayTeam = shouldSwap ? homeTeam : awayTeam;
                // Assign time slot (cycle through available slots)
                const timeSlot = timeSlots[roundMatches.length % timeSlots.length];
                // Calculate match date
                const matchDate = new Date(startDate);
                matchDate.setDate(matchDate.getDate() + (round * daysBetweenMatches));
                const match = {
                    homeTeam: new mongoose_1.default.Types.ObjectId(finalHomeTeam._id.toString()),
                    awayTeam: new mongoose_1.default.Types.ObjectId(finalAwayTeam._id.toString()),
                    category,
                    poule,
                    date: matchDate,
                    time: timeSlot,
                    venue: finalHomeTeam.arena || defaultVenue || 'TBD',
                    terrain: finalHomeTeam.arena || defaultVenue || 'TBD',
                    status: 'upcoming',
                    journee: round + 1,
                    homeScore: undefined,
                    awayScore: undefined,
                    forfeit: undefined
                };
                roundMatches.push(match);
            }
            matches.push(...roundMatches);
        }
        return matches;
    }
    /**
     * Save generated schedule to database
     */
    async saveSchedule(preview) {
        try {
            // Validate all matches before saving
            for (const matchData of preview.matches) {
                const validation = await validationService_1.default.validateMatchCreation(matchData);
                if (!validation.valid) {
                    throw new Error(`Match validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
                }
            }
            // Save all matches
            const savedMatches = await Match_1.default.insertMany(preview.matches);
            return savedMatches;
        }
        catch (error) {
            console.error('Error saving schedule:', error);
            throw new Error(`Failed to save schedule: ${error.message}`);
        }
    }
    /**
     * Get schedule preview for a category/poule
     */
    async getSchedulePreview(category, poule) {
        const query = { category, status: 'upcoming' };
        if (poule) {
            query.poule = poule;
        }
        return await Match_1.default.find(query)
            .populate('homeTeam awayTeam')
            .sort({ journee: 1, date: 1, time: 1 });
    }
    /**
     * Calculate end date based on number of journées and interval
     */
    calculateEndDate(startDate, journees, daysBetweenMatches) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + ((journees - 1) * daysBetweenMatches));
        return endDate;
    }
    /**
     * Delete all matches for a category/poule (for regeneration)
     */
    async deleteSchedule(category, poule) {
        const query = { category, status: 'upcoming' };
        if (poule) {
            query.poule = poule;
        }
        const result = await Match_1.default.deleteMany(query);
        return result.deletedCount || 0;
    }
}
exports.default = new SchedulerService();
