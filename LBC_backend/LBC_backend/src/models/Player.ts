import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer extends Document {
  team: mongoose.Types.ObjectId;
  name: string;
  number: number;
  position: string;
  height: string;
  age: number;
}

const PlayerSchema: Schema = new Schema({
  team: { 
    type: Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  name: { type: String, required: true },
  number: { type: Number, required: true },
  position: { type: String, required: true },
  height: { type: String, required: true },
  age: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IPlayer>('Player', PlayerSchema);