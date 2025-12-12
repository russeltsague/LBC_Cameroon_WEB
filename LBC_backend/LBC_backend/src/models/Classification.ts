import mongoose, { Document, Schema } from 'mongoose';

export interface IClassification extends Document {
  team: mongoose.Types.ObjectId;
  category: string;
  poule?: string;
  position: number;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifference: number;
  points: number; // FIBA points: 2 for win, 1 for loss, 0 for forfeit
  recentResults: ('W' | 'L')[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassificationSchema: Schema = new Schema({
  team: { 
    type: Schema.Types.ObjectId, 
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
      validator: function(this: IClassification, poule: string) {
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
ClassificationSchema.methods.updateRecentResults = function(result: 'W' | 'L') {
  this.recentResults = [result, ...this.recentResults].slice(0, 5);
  return this.save();
};

// Method to get current streak
ClassificationSchema.methods.getCurrentStreak = function(): ('W' | 'L')[] {
  return this.recentResults.slice(0, 5);
};

export default mongoose.model<IClassification>('Classification', ClassificationSchema);