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
        enum: {
            values: [
                'L1 MESSIEUR',
                'L1 DAME',
                'L2A MESSIEUR',
                'L2B MESSIEUR',
                'U18 GARCONS',
                'U18 FILLES',
                'VETERANT',
                'CORPO'
            ],
            message: '{VALUE} is not a valid category'
        }
    },
    poule: {
        type: String,
        enum: {
            values: ['A', 'B', 'C'],
            message: '{VALUE} is not a valid poule',
        },
        validate: {
            validator: function (poule) {
                // Only require poule for U18 GARCONS and L2A MESSIEUR
                if (this.category === 'U18 GARCONS' || this.category === 'L2A MESSIEUR') {
                    return poule != null;
                }
                return true;
            },
            message: 'Poule is required for U18 GARCONS and L2A MESSIEUR categories'
        }
    },
    played: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    pointsFor: { type: Number, default: 0 },
    pointsAgainst: { type: Number, default: 0 },
    pointsDifference: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    position: { type: Number, required: true },
    recentResults: [{ type: String, enum: ['W', 'L'] }],
}, { timestamps: true });
// Add indexes for better query performance
ClassificationSchema.index({ category: 1, points: -1 });
ClassificationSchema.index({ team: 1, category: 1 }, { unique: true });
ClassificationSchema.index({ category: 1, poule: 1, points: -1, pointsDifference: -1 });
// Method to update recent results
ClassificationSchema.methods.updateRecentResults = function (result) {
    this.recentResults = [result, ...this.recentResults].slice(0, 5);
    return this.save();
};
// Method to get current streak
ClassificationSchema.methods.getCurrentStreak = function () {
    return this.recentResults.slice(0, 5);
};
exports.default = mongoose_1.default.model('Classification', ClassificationSchema);
