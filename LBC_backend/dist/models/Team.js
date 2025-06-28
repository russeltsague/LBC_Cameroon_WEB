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
                'CORPORATES'
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
}, { timestamps: true });
// Add compound unique index
TeamSchema.index({ name: 1, category: 1, poule: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Team', TeamSchema);
