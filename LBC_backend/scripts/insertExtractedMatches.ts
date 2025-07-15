import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from '../src/models/Match';
import Team from '../src/models/Team';

dotenv.config();

const teamNameMap: Record<string, string> = {
  'JOAKIM BB': 'JOAKIM',
  'WOLVES2': 'WOLVES 2',
  'AS KEEP': 'ASKEEP',
  'KLOES YD2': 'KLOES YDE2',
  // Poule B mappings
  'SEED EXPENDABLE': 'SEED EXPENDABLES',
  'SEED EXP.': 'SEED EXPENDABLES',
  'ALL SPORT': 'ALLSPORT',
  'FUSEE': 'FUSEE',
  'WOLVES1': 'WOLVE1',
  'MARY JO': 'MARYJO',
  'MSA': 'MSA MENDONGO',
  'BOFIA BB': 'BOFIA',
  'MC NOAH2': 'LAMAFEE(MCNOAH)',
  'APEJES': 'APEJES',
  // U18 GARCONS Poule A mappings
  'PLAY2LEAD': 'PLAY 2 LEADS',
  'EAST BB': 'EAST BASKET',
  '512 SA': '512 BA',
};

const matches = [
  // 1ère journée
  { journee: 1, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'LENA', awayTeam: 'MESSASSI', homeScore: 73, awayScore: 47 },
  { journee: 1, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'EXPENDABLES', awayTeam: 'JOAKIM BB' },
  { journee: 1, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'WOLVES2', awayTeam: 'AS KEEP' },
  { journee: 1, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'ALPH2', awayTeam: 'KLOES YD2' },
  // 2e journée
  { journee: 2, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'JOAKIM BB', awayTeam: 'MENDONG' },
  { journee: 2, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'WOLVES2', awayTeam: 'MESSASSI', homeScore: 49, awayScore: 74 },
  { journee: 2, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'KLOES YD2', awayTeam: 'EXPENDABLES' },
  { journee: 2, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'ALPH2', awayTeam: 'AS KEEP' },
  // 3e journée
  { journee: 3, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'WOLVES2', awayTeam: 'LENA', homeScore: 38, awayScore: 34 },
  { journee: 3, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'MENDONG', awayTeam: 'KLOES YD2' },
  { journee: 3, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'ALPH2', awayTeam: 'MESSASSI', homeScore: 48, awayScore: 56 },
  { journee: 3, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'EXPENDABLES', awayTeam: 'AS KEEP' },
  // 4e journée
  { journee: 4, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'KLOES YD2', awayTeam: 'JOAKIM BB' },
  { journee: 4, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'ALPH2', awayTeam: 'LENA' },
  { journee: 4, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'AS KEEP', awayTeam: 'MENDONG' },
  { journee: 4, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'EXPENDABLES', awayTeam: 'MESSASSI' },
  // 5e journée
  { journee: 5, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'ALPH2', awayTeam: 'JOAKIM BB', homeScore: 58, awayScore: 49 },
  { journee: 5, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'WOLVES2', awayTeam: 'AS KEEP', homeScore: 39, awayScore: 47 },
  { journee: 5, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'EXPENDABLES', awayTeam: 'MENDONG', homeScore: 54, awayScore: 49 },
  { journee: 5, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'MESSASSI', awayTeam: 'KLOES YD2' },
  // 6e journée
  { journee: 6, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'AS KEEP', awayTeam: 'JOAKIM BB' },
  { journee: 6, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'EXPENDABLES', awayTeam: 'ALPH2' },
  { journee: 6, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'MESSASSI', awayTeam: 'MENDONG' },
  { journee: 6, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'WOLVES2', awayTeam: 'LENA' },
  // 7e journée
  { journee: 7, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'EXPENDABLES', awayTeam: 'ALPH2', homeScore: 63, awayScore: 34 },
  { journee: 7, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'KLOES YD2', awayTeam: 'MESSASSI', homeScore: 49, awayScore: 39 },
  { journee: 7, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'MENDONG', awayTeam: 'WOLVES2', homeScore: 52, awayScore: 59 },
  { journee: 7, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'JOAKIM BB', awayTeam: 'LENA' },
  // 8e journée
  { journee: 8, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'MESSASSI', awayTeam: 'AS KEEP', homeScore: 71, awayScore: 73 },
  { journee: 8, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'MENDONG', awayTeam: 'ALPH2', homeScore: 47, awayScore: 42 },
  { journee: 8, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'LENA', awayTeam: 'KLOES YD2', homeScore: 37, awayScore: 48 },
  { journee: 8, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'JOAKIM BB', awayTeam: 'EXPENDABLES', homeScore: 58, awayScore: 73 },
  // 9e journée
  { journee: 9, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'MENDONG', awayTeam: 'EXPENDABLES', homeScore: 53, awayScore: 49 },
  { journee: 9, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'AS KEEP', awayTeam: 'LENA', homeScore: 30, awayScore: 49 },
  { journee: 9, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'JOAKIM BB', awayTeam: 'WOLVES2' },
  { journee: 9, category: 'L2A MESSIEUR', poule: 'A', homeTeam: 'KLOES YD2', awayTeam: 'WOLVES2', homeScore: 52, awayScore: 34 },
];

