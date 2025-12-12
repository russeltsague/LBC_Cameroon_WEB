import mongoose from 'mongoose';
import Match from '../src/models/Match';
import Team from '../src/models/Team';
import dotenv from 'dotenv';
dotenv.config();

const matchesToInsert = [
  // Poule A (example, fill in all matches)
  { homeTeam: 'WILDCATS', awayTeam: 'ONYX', poule: 'A', journee: 1 },
  { homeTeam: 'MC NOAH', awayTeam: 'JOAKIM BB', poule: 'A', journee: 1 },
  { homeTeam: 'FUSEE', awayTeam: 'EAST BASKET', poule: 'A', journee: 1 },
  { homeTeam: 'FALCONS', awayTeam: 'EAST BASKET', poule: 'A', journee: 1 },
  { homeTeam: 'PLAY 2 LEADS', awayTeam: 'ETOUDI', poule: 'A', journee: 1 },
  // ... (add all matches for all poules and journéés from your images)
];

async function insertU18GarconsMatches() {
  await mongoose.connect(process.env.MONGO_URI!);
  let inserted = 0;
  for (const m of matchesToInsert) {
    // Fuzzy, case-insensitive matching for team names and poule
    const home = await Team.findOne({ name: { $regex: m.homeTeam, $options: 'i' }, category: 'U18 GARCONS', poule: m.poule });
    const away = await Team.findOne({ name: { $regex: m.awayTeam, $options: 'i' }, category: 'U18 GARCONS', poule: m.poule });
    if (!home || !away) {
      console.warn(`Skipping: ${m.homeTeam} vs ${m.awayTeam} (team not found)`);
      continue;
    }
    // Check if match already exists
    const existing = await Match.findOne({ homeTeam: home._id, awayTeam: away._id, category: 'U18 GARCONS', poule: m.poule });
    if (existing) {
      console.log(`Match already exists: ${m.homeTeam} vs ${m.awayTeam} (Poule ${m.poule})`);
      continue;
    }
    await Match.create({
      date: new Date(), // Placeholder, update as needed
      time: '00:00',
      homeTeam: home._id,
      awayTeam: away._id,
      homeScore: 0,
      awayScore: 0,
      category: 'U18 GARCONS',
      status: 'upcoming',
      venue: 'Unknown',
      journee: m.journee,
      poule: m.poule,
    });
    inserted++;
    console.log(`Inserted: ${m.homeTeam} vs ${m.awayTeam} (Poule ${m.poule}, journee ${m.journee})`);
  }
  console.log(`Done. Inserted ${inserted} matches.`);
  process.exit(0);
}

insertU18GarconsMatches(); 