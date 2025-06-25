import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './LBC_backend02/.env' });

const uri = process.env.MONGO_URI;

const run = async () => {
  if (!uri) {
    console.error('MONGO_URI not set in environment.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('No DB connection');
    const result = await db.collection('teams').dropIndex('name_1');
    console.log('Drop index result:', result);
  } catch (e) {
    const err = e as Error;
    console.error('Error dropping index:', err.message || err);
  } finally {
    process.exit(0);
  }
};

run(); 