import mongoose from 'mongoose';
import Match from '../src/models/Match';
import Team from '../src/models/Team';
import dotenv from 'dotenv';
dotenv.config();

const matchesToUpdate = [
  // 1ère JOURNÉE
  { homeTeam: 'FAP', awayTeam: 'LENA', journee: 1 },
  { homeTeam: 'AS KEEP2', awayTeam: 'OVERDOSE', journee: 1 },
  { homeTeam: 'FAP2', awayTeam: 'AS KEEP', journee: 1 },
  { homeTeam: 'MC NOAH', awayTeam: 'MARIK YD2', journee: 1 },
  { homeTeam: 'ONYX', awayTeam: 'FALCONS', journee: 1 },
  // 2e JOURNÉE
  { homeTeam: 'MARIK YD2', awayTeam: 'AS KEEP2', journee: 2 },
  { homeTeam: 'FAP', awayTeam: 'ONYX', journee: 2 },
  { homeTeam: 'AS KEEP', awayTeam: 'FAP2', journee: 2 },
  { homeTeam: 'MC NOAH', awayTeam: 'LENA', journee: 2 },
  { homeTeam: 'FALCONS', awayTeam: 'OVERDOSE', journee: 2 },
  // 3e JOURNÉE
  { homeTeam: 'AS KEEP', awayTeam: 'ONYX', journee: 3 },
  { homeTeam: 'AS KEEP2', awayTeam: 'FAP', journee: 3 },
  { homeTeam: 'LENA', awayTeam: 'FALCONS', journee: 3 },
  { homeTeam: 'OVERDOSE', awayTeam: 'FAP2', journee: 3 },
  { homeTeam: 'KLOES YD2', awayTeam: 'FALCONS', journee: 3 },
  // 4e JOURNÉE
  { homeTeam: 'ONYX', awayTeam: 'OVERDOSE', journee: 4 },
  { homeTeam: 'LENA', awayTeam: 'FAP2', journee: 4 },
  { homeTeam: 'AS KEEP', awayTeam: 'MC NOAH', journee: 4 },
  { homeTeam: 'MARIK YD2', awayTeam: 'FALCONS', journee: 4 },
  { homeTeam: 'FAP', awayTeam: 'AS KEEP2', journee: 4 },
  // 5e JOURNÉE
  { homeTeam: 'OVERDOSE', awayTeam: 'AS KEEP', journee: 5 },
  { homeTeam: 'FAP2', awayTeam: 'FAP', journee: 5 },
  // 6e JOURNÉE
  { homeTeam: 'AS KEEP', awayTeam: 'AS KEEP2', journee: 6 },
  { homeTeam: 'FAP2', awayTeam: 'ONYX', journee: 6 },
  { homeTeam: 'LENA', awayTeam: 'OVERDOSE', journee: 6 },
  { homeTeam: 'MC NOAH', awayTeam: 'FALCONS', journee: 6 },
  // 7e JOURNÉE
  { homeTeam: 'ONYX', awayTeam: 'LENA', journee: 7 },
  { homeTeam: 'FAP2', awayTeam: 'MC NOAH', journee: 7 },
  { homeTeam: 'AS KEEP', awayTeam: 'MARIK YD2', journee: 7 },
  { homeTeam: 'OVERDOSE', awayTeam: 'FAP', journee: 7 },
  { homeTeam: 'AS KEEP2', awayTeam: 'FALCONS', journee: 7 },
  // 8e JOURNÉE
  { homeTeam: 'LENA', awayTeam: 'OVERDOSE', journee: 8 },
  { homeTeam: 'MC NOAH', awayTeam: 'ONYX', journee: 8 },
  { homeTeam: 'AS KEEP2', awayTeam: 'FAP', journee: 8 },
  { homeTeam: 'MARIK YD2', awayTeam: 'AS KEEP', journee: 8 },
  { homeTeam: 'FALCONS', awayTeam: 'ASKEEP2', journee: 8 },
  // 9e JOURNÉE
  { homeTeam: 'OVERDOSE', awayTeam: 'MC NOAH', journee: 9 },
  { homeTeam: 'FAP', awayTeam: 'AS KEEP', journee: 9 },
  { homeTeam: 'ONYX', awayTeam: 'FAP2', journee: 9 },
  { homeTeam: 'MARIK YD2', awayTeam: 'LENA', journee: 9 },
  { homeTeam: 'FAP2', awayTeam: 'FALCONS', journee: 9 },
];

async function updateDamesJournee() {
  await mongoose.connect(process.env.MONGO_URI!);
  let updated = 0;
  for (const m of matchesToUpdate) {
    // Fuzzy, case-insensitive matching for team names
    const home = await Team.findOne({ name: { $regex: m.homeTeam, $options: 'i' }, category: 'DAMES' });
    const away = await Team.findOne({ name: { $regex: m.awayTeam, $options: 'i' }, category: 'DAMES' });
    if (!home || !away) {
      console.warn(`Skipping: ${m.homeTeam} vs ${m.awayTeam} (team not found)`);
      continue;
    }
    const match = await Match.findOneAndUpdate(
      {
        homeTeam: home._id,
        awayTeam: away._id,
        category: 'DAMES',
      },
      { $set: { journee: m.journee } },
      { new: true }
    );
    if (match) {
      updated++;
      console.log(`Updated: ${m.homeTeam} vs ${m.awayTeam} to journee ${m.journee}`);
    } else {
      console.warn(`No match found for: ${m.homeTeam} vs ${m.awayTeam}`);
    }
  }
  console.log(`Done. Updated ${updated} matches.`);
  process.exit(0);
}

updateDamesJournee(); 