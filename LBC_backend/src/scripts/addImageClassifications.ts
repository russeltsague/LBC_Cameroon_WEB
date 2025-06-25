import mongoose from 'mongoose';
import Classification from '../models/Classification';
import Team from '../models/Team';
import connectDB from '../config/db';
import dotenv from 'dotenv';
import levenshtein from 'fast-levenshtein';

dotenv.config({ path: './LBC_backend02/.env' });

// Example: L1 MESSIEUR (fill in all categories as parsed from images)
const classificationData = [
  // L1 MESSIEUR
  { category: 'L1 MESSIEUR', team: 'BEAC', position: 1, played: 11, wins: 11, losses: 0, points: 22, pointsFor: 869, pointsAgainst: 473, pointsDifference: 396 },
  { category: 'L1 MESSIEUR', team: 'FAP', position: 2, played: 11, wins: 11, losses: 0, points: 22, pointsFor: 775, pointsAgainst: 457, pointsDifference: 318 },
  { category: 'L1 MESSIEUR', team: 'WILDCATS', position: 3, played: 12, wins: 8, losses: 4, points: 20, pointsFor: 752, pointsAgainst: 710, pointsDifference: 42 },
  { category: 'L1 MESSIEUR', team: 'MC NOAH', position: 4, played: 11, wins: 8, losses: 3, points: 19, pointsFor: 651, pointsAgainst: 560, pointsDifference: 91 },
  { category: 'L1 MESSIEUR', team: 'ALPH', position: 5, played: 11, wins: 6, losses: 5, points: 17, pointsFor: 688, pointsAgainst: 619, pointsDifference: 69 },
  { category: 'L1 MESSIEUR', team: 'FALCONS', position: 6, played: 10, wins: 6, losses: 4, points: 16, pointsFor: 648, pointsAgainst: 559, pointsDifference: 89 },
  { category: 'L1 MESSIEUR', team: '512 SA', position: 7, played: 10, wins: 6, losses: 4, points: 16, pointsFor: 581, pointsAgainst: 609, pointsDifference: -28 },
  { category: 'L1 MESSIEUR', team: 'ACPBA', position: 8, played: 10, wins: 5, losses: 5, points: 15, pointsFor: 609, pointsAgainst: 659, pointsDifference: -50 },
  { category: 'L1 MESSIEUR', team: 'LIGHT ACADEMY', position: 9, played: 11, wins: 4, losses: 7, points: 15, pointsFor: 605, pointsAgainst: 683, pointsDifference: -78 },
  { category: 'L1 MESSIEUR', team: 'ONYX', position: 10, played: 12, wins: 3, losses: 9, points: 15, pointsFor: 590, pointsAgainst: 715, pointsDifference: -125 },
  { category: 'L1 MESSIEUR', team: 'ANGELS', position: 11, played: 11, wins: 3, losses: 8, points: 14, pointsFor: 548, pointsAgainst: 716, pointsDifference: -168 },
  { category: 'L1 MESSIEUR', team: 'FRIENDSHIP', position: 12, played: 10, wins: 3, losses: 7, points: 13, pointsFor: 502, pointsAgainst: 610, pointsDifference: -108 },
  { category: 'L1 MESSIEUR', team: 'ETOUDI', position: 13, played: 12, wins: 1, losses: 11, points: 9, pointsFor: 523, pointsAgainst: 764, pointsDifference: -241 },
  { category: 'L1 MESSIEUR', team: 'NYBA', position: 14, played: 11, wins: 0, losses: 8, points: 8, pointsFor: 379, pointsAgainst: 564, pointsDifference: -185 },

  // L2B MESSIEURS
  { category: 'L2B MESSIEUR', team: 'OVENG BB', position: 1, played: 9, wins: 8, losses: 1, points: 17, pointsFor: 707, pointsAgainst: 321, pointsDifference: 386 },
  { category: 'L2B MESSIEUR', team: 'MBALMAYO', position: 2, played: 9, wins: 8, losses: 1, points: 17, pointsFor: 502, pointsAgainst: 403, pointsDifference: 99 },
  { category: 'L2B MESSIEUR', team: 'HAND OF GOD', position: 3, played: 9, wins: 7, losses: 2, points: 16, pointsFor: 522, pointsAgainst: 461, pointsDifference: 61 },
  { category: 'L2B MESSIEUR', team: 'MBOA BB', position: 4, played: 9, wins: 6, losses: 3, points: 15, pointsFor: 393, pointsAgainst: 328, pointsDifference: 65 },
  { category: 'L2B MESSIEUR', team: 'EAST BB', position: 5, played: 9, wins: 5, losses: 4, points: 14, pointsFor: 456, pointsAgainst: 465, pointsDifference: -9 },
  { category: 'L2B MESSIEUR', team: 'TEAM K SPORT', position: 6, played: 9, wins: 5, losses: 4, points: 14, pointsFor: 462, pointsAgainst: 511, pointsDifference: -49 },
  { category: 'L2B MESSIEUR', team: 'WILDCATS', position: 7, played: 9, wins: 3, losses: 6, points: 12, pointsFor: 348, pointsAgainst: 469, pointsDifference: -121 },
  { category: 'L2B MESSIEUR', team: 'SANTA BARBARA', position: 8, played: 9, wins: 3, losses: 6, points: 11, pointsFor: 314, pointsAgainst: 428, pointsDifference: -114 },
  { category: 'L2B MESSIEUR', team: 'APEJES2', position: 9, played: 9, wins: 1, losses: 8, points: 9, pointsFor: 335, pointsAgainst: 492, pointsDifference: -157 },
  { category: 'L2B MESSIEUR', team: 'PHISLAMA', position: 10, played: 9, wins: 1, losses: 8, points: 8, pointsFor: 308, pointsAgainst: 459, pointsDifference: -151 },

  // L2A MESSIEUR - POULE A
  { category: 'L2A MESSIEUR', poule: 'A', team: 'EXPENDABLES', position: 1, played: 8, wins: 7, losses: 1, points: 15, pointsFor: 524, pointsAgainst: 334, pointsDifference: 190 },
  { category: 'L2A MESSIEUR', poule: 'A', team: 'MENDONG', position: 2, played: 8, wins: 6, losses: 2, points: 14, pointsFor: 479, pointsAgainst: 400, pointsDifference: 79 },
  { category: 'L2A MESSIEUR', poule: 'A', team: 'KLOES YD2', position: 3, played: 8, wins: 5, losses: 3, points: 13, pointsFor: 392, pointsAgainst: 408, pointsDifference: -16 },
  { category: 'L2A MESSIEUR', poule: 'A', team: 'MESSASSI', position: 4, played: 8, wins: 4, losses: 4, points: 12, pointsFor: 444, pointsAgainst: 409, pointsDifference: 35 },
  { category: 'L2A MESSIEUR', poule: 'A', team: 'ALPH2', position: 5, played: 8, wins: 3, losses: 5, points: 11, pointsFor: 413, pointsAgainst: 382, pointsDifference: 31 },
  { category: 'L2A MESSIEUR', poule: 'A', team: 'JOAKIM', position: 6, played: 8, wins: 3, losses: 5, points: 11, pointsFor: 391, pointsAgainst: 412, pointsDifference: -21 },
  { category: 'L2A MESSIEUR', poule: 'A', team: 'WOLVES2', position: 7, played: 8, wins: 3, losses: 5, points: 11, pointsFor: 348, pointsAgainst: 440, pointsDifference: -92 },
  { category: 'L2A MESSIEUR', poule: 'A', team: 'AS KEEP', position: 8, played: 8, wins: 3, losses: 5, points: 11, pointsFor: 343, pointsAgainst: 421, pointsDifference: -78 },
  { category: 'L2A MESSIEUR', poule: 'A', team: 'LENA', position: 9, played: 8, wins: 2, losses: 6, points: 10, pointsFor: 363, pointsAgainst: 391, pointsDifference: -28 },

  // L2A MESSIEUR - POULE B
  { category: 'L2A MESSIEUR', poule: 'B', team: 'APEJES', position: 1, played: 8, wins: 8, losses: 0, points: 16, pointsFor: 529, pointsAgainst: 320, pointsDifference: 209 },
  { category: 'L2A MESSIEUR', poule: 'B', team: 'MARY JO', position: 2, played: 8, wins: 6, losses: 2, points: 14, pointsFor: 422, pointsAgainst: 310, pointsDifference: 112 },
  { category: 'L2A MESSIEUR', poule: 'B', team: 'FUSEE', position: 3, played: 8, wins: 5, losses: 3, points: 13, pointsFor: 390, pointsAgainst: 357, pointsDifference: 33 },
  { category: 'L2A MESSIEUR', poule: 'B', team: 'MC NOAH2', position: 4, played: 8, wins: 5, losses: 3, points: 13, pointsFor: 470, pointsAgainst: 374, pointsDifference: 96 },
  { category: 'L2A MESSIEUR', poule: 'B', team: 'WOLVES1', position: 5, played: 8, wins: 4, losses: 4, points: 12, pointsFor: 395, pointsAgainst: 317, pointsDifference: 78 },
  { category: 'L2A MESSIEUR', poule: 'B', team: 'MSA', position: 6, played: 8, wins: 4, losses: 4, points: 12, pointsFor: 341, pointsAgainst: 359, pointsDifference: -18 },
  { category: 'L2A MESSIEUR', poule: 'B', team: 'ALL SPORT', position: 7, played: 8, wins: 2, losses: 6, points: 10, pointsFor: 338, pointsAgainst: 339, pointsDifference: -1 },
  { category: 'L2A MESSIEUR', poule: 'B', team: 'BOFIA', position: 8, played: 8, wins: 1, losses: 7, points: 9, pointsFor: 267, pointsAgainst: 418, pointsDifference: -151 },
  { category: 'L2A MESSIEUR', poule: 'B', team: 'SEED EXP.', position: 9, played: 8, wins: 0, losses: 8, points: 8, pointsFor: 226, pointsAgainst: 498, pointsDifference: -272 },

  // L1 DAME
  { category: 'L1 DAME', team: 'FAP', position: 1, played: 8, wins: 8, losses: 0, points: 16, pointsFor: 550, pointsAgainst: 191, pointsDifference: 359 },
  { category: 'L1 DAME', team: 'AS KEEP', position: 2, played: 9, wins: 7, losses: 2, points: 16, pointsFor: 532, pointsAgainst: 320, pointsDifference: 212 },
  { category: 'L1 DAME', team: 'FAP2', position: 3, played: 8, wins: 7, losses: 1, points: 15, pointsFor: 366, pointsAgainst: 239, pointsDifference: 127 },
  { category: 'L1 DAME', team: 'OVERDOSE', position: 4, played: 8, wins: 7, losses: 1, points: 15, pointsFor: 402, pointsAgainst: 241, pointsDifference: 161 },
  { category: 'L1 DAME', team: 'ONYX', position: 5, played: 8, wins: 5, losses: 3, points: 13, pointsFor: 333, pointsAgainst: 276, pointsDifference: 57 },
  { category: 'L1 DAME', team: 'MC NOAH', position: 6, played: 8, wins: 5, losses: 3, points: 13, pointsFor: 313, pointsAgainst: 256, pointsDifference: 57 },
  { category: 'L1 DAME', team: 'AS KEEP2', position: 7, played: 9, wins: 4, losses: 5, points: 13, pointsFor: 326, pointsAgainst: 349, pointsDifference: -23 },
  { category: 'L1 DAME', team: 'LENA', position: 8, played: 9, wins: 3, losses: 6, points: 12, pointsFor: 259, pointsAgainst: 326, pointsDifference: -67 },
  { category: 'L1 DAME', team: 'FALCONS', position: 9, played: 8, wins: 2, losses: 6, points: 10, pointsFor: 216, pointsAgainst: 483, pointsDifference: -267 },
  { category: 'L1 DAME', team: 'MARIK KLOES', position: 10, played: 9, wins: 0, losses: 9, points: 9, pointsFor: 153, pointsAgainst: 447, pointsDifference: -294 },

  // U18 FILLES
  { category: 'U18 FILLES', team: 'LENA', position: 1, played: 7, wins: 6, losses: 1, points: 13, pointsFor: 270, pointsAgainst: 155, pointsDifference: 115 },
  { category: 'U18 FILLES', team: 'FX VOGT', position: 2, played: 6, wins: 5, losses: 1, points: 11, pointsFor: 235, pointsAgainst: 126, pointsDifference: 109 },
  { category: 'U18 FILLES', team: 'FUSEE', position: 3, played: 7, wins: 4, losses: 3, points: 11, pointsFor: 301, pointsAgainst: 278, pointsDifference: 23 },
  { category: 'U18 FILLES', team: 'FAP', position: 4, played: 5, wins: 4, losses: 1, points: 9, pointsFor: 281, pointsAgainst: 156, pointsDifference: 125 },
  { category: 'U18 FILLES', team: 'MARIK KLOES', position: 5, played: 6, wins: 4, losses: 2, points: 10, pointsFor: 244, pointsAgainst: 166, pointsDifference: 78 },
  { category: 'U18 FILLES', team: 'DESBA', position: 6, played: 6, wins: 4, losses: 2, points: 10, pointsFor: 200, pointsAgainst: 171, pointsDifference: 29 },
  { category: 'U18 FILLES', team: 'SANTA BARBARA', position: 7, played: 3, wins: 4, losses: 0, points: 10, pointsFor: 172, pointsAgainst: 183, pointsDifference: -11 },
  { category: 'U18 FILLES', team: 'ONYX', position: 8, played: 5, wins: 4, losses: 1, points: 9, pointsFor: 202, pointsAgainst: 146, pointsDifference: 56 },
  { category: 'U18 FILLES', team: 'PLAY2LEAD', position: 9, played: 6, wins: 1, losses: 5, points: 7, pointsFor: 190, pointsAgainst: 219, pointsDifference: -29 },
  { category: 'U18 FILLES', team: 'FALCONS', position: 10, played: 7, wins: 1, losses: 6, points: 7, pointsFor: 118, pointsAgainst: 257, pointsDifference: -139 },
  { category: 'U18 FILLES', team: 'FRIENDSHIP', position: 11, played: 6, wins: 1, losses: 5, points: 7, pointsFor: 124, pointsAgainst: 195, pointsDifference: -71 },
  { category: 'U18 FILLES', team: '3A BB', position: 12, played: 6, wins: 1, losses: 5, points: 7, pointsFor: 124, pointsAgainst: 195, pointsDifference: -71 },
  { category: 'U18 FILLES', team: 'OL. DE MEYO', position: 13, played: 5, wins: 0, losses: 5, points: 5, pointsFor: 249, pointsAgainst: 237, pointsDifference: -237 },

  // U18 GARCONS - POULE A
  { category: 'U18 GARCONS', poule: 'A', team: 'FALCONS', position: 1, played: 5, wins: 5, losses: 0, points: 10, pointsFor: 325, pointsAgainst: 200, pointsDifference: 125 },
  { category: 'U18 GARCONS', poule: 'A', team: '512 SA', position: 2, played: 5, wins: 3, losses: 2, points: 8, pointsFor: 283, pointsAgainst: 256, pointsDifference: 27 },
  { category: 'U18 GARCONS', poule: 'A', team: 'PLAY2LEAD', position: 3, played: 5, wins: 3, losses: 2, points: 8, pointsFor: 217, pointsAgainst: 192, pointsDifference: 25 },
  { category: 'U18 GARCONS', poule: 'A', team: 'ONYX', position: 4, played: 5, wins: 3, losses: 2, points: 8, pointsFor: 186, pointsAgainst: 159, pointsDifference: 27 },
  { category: 'U18 GARCONS', poule: 'A', team: 'WILDCATS', position: 5, played: 5, wins: 3, losses: 2, points: 8, pointsFor: 195, pointsAgainst: 185, pointsDifference: 10 },
  { category: 'U18 GARCONS', poule: 'A', team: 'MC NOAH', position: 6, played: 5, wins: 2, losses: 3, points: 7, pointsFor: 235, pointsAgainst: 111, pointsDifference: 124 },
  { category: 'U18 GARCONS', poule: 'A', team: 'JOAKIM', position: 7, played: 5, wins: 1, losses: 4, points: 6, pointsFor: 193, pointsAgainst: 283, pointsDifference: -90 },
  { category: 'U18 GARCONS', poule: 'A', team: 'EAST BB', position: 8, played: 5, wins: 1, losses: 4, points: 6, pointsFor: 197, pointsAgainst: 258, pointsDifference: -61 },
  { category: 'U18 GARCONS', poule: 'A', team: 'ETOUDI', position: 9, played: 5, wins: 1, losses: 4, points: 6, pointsFor: 140, pointsAgainst: 144, pointsDifference: -4 },
  { category: 'U18 GARCONS', poule: 'A', team: 'FUSEE', position: 10, played: 3, wins: 0, losses: 3, points: 3, pointsFor: 93, pointsAgainst: 253, pointsDifference: -160 },

  // U18 GARCONS - POULE B
  { category: 'U18 GARCONS', poule: 'B', team: 'YD2 KLOES', position: 1, played: 4, wins: 3, losses: 1, points: 7, pointsFor: 235, pointsAgainst: 191, pointsDifference: 44 },
  { category: 'U18 GARCONS', poule: 'B', team: 'ELCIB', position: 2, played: 4, wins: 3, losses: 1, points: 7, pointsFor: 212, pointsAgainst: 177, pointsDifference: 35 },
  { category: 'U18 GARCONS', poule: 'B', team: 'MESSASSI', position: 3, played: 4, wins: 3, losses: 1, points: 7, pointsFor: 230, pointsAgainst: 167, pointsDifference: 63 },
  { category: 'U18 GARCONS', poule: 'B', team: 'PEPINIERE', position: 4, played: 5, wins: 2, losses: 3, points: 7, pointsFor: 188, pointsAgainst: 245, pointsDifference: -57 },
  { category: 'U18 GARCONS', poule: 'B', team: 'FAP', position: 5, played: 4, wins: 2, losses: 2, points: 6, pointsFor: 152, pointsAgainst: 180, pointsDifference: -28 },
  { category: 'U18 GARCONS', poule: 'B', team: 'FRIENDSHIP', position: 6, played: 4, wins: 2, losses: 2, points: 6, pointsFor: 213, pointsAgainst: 189, pointsDifference: 24 },
  { category: 'U18 GARCONS', poule: 'B', team: 'MARY JO', position: 7, played: 4, wins: 1, losses: 3, points: 5, pointsFor: 160, pointsAgainst: 200, pointsDifference: -40 },
  { category: 'U18 GARCONS', poule: 'B', team: 'PHISLAMA', position: 8, played: 4, wins: 0, losses: 4, points: 4, pointsFor: 138, pointsAgainst: 222, pointsDifference: -84 },
  { category: 'U18 GARCONS', poule: 'B', team: 'ALPH1', position: 9, played: 4, wins: 0, losses: 4, points: 4, pointsFor: 138, pointsAgainst: 222, pointsDifference: -84 },

  // U18 GARCONS - POULE C
  { category: 'U18 GARCONS', poule: 'C', team: 'GREEN CITY', position: 1, played: 5, wins: 5, losses: 0, points: 10, pointsFor: 258, pointsAgainst: 216, pointsDifference: 42 },
  { category: 'U18 GARCONS', poule: 'C', team: 'ACPBA', position: 2, played: 4, wins: 4, losses: 0, points: 8, pointsFor: 220, pointsAgainst: 165, pointsDifference: 55 },
  { category: 'U18 GARCONS', poule: 'C', team: 'MENDONG', position: 3, played: 4, wins: 3, losses: 1, points: 7, pointsFor: 157, pointsAgainst: 111, pointsDifference: 46 },
  { category: 'U18 GARCONS', poule: 'C', team: 'DREAM BB', position: 4, played: 5, wins: 2, losses: 3, points: 7, pointsFor: 188, pointsAgainst: 245, pointsDifference: -57 },
  { category: 'U18 GARCONS', poule: 'C', team: 'COSBIE', position: 5, played: 4, wins: 2, losses: 2, points: 6, pointsFor: 152, pointsAgainst: 180, pointsDifference: -28 },
  { category: 'U18 GARCONS', poule: 'C', team: 'LENA', position: 6, played: 4, wins: 1, losses: 3, points: 5, pointsFor: 213, pointsAgainst: 189, pointsDifference: 24 },
  { category: 'U18 GARCONS', poule: 'C', team: 'SANTA BARBARA', position: 7, played: 4, wins: 1, losses: 3, points: 5, pointsFor: 160, pointsAgainst: 200, pointsDifference: -40 },
  { category: 'U18 GARCONS', poule: 'C', team: 'FX VOGT', position: 8, played: 4, wins: 0, losses: 4, points: 4, pointsFor: 138, pointsAgainst: 222, pointsDifference: -84 },
  { category: 'U18 GARCONS', poule: 'C', team: '3A BB', position: 9, played: 4, wins: 0, losses: 4, points: 4, pointsFor: 138, pointsAgainst: 222, pointsDifference: -84 },
];

