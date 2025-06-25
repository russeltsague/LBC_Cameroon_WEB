import mongoose from 'mongoose';
import { Match } from '../models/Match';
import Team from '../models/Team';
import connectDB from '../config/db';
import dotenv from 'dotenv';
import levenshtein from 'fast-levenshtein';

dotenv.config({ path: './LBC_backend02/.env' });

const matchesData = [
  // Vendredi, 18 avril 2025
  { date: '2025-04-18', category: 'U18 FILLES', homeTeam: '3A BB', awayTeam: 'LENA', homeScore: 0, awayScore: 20 },
  { date: '2025-04-18', category: 'U18 FILLES', homeTeam: 'FALCONS', awayTeam: 'FAP', homeScore: 22, awayScore: 63 },
  { date: '2025-04-18', category: 'U18 GARCONS', homeTeam: 'MENDONG', awayTeam: 'COSBIE', homeScore: 20, awayScore: 0 },
  { date: '2025-04-18', category: 'U18 GARCONS', homeTeam: 'EAST BB', awayTeam: 'ETOUDI', homeScore: 43, awayScore: 46 },
  { date: '2025-04-18', category: 'U18 GARCONS', homeTeam: 'FUSEE', awayTeam: 'ONYX', homeScore: 39, awayScore: 76 },

  // Samedi, 13 avril 2025
  { date: '2025-04-13', category: 'U18 FILLES', homeTeam: 'MARIK KLOES', awayTeam: 'DESBA', homeScore: 37, awayScore: 22 },
  { date: '2025-04-13', category: 'U18 FILLES', homeTeam: 'FRIENDSHIP', awayTeam: 'LENA', homeScore: 23, awayScore: 43 },
  { date: '2025-04-13', category: 'U18 GARCONS', homeTeam: 'PHISLAMA', awayTeam: 'ALPH1', homeScore: 47, awayScore: 38 },
  { date: '2025-04-13', category: 'U18 GARCONS', homeTeam: 'ELCIB', awayTeam: 'MESSASSI', homeScore: 57, awayScore: 52 },
  { date: '2025-04-13', category: 'U18 GARCONS', homeTeam: 'VOGT2', awayTeam: 'SANTA BARBARA', homeScore: 30, awayScore: 56 },

  // Samedi, 26 avril 2025
  { date: '2025-04-26', category: 'DAMES', homeTeam: 'FALCONS', awayTeam: 'FAP', homeScore: 26, awayScore: 77 },
  { date: '2025-04-26', category: 'DAMES', homeTeam: 'LENA', awayTeam: 'ONYX', homeScore: 46, awayScore: 66 },
  { date: '2025-04-26', category: 'DAMES', homeTeam: 'MARIK YD2', awayTeam: 'AS KEEP', homeScore: 24, awayScore: 87 },
  { date: '2025-04-26', category: 'DAMES', homeTeam: 'OVERDOSE', awayTeam: 'MC NOAH', homeScore: 55, awayScore: 37 },
  { date: '2025-04-26', category: 'MESSIEURS', homeTeam: 'ONYX', awayTeam: '512 SA', homeScore: 48, awayScore: 65 },
  { date: '2025-04-26', category: 'MESSIEURS', homeTeam: 'ALPH', awayTeam: 'ANGELS', homeScore: 66, awayScore: 36 },
  { date: '2025-04-26', category: 'MESSIEURS', homeTeam: 'FALCONS', awayTeam: 'WILDCATS', homeScore: 60, awayScore: 55 },
  { date: '2025-04-26', category: 'MESSIEURS', homeTeam: 'BEAC', awayTeam: 'ETOUDI', homeScore: 113, awayScore: 44 },
  { date: '2025-04-26', category: 'MESSIEURS', homeTeam: 'FAP', awayTeam: 'MC NOAH', homeScore: 62, awayScore: 59 },

  // Samedi, 10 mai 2025
  { date: '2025-05-10', category: 'U18 FILLES', homeTeam: 'SANTA B.', awayTeam: 'FUSEE', homeScore: 17, awayScore: 45 },
  { date: '2025-05-10', category: 'L2A MESSIEURS', homeTeam: 'ALPH2', awayTeam: 'MENDONG', homeScore: 42, awayScore: 47 },
  { date: '2025-05-10', category: 'L2A MESSIEURS', homeTeam: 'LENA', awayTeam: 'KLOES YD2', homeScore: 37, awayScore: 41 },
  { date: '2025-05-10', category: 'L2B MESSIEURS', homeTeam: 'APEJES2', awayTeam: 'MBALMAYO', homeScore: 25, awayScore: 60 },
  { date: '2025-05-10', category: 'L2B MESSIEURS', homeTeam: 'PHISLAMA', awayTeam: 'MBALMAYO', homeScore: 49, awayScore: 73 },
  { date: '2025-05-10', category: 'DAMES', homeTeam: 'FAP2', awayTeam: 'MC NOAH', homeScore: 38, awayScore: 26 },
  { date: '2025-05-10', category: 'L1 MESSIEURS', homeTeam: 'MC NOAH', awayTeam: 'NYBA', homeScore: 71, awayScore: 58 },

  // Dimanche, 11 mai 2025
  { date: '2025-05-11', category: 'L2B MESSIEURS', homeTeam: 'MBOA BB', awayTeam: 'SANTA B.', homeScore: 20, awayScore: 0 },
  { date: '2025-05-11', category: 'L2B MESSIEURS', homeTeam: 'PHISLAMA', awayTeam: 'HAND OF GOD', homeScore: 52, awayScore: 59 },
  { date: '2025-05-11', category: 'L2A MESSIEURS', homeTeam: 'MESSASSI', awayTeam: 'AS KEEP', homeScore: 71, awayScore: 73 },
  { date: '2025-05-11', category: 'L2A MESSIEURS', homeTeam: 'ALL SPORT', awayTeam: 'BOFIA', homeScore: 49, awayScore: 37 },
  { date: '2025-05-11', category: 'L2A MESSIEURS', homeTeam: 'SEED EXP.', awayTeam: 'FUSEE', homeScore: 29, awayScore: 50 },
  { date: '2025-05-11', category: 'L2A MESSIEURS', homeTeam: 'MARY JO', awayTeam: 'APEJES', homeScore: 51, awayScore: 70 },
  { date: '2025-05-11', category: 'DAMES', homeTeam: 'ONYX', awayTeam: 'OVERDOSE', homeScore: 41, awayScore: 65 },
  { date: '2025-05-11', category: 'DAMES', homeTeam: 'LENA', awayTeam: 'AS KEEP2', homeScore: 24, awayScore: 32 },
  { date: '2025-05-11', category: 'L1 MESSIEURS', homeTeam: 'ETOUDI', awayTeam: 'WILDCATS', homeScore: 61, awayScore: 79 },
  { date: '2025-05-11', category: 'L1 MESSIEURS', homeTeam: 'FALCONS', awayTeam: 'ANGELS', homeScore: 67, awayScore: 78 },

  // Samedi, 17 mai 2025
  { date: '2025-05-17', category: 'L2B MESSIEURS', homeTeam: 'HAND OF GOD', awayTeam: 'APEJES2', homeScore: 48, awayScore: 45 },
  { date: '2025-05-17', category: 'L2B MESSIEURS', homeTeam: 'WILDCATS', awayTeam: 'EAST BB', homeScore: 64, awayScore: 63 },
  { date: '2025-05-17', category: 'L2B MESSIEURS', homeTeam: 'PHISLAMA', awayTeam: 'TEAM K SPORT', homeScore: 31, awayScore: 63 },
  { date: '2025-05-17', category: 'L2B MESSIEURS', homeTeam: 'SANTA BARBARA', awayTeam: 'OVENG BB', homeScore: 19, awayScore: 74 },
  { date: '2025-05-17', category: 'L2A MESSIEURS', homeTeam: 'EXPENDABLES', awayTeam: 'LENA', homeScore: 46, awayScore: 39 },
  { date: '2025-05-17', category: 'L2A MESSIEURS', homeTeam: 'KLOES YD2', awayTeam: 'JOAKIM BB', homeScore: 40, awayScore: 39 },
  { date: '2025-05-17', category: 'DAMES', homeTeam: 'AS KEEP2', awayTeam: 'MC NOAH', homeScore: 27, awayScore: 48 },
  { date: '2025-05-17', category: 'DAMES', homeTeam: 'LENA', awayTeam: 'FALCONS', homeScore: 34, awayScore: 32 },
  { date: '2025-05-17', category: 'L1 MESSIEURS', homeTeam: 'ETOUDI', awayTeam: '512 SA', homeScore: 52, awayScore: 62 },
  { date: '2025-05-17', category: 'L1 MESSIEURS', homeTeam: 'NYBA', awayTeam: 'ACPBA', homeScore: 57, awayScore: 70 },
  { date: '2025-05-17', category: 'L1 MESSIEURS', homeTeam: 'ALPH', awayTeam: 'FALCONS', homeScore: 53, awayScore: 37 },

  // Samedi, 24 mai 2025
  { date: '2025-05-24', category: 'L2B MESSIEURS', homeTeam: 'OVENG BB', awayTeam: 'MBALMAYO', homeScore: 80, awayScore: 38 },
  { date: '2025-05-24', category: 'L2B MESSIEURS', homeTeam: 'MBALMAYO', awayTeam: 'MBOA BB', homeScore: 68, awayScore: 55 },
  { date: '2025-05-24', category: 'L2B MESSIEURS', homeTeam: 'APEJES2', awayTeam: 'TEAM K SPORT', homeScore: 47, awayScore: 70 },
  { date: '2025-05-24', category: 'L2B MESSIEURS', homeTeam: 'HAND OF GOD', awayTeam: 'EAST BB', homeScore: 57, awayScore: 67 },
  { date: '2025-05-24', category: 'L2A MESSIEURS', homeTeam: 'BOFIA', awayTeam: 'MC NOAH', homeScore: 30, awayScore: 74 },
  { date: '2025-05-24', category: 'L2A MESSIEURS', homeTeam: 'ALPH2', awayTeam: 'MESSASSI', homeScore: 48, awayScore: 56 },
  { date: '2025-05-24', category: 'L2A MESSIEURS', homeTeam: 'WOLVES1', awayTeam: 'APEJES', homeScore: 42, awayScore: 53 },
  { date: '2025-05-24', category: 'DAMES', homeTeam: 'AS KEEP2', awayTeam: 'FAP2', homeScore: 23, awayScore: 36 },
  { date: '2025-05-24', category: 'DAMES', homeTeam: 'AS KEEP', awayTeam: 'FAP', homeScore: 42, awayScore: 50 },
  { date: '2025-05-24', category: 'L1 MESSIEURS', homeTeam: 'FRIENDSHIP', awayTeam: 'ETOUDI', homeScore: 52, awayScore: 49 },
  { date: '2025-05-24', category: 'L1 MESSIEURS', homeTeam: 'FALCONS', awayTeam: 'FAP', homeScore: 82, awayScore: 90 },

  // Dimanche, 25 mai 2025
  { date: '2025-05-25', category: 'L2B MESSIEURS', homeTeam: 'APEJES2', awayTeam: 'OVENG BB', homeScore: 33, awayScore: 101 },
  { date: '2025-05-25', category: 'L2B MESSIEURS', homeTeam: 'SANTA BARBARA', awayTeam: 'PHISLAMA', homeScore: 53, awayScore: 59 },
  { date: '2025-05-25', category: 'L2B MESSIEURS', homeTeam: 'WILDCATS2', awayTeam: 'MBOA BB', homeScore: 26, awayScore: 62 },
  { date: '2025-05-25', category: 'L2A MESSIEURS', homeTeam: 'MSA', awayTeam: 'FUSEE', homeScore: 46, awayScore: 43 },
  { date: '2025-05-25', category: 'L2A MESSIEURS', homeTeam: 'JOAKIM BB', awayTeam: 'LENA', homeScore: 69, awayScore: 57 },
  { date: '2025-05-25', category: 'L2A MESSIEURS', homeTeam: 'MENDONG', awayTeam: 'WOLVES2', homeScore: 52, awayScore: 59 },
  { date: '2025-05-25', category: 'L2A MESSIEURS', homeTeam: 'AS KEEP', awayTeam: 'KLOES YD2', homeScore: 49, awayScore: 43 },
  { date: '2025-05-25', category: 'L2A MESSIEURS', homeTeam: 'ALL SPORT', awayTeam: 'MARY JO', homeScore: 29, awayScore: 48 },
  { date: '2025-05-25', category: 'DAMES', homeTeam: 'FALCONS', awayTeam: 'MC NOAH', homeScore: 28, awayScore: 54 },
  { date: '2025-05-25', category: 'DAMES', homeTeam: 'LENA', awayTeam: 'MARIK YD2', homeScore: 28, awayScore: 25 },
  { date: '2025-05-25', category: 'L1 MESSIEURS', homeTeam: 'ACPBA', awayTeam: 'FRIENDSHIP', homeScore: 49, awayScore: 57 },
  { date: '2025-05-25', category: 'L1 MESSIEURS', homeTeam: 'WILDCATS', awayTeam: 'NYBA', homeScore: 72, awayScore: 50 },
  { date: '2025-05-25', category: 'L1 MESSIEURS', homeTeam: 'LIGTH ACADEMY', awayTeam: 'ANGELS', homeScore: 66, awayScore: 54 },
  { date: '2025-05-25', category: 'L1 MESSIEURS', homeTeam: 'ALPH', awayTeam: 'ONYX', homeScore: 61, awayScore: 49 },
  { date: '2025-05-25', category: 'L1 MESSIEURS', homeTeam: 'BEAC', awayTeam: 'MC NOAH', homeScore: 65, awayScore: 37 },

  // Samedi, 30 mai 2025
  { date: '2025-05-30', category: 'L2A MESSIEURS', homeTeam: 'BOFIA', awayTeam: 'SEED EXPENDABLES', homeScore: 35, awayScore: 30 },
  { date: '2025-05-30', category: 'L2A MESSIEURS', homeTeam: 'MENDONG', awayTeam: 'EXPENDABLES', homeScore: 53, awayScore: 49 },
  { date: '2025-05-30', category: 'DAMES', homeTeam: 'LENA', awayTeam: 'FAP2', homeScore: 19, awayScore: 46 },
  { date: '2025-05-30', category: 'L1 MESSIEURS', homeTeam: 'MC NOAH', awayTeam: 'ETOUDI', homeScore: 63, awayScore: 47 },
  { date: '2025-05-30', category: 'L1 MESSIEURS', homeTeam: 'FALCONS', awayTeam: '512 SA', homeScore: 76, awayScore: 57 },
  { date: '2025-05-30', category: 'L1 MESSIEURS', homeTeam: 'FAP', awayTeam: 'ALPH', homeScore: 65, awayScore: 45 },

  // Dimanche, 01 juin 2025
  { date: '2025-06-01', category: 'L2A MESSIEURS', homeTeam: 'AS KEEP', awayTeam: 'LENA', homeScore: 30, awayScore: 48 },
  { date: '2025-06-01', category: 'L2A MESSIEURS', homeTeam: 'MSA', awayTeam: 'SEED EXPENDABLES', homeScore: 55, awayScore: 32 },
  { date: '2025-06-01', category: 'L2A MESSIEURS', homeTeam: 'KLOES YD2', awayTeam: 'WOLVES2', homeScore: 52, awayScore: 44 },
  { date: '2025-06-01', category: 'L2A MESSIEURS', homeTeam: 'APEJES', awayTeam: 'FUSEE', homeScore: 69, awayScore: 43 },
  { date: '2025-06-01', category: 'DAMES', homeTeam: 'AS KEEP2', awayTeam: 'FALCONS', homeScore: 43, awayScore: 25 },
  { date: '2025-06-01', category: 'DAMES', homeTeam: 'MC NOAH', awayTeam: 'ONYX', homeScore: 34, awayScore: 57 },
  { date: '2025-06-01', category: 'L1 MESSIEURS', homeTeam: 'ANGELS', awayTeam: 'ONYX', homeScore: 67, awayScore: 52 },
  { date: '2025-06-01', category: 'L1 MESSIEURS', homeTeam: 'LIGTH ACADEMY', awayTeam: 'WILDCATS', homeScore: 68, awayScore: 67 },
  { date: '2025-06-01', category: 'L1 MESSIEURS', homeTeam: 'ACPBA', awayTeam: 'BEAC', homeScore: 44, awayScore: 75 },

  // Samedi, 07 juin 2025
  { date: '2025-06-07', category: 'L2A MESSIEURS', homeTeam: 'ALL SPORT', awayTeam: 'WOLVES1', homeScore: 31, awayScore: 70 },
  { date: '2025-06-07', category: 'L1 MESSIEURS', homeTeam: 'LIGTH ACADEMY', awayTeam: 'FAP', homeScore: 46, awayScore: 74 },
  { date: '2025-06-07', category: 'L1 MESSIEURS', homeTeam: 'ANGELS', awayTeam: 'WILDCATS', homeScore: 48, awayScore: 71 },

  // Dimanche, 08 juin 2025
  { date: '2025-06-08', category: 'L2A MESSIEURS', homeTeam: 'JOAKIM BB', awayTeam: 'ALPH2', homeScore: 37, awayScore: 57 },
  { date: '2025-06-08', category: 'L1 MESSIEURS', homeTeam: 'ALPH', awayTeam: 'BEAC', homeScore: 70, awayScore: 77 },
  { date: '2025-06-08', category: 'L1 MESSIEURS', homeTeam: 'WILDCATS', awayTeam: 'ONYX', homeScore: 61, awayScore: 53 },
  { date: '2025-06-08', category: 'L1 MESSIEURS', homeTeam: 'ACPBA', awayTeam: 'ANGELS', homeScore: 63, awayScore: 47 },

  // Samedi, 14 juin 2025
  { date: '2025-06-14', category: 'U18 FILLES', homeTeam: 'MARIK KLOES', awayTeam: 'FUSEE', homeScore: 47, awayScore: 51 },
  { date: '2025-06-14', category: 'U18 GARCONS', homeTeam: 'PEPINIERE', awayTeam: 'KLOES YD2', homeScore: 49, awayScore: 65 },
  { date: '2025-06-14', category: 'U18 GARCONS', homeTeam: 'PLAY2LEAD', awayTeam: 'FUSEE', homeScore: 37, awayScore: 14 },
  { date: '2025-06-14', category: 'U18 GARCONS', homeTeam: 'GREEN CITY', awayTeam: 'FX VOGT2', homeScore: 51, awayScore: 43 },

  // Dimanche, 15 juin 2025
  { date: '2025-06-15', category: 'U18 FILLES', homeTeam: '3A BB', awayTeam: 'ONYX', homeScore: 17, awayScore: 38 },
  { date: '2025-06-15', category: 'U18 FILLES', homeTeam: 'FRIENDSHIP', awayTeam: 'SANTA BARBARA', homeScore: 17, awayScore: 23 },
  { date: '2025-06-15', category: 'U18 FILLES', homeTeam: 'DESBA', awayTeam: 'PLAY2LEAD', homeScore: 36, awayScore: 29 },
  { date: '2025-06-15', category: 'U18 FILLES', homeTeam: 'FX VOGT', awayTeam: 'FALCONS', homeScore: 35, awayScore: 21 },
  { date: '2025-06-15', category: 'U18 GARCONS', homeTeam: 'PLAY2LEAD', awayTeam: 'EAST BB', homeScore: 44, awayScore: 37 },
  { date: '2025-06-15', category: 'U18 GARCONS', homeTeam: 'JOAKIM BB', awayTeam: '512 SA', homeScore: 40, awayScore: 42 },
  { date: '2025-06-15', category: 'U18 GARCONS', homeTeam: 'FALCONS', awayTeam: 'WILDCATS', homeScore: 61, awayScore: 53 },
  { date: '2025-06-15', category: 'DAMES', homeTeam: 'OVERDOSE', awayTeam: 'KLOES YD2', homeScore: 20, awayScore: 0 },
];

