import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  city: string;
  logo: string;
  founded: number;
  arena: string;
  championships: number;
  category: 'L1 MESSIEUR' | 'L1 DAME' | 'L2A MESSIEUR' | 'L2B MESSIEUR'| 'U18 GARCONS' | 'U18 FILLES' | 'VETERANS' | 'CORPORATES';
  coach: string;
  about: string;
  poule?: string;
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
}, { timestamps: true });

// Add compound unique index
TeamSchema.index({ name: 1, category: 1, poule: 1 }, { unique: true });

export default mongoose.model<ITeam>('Team', TeamSchema);