// Add Poule B matches below existing matches
matches.push(
  // 1ère journée
  { journee: 1, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'WOLVES1', awayTeam: 'FUSEE', homeScore: 21, awayScore: 33 },
  { journee: 1, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'MSA', awayTeam: 'ALL SPORT', homeScore: 39, awayScore: 30 },
  { journee: 1, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'SEED EXPENDABLE', awayTeam: 'MARY JO', homeScore: 44, awayScore: 71 },
  { journee: 1, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'MC NOAH2', awayTeam: 'APEJES', homeScore: 56, awayScore: 60 },
  // 2e journée
  { journee: 2, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'ALL SPORT', awayTeam: 'BOFIA BB', homeScore: 49, awayScore: 37 },
  { journee: 2, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'SEED EXPENDABLE', awayTeam: 'FUSEE', homeScore: 76, awayScore: 44 },
  { journee: 2, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'APEJES', awayTeam: 'MSA', homeScore: 57, awayScore: 41 },
  { journee: 2, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'MC NOAH2', awayTeam: 'MARY JO', homeScore: 49, awayScore: 57 },
  // 3e journée
  { journee: 3, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'SEED EXPENDABLE', awayTeam: 'WOLVES1', homeScore: 44, awayScore: 71 },
  { journee: 3, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'BOFIA BB', awayTeam: 'APEJES', homeScore: 49, awayScore: 43 },
  { journee: 3, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'MSA', awayTeam: 'FUSEE', homeScore: 38, awayScore: 53 },
  { journee: 3, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'ALL SPORT', awayTeam: 'MC NOAH2' },
  // 4e journée
  { journee: 4, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'APEJES', awayTeam: 'ALL SPORT' },
  { journee: 4, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'MC NOAH2', awayTeam: 'BOFIA BB' },
  { journee: 4, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'FUSEE', awayTeam: 'MARY JO' },
  { journee: 4, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'MSA', awayTeam: 'SEED EXPENDABLE' },
  // 5e journée
  { journee: 5, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'MC NOAH2', awayTeam: 'SEED EXPENDABLE' },
  { journee: 5, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'ALL SPORT', awayTeam: 'MARY JO' },
  { journee: 5, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'MSA', awayTeam: 'WOLVES1' },
  // 6e journée
  { journee: 6, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'MARY JO', awayTeam: 'APEJES' },
  { journee: 6, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'SEED EXPENDABLE', awayTeam: 'ALL SPORT' },
  { journee: 6, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'FUSEE', awayTeam: 'MSA' },
  // 7e journée
  { journee: 7, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'BOFIA BB', awayTeam: 'FUSEE', homeScore: 40, awayScore: 48 },
  // Exempt: APEJES
  // 8e journée
  { journee: 8, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'BOFIA BB', awayTeam: 'WOLVES1', homeScore: 38, awayScore: 49 },
  // Exempt: MC NOAH2
  // 9e journée
  { journee: 9, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'BOFIA BB', awayTeam: 'MSA', homeScore: 24, awayScore: 50 },
  { journee: 9, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'MARY JO', awayTeam: 'WOLVES1', homeScore: 42, awayScore: 36 },
  { journee: 9, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'ALL SPORT', awayTeam: 'MC NOAH2', homeScore: 32, awayScore: 44 },
  { journee: 9, category: 'L2A MESSIEUR', poule: 'B', homeTeam: 'APEJES', awayTeam: 'SEED EXPENDABLE', homeScore: 93, awayScore: 74 },
);

