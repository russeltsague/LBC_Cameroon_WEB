"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("../config/db"));
const Team_1 = __importDefault(require("../models/Team"));
const Match_1 = __importDefault(require("../models/Match"));
const Classification_1 = __importDefault(require("../models/Classification"));
const Stats_1 = __importDefault(require("../models/Stats"));
dotenv_1.default.config({ path: './LBC_backend02/.env' });
const clearAllData = async () => {
    await (0, db_1.default)();
    console.log('Connected to MongoDB. Clearing all data...');
    await Promise.all([
        Team_1.default.deleteMany({}),
        Match_1.default.deleteMany({}),
        Classification_1.default.deleteMany({}),
        Stats_1.default.deleteMany({}),
    ]);
    console.log('All documents removed from Team, Match, Classification, and Stats collections.');
    process.exit(0);
};
clearAllData().catch((err) => {
    console.error('Error clearing data:', err);
    process.exit(1);
});