const normalizeCategory = (cat: string) => {
  // Map image categories to DB categories
  if (cat.includes('U18 FILLES')) return 'U18 FILLES';
  if (cat.includes('U18 GARCONS')) return 'U18 GARCONS';
  if (cat.includes('L2A')) return 'L2A MESSIEUR';
  if (cat.includes('L2B')) return 'L2B MESSIEUR';
  if (cat.includes('L1 MESSIEURS')) return 'L1 MESSIEUR';
  if (cat.includes('L1 MESSIEUR')) return 'L1 MESSIEUR';
  if (cat.includes('DAMES')) return 'L1 DAME';
  if (cat.includes('MESSIEURS')) return 'L1 MESSIEUR';
  return cat;
};

// Helper to find closest team name in the same category, allowing for suffixes for L1 MESSIEUR and L1 DAME
function findClosestTeamInCategory(name: string, category: string, teams: { name: string, category: string }[]): string | null {
  // Normalize category
  let cat = normalizeCategory(category);
  // For L1 MESSIEUR and L1 DAME, allow suffixes
  let candidates = teams.filter(t => {
    if (cat === 'L1 MESSIEUR') {
      return t.category === cat && (t.name.toUpperCase() === name.toUpperCase() || t.name.toUpperCase().endsWith(' MESSIEURS') || t.name.toUpperCase().endsWith(' MESSIEUR'));
    }
    if (cat === 'L1 DAME') {
      return t.category === cat && (t.name.toUpperCase() === name.toUpperCase() || t.name.toUpperCase().endsWith(' DAMES') || t.name.toUpperCase().endsWith(' DAME'));
    }
    return t.category === cat;
  });
  if (candidates.length === 0) return null;
  let minDist = Infinity;
  let closest = null;
  for (const t of candidates) {
    // Try exact match first
    if (t.name.toUpperCase() === name.toUpperCase()) return t.name;
    // Try match ignoring suffix for L1 MESSIEUR/DAME
    if (cat === 'L1 MESSIEUR' && (t.name.toUpperCase().replace(/ MESSIEURS?$/, '') === name.toUpperCase())) return t.name;
    if (cat === 'L1 DAME' && (t.name.toUpperCase().replace(/ DAMES?$/, '') === name.toUpperCase())) return t.name;
    // Fuzzy match
    const dist = levenshtein.get(name.toUpperCase(), t.name.toUpperCase());
    if (dist < minDist) {
      minDist = dist;
      closest = t.name;
    }
  }
  // Accept if distance is small (typo), e.g. <= 3
  return minDist <= 3 ? closest : null;
}

