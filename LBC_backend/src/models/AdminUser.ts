import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminUser extends Document {
  username: string;
  password: string;
  roles: string[];
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 32
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  roles: [{
    type: String,
    enum: ['player', 'technical_official', 'coach', 'medical_staff', 'manager'],
    default: ['player']
  }]
}, { timestamps: true });

// Hash password before save
AdminUserSchema.pre<IAdminUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminUserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IAdminUser>('AdminUser', AdminUserSchema); 