import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); 

const connectDB = async () => {
  try {
    console.log('MONGO_URI:', process.env.MONGO_URI); // Debug line
    await mongoose.connect(process.env.MONGO_URI as string); // Ensure MONGO_URI is loaded
    console.log('✅ MongoDB connected');
  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
