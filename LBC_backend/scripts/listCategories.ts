import mongoose from 'mongoose';
import Team from '../src/models/Team';
import dotenv from 'dotenv';
dotenv.config();

async function listCategories() {
  await mongoose.connect(process.env.MONGO_URI!);
  const categories = await Team.distinct('category');
  console.log('Unique team categories:');
  categories.forEach(cat => console.log(cat));
  process.exit(0);
}

listCategories(); 