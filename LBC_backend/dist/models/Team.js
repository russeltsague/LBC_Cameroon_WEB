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
const TeamSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Team name is required'],
    },
    city: { type: String, required: true },
    logo: { type: String, default: '/default-logo.png' },
    founded: { type: Number, required: true },
    arena: { type: String, required: true },
    championships: { type: Number, default: 0 },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: [
                'L1 MESSIEUR',
                'L1 DAME',
                'L2A MESSIEUR',
                'L2B MESSIEUR',
                'U18 GARCONS',
                'U18 FILLES',
                'VETERANS',
                'CORPORATES',
                'DAMES'
            ],
            message: '{VALUE} is not a valid category',
        },
    },
    coach: { type: String, required: true },
    about: { type: String, required: true },
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
    isActive: { type: Boolean, default: true },
    contactEmail: { type: String },
    contactPhone: { type: String },
    website: { type: String },
    socialMedia: {
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String }
    },
    // Classification statistics
    classificationStats: {
        played: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        forfeits: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        pointsFor: { type: Number, default: 0 },
        pointsAgainst: { type: Number, default: 0 },
        goalDifference: { type: Number, default: 0 },
        last5: [{
                opponent: { type: String, required: true },
                isHome: { type: Boolean, required: true },
                pointsFor: { type: Number, required: true },
                pointsAgainst: { type: Number, required: true },
                result: { type: String, enum: ['W', 'D', 'L', 'F'], required: true },
                date: { type: Date, required: true }
            }]
    },
    players: [{
            name: { type: String, required: true },
            number: { type: Number },
            position: { type: String },
            role: { type: String },
            birthDate: { type: String },
            height: { type: Number },
            weight: { type: Number },
            nationality: { type: String },
            image: { type: String },
            type: { type: String, default: 'player' }
        }],
    staff: [{
            name: { type: String, required: true },
            role: { type: String },
            type: { type: String, default: 'staff' }
        }]
}, { timestamps: true });
// Add compound unique index
TeamSchema.index({ name: 1, category: 1, poule: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Team', TeamSchema);
