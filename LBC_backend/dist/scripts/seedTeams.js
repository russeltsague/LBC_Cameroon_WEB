"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Team_1 = __importDefault(require("../models/Team"));
const db_1 = __importDefault(require("../config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './LBC_backend02/.env' });
const teamsData = [
    // CORPORATES
    { name: 'MINDCAF', category: 'CORPORATES', city: 'Yaounde', poule: undefined },
    { name: 'MINFI', category: 'CORPORATES', city: 'Yaounde', poule: undefined },
    { name: 'AFRILAND', category: 'CORPORATES', city: 'Yaounde', poule: undefined },
    { name: 'BICEC', category: 'CORPORATES', city: 'Yaounde', poule: undefined },
    // L1 DAME
    { name: 'FAP DAMES', category: 'L1 DAME', city: 'Yaounde', poule: undefined },
    { name: 'MARIK YD2', category: 'L1 DAME', city: 'Yaounde', poule: undefined },
    { name: 'ONYX DAMES', category: 'L1 DAME', city: 'Yaounde', poule: undefined },
    { name: 'OVERDOSE', category: 'L1 DAME', city: 'Yaounde', poule: undefined },
    { name: 'AS KEEP', category: 'L1 DAME', city: 'Yaounde', poule: undefined },
    { name: 'MC NOAH DAMES', category: 'L1 DAME', city: 'Yaounde', poule: undefined },
    { name: 'LENA DAMES', category: 'L1 DAME', city: 'Yaounde', poule: undefined },
    { name: 'FAP2 DAMES', category: 'L1 DAME', city: 'Yaounde', poule: undefined },
    { name: 'AS KEEP2', category: 'L1 DAME', city: 'Yaounde', poule: undefined },
    { name: 'FALCONS DAMES', category: 'L1 DAME', city: 'Yaounde', poule: undefined },
    // MESSIEURS L2A - POULE A
    { name: 'MENDONG', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'A' },
    { name: 'LENA MESSIEURS L2A', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'A' },
    { name: 'JOAKIM BB', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'A' },
    { name: 'WOLVES2', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'A' },
    { name: 'KLOES YD2 L2A', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'A' },
    { name: 'ALPH2', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'A' },
    { name: 'AS KEEP L2A', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'A' },
    { name: 'EXPENDABLES', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'A' },
    { name: 'MESSASSI L2A', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'A' },
    // MESSIEURS L2A - POULE B
    { name: 'SEED EXPENDABLE', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'B' },
    { name: 'ALL SPORT', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'B' },
    { name: 'FUSEE L2A', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'B' },
    { name: 'WOLVES1', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'B' },
    { name: 'MARY JO L2A', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'B' },
    { name: 'MSA', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'B' },
    { name: 'BOFIA BB', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'B' },
    { name: 'MC NOAH2', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'B' },
    { name: 'APEJES', category: 'L2A MESSIEUR', city: 'Yaounde', poule: 'B' },
    // MESSIEURS L2B
    { name: 'MBOA BB', category: 'L2B MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'OVENG BB', category: 'L2B MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'APEJES2', category: 'L2B MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'SANTA BARBARA L2B', category: 'L2B MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'MBALMAYO BBC', category: 'L2B MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'HAND OF GOD', category: 'L2B MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'PHYSLAMA L2B', category: 'L2B MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'TEAM K SPORT', category: 'L2B MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'WILDCATS2', category: 'L2B MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'EAST BB L2B', category: 'L2B MESSIEUR', city: 'Yaounde', poule: undefined },
    // U18 FILLES
    { name: 'FX VOGT FILLES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'SANTA BARBARA FILLES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'PLAY2LEAD FILLES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: '3A BB FILLES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'MARIK KLOES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'OLYMPIQUE DE MEYO', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'FRIENDSHIP FILLES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'FAP U18 FILLES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'ONYX U18 FILLES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'FUSEE U18 FILLES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'FALCONS U18 FILLES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'DESBA', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    { name: 'LENA U18 FILLES', category: 'U18 FILLES', city: 'Yaounde', poule: undefined },
    // U18 GARCONS - POULE A
    { name: 'PLAY2LEAD GARCONS', category: 'U18 GARCONS', city: 'Yaounde', poule: 'A' },
    { name: 'WILDCATS U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'A' },
    { name: 'JOAKIM BB U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'A' },
    { name: 'FUSEE U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'A' },
    { name: 'EAST BB U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'A' },
    { name: 'FALCONS U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'A' },
    { name: '512 SA U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'A' },
    { name: 'MC NOAH U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'A' },
    { name: 'ONYX U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'A' },
    { name: 'ETOUDI U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'A' },
    // U18 GARCONS - POULE B
    { name: 'KLOES YD2 U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'B' },
    { name: 'FRIENDSHIP U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'B' },
    { name: 'MARY JO U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'B' },
    { name: 'FAP U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'B' },
    { name: 'ELCIB', category: 'U18 GARCONS', city: 'Yaounde', poule: 'B' },
    { name: 'PHISLAMA U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'B' },
    { name: 'PEPINIERE', category: 'U18 GARCONS', city: 'Yaounde', poule: 'B' },
    { name: 'MESSASSI U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'B' },
    { name: 'ALPH1 U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'B' },
    // U18 GARCONS - POULE C
    { name: 'ACPBA U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'C' },
    { name: 'COSBIE', category: 'U18 GARCONS', city: 'Yaounde', poule: 'C' },
    { name: 'SANTA BARBARA U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'C' },
    { name: '3A BB U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'C' },
    { name: 'FX VOGT2', category: 'U18 GARCONS', city: 'Yaounde', poule: 'C' },
    { name: 'DREAM BB', category: 'U18 GARCONS', city: 'Yaounde', poule: 'C' },
    { name: 'GREEN CITY', category: 'U18 GARCONS', city: 'Yaounde', poule: 'C' },
    { name: 'MENDONG U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'C' },
    { name: 'LENA U18', category: 'U18 GARCONS', city: 'Yaounde', poule: 'C' },
    // VETERANS
    { name: 'VBC', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'AWAE', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'EVBA', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'NO STRESS SOA', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'BALLERS', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'MIMBOMAN', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'MCI', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'LBV', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'FRIENDSHIP VETERANS', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'BAFIA', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'NKOLBISSON', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'KONDENGUI', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    { name: 'MESSASSI VETERANS', category: 'VETERANS', city: 'Yaounde', poule: undefined },
    // MESSIEURS L1
    { name: 'BEAC', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'NYBA', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'FAP MESSIEURS', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'FALCONS MESSIEURS', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'ETOUDI MESSIEURS', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'ACPBA MESSIEURS', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'ANGELS', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: '512 SA', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'ALPH', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'MC NOAH MESSIEURS', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'ONYX MESSIEURS', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'FRIENDSHIP MESSIEURS', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'WILDCATS', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
    { name: 'LIGHT ACADEMY', category: 'L1 MESSIEUR', city: 'Yaounde', poule: undefined },
];
const teamsToCreate = teamsData.map(team => ({
    ...team,
    founded: 0,
    arena: '.......',
    coach: '.......',
    about: '.......',
}));
const seedTeams = async () => {
    try {
        await (0, db_1.default)();
        console.log('Connected to MongoDB for seeding teams.');
        // Optional: Clear existing teams
        await Team_1.default.deleteMany({});
        console.log('Cleared existing teams.');
        await Team_1.default.insertMany(teamsToCreate);
        console.log(`Inserted ${teamsToCreate.length} teams.`);
        console.log('Team seeding completed successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding teams:', error);
        process.exit(1);
    }
};
seedTeams();
