import mongoose, { Schema, Document } from 'mongoose';

export interface IDayResult {
  day: string;
  matches: {
    category: string;
    results: string[];
  }[];
}

export interface ISanctions {
  heading: string;
  columns: string[];
  rows: string[][];
  note: string;
}

export interface IReport extends Document {
  season: string;
  reportTitle: string;
  date: string;
  secretary: string;
  resultsA: IDayResult[];
  decisionsB: string;
  sanctionsC: ISanctions;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DayResultSchema = new Schema({
  day: {
    type: String,
    required: true
  },
  matches: [{
    category: {
      type: String,
      required: true
    },
    results: [String]
  }]
}, { _id: false });

const SanctionsSchema = new Schema({
  heading: {
    type: String,
    required: true
  },
  columns: [String],
  rows: [[String]],
  note: {
    type: String,
    required: true
  }
}, { _id: false });

const ReportSchema = new Schema({
  season: {
    type: String,
    required: [true, 'Season is required'],
    trim: true
  },
  reportTitle: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    trim: true
  },
  secretary: {
    type: String,
    required: [true, 'Secretary is required'],
    trim: true
  },
  resultsA: [DayResultSchema],
  decisionsB: {
    type: String,
    required: true,
    trim: true
  },
  sanctionsC: {
    type: SanctionsSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
ReportSchema.index({ reportTitle: 1 });
ReportSchema.index({ season: 1 });
ReportSchema.index({ isActive: 1 });
ReportSchema.index({ createdAt: -1 });

export default mongoose.model<IReport>('Report', ReportSchema);