// Add U18 GARCONS Poule A matches below existing matches
matches.push(
  // 1ère journée
  { journee: 1, category: 'U18 GARCONS', poule: 'A', homeTeam: 'WILDCATS', awayTeam: 'ONYX', homeScore: 20, awayScore: 0 },
  { journee: 1, category: 'U18 GARCONS', poule: 'A', homeTeam: 'MC NOAH', awayTeam: 'JOAKIM BB', homeScore: 32, awayScore: 37 },
  { journee: 1, category: 'U18 GARCONS', poule: 'A', homeTeam: 'FUSEE', awayTeam: '512 SA', homeScore: 49, awayScore: 24 },
  { journee: 1, category: 'U18 GARCONS', poule: 'A', homeTeam: 'FALCONS', awayTeam: 'EAST BB' },
  { journee: 1, category: 'U18 GARCONS', poule: 'A', homeTeam: 'PLAY2LEAD', awayTeam: 'ETOUDI' },
  // 2e journée
  { journee: 2, category: 'U18 GARCONS', poule: 'A', homeTeam: 'JOAKIM BB', awayTeam: 'PLAY2LEAD' },
  { journee: 2, category: 'U18 GARCONS', poule: 'A', homeTeam: 'FUSEE', awayTeam: 'ONYX', homeScore: 39, awayScore: 76 },
  { journee: 2, category: 'U18 GARCONS', poule: 'A', homeTeam: 'EAST BB', awayTeam: '512 SA' },
  { journee: 2, category: 'U18 GARCONS', poule: 'A', homeTeam: 'FALCONS', awayTeam: 'WILDCATS', homeScore: 50, awayScore: 50 },
  { journee: 2, category: 'U18 GARCONS', poule: 'A', homeTeam: 'ETOUDI', awayTeam: 'WILDCATS' },
  // 3e journée
  { journee: 3, category: 'U18 GARCONS', poule: 'A', homeTeam: 'FUSEE', awayTeam: 'WILDCATS' },
  { journee: 3, category: 'U18 GARCONS', poule: 'A', homeTeam: 'PLAY2LEAD', awayTeam: 'EAST BB', homeScore: 44, awayScore: 37 },
  { journee: 3, category: 'U18 GARCONS', poule: 'A', homeTeam: 'FALCONS', awayTeam: '512 SA' },
  { journee: 3, category: 'U18 GARCONS', poule: 'A', homeTeam: 'MC NOAH', awayTeam: 'ETOUDI' },
  { journee: 3, category: 'U18 GARCONS', poule: 'A', homeTeam: 'JOAKIM BB', awayTeam: 'ONYX' },
  // 4e journée
  { journee: 4, category: 'U18 GARCONS', poule: 'A', homeTeam: 'EAST BB', awayTeam: 'JOAKIM BB', homeScore: 44, awayScore: 61 },
  { journee: 4, category: 'U18 GARCONS', poule: 'A', homeTeam: 'FALCONS', awayTeam: 'PLAY2LEAD' },
  { journee: 4, category: 'U18 GARCONS', poule: 'A', homeTeam: 'MC NOAH', awayTeam: 'FUSEE' },
  { journee: 4, category: 'U18 GARCONS', poule: 'A', homeTeam: 'ETOUDI', awayTeam: 'WILDCATS' },
  // 5e journée
  { journee: 5, category: 'U18 GARCONS', poule: 'A', homeTeam: 'FALCONS', awayTeam: 'FUSEE', homeScore: 81, awayScore: 13 },
  { journee: 5, category: 'U18 GARCONS', poule: 'A', homeTeam: 'JOAKIM BB', awayTeam: '512 SA', homeScore: 40, awayScore: 42 },
  { journee: 5, category: 'U18 GARCONS', poule: 'A', homeTeam: 'MC NOAH', awayTeam: 'WILDCATS' },
  { journee: 5, category: 'U18 GARCONS', poule: 'A', homeTeam: 'PLAY2LEAD', awayTeam: 'ONYX', homeScore: 56, awayScore: 63 },
  // 6e journée
  { journee: 6, category: 'U18 GARCONS', poule: 'A', homeTeam: '512 SA', awayTeam: 'EAST BB' },
  { journee: 6, category: 'U18 GARCONS', poule: 'A', homeTeam: 'MC NOAH', awayTeam: 'FALCONS' },
  { journee: 6, category: 'U18 GARCONS', poule: 'A', homeTeam: 'PLAY2LEAD', awayTeam: 'WILDCATS', homeScore: 46, awayScore: 30 },
  // 7e journée
  { journee: 7, category: 'U18 GARCONS', poule: 'A', homeTeam: 'EAST BB', awayTeam: 'ETOUDI', homeScore: 43, awayScore: 46 },
  { journee: 7, category: 'U18 GARCONS', poule: 'A', homeTeam: 'ETOUDI', awayTeam: 'FALCONS' },
  // 8e journée
  { journee: 8, category: 'U18 GARCONS', poule: 'A', homeTeam: 'ONYX', awayTeam: '512 SA' },
  { journee: 8, category: 'U18 GARCONS', poule: 'A', homeTeam: 'PLAY2LEAD', awayTeam: 'FALCONS', homeScore: 44, awayScore: 47 },
  { journee: 8, category: 'U18 GARCONS', poule: 'A', homeTeam: 'JOAKIM BB', awayTeam: 'FUSEE', homeScore: 28, awayScore: 41 },
  { journee: 8, category: 'U18 GARCONS', poule: 'A', homeTeam: 'ETOUDI', awayTeam: 'MC NOAH' },
  // 9e journée
  { journee: 9, category: 'U18 GARCONS', poule: 'A', homeTeam: 'PLAY2LEAD', awayTeam: 'MC NOAH' },
  { journee: 9, category: 'U18 GARCONS', poule: 'A', homeTeam: '512 SA', awayTeam: 'WILDCATS' },
  { journee: 9, category: 'U18 GARCONS', poule: 'A', homeTeam: 'JOAKIM BB', awayTeam: 'FALCONS', homeScore: 43, awayScore: 64 },
  { journee: 9, category: 'U18 GARCONS', poule: 'A', homeTeam: 'EAST BB', awayTeam: 'FUSEE' },
  { journee: 9, category: 'U18 GARCONS', poule: 'A', homeTeam: 'ONYX', awayTeam: 'ETOUDI' },
);

async function insertMatches() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');
    let inserted = 0;
    for (const m of matches) {
      // Map team names to database names if needed
      const homeName = teamNameMap[m.homeTeam] || m.homeTeam;
      const awayName = teamNameMap[m.awayTeam] || m.awayTeam;
      // Find home and away team IDs
      const home = await Team.findOne({ name: homeName, category: m.category, poule: m.poule });
      const away = await Team.findOne({ name: awayName, category: m.category, poule: m.poule });
      if (!home || !away) {
        console.warn(`Skipping match: ${m.homeTeam} vs ${m.awayTeam} (team not found)`);
        continue;
      }
      const today = new Date();
      const matchData: any = {
        date: today,
        time: '00:00',
        homeTeam: home._id,
        awayTeam: away._id,
        category: m.category,
        status: m.homeScore !== undefined && m.awayScore !== undefined ? 'completed' : 'upcoming',
        venue: 'Unknown',
        journee: m.journee,
        poule: m.poule,
      };
      if ('homeScore' in m) matchData.homeScore = m.homeScore;
      if ('awayScore' in m) matchData.awayScore = m.awayScore;
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