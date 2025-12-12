"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ClassificationSchema = new mongoose_1.Schema({
    team: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true,
        enum: [
            'L1 MESSIEUR',
            'L1 DAME',
            'L2A MESSIEUR',
            'L2B MESSIEUR',
            'U18 GARCONS',
            'U18 FILLES',
            'VETERANT',
            'CORPO'
        ]
    },
    poule: {
        type: String,
        enum: ['A', 'B', 'C'],
        index: true
    },
    position: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    goalDifference: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    form: { type: [String], default: [], maxlength: 5 },
    cleanSheets: { type: Number, default: 0 },
    failedToScore: { type: Number, default: 0 },
    last5: [{
            opponent: { type: String, required: true },
            isHome: { type: Boolean, required: true },
            goalsFor: { type: Number, required: true },
            goalsAgainst: { type: Number, required: true },
            result: { type: String, enum: ['W', 'D', 'L'], required: true },
            date: { type: Date, required: true }
        }]
}, { timestamps: true });
// Add indexes for better query performance
ClassificationSchema.index({ category: 1, points: -1 });
ClassificationSchema.index({ team: 1, category: 1 }, { unique: true });
ClassificationSchema.index({ category: 1, poule: 1, points: -1, pointsDifference: -1 });
// Update team statistics based on match result
ClassificationSchema.methods.updateStats = async function (match) {
    const { isHome, opponent, goalsFor, goalsAgainst, date } = match;
    // Update basic stats
    this.gamesPlayed += 1;
    this.goalsFor += goalsFor;
    this.goalsAgainst += goalsAgainst;
    this.goalDifference = this.goalsFor - this.goalsAgainst;
    // Determine match result
    let result = 'D';
    if (goalsFor > goalsAgainst) {
        result = 'W';
        this.wins += 1;
        this.points += 3;
    }
    else if (goalsFor < goalsAgainst) {
        result = 'L';
        this.losses += 1;
    }
    else {
        this.draws += 1;
        this.points += 1;
    }
    // Update clean sheets and failed to score
    if (goalsAgainst === 0)
        this.cleanSheets += 1;
    if (goalsFor === 0)
        this.failedToScore += 1;
    // Update form (last 5 matches)
    this.form.unshift(result);
    if (this.form.length > 5)
        this.form.pop();
    // Update last 5 matches
    this.last5.unshift({
        opponent,
        isHome,
        goalsFor,
        goalsAgainst,
        result,
        date
    });
    if (this.last5.length > 5)
        this.last5.pop();
    await this.save();
};
// Get formatted statistics
ClassificationSchema.methods.getFormattedStats = function () {
    return {
        position: this.position,
        played: this.gamesPlayed,
        won: this.wins,
        drawn: this.draws,
        lost: this.losses,
        goalsFor: this.goalsFor,
        goalsAgainst: this.goalsAgainst,
        goalDifference: this.goalDifference,
        points: this.points,
        form: this.form.join(''),
        cleanSheets: this.cleanSheets,
        failedToScore: this.failedToScore,
        pointsPerGame: this.gamesPlayed > 0 ? (this.points / this.gamesPlayed).toFixed(2) : 0
    };
};
// Update positions for all teams in a category/poule
ClassificationSchema.statics.updatePositions = async function (category, poule) {
    const query = { category };
    if (poule)
        query.poule = poule;
    const teams = await this.find(query)
        .sort({ points: -1, goalDifference: -1, goalsFor: -1, goalsAgainst: 1 });
    // Update positions
    const bulkOps = teams.map((team, index) => ({
        updateOne: {
            filter: { _id: team._id },
            update: { $set: { position: index + 1 } }
        }
    }));
    if (bulkOps.length > 0) {
        await this.bulkWrite(bulkOps);
    }
};
exports.default = mongoose_1.default.model('Classification', ClassificationSchema);
