import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from '../src/models/Match';

dotenv.config();

async function clearMatchesWithoutJournee() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    const result = await Match.deleteMany({ $or: [ { journee: { $exists: false } }, { journee: null } ] });
    console.log(`Deleted ${result.deletedCount} matches without journee.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

clearMatchesWithoutJournee(); 