const normalizeCategory = (cat: string) => {
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

function findClosestTeamInCategory(name: string, category: string, teams: { name: string, category: string }[]): string | null {
  let cat = normalizeCategory(category);
  let candidates = teams.filter(t => {
    if (cat === 'L1 MESSIEUR') {
      return t.category === cat && (t.name.toUpperCase() === name.toUpperCase() || t.name.toUpperCase().endsWith(' MESSIEURS') || t.name.toUpperCase().endsWith(' MESSIEUR'));
    }
    if (cat === 'L1 DAME') {
      return t.category === cat && (t.name.toUpperCase() === name.toUpperCase() || t.name.toUpperCase().endsWith(' DAMES') || t.name.toUpperCase().endsWith(' DAME'));
    }
    // Also allow for category-suffixed names (e.g., 'SANTA BARBARA L2B' for 'SANTA BARBARA' in L2B MESSIEUR)
    if (t.category === cat && t.name.toUpperCase().replace(/ [A-Z0-9]+$/, '') === name.toUpperCase()) {
      return true;
    }
    return t.category === cat;
  });
  if (candidates.length === 0) return null;
  let minDist = Infinity;
  let closest = null;
  for (const t of candidates) {
    if (t.name.toUpperCase() === name.toUpperCase()) return t.name;
    if (cat === 'L1 MESSIEUR' && (t.name.toUpperCase().replace(/ MESSIEURS?$/, '') === name.toUpperCase())) return t.name;
    if (cat === 'L1 DAME' && (t.name.toUpperCase().replace(/ DAMES?$/, '') === name.toUpperCase())) return t.name;
    // Category-suffix match
    if (t.name.toUpperCase().replace(/ [A-Z0-9]+$/, '') === name.toUpperCase()) return t.name;
    const dist = levenshtein.get(name.toUpperCase(), t.name.toUpperCase());
    if (dist < minDist) {
      minDist = dist;
      closest = t.name;
    }
  }
  return minDist <= 3 ? closest : null;
}

const run = async () => {
  await connectDB();
  console.log('Connected to MongoDB for adding image classifications.');

  let teams: { name: string, category: string, _id: any }[] = (await Team.find().select('name category _id')).map(t => ({ name: t.name, category: t.category, _id: t._id }));

  let inserted = 0;
  let skipped = 0;

  for (const c of classificationData) {
    let cat = normalizeCategory(c.category);
    let teamObj = teams.find(t => t.name.toUpperCase() === c.team.toUpperCase() && t.category === cat);
    if (!teamObj) {
      const close = findClosestTeamInCategory(c.team, cat, teams);
      if (close) {
        teamObj = teams.find(t => t.name === close && t.category === cat);
        console.warn(`Corrected team: '${c.team}' -> '${close}'`);
      }
    }
    if (!teamObj) {
      console.warn(`Skipping classification: ${c.team} (${cat}) (team not found)`);
      skipped++;
      continue;
    }
    // Upsert classification
    await Classification.findOneAndUpdate(
      { team: teamObj._id, category: cat },
      {
        team: teamObj._id,
        category: cat,
        position: c.position,
        played: c.played,
        wins: c.wins,
        losses: c.losses,
        points: c.points,
        pointsFor: c.pointsFor,
        pointsAgainst: c.pointsAgainst,
        pointsDifference: c.pointsDifference,
      },
      { upsert: true, new: true }
    );
    inserted++;
    console.log(`Inserted/Updated: ${c.team} (${cat})`);
  }
  console.log(`Done. Inserted/Updated: ${inserted}, Skipped: ${skipped}`);
  process.exit(0);
};

run().catch(e => { console.error(e); process.exit(1); }); 