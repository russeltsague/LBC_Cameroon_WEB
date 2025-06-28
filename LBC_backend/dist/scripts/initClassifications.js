"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Classification_1 = __importDefault(require("../models/Classification"));
const Team_1 = __importDefault(require("../models/Team"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lbc';
async function initializeClassifications() {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        // Get all teams
        const teams = await Team_1.default.find({});
        console.log(`Found ${teams.length} teams`);
        // Create classification records for each team
        const classificationPromises = teams.map(async (team, index) => {
            // Check if classification already exists
            const existingClassification = await Classification_1.default.findOne({
                team: team._id,
                category: team.category
            });
            if (existingClassification) {
                console.log(`Classification already exists for ${team.name} in ${team.category}`);
                return existingClassification;
            }
            // Create new classification
            const poule = (team.category === 'U18 GARCONS' || team.category === 'L2A MESSIEUR')
                ? ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
                : undefined;
            const classification = new Classification_1.default({
                team: team._id,
                category: team.category,
                poule: poule,
                position: index + 1,
                played: 0,
                wins: 0,
                losses: 0,
                pointsFor: 0,
                pointsAgainst: 0,
                pointsDifference: 0,
                points: 0,
                recentResults: []
            });
            await classification.save();
            console.log(`Created classification for ${team.name} in ${team.category}`);
            return classification;
        });
        await Promise.all(classificationPromises);
        console.log('All classifications initialized successfully');
        // Sort and update positions for each category
        const categories = [...new Set(teams.map(team => team.category))];
        for (const category of categories) {
            const classifications = await Classification_1.default.find({ category })
                .populate('team')
                .sort({ points: -1, pointsDifference: -1, pointsFor: -1 });
            for (let i = 0; i < classifications.length; i++) {
                classifications[i].position = i + 1;
                await classifications[i].save();
            }
            console.log(`Updated positions for ${category}: ${classifications.length} teams`);
        }
        console.log('Classification initialization completed');
        process.exit(0);
    }
    catch (error) {
        console.error('Error initializing classifications:', error);
        process.exit(1);
    }
}
initializeClassifications();
