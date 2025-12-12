import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date?: string;
  time?: string;
  venue?: string;
}

export interface IJournee {
  n: number;
  matches: IMatch[];
  exempt?: string;
}

export interface IPoule {
  name: string;
  teams: string[];
  journées: IJournee[];
}

export interface IPlayoffRound {
  name: string;
  matches: IMatch[];
}

export interface ICalendar extends Document {
  category: string;
  hasPoules: boolean;
  poules?: IPoule[];
  playoffs?: IPlayoffRound[];
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>({
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  homeScore: { type: Number },
  awayScore: { type: Number },
  date: { type: String },
  time: { type: String },
  venue: { type: String }
}, { _id: false });

const JourneeSchema = new Schema<IJournee>({
  n: { type: Number, required: true },
  matches: [MatchSchema],
  exempt: { type: String }
}, { _id: false });

const PouleSchema = new Schema<IPoule>({
  name: { type: String, required: true },
  teams: [{ type: String, required: true }],
  journées: [JourneeSchema]
}, { _id: false });

const PlayoffRoundSchema = new Schema<IPlayoffRound>({
  name: { type: String, required: true },
  matches: [MatchSchema]
}, { _id: false });

const CalendarSchema = new Schema<ICalendar>({
  category: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  hasPoules: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  poules: [PouleSchema],
  playoffs: [PlayoffRoundSchema]
}, {
  timestamps: true
});

// Index for faster lookups
CalendarSchema.index({ category: 1 });

export const Calendar = mongoose.model<ICalendar>('Calendar', CalendarSchema);
