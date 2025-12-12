import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsor extends Document {
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  sponsorshipLevel: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SponsorSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logoUrl: {
    type: String,
    required: [true, 'Logo URL is required'],
    trim: true
  },
  websiteUrl: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  sponsorshipLevel: {
    type: String,
    required: [true, 'Sponsorship level is required'],
    enum: ['Platinum', 'Gold', 'Silver', 'Bronze', 'Partner'],
    default: 'Partner'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
SponsorSchema.index({ isActive: 1, sponsorshipLevel: 1 });
SponsorSchema.index({ name: 1 });

export default mongoose.model<ISponsor>('Sponsor', SponsorSchema); 