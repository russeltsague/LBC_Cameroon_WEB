import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Match } from '../src/models/Match';
import Team from '../src/models/Team';
import Classification from '../src/models/Classification';
import Stats from '../src/models/Stats';

dotenv.config();

interface CorrectedMatch {
  date: string;
  category: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  poule?: string;
}

const correctedMatches: CorrectedMatch[] = [
  // Fill in with all mapped matches from the mapping and extracted data
  { date: '2025-03-01', category: 'L2A MESSIEUR', homeTeam: 'SEED EXPENDABLES', awayTeam: 'MARYJO', homeScore: 17, awayScore: 77, poule: 'B' },
  // ... (all other mapped matches)
];

async function insertAndUpdate() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');
    let inserted = 0;
    for (const m of correctedMatches) {
      const home = await Team.findOne({ name: m.homeTeam, category: m.category, poule: m.poule || undefined });
      const away = await Team.findOne({ name: m.awayTeam, category: m.category, poule: m.poule || undefined });
      if (!home || !away) {
        console.warn(`Skipping match: ${m.homeTeam} vs ${m.awayTeam} (team not found)`);
        continue;
      }
      await Match.create({
        date: new Date(m.date),
        time: '00:00',
        homeTeam: home._id,
        awayTeam: away._id,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        category: m.category,
        status: 'completed',
        venue: 'Unknown',
        poule: m.poule || home.poule || away.poule || undefined,
      });
      inserted++;
      console.log(`Inserted: ${m.homeTeam} vs ${m.awayTeam} (${m.category}${m.poule ? ', Poule ' + m.poule : ''})`);
    }
    console.log(`Done. Inserted: ${inserted}`);
    // Classification and stats update can be implemented here
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

insertAndUpdate(); 