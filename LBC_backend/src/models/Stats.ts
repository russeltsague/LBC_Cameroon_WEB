import mongoose, { Document, Schema } from 'mongoose';

export interface IStats extends Document {
  category: string;
  subcategory?: string; // e.g., poule or PA/PB/PC
  matchesToPlay: number;
  matchesPlayed: number;
  percent: number;
  createdAt: Date;
  updatedAt: Date;
}

const StatsSchema: Schema = new Schema({
  category: { type: String, required: true },
  subcategory: { type: String },
  matchesToPlay: { type: Number, required: true },
  matchesPlayed: { type: Number, required: true },
  percent: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IStats>('Stats', StatsSchema); 