const createTeam = async (name: string, category: string) => {
  // Use sensible defaults for required fields
  const team = new Team({
    name,
    category,
    city: 'Yaounde',
    logo: '/default-logo.png',
    founded: 2024,
    arena: 'TBD',
    championships: 0,
    coach: 'TBD',
    about: 'Auto-created for match import',
  });
  await team.save();
  return team;
};

const run = async () => {
  await connectDB();
  console.log('Connected to MongoDB for adding image matches.');

  let teams: { name: string, category: string }[] = (await Team.find().select('name category')).map(t => ({ name: t.name, category: t.category }));
  let teamMap = new Map((await Team.find().select('name category _id')).map(team => [team.name.toUpperCase(), team._id]));

  let inserted = 0;
  let skipped = 0;

  for (const m of matchesData) {
    let cat = normalizeCategory(m.category);
    let homeId = teamMap.get(m.homeTeam.toUpperCase());
    let awayId = teamMap.get(m.awayTeam.toUpperCase());
    if (!homeId) {
      const closeHome = findClosestTeamInCategory(m.homeTeam, cat, teams);
      if (closeHome) {
        homeId = teamMap.get(closeHome.toUpperCase());
        console.warn(`Corrected home team: '${m.homeTeam}' -> '${closeHome}'`);
      } else {
        // Create missing home team
        const newTeam = await createTeam(m.homeTeam, cat);
        homeId = newTeam._id;
        teamMap.set(m.homeTeam.toUpperCase(), homeId);
        teams.push({ name: m.homeTeam, category: cat as any });
        console.warn(`Created missing home team: '${m.homeTeam}' in category '${cat}'`);
      }
    }
    if (!awayId) {
      const closeAway = findClosestTeamInCategory(m.awayTeam, cat, teams);
      if (closeAway) {
        awayId = teamMap.get(closeAway.toUpperCase());
        console.warn(`Corrected away team: '${m.awayTeam}' -> '${closeAway}'`);
      } else {
        // Create missing away team
        const newTeam = await createTeam(m.awayTeam, cat);
        awayId = newTeam._id;
        teamMap.set(m.awayTeam.toUpperCase(), awayId);
        teams.push({ name: m.awayTeam, category: cat as any });
        console.warn(`Created missing away team: '${m.awayTeam}' in category '${cat}'`);
      }
    }
    if (!homeId || !awayId) {
      console.warn(`Skipping match: ${m.homeTeam} vs ${m.awayTeam} (team not found)`);
      skipped++;
      continue;
    }
    const match = new Match({
      date: m.date,
      time: '00:00',
      homeTeam: homeId,
      awayTeam: awayId,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      category: cat,
      venue: 'TBD',
      status: 'completed',
    });
    await match.save();
    inserted++;
    console.log(`Inserted: ${m.homeTeam} vs ${m.awayTeam} (${m.date})`);
  }
  console.log(`Done. Inserted: ${inserted}, Skipped: ${skipped}`);
  process.exit(0);
};

run().catch(e => { console.error(e); process.exit(1); }); 