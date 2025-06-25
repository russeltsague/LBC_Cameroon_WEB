import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  hasPoules: boolean;
  poules: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  hasPoules: {
    type: Boolean,
    default: false
  },
  poules: [{
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    validate: {
      validator: function(this: ICategory, poules: string[]) {
        // If hasPoules is true, poules array must not be empty
        if (this.hasPoules && (!poules || poules.length === 0)) {
          return false;
        }
        // If hasPoules is false, poules array should be empty
        if (!this.hasPoules && poules && poules.length > 0) {
          return false;
        }
        return true;
      },
      message: 'Poules configuration is invalid'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Add indexes for better query performance
CategorySchema.index({ name: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ hasPoules: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema); 