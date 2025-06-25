import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  date: Date;
  time: string;
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  homeScore?: number;
  awayScore?: number;
  category: string;
  poule?: string;
  venue: string;
  status: 'completed' | 'upcoming' | 'live';
  forfeit?: 'home' | 'away' | null;
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>({
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
  },
  homeTeam: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Home team is required'],
  },
  awayTeam: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Away team is required'],
  },
  homeScore: {
    type: Number,
    default: null,
  },
  awayScore: {
    type: Number,
    default: null,
  },
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
        'VETERANT',
        'CORPO'
      ],
      message: '{VALUE} is not a valid category',
    },
  },
  poule: {
    type: String,
    enum: {
      values: ['A', 'B', 'C'],
      message: '{VALUE} is not a valid poule',
    },
    validate: {
      validator: function(this: IMatch, poule: string) {
        // Only require poule for U18 GARCONS and L2A MESSIEUR
        if (this.category === 'U18 GARCONS' || this.category === 'L2A MESSIEUR') {
          return poule != null;
        }
        return true;
      },
      message: 'Poule is required for U18 GARCONS and L2A MESSIEUR categories'
    }
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['completed', 'upcoming', 'live'],
      message: '{VALUE} is not a valid status',
    },
    default: 'upcoming',
  },
  forfeit: {
    type: String,
    enum: {
      values: ['home', 'away', null],
      message: '{VALUE} is not a valid forfeit value',
    },
    default: null,
  },
}, {
  timestamps: true,
});

// Add indexes for better query performance
matchSchema.index({ category: 1, date: 1 });
matchSchema.index({ homeTeam: 1, awayTeam: 1 });
matchSchema.index({ status: 1 });

export default mongoose.model<IMatch>('Match', matchSchema); 