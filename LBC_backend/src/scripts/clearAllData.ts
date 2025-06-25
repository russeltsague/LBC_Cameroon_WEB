import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import Team from '../models/Team';
import Match from '../models/Match';
import Classification from '../models/Classification';
import Stats from '../models/Stats';

dotenv.config({ path: './LBC_backend02/.env' });

const clearAllData = async () => {
  await connectDB();
  console.log('Connected to MongoDB. Clearing all data...');

  await Promise.all([
    Team.deleteMany({}),
    Match.deleteMany({}),
    Classification.deleteMany({}),
    Stats.deleteMany({}),
  ]);

  console.log('All documents removed from Team, Match, Classification, and Stats collections.');
  process.exit(0);
};

clearAllData().catch((err) => {
  console.error('Error clearing data:', err);
  process.exit(1);
}); 