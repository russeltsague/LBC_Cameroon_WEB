"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Match_1 = __importDefault(require("../models/Match"));
const Stats_1 = __importDefault(require("../models/Stats"));
dotenv_1.default.config();
const statsConfig = [
    { category: 'U18 FILLES', matchesToPlay: 78 },
    { category: 'U18 GARCONS', subcategory: 'PA', matchesToPlay: 45 },
    { category: 'U18 GARCONS', subcategory: 'PB', matchesToPlay: 36 },
    { category: 'U18 GARCONS', subcategory: 'PC', matchesToPlay: 36 },
    { category: 'L2B MESSIEUR', matchesToPlay: 45 },
    { category: 'L2A MESSIEUR', subcategory: 'PA', matchesToPlay: 36 },
    { category: 'L2A MESSIEUR', subcategory: 'PB', matchesToPlay: 36 },
    { category: 'L1 DAME', matchesToPlay: 45 },
    { category: 'L1 MESSIEUR', matchesToPlay: 91 },
];
const run = async () => {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for updating image stats.');
    let inserted = 0;
    for (const s of statsConfig) {
        let matchQuery = { category: s.category, status: 'completed' };
        if (s.subcategory) {
            // For poule-based stats, subcategory is poule (PA, PB, PC)
            matchQuery.poule = s.subcategory.replace('P', ''); // 'PA' -> 'A'
        }
        const matchesPlayed = await Match_1.default.countDocuments(matchQuery);
        const percent = s.matchesToPlay > 0 ? Math.round((matchesPlayed / s.matchesToPlay) * 100) : 0;
        await Stats_1.default.findOneAndUpdate({ category: s.category, subcategory: s.subcategory }, { ...s, matchesPlayed, percent }, { upsert: true, new: true });
        inserted++;
        console.log(`Updated: ${s.category}${s.subcategory ? ' - ' + s.subcategory : ''} | Played: ${matchesPlayed} / ${s.matchesToPlay} (${percent}%)`);
    }
    console.log(`Done. Updated: ${inserted}`);
    process.exit(0);
};
run();
