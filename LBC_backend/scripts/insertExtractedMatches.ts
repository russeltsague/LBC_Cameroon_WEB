import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Match } from '../src/models/Match';
import Team from '../src/models/Team';

dotenv.config();

const matches = [
  // Samedi, 01 mars 2025
  { date: '2025-03-01', category: 'U18 FILLES', homeTeam: 'FUSEE', awayTeam: 'FAP', homeScore: 40, awayScore: 74 },
  { date: '2025-03-01', category: 'U18 FILLES', homeTeam: 'PLAY2LEAD', awayTeam: 'MARIK KLOES', homeScore: 27, awayScore: 42 },
  { date: '2025-03-01', category: 'U18 GARCONS', homeTeam: 'ACPBA', awayTeam: 'COSBIE', homeScore: 40, awayScore: 38 },
  { date: '2025-03-01', category: 'L2B MESSIEUR', homeTeam: 'MBALMAYO BB', awayTeam: 'HAND OF GOD', homeScore: 45, awayScore: 42 },
  { date: '2025-03-01', category: 'L2A MESSIEUR', homeTeam: 'KLOES YD2', awayTeam: 'ALPH2', homeScore: 48, awayScore: 47 },
  { date: '2025-03-01', category: 'L2A MESSIEUR', homeTeam: 'MARY JO', awayTeam: 'MSA', homeScore: 53, awayScore: 38 },
  { date: '2025-03-01', category: 'L2A MESSIEUR', homeTeam: 'MENDONG', awayTeam: 'LENA', homeScore: 60, awayScore: 41 },
  { date: '2025-03-01', category: 'L2A MESSIEUR', homeTeam: 'SEED EXP.', awayTeam: 'MARFEE', homeScore: 17, awayScore: 56 },
  { date: '2025-03-01', category: 'L1 MESSIEUR', homeTeam: 'FALCONS', awayTeam: 'FRIENDSHIP', homeScore: 69, awayScore: 37 },
  { date: '2025-03-01', category: 'L1 MESSIEUR', homeTeam: '512 SA', awayTeam: 'NYBA', homeScore: 51, awayScore: 47 },
  // ... (all other matches from extraction, structured as above)
];

async function insertMatches() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');
    let inserted = 0;
    for (const m of matches) {
      // Find home and away team IDs
      const home = await Team.findOne({ name: m.homeTeam, category: m.category });
      const away = await Team.findOne({ name: m.awayTeam, category: m.category });
      if (!home || !away) {
        console.warn(`Skipping match: ${m.homeTeam} vs ${m.awayTeam} (team not found)`);
        continue;
      }
      const matchData: any = {
        date: new Date(m.date),
        time: '00:00',
        homeTeam: home._id,
        awayTeam: away._id,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        category: m.category,
        status: 'completed',
        venue: 'Unknown',
      };
      if ('poule' in m) {
        matchData.poule = (m as any).poule || home.poule || away.poule || undefined;
      }
      await Match.create(matchData);
      inserted++;
      console.log(`Inserted: ${m.homeTeam} vs ${m.awayTeam} (${m.category})`);
    }
    console.log(`Done. Inserted: ${inserted}`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

insertMatches(); 