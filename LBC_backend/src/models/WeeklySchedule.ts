import mongoose, { Document, Schema } from 'mongoose';

export interface IWeeklyMatch extends Document {
  category: string;
  teams: string; // "Team1 vs Team2" format
  groupNumber: string;
  terrain: string;
  journey: string;
  homeTeam: string; // Extracted from teams string
  awayTeam: string; // Extracted from teams string
}

export interface IWeeklySchedule extends Document {
  date: string;
  venue: string;
  matches: IWeeklyMatch[];
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const weeklyMatchSchema = new Schema<IWeeklyMatch>({
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  teams: {
    type: String,
    required: [true, 'Teams are required'],
    trim: true,
    validate: {
      validator: function(teams: string) {
        // Validate "Team1 vs Team2" format
        return teams.includes(' vs ');
      },
      message: 'Teams must be in "Team1 vs Team2" format'
    }
  },
  groupNumber: {
    type: String,
    trim: true,
    default: ''
  },
  terrain: {
    type: String,
    trim: true,
    default: 'T1'
  },
  journey: {
    type: String,
    trim: true,
    default: '1'
  },
  homeTeam: {
    type: String,
    required: [true, 'Home team is required'],
    trim: true
  },
  awayTeam: {
    type: String,
    required: [true, 'Away team is required'],
    trim: true
  }
}, { _id: true });

// Pre-save middleware to extract home and away teams from teams string
weeklyMatchSchema.pre('save', function(next) {
  if (this.teams && this.teams.includes(' vs ')) {
    const [homeTeam, awayTeam] = this.teams.split(' vs ').map(team => team.trim());
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
  }
  next();
});

const weeklyScheduleSchema = new Schema<IWeeklySchedule>({
  date: {
    type: String,
    required: [true, 'Date is required'],
    validate: {
      validator: function(date: string) {
        // Validate YYYY-MM-DD format
        return /^\d{4}-\d{2}-\d{2}$/.test(date);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  matches: [weeklyMatchSchema],
  isExpanded: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
weeklyScheduleSchema.index({ date: 1 });
weeklyScheduleSchema.index({ venue: 1 });
weeklyScheduleSchema.index({ 'matches.category': 1 });

export default mongoose.model<IWeeklySchedule>('WeeklySchedule', weeklyScheduleSchema);
