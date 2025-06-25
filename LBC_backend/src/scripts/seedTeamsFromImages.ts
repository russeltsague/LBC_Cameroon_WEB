import mongoose from 'mongoose';
import Team from '../models/Team';
import connectDB from '../config/db';
import dotenv from 'dotenv';

dotenv.config({ path: './LBC_backend02/.env' });

const teamsData = [
  // MESSIEURS L1
  { name: 'FAP', category: 'L1 MESSIEUR' },
  { name: '512 BA', category: 'L1 MESSIEUR' },
  { name: 'ACPBA', category: 'L1 MESSIEUR' },
  { name: 'ONYX', category: 'L1 MESSIEUR' },
  { name: 'BEAC', category: 'L1 MESSIEUR' },
  { name: 'NYBA', category: 'L1 MESSIEUR' },
  { name: 'ALPH', category: 'L1 MESSIEUR' },
  { name: 'FALCON', category: 'L1 MESSIEUR' },
  { name: 'ANGELS', category: 'L1 MESSIEUR' },
  { name: 'ETOUDI', category: 'L1 MESSIEUR' },
  { name: 'WILDCATS', category: 'L1 MESSIEUR' },
  { name: 'LIGHT ACADEMY', category: 'L1 MESSIEUR' },
  { name: 'FRIENDSHIP', category: 'L1 MESSIEUR' },
  { name: 'MC NOAH', category: 'L1 MESSIEUR' },

  // DAMES L1
  { name: 'FAP', category: 'L1 DAME' },
  { name: 'OVERDOSE OF ACPBA', category: 'L1 DAME' },
  { name: 'ONYX', category: 'L1 DAME' },
  { name: 'AS KEEP', category: 'L1 DAME' },
  { name: 'MC NOAH', category: 'L1 DAME' },
  { name: 'MARIK YDE2', category: 'L1 DAME' },
  { name: 'FAP 2', category: 'L1 DAME' },
  { name: 'AS KEEP 2', category: 'L1 DAME' },
  { name: 'LENA', category: 'L1 DAME' },

  // MESSIEURS L2A - POULE A
  { name: 'MENDONG', category: 'L2A MESSIEUR', poule: 'A' },
  { name: 'LENA', category: 'L2A MESSIEUR', poule: 'A' },
  { name: 'JOAKIM', category: 'L2A MESSIEUR', poule: 'A' },
  { name: 'WOLVES 2', category: 'L2A MESSIEUR', poule: 'A' },
  { name: 'KLOES YDE2', category: 'L2A MESSIEUR', poule: 'A' },
  { name: 'ALPH2', category: 'L2A MESSIEUR', poule: 'A' },
  { name: 'ASKEEP', category: 'L2A MESSIEUR', poule: 'A' },
  { name: 'EXPENDABLES', category: 'L2A MESSIEUR', poule: 'A' },
  { name: 'MESSASSI', category: 'L2A MESSIEUR', poule: 'A' },

  // MESSIEURS L2A - POULE B
  { name: 'SEED EXPENDABLES', category: 'L2A MESSIEUR', poule: 'B' },
  { name: 'WOLVE1', category: 'L2A MESSIEUR', poule: 'B' },
  { name: 'ALLSPORT', category: 'L2A MESSIEUR', poule: 'B' },
  { name: 'MARYJO', category: 'L2A MESSIEUR', poule: 'B' },
  { name: 'FUSEE', category: 'L2A MESSIEUR', poule: 'B' },
  { name: 'MSA MEDONGO', category: 'L2A MESSIEUR', poule: 'B' },
  { name: 'APEJES', category: 'L2A MESSIEUR', poule: 'B' },
  { name: 'BOFIA', category: 'L2A MESSIEUR', poule: 'B' },
  { name: 'LAMAFEE(MCNOAH)', category: 'L2A MESSIEUR', poule: 'B' },

  // MESSIEURS L2B
  { name: 'MBOA BASKET', category: 'L2B MESSIEUR' },
  { name: 'OVENG BASKET', category: 'L2B MESSIEUR' },
  { name: 'APEJES 2', category: 'L2B MESSIEUR' },
  { name: 'SANTA BABARA', category: 'L2B MESSIEUR' },
  { name: 'MBALMAYO BBC', category: 'L2B MESSIEUR' },
  { name: 'HAND OF GOD', category: 'L2B MESSIEUR' },
  { name: 'PHYSILAMA JAMA', category: 'L2B MESSIEUR' },
  { name: 'TEAM K SPORT', category: 'L2B MESSIEUR' },
  { name: 'WILDCATS2', category: 'L2B MESSIEUR' },
  { name: 'EAST BASKET', category: 'L2B MESSIEUR' },

  // U18 GARÇONS - POULE A
  { name: 'MC NOAH', category: 'U18 GARCONS', poule: 'A' },
  { name: '512 BA', category: 'U18 GARCONS', poule: 'A' },
  { name: 'ONYX', category: 'U18 GARCONS', poule: 'A' },
  { name: 'WILDCATS', category: 'U18 GARCONS', poule: 'A' },
  { name: 'PLAY 2 LEADS', category: 'U18 GARCONS', poule: 'A' },
  { name: 'FUSEE', category: 'U18 GARCONS', poule: 'A' },
  { name: 'JOAKIM BB', category: 'U18 GARCONS', poule: 'A' },
  { name: 'EAST BASKET', category: 'U18 GARCONS', poule: 'A' },
  { name: 'FALCONS', category: 'U18 GARCONS', poule: 'A' },

  // U18 GARÇONS - POULE B
  { name: 'ALPH1', category: 'U18 GARCONS', poule: 'B' },
  { name: 'YD2 KLOES', category: 'U18 GARCONS', poule: 'B' },
  { name: 'PHISLAMA JAMA', category: 'U18 GARCONS', poule: 'B' },
  { name: 'ELITE CAPITAL', category: 'U18 GARCONS', poule: 'B' },
  { name: 'MARY JO', category: 'U18 GARCONS', poule: 'B' },
  { name: 'PEPINIÈRE', category: 'U18 GARCONS', poule: 'B' },
  { name: 'FAP', category: 'U18 GARCONS', poule: 'B' },
  { name: 'FRIENDSHIP', category: 'U18 GARCONS', poule: 'B' },
  { name: 'MESSASSI ANGELS', category: 'U18 GARCONS', poule: 'B' },

  // U18 GARÇONS - POULE C
  { name: 'ACPBA', category: 'U18 GARCONS', poule: 'C' },
  { name: 'MENDONG', category: 'U18 GARCONS', poule: 'C' },
  { name: 'DREAM BASKETBALL', category: 'U18 GARCONS', poule: 'C' },
  { name: 'COSBIE', category: 'U18 GARCONS', poule: 'C' },
  { name: 'LENA', category: 'U18 GARCONS', poule: 'C' },
  { name: 'GREEN CITY', category: 'U18 GARCONS', poule: 'C' },
  { name: 'FX VOGT2', category: 'U18 GARCONS', poule: 'C' },
  { name: 'SANTA BABARA', category: 'U18 GARCONS', poule: 'C' },
  { name: '3ABASKETBALL', category: 'U18 GARCONS', poule: 'C' },

  // U18 FILLES
  { name: 'OLYMPIQUE DE MEYO', category: 'U18 FILLES' },
  { name: 'FX VOGT', category: 'U18 FILLES' },
  { name: 'SANTA BABARA', category: 'U18 FILLES' },
  { name: 'PLAY 2 LEADS', category: 'U18 FILLES' },
  { name: 'MARIK KLOES', category: 'U18 FILLES' },
  { name: 'ONYX', category: 'U18 FILLES' },
  { name: 'DESBA', category: 'U18 FILLES' },
  { name: 'FAP', category: 'U18 FILLES' },
  { name: 'FUSEE', category: 'U18 FILLES' },
  { name: 'COSBIE', category: 'U18 FILLES' },
  { name: '3ABASKETBALL', category: 'U18 FILLES' },
  { name: 'LENA', category: 'U18 FILLES' },
  { name: 'FRIENDSHIP', category: 'U18 FILLES' },
];

const defaultFields = {
  city: 'Yaounde',
  founded: 0,
  arena: 'Unknown',
  coach: 'Unknown',
  about: 'No description.',
};

const run = async () => {
  await connectDB();
  console.log('Connected to MongoDB for seeding teams from images.');

  let inserted = 0;
  for (const t of teamsData) {
    await Team.findOneAndUpdate(
      { name: t.name, category: t.category, poule: t.poule },
      { ...defaultFields, ...t },
      { upsert: true, new: true }
    );
    inserted++;
    console.log(`Upserted: ${t.name} (${t.category}${t.poule ? ', Poule ' + t.poule : ''})`);
  }
  console.log(`Done. Upserted: ${inserted} teams.`);
  process.exit(0);
};

run().catch(e => { console.error(e); process.exit(1); }); 