import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from '../src/models/Match';
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
  journee: number; // Add this field
}

const correctedMatches: CorrectedMatch[] = [
  // Poule A, 1ère journée
  { homeTeam: 'LENA', awayTeam: 'MESSASSI', category: 'L2A MESSIEUR', poule: 'A', journee: 1, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'EXPENDABLES', awayTeam: 'JOAKIM BB', category: 'L2A MESSIEUR', poule: 'A', journee: 1, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'WOLVES2', awayTeam: 'AS KEEP', category: 'L2A MESSIEUR', poule: 'A', journee: 1, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'ALPH2', awayTeam: 'KLOES YD2', category: 'L2A MESSIEUR', poule: 'A', journee: 1, date: '', homeScore: 0, awayScore: 0 },

  // Poule A, 2e journée
  { homeTeam: 'JOAKIM BB', awayTeam: 'MENDONG', category: 'L2A MESSIEUR', poule: 'A', journee: 2, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'WOLVES2', awayTeam: 'MESSASSI', category: 'L2A MESSIEUR', poule: 'A', journee: 2, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'KLOES YD2', awayTeam: 'EXPENDABLES', category: 'L2A MESSIEUR', poule: 'A', journee: 2, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'ALPH2', awayTeam: 'AS KEEP', category: 'L2A MESSIEUR', poule: 'A', journee: 2, date: '', homeScore: 0, awayScore: 0 },

  // Poule A, 3e journée
  { homeTeam: 'WOLVES2', awayTeam: 'LENA', category: 'L2A MESSIEUR', poule: 'A', journee: 3, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MENDONG', awayTeam: 'KLOES YD2', category: 'L2A MESSIEUR', poule: 'A', journee: 3, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'ALPH2', awayTeam: 'MESSASSI', category: 'L2A MESSIEUR', poule: 'A', journee: 3, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'EXPENDABLES', awayTeam: 'AS KEEP', category: 'L2A MESSIEUR', poule: 'A', journee: 3, date: '', homeScore: 0, awayScore: 0 },

  // Poule A, 4e journée
  { homeTeam: 'KLOES YD2', awayTeam: 'JOAKIM BB', category: 'L2A MESSIEUR', poule: 'A', journee: 4, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'ALPH2', awayTeam: 'LENA', category: 'L2A MESSIEUR', poule: 'A', journee: 4, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'AS KEEP', awayTeam: 'MENDONG', category: 'L2A MESSIEUR', poule: 'A', journee: 4, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'EXPENDABLES', awayTeam: 'MESSASSI', category: 'L2A MESSIEUR', poule: 'A', journee: 4, date: '', homeScore: 0, awayScore: 0 },

  // Poule A, 5e journée
  { homeTeam: 'ALPH2', awayTeam: 'WOLVES2', category: 'L2A MESSIEUR', poule: 'A', journee: 5, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'JOAKIM BB', awayTeam: 'AS KEEP', category: 'L2A MESSIEUR', poule: 'A', journee: 5, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'EXPENDABLES', awayTeam: 'LENA', category: 'L2A MESSIEUR', poule: 'A', journee: 5, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MENDONG', awayTeam: 'MESSASSI', category: 'L2A MESSIEUR', poule: 'A', journee: 5, date: '', homeScore: 0, awayScore: 0 },

  // Poule A, 6e journée
  { homeTeam: 'AS KEEP', awayTeam: 'KLOES YD2', category: 'L2A MESSIEUR', poule: 'A', journee: 6, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'EXPENDABLES', awayTeam: 'WOLVES2', category: 'L2A MESSIEUR', poule: 'A', journee: 6, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MESSASSI', awayTeam: 'JOAKIM BB', category: 'L2A MESSIEUR', poule: 'A', journee: 6, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MENDONG', awayTeam: 'LENA', category: 'L2A MESSIEUR', poule: 'A', journee: 6, date: '', homeScore: 0, awayScore: 0 },

  // Poule A, 7e journée
  { homeTeam: 'EXPENDABLES', awayTeam: 'ALPH2', category: 'L2A MESSIEUR', poule: 'A', journee: 7, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'KLOES YD2', awayTeam: 'MESSASSI', category: 'L2A MESSIEUR', poule: 'A', journee: 7, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MENDONG', awayTeam: 'WOLVES2', category: 'L2A MESSIEUR', poule: 'A', journee: 7, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'JOAKIM BB', awayTeam: 'LENA', category: 'L2A MESSIEUR', poule: 'A', journee: 7, date: '', homeScore: 0, awayScore: 0 },

  // Poule A, 8e journée
  { homeTeam: 'MESSASSI', awayTeam: 'AS KEEP', category: 'L2A MESSIEUR', poule: 'A', journee: 8, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MENDONG', awayTeam: 'ALPH2', category: 'L2A MESSIEUR', poule: 'A', journee: 8, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'LENA', awayTeam: 'KLOES YD2', category: 'L2A MESSIEUR', poule: 'A', journee: 8, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'JOAKIM BB', awayTeam: 'WOLVES2', category: 'L2A MESSIEUR', poule: 'A', journee: 8, date: '', homeScore: 0, awayScore: 0 },

  // Poule A, 9e journée
  { homeTeam: 'MENDONG', awayTeam: 'EXPENDABLES', category: 'L2A MESSIEUR', poule: 'A', journee: 9, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'AS KEEP', awayTeam: 'LENA', category: 'L2A MESSIEUR', poule: 'A', journee: 9, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'JOAKIM BB', awayTeam: 'ALPH2', category: 'L2A MESSIEUR', poule: 'A', journee: 9, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'KLOES YD2', awayTeam: 'WOLVES2', category: 'L2A MESSIEUR', poule: 'A', journee: 9, date: '', homeScore: 0, awayScore: 0 },

  // Poule B, 1ère journée
  { homeTeam: 'WOLVES1', awayTeam: 'FUSEE', category: 'L2A MESSIEUR', poule: 'B', journee: 1, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MSA', awayTeam: 'ALL SPORT', category: 'L2A MESSIEUR', poule: 'B', journee: 1, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'SEED EXPENDABLES', awayTeam: 'MARY JO', category: 'L2A MESSIEUR', poule: 'B', journee: 1, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MC NOAH2', awayTeam: 'APEJES', category: 'L2A MESSIEUR', poule: 'B', journee: 1, date: '', homeScore: 0, awayScore: 0 },

  // Poule B, 2e journée
  { homeTeam: 'ALL SPORT', awayTeam: 'BOFIA BB', category: 'L2A MESSIEUR', poule: 'B', journee: 2, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'SEED EXPENDABLES', awayTeam: 'FUSEE', category: 'L2A MESSIEUR', poule: 'B', journee: 2, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'APEJES', awayTeam: 'MSA', category: 'L2A MESSIEUR', poule: 'B', journee: 2, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MC NOAH2', awayTeam: 'MARY JO', category: 'L2A MESSIEUR', poule: 'B', journee: 2, date: '', homeScore: 0, awayScore: 0 },

  // Poule B, 3e journée
  { homeTeam: 'SEED EXPENDABLES', awayTeam: 'WOLVES1', category: 'L2A MESSIEUR', poule: 'B', journee: 3, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'BOFIA BB', awayTeam: 'APEJES', category: 'L2A MESSIEUR', poule: 'B', journee: 3, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MARY JO', awayTeam: 'FUSEE', category: 'L2A MESSIEUR', poule: 'B', journee: 3, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MSA', awayTeam: 'MC NOAH2', category: 'L2A MESSIEUR', poule: 'B', journee: 3, date: '', homeScore: 0, awayScore: 0 },

  // Poule B, 4e journée
  { homeTeam: 'APEJES', awayTeam: 'JOAKIM BB', category: 'L2A MESSIEUR', poule: 'B', journee: 4, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MC NOAH2', awayTeam: 'FUSEE', category: 'L2A MESSIEUR', poule: 'B', journee: 4, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'BOFIA BB', awayTeam: 'ALL SPORT', category: 'L2A MESSIEUR', poule: 'B', journee: 4, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MSA', awayTeam: 'SEED EXPENDABLES', category: 'L2A MESSIEUR', poule: 'B', journee: 4, date: '', homeScore: 0, awayScore: 0 },

  // Poule B, 5e journée
  { homeTeam: 'MC NOAH2', awayTeam: 'SEED EXPENDABLES', category: 'L2A MESSIEUR', poule: 'B', journee: 5, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'ALL SPORT', awayTeam: 'MARY JO', category: 'L2A MESSIEUR', poule: 'B', journee: 5, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MSA', awayTeam: 'WOLVES1', category: 'L2A MESSIEUR', poule: 'B', journee: 5, date: '', homeScore: 0, awayScore: 0 },

  // Poule B, 6e journée
  { homeTeam: 'MARY JO', awayTeam: 'APEJES', category: 'L2A MESSIEUR', poule: 'B', journee: 6, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'SEED EXPENDABLES', awayTeam: 'MSA', category: 'L2A MESSIEUR', poule: 'B', journee: 6, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'FUSEE', awayTeam: 'ALL SPORT', category: 'L2A MESSIEUR', poule: 'B', journee: 6, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'BOFIA BB', awayTeam: 'MC NOAH2', category: 'L2A MESSIEUR', poule: 'B', journee: 6, date: '', homeScore: 0, awayScore: 0 },

  // Poule B, 7e journée
  { homeTeam: 'BOFIA BB', awayTeam: 'FUSEE', category: 'L2A MESSIEUR', poule: 'B', journee: 7, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'APEJES', awayTeam: 'MC NOAH2', category: 'L2A MESSIEUR', poule: 'B', journee: 7, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MSA', awayTeam: 'MC NOAH2', category: 'L2A MESSIEUR', poule: 'B', journee: 7, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'ALL SPORT', awayTeam: 'WOLVES1', category: 'L2A MESSIEUR', poule: 'B', journee: 7, date: '', homeScore: 0, awayScore: 0 },

  // Poule B, 8e journée
  { homeTeam: 'BOFIA BB', awayTeam: 'WOLVES1', category: 'L2A MESSIEUR', poule: 'B', journee: 8, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'FUSEE', awayTeam: 'MARY JO', category: 'L2A MESSIEUR', poule: 'B', journee: 8, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'BOFIA BB', awayTeam: 'MC NOAH2', category: 'L2A MESSIEUR', poule: 'B', journee: 8, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'ALL SPORT', awayTeam: 'SEED EXPENDABLES', category: 'L2A MESSIEUR', poule: 'B', journee: 8, date: '', homeScore: 0, awayScore: 0 },

  // Poule B, 9e journée
  { homeTeam: 'BOFIA BB', awayTeam: 'MSA', category: 'L2A MESSIEUR', poule: 'B', journee: 9, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'MARY JO', awayTeam: 'WOLVES1', category: 'L2A MESSIEUR', poule: 'B', journee: 9, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'ALL SPORT', awayTeam: 'MC NOAH2', category: 'L2A MESSIEUR', poule: 'B', journee: 9, date: '', homeScore: 0, awayScore: 0 },
  { homeTeam: 'APEJES', awayTeam: 'SEED EXPENDABLES', category: 'L2A MESSIEUR', poule: 'B', journee: 9, date: '', homeScore: 0, awayScore: 0 },
];

async function insertAndUpdate() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');
    let updated = 0;
    for (const m of correctedMatches) {
      // Use case-insensitive, partial matching for team names
      const home = await Team.findOne({
        name: { $regex: m.homeTeam, $options: 'i' },
        category: m.category,
        poule: m.poule
      });
      const away = await Team.findOne({
        name: { $regex: m.awayTeam, $options: 'i' },
        category: m.category,
        poule: m.poule
      });
      if (!home || !away) {
        console.warn(`Skipping match: ${m.homeTeam} vs ${m.awayTeam} (team not found)`);
        continue;
      }
      const match = await Match.findOneAndUpdate(
        {
        homeTeam: home._id,
        awayTeam: away._id,
        category: m.category,
          poule: m.poule,
        },
        { $set: { journee: m.journee } },
        { new: true }
      );
      if (match) {
        updated++;
        console.log(`Updated: ${m.homeTeam} vs ${m.awayTeam} (Poule ${m.poule}) to journee ${m.journee}`);
      } else {
        console.warn(`No match found for: ${m.homeTeam} vs ${m.awayTeam} (Poule ${m.poule})`);
      }
    }
    console.log(`Done. Updated ${updated} matches.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

insertAndUpdate(); 