import mongoose from 'mongoose';
import Team from '../src/models/Team';
import dotenv from 'dotenv';
dotenv.config();

const damesTeams = [
  'FAP',
  'LENA',
  'AS KEEP2',
  'OVERDOSE',
  'FAP2',
  'AS KEEP',
  'MC NOAH',
  'MARIK YD2',
  'ONYX',
  'FALCONS',
  'KLOES YD2',
];

async function insertMissingTeams() {
  await mongoose.connect(process.env.MONGO_URI!);
  let inserted = 0;
  for (const name of damesTeams) {
    const existing = await Team.findOne({ name, category: 'DAMES' });
    if (existing) {
      console.log(`Team already exists: ${name}`);
      continue;
    }
    await Team.create({
      name,
      category: 'DAMES',
      city: 'Unknown',
      logo: '',
      founded: 2024,
      arena: 'Unknown',
      championships: 0,
      coach: 'Unknown',
      about: 'Auto-imported',
    });
    inserted++;
    console.log(`Inserted team: ${name}`);
  }
  console.log(`Done. Inserted ${inserted} teams.`);
  process.exit(0);
}

insertMissingTeams(); 