import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Match } from '../src/models/Match';
import classificationService from '../src/services/classificationService';

dotenv.config();

async function updateAllClassifications() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');
    const matches = await Match.find({ status: 'completed' });
    console.log(`Found ${matches.length} completed matches`);
    for (const match of matches) {
      await classificationService.updateClassification(String(match._id));
      console.log(`Updated classification for match ${match._id}`);
    }
    console.log('All classifications updated.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

updateAllClassifications(); 