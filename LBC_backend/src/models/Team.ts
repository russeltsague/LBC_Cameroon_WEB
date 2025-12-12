import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  city: string;
  logo: string;
  founded: number;
  arena: string;
  championships: number;
  category: string;
  coach: string;
  about: string;
  poule?: string;
  isActive: boolean;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  // Classification statistics
  classificationStats: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    forfeits: number;
    points: number;
    pointsFor: number;
    pointsAgainst: number;
    goalDifference: number;
    last5: Array<{
      opponent: string;
      isHome: boolean;
      pointsFor: number;
      pointsAgainst: number;
      result: 'W' | 'D' | 'L' | 'F';
      date: Date;
    }>;
  };
  players?: Array<{
    name: string;
    number?: number;
    position?: string;
    role?: string;
    birthDate?: string;
    height?: number;
    weight?: number;
    nationality?: string;
    image?: string;
    type: 'player';
  }>;
  staff?: Array<{
    name: string;
    role?: string;
    type: 'staff';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema({
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
      validator: function(this: ITeam, poule: string) {
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

export default mongoose.model<ITeam>('Team', TeamSchema);