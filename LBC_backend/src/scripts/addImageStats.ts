import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from '../models/Match';
import Stats from '../models/Stats';

dotenv.config();

const statsConfig = [
  { category: 'U18 FILLES', matchesToPlay: 78 },
  { category: 'U18 GARCONS', subcategory: 'PA', matchesToPlay: 45 },
  { category: 'U18 GARCONS', subcategory: 'PB', matchesToPlay: 36 },
  { category: 'U18 GARCONS', subcategory: 'PC', matchesToPlay: 36 },
  { category: 'L2B MESSIEUR', matchesToPlay: 45 },
  { category: 'L2A MESSIEUR', subcategory: 'PA', matchesToPlay: 36 },
  { category: 'L2A MESSIEUR', subcategory: 'PB', matchesToPlay: 36 },
  { category: 'L1 DAME', matchesToPlay: 45 },
  { category: 'L1 MESSIEUR', matchesToPlay: 91 },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('Connected to MongoDB for updating image stats.');

  let inserted = 0;
  for (const s of statsConfig) {
    let matchQuery: any = { category: s.category, status: 'completed' };
    if (s.subcategory) {
      // For poule-based stats, subcategory is poule (PA, PB, PC)
      matchQuery.poule = s.subcategory.replace('P', ''); // 'PA' -> 'A'
    }
    const matchesPlayed = await Match.countDocuments(matchQuery);
    const percent = s.matchesToPlay > 0 ? Math.round((matchesPlayed / s.matchesToPlay) * 100) : 0;
    await Stats.findOneAndUpdate(
      { category: s.category, subcategory: s.subcategory },
      { ...s, matchesPlayed, percent },
      { upsert: true, new: true }
    );
    inserted++;
    console.log(`Updated: ${s.category}${s.subcategory ? ' - ' + s.subcategory : ''} | Played: ${matchesPlayed} / ${s.matchesToPlay} (${percent}%)`);
  }
  console.log(`Done. Updated: ${inserted}`);
  process.exit(0);
};

run(); 