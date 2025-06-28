"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Match_1 = __importDefault(require("../models/Match"));
const Team_1 = __importDefault(require("../models/Team"));
const Category_1 = __importDefault(require("../models/Category"));
const db_1 = __importDefault(require("../config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './LBC_backend02/.env' });
const teamNameMapping = {
    "3A BB": "3A BB FILLES",
    "FALCONS": "FALCONS U18 FILLES",
    "LENA": "LENA U18 FILLES",
    "FAP": "FAP U18 FILLES",
    "MENDONG": "MENDONG U18",
    "EAST BB": "EAST BB U18",
    "ETOUDI": "ETOUDI U18",
    "FUSEE": "FUSEE U18",
    "ONYX": "ONYX U18",
    "MARIK KLOES": "MARIK KLOES",
    "FRIENDSHIP": "FRIENDSHIP FILLES",
    "PHISLAMA": "PHISLAMA U18",
    "ALPH1": "ALPH1 U18",
    "MESSASSI": "MESSASSI U18",
    "VOGT2": "FX VOGT2",
    "SANTA BARBARA": "SANTA BARBARA U18",
    // DAMES
    "FALCONS DAMES": "FALCONS DAMES",
    "LENA DAMES": "LENA DAMES",
    "ONYX DAMES": "ONYX DAMES",
    "AS KEEP": "AS KEEP",
    "OVERDOSE": "OVERDOSE",
    "MC NOAH": "MC NOAH DAMES",
    "FAP2": "FAP2 DAMES",
    "AS KEEP2": "AS KEEP2",
    "MARIK YD2": "MARIK YD2",
    // MESSIEURS
    "ONYX MESSIEURS": "ONYX MESSIEURS",
    "ALPH": "ALPH",
    "FALCONS MESSIEURS": "FALCONS MESSIEURS",
    "BEAC": "BEAC",
    "FAP MESSIEURS": "FAP MESSIEURS",
    "512 SA": "512 SA",
    "ANGELS": "ANGELS",
    "WILDCATS": "WILDCATS",
    "ETOUDI MESSIEURS": "ETOUDI MESSIEURS",
    "MC NOAH MESSIEURS": "MC NOAH MESSIEURS",
    "FRIENDSHIP MESSIEURS": "FRIENDSHIP MESSIEURS",
    "NYBA": "NYBA",
    "LIGHT ACADEMY": "LIGHT ACADEMY",
    "ACPBA MESSIEURS": "ACPBA MESSIEURS",
    // L2A MESSIEURS
    "ALPH2": "ALPH2",
    "LENA MESSIEURS L2A": "LENA MESSIEURS L2A",
    "MENDONG L2A": "MENDONG",
    "KLOES YD2 L2A": "KLOES YD2 L2A",
    "MESSASSI L2A": "MESSASSI L2A",
    "ALL SPORT": "ALL SPORT",
    "SEED EXP.": "SEED EXPENDABLE",
    "MARY JO": "MARY JO L2A",
    "JOAKIM BB": "JOAKIM BB",
    "EXPENDABLES": "EXPENDABLES",
    "BOFIA": "BOFIA BB",
    "WOLVES1": "WOLVES1",
    "MSA": "MSA",
    "AS KEEP L2A": "AS KEEP L2A",
    "WOLVES2": "WOLVES2",
    "FUSEE L2A": "FUSEE L2A",
    // L2B MESSIEURS
    "HAND OF GOD": "HAND OF GOD",
    "WILDCATS2": "WILDCATS2",
    "PHYSLAMA L2B": "PHYSLAMA L2B",
    "SANTA BARBARA L2B": "SANTA BARBARA L2B",
    "APEJES2": "APEJES2",
    "EAST BB L2B": "EAST BB L2B",
    "OVENG BB": "OVENG BB",
    "TEAM K SPORT": "TEAM K SPORT",
    "MBALMAYO": "MBALMAYO BBC",
    "MBOA BB": "MBOA BB",
    // U18 FILLES
    "SANTA B.": "SANTA BARBARA FILLES",
    "FUSEE U18 FILLES": "FUSEE U18 FILLES",
    "MARIK KLOES FILLES": "MARIK KLOES",
    "3A BB FILLES": "3A BB FILLES",
    "FRIENDSHIP FILLES": "FRIENDSHIP FILLES",
    "DESBA": "DESBA",
    "PLAY2LEAD FILLES": "PLAY2LEAD FILLES",
    "FX VOGT": "FX VOGT FILLES",
    "ONYX U18 FILLES": "ONYX U18 FILLES",
    // U18 GARCONS
    "PEPINIERE": "PEPINIERE",
    "KLOES YD2": "KLOES YD2 U18",
    "PLAY2LEAD": "PLAY2LEAD GARCONS",
    "GREEN CITY": "GREEN CITY",
    "FX VOGT2": "FX VOGT2",
    "512 SA U18": "512 SA U18",
    "FALCONS U18": "FALCONS U18",
    "WILDCATS U18": "WILDCATS U18",
    "EAST BB U18": "EAST BB U18",
    "JOAKIM BB U18": "JOAKIM BB U18",
    "COSBIE": "COSBIE",
    "ONYX U18": "ONYX U18",
    "MESSASSI U18": "MESSASSI U18",
    "SANTA BARBARA U18": "SANTA BARBARA U18",
    "MENDONG U18": "MENDONG U18",
};
const categoryNameMapping = {
    "U18 FILLES": "U18 FILLES",
    "U18 GARCONS": "U18 GARCONS",
    "DAMES": "L1 DAME",
    "MESSIEURS": "L1 MESSIEUR",
    "L1 MESSIEURS": "L1 MESSIEUR",
    "L2A MESSIEURS": "L2A MESSIEUR",
    "L2B MESSIEURS": "L2B MESSIEUR",
};
const matchesData = [
    // image 1
    { date: '2025-04-18', category: 'U18 FILLES', homeTeam: '3A BB', awayTeam: 'LENA', homeScore: 0, awayScore: 20 },
    { date: '2025-04-18', category: 'U18 FILLES', homeTeam: 'FALCONS', awayTeam: 'FAP', homeScore: 22, awayScore: 63 },
    { date: '2025-04-18', category: 'U18 GARCONS', homeTeam: 'MENDONG', awayTeam: 'COSBIE', homeScore: 20, awayScore: 0 },
    { date: '2025-04-18', category: 'U18 GARCONS', homeTeam: 'EAST BB', awayTeam: 'ETOUDI', homeScore: 43, awayScore: 46 },
    { date: '2025-04-18', category: 'U18 GARCONS', homeTeam: 'FUSEE', awayTeam: 'ONYX', homeScore: 39, awayScore: 76 },
    { date: '2025-04-13', category: 'U18 FILLES', homeTeam: 'MARIK KLOES', awayTeam: 'DESBA', homeScore: 37, awayScore: 22 },
    { date: '2025-04-13', category: 'U18 FILLES', homeTeam: 'FRIENDSHIP', awayTeam: 'LENA', homeScore: 23, awayScore: 43 },
    { date: '2025-04-13', category: 'U18 GARCONS', homeTeam: 'PHISLAMA', awayTeam: 'ALPH1', homeScore: 47, awayScore: 38 },
    { date: '2025-04-13', category: 'U18 GARCONS', homeTeam: 'ELCIB', awayTeam: 'MESSASSI', homeScore: 57, awayScore: 52 },
    { date: '2025-04-13', category: 'U18 GARCONS', homeTeam: 'VOGT2', awayTeam: 'SANTA BARBARA', homeScore: 30, awayScore: 56 },
    // image 2
    { date: '2025-04-26', category: 'DAMES', homeTeam: 'FALCONS DAMES', awayTeam: 'FAP DAMES', homeScore: 26, awayScore: 77 },
    { date: '2025-04-26', category: 'DAMES', homeTeam: 'LENA DAMES', awayTeam: 'ONYX DAMES', homeScore: 46, awayScore: 66 },
    { date: '2025-04-26', category: 'DAMES', homeTeam: 'MARIK YD2', awayTeam: 'AS KEEP', homeScore: 24, awayScore: 87 },
    { date: '2025-04-26', category: 'DAMES', homeTeam: 'OVERDOSE', awayTeam: 'MC NOAH DAMES', homeScore: 55, awayScore: 37 },
    { date: '2025-04-26', category: 'MESSIEURS', homeTeam: 'ONYX MESSIEURS', awayTeam: '512 SA', homeScore: 48, awayScore: 65 },
    { date: '2025-04-26', category: 'MESSIEURS', homeTeam: 'ALPH', awayTeam: 'ANGELS', homeScore: 66, awayScore: 36 },
    { date: '2025-04-26', category: 'MESSIEURS', homeTeam: 'FALCONS MESSIEURS', awayTeam: 'WILDCATS', homeScore: 60, awayScore: 55 },
    { date: '2025-04-26', category: 'MESSIEURS', homeTeam: 'BEAC', awayTeam: 'ETOUDI MESSIEURS', homeScore: 113, awayScore: 44 },
    { date: '2025-04-26', category: 'MESSIEURS', homeTeam: 'FAP MESSIEURS', awayTeam: 'MC NOAH MESSIEURS', homeScore: 62, awayScore: 59 },
    // image 3
    { date: '2025-05-10', category: 'U18 FILLES', homeTeam: 'SANTA B.', awayTeam: 'FUSEE U18 FILLES', homeScore: 17, awayScore: 45 },
    { date: '2025-05-10', category: 'L2A MESSIEURS', homeTeam: 'ALPH2', awayTeam: 'MENDONG', homeScore: 42, awayScore: 47 },
    { date: '2025-05-10', category: 'L2A MESSIEURS', homeTeam: 'LENA MESSIEURS L2A', awayTeam: 'KLOES YD2 L2A', homeScore: 37, awayScore: 41 },
    { date: '2025-05-10', category: 'L2B MESSIEURS', homeTeam: 'APEJES2', awayTeam: 'MBALMAYO BBC', homeScore: 25, awayScore: 60 },
    { date: '2025-05-10', category: 'L2B MESSIEURS', homeTeam: 'PHISLAMA L2B', awayTeam: 'MBALMAYO BBC', homeScore: 49, awayScore: 73 },
    { date: '2025-05-10', category: 'DAMES', homeTeam: 'FAP2 DAMES', awayTeam: 'FAP DAMES', homeScore: 38, awayScore: 26 },
    { date: '2025-05-10', category: 'L1 MESSIEURS', homeTeam: 'MC NOAH MESSIEURS', awayTeam: 'NYBA', homeScore: 71, awayScore: 58 },
    { date: '2025-05-11', category: 'L2B MESSIEURS', homeTeam: 'MBOA BB', awayTeam: 'SANTA BARBARA L2B', homeScore: 20, awayScore: 0 },
    { date: '2025-05-11', category: 'L2B MESSIEURS', homeTeam: 'PHISLAMA L2B', awayTeam: 'HAND OF GOD', homeScore: 52, awayScore: 59 },
    { date: '2025-05-11', category: 'L2A MESSIEURS', homeTeam: 'MESSASSI L2A', awayTeam: 'AS KEEP L2A', homeScore: 71, awayScore: 73 },
    { date: '2025-05-11', category: 'L2A MESSIEURS', homeTeam: 'ALL SPORT', awayTeam: 'BOFIA BB', homeScore: 49, awayScore: 37 },
    { date: '2025-05-11', category: 'L2A MESSIEURS', homeTeam: 'SEED EXPENDABLE', awayTeam: 'FUSEE L2A', homeScore: 29, awayScore: 50 },
    { date: '2025-05-11', category: 'L2A MESSIEURS', homeTeam: 'MARY JO L2A', awayTeam: 'APEJES', homeScore: 51, awayScore: 70 },
    { date: '2025-05-11', category: 'DAMES', homeTeam: 'ONYX DAMES', awayTeam: 'OVERDOSE', homeScore: 41, awayScore: 65 },
    { date: '2025-05-11', category: 'DAMES', homeTeam: 'LENA DAMES', awayTeam: 'AS KEEP2', homeScore: 24, awayScore: 32 },
    { date: '2025-05-11', category: 'L1 MESSIEURS', homeTeam: 'ETOUDI MESSIEURS', awayTeam: 'WILDCATS', homeScore: 61, awayScore: 79 },
    { date: '2025-05-11', category: 'L1 MESSIEURS', homeTeam: 'FALCONS MESSIEURS', awayTeam: 'BEAC', homeScore: 67, awayScore: 78 },
    // image 4
    { date: '2025-05-17', category: 'L2B MESSIEURS', homeTeam: 'HAND OF GOD', awayTeam: 'APEJES2', homeScore: 48, awayScore: 45 },
    { date: '2025-05-17', category: 'L2B MESSIEURS', homeTeam: 'WILDCATS2', awayTeam: 'EAST BB L2B', homeScore: 64, awayScore: 63 },
    { date: '2025-05-17', category: 'L2B MESSIEURS', homeTeam: 'PHYSLAMA L2B', awayTeam: 'TEAM K SPORT', homeScore: 31, awayScore: 63 },
    { date: '2025-05-17', category: 'L2B MESSIEURS', homeTeam: 'SANTA BARBARA L2B', awayTeam: 'OVENG BB', homeScore: 19, awayScore: 74 },
    { date: '2025-05-17', category: 'L2A MESSIEURS', homeTeam: 'EXPENDABLES', awayTeam: 'LENA MESSIEURS L2A', homeScore: 46, awayScore: 39 },
    { date: '2025-05-17', category: 'L2A MESSIEURS', homeTeam: 'KLOES YD2 L2A', awayTeam: 'JOAKIM BB', homeScore: 40, awayScore: 39 },
    { date: '2025-05-17', category: 'DAMES', homeTeam: 'AS KEEP2', awayTeam: 'MC NOAH DAMES', homeScore: 27, awayScore: 48 },
    { date: '2025-05-17', category: 'DAMES', homeTeam: 'LENA DAMES', awayTeam: 'FALCONS DAMES', homeScore: 34, awayScore: 32 },
    { date: '2025-05-17', category: 'L1 MESSIEURS', homeTeam: 'ETOUDI MESSIEURS', awayTeam: '512 SA', homeScore: 52, awayScore: 62 },
    { date: '2025-05-17', category: 'L1 MESSIEURS', homeTeam: 'NYBA', awayTeam: 'ACPBA MESSIEURS', homeScore: 57, awayScore: 70 },
    { date: '2025-05-17', category: 'L1 MESSIEURS', homeTeam: 'ALPH', awayTeam: 'FALCONS MESSIEURS', homeScore: 53, awayScore: 37 },
    { date: '2025-05-18', category: 'L2B MESSIEURS', homeTeam: 'TEAM K SPORT', awayTeam: 'WILDCATS2', homeScore: 74, awayScore: 65 },
    { date: '2025-05-18', category: 'L2B MESSIEURS', homeTeam: 'EAST BB L2B', awayTeam: 'SANTA BARBARA L2B', homeScore: 59, awayScore: 29 },
    { date: '2025-05-18', category: 'L2B MESSIEURS', homeTeam: 'MBOA BB', awayTeam: 'PHYSLAMA L2B', homeScore: 20, awayScore: 0 },
    { date: '2025-05-18', category: 'L2B MESSIEURS', homeTeam: 'OVENG BB', awayTeam: 'HAND OF GOD', homeScore: 72, awayScore: 74 },
    { date: '2025-05-18', category: 'L2A MESSIEURS', homeTeam: 'BOFIA BB', awayTeam: 'MARY JO L2A', homeScore: 27, awayScore: 59 },
    { date: '2025-05-18', category: 'L2A MESSIEURS', homeTeam: 'ALPH2', awayTeam: 'WOLVES2', homeScore: 85, awayScore: 49 },
    { date: '2025-05-18', category: 'L2A MESSIEURS', homeTeam: 'MENDONG', awayTeam: 'MESSASSI L2A', homeScore: 84, awayScore: 54 },
    { date: '2025-05-18', category: 'L2A MESSIEURS', homeTeam: 'MC NOAH2', awayTeam: 'WOLVES1', homeScore: 49, awayScore: 56 },
    { date: '2025-05-18', category: 'DAMES', homeTeam: 'ONYX DAMES', awayTeam: 'MARIK YD2', homeScore: 85, awayScore: 16 },
    { date: '2025-05-18', category: 'DAMES', homeTeam: 'FAP2 DAMES', awayTeam: 'FAP DAMES', homeScore: 26, awayScore: 51 },
    { date: '2025-05-18', category: 'DAMES', homeTeam: 'OVERDOSE', awayTeam: 'AS KEEP', homeScore: 58, awayScore: 57 },
    { date: '2025-05-18', category: 'L1 MESSIEURS', homeTeam: 'MC NOAH MESSIEURS', awayTeam: 'BEAC', homeScore: 60, awayScore: 54 },
    { date: '2025-05-18', category: 'L1 MESSIEURS', homeTeam: 'FRIENDSHIP MESSIEURS', awayTeam: 'ETOUDI MESSIEURS', homeScore: 44, awayScore: 83 },
    { date: '2025-05-18', category: 'L1 MESSIEURS', homeTeam: 'LIGHT ACADEMY', awayTeam: 'WILDCATS', homeScore: 71, awayScore: 62 },
    { date: '2025-05-18', category: 'L1 MESSIEURS', homeTeam: 'FAP MESSIEURS', awayTeam: 'ALPH', homeScore: 71, awayScore: 51 },
    // image 5
    { date: '2025-05-24', category: 'L2B MESSIEURS', homeTeam: 'OVENG BB', awayTeam: 'MBALMAYO BBC', homeScore: 80, awayScore: 38 },
    { date: '2025-05-24', category: 'L2B MESSIEURS', homeTeam: 'MBALMAYO BBC', awayTeam: 'MBOA BB', homeScore: 68, awayScore: 55 },
    { date: '2025-05-24', category: 'L2B MESSIEURS', homeTeam: 'APEJES2', awayTeam: 'TEAM K SPORT', homeScore: 47, awayScore: 70 },
    { date: '2025-05-24', category: 'L2B MESSIEURS', homeTeam: 'HAND OF GOD', awayTeam: 'EAST BB L2B', homeScore: 57, awayScore: 67 },
    { date: '2025-05-24', category: 'L2A MESSIEURS', homeTeam: 'BOFIA BB', awayTeam: 'MC NOAH2', homeScore: 30, awayScore: 74 },
    { date: '2025-05-24', category: 'L2A MESSIEURS', homeTeam: 'ALPH2', awayTeam: 'MESSASSI L2A', homeScore: 48, awayScore: 56 },
    { date: '2025-05-24', category: 'L2A MESSIEURS', homeTeam: 'WOLVES1', awayTeam: 'APEJES', homeScore: 42, awayScore: 53 },
    { date: '2025-05-24', category: 'DAMES', homeTeam: 'AS KEEP2', awayTeam: 'FAP2 DAMES', homeScore: 23, awayScore: 36 },
    { date: '2025-05-24', category: 'DAMES', homeTeam: 'AS KEEP', awayTeam: 'FAP DAMES', homeScore: 42, awayScore: 50 },
    { date: '2025-05-24', category: 'L1 MESSIEURS', homeTeam: 'FRIENDSHIP MESSIEURS', awayTeam: 'ETOUDI MESSIEURS', homeScore: 82, awayScore: 90 },
    { date: '2025-05-24', category: 'L1 MESSIEURS', homeTeam: 'FALCONS MESSIEURS', awayTeam: 'FAP MESSIEURS', homeScore: 82, awayScore: 90 },
    { date: '2025-05-25', category: 'L2B MESSIEURS', homeTeam: 'APEJES2', awayTeam: 'OVENG BB', homeScore: 33, awayScore: 101 },
    { date: '2025-05-25', category: 'L2B MESSIEURS', homeTeam: 'SANTA BARBARA L2B', awayTeam: 'PHYSLAMA L2B', homeScore: 53, awayScore: 59 },
    { date: '2025-05-25', category: 'L2B MESSIEURS', homeTeam: 'WILDCATS2', awayTeam: 'MBOA BB', homeScore: 26, awayScore: 62 },
    { date: '2025-05-25', category: 'L2A MESSIEURS', homeTeam: 'MSA', awayTeam: 'FUSEE L2A', homeScore: 46, awayScore: 43 },
    { date: '2025-05-25', category: 'L2A MESSIEURS', homeTeam: 'JOAKIM BB', awayTeam: 'LENA MESSIEURS L2A', homeScore: 69, awayScore: 57 },
    { date: '2025-05-25', category: 'L2A MESSIEURS', homeTeam: 'MENDONG', awayTeam: 'WOLVES2', homeScore: 52, awayScore: 59 },
    { date: '2025-05-25', category: 'L2A MESSIEURS', homeTeam: 'AS KEEP L2A', awayTeam: 'KLOES YD2 L2A', homeScore: 49, awayScore: 49 },
    { date: '2025-05-25', category: 'L2A MESSIEURS', homeTeam: 'ALL SPORT', awayTeam: 'MARY JO L2A', homeScore: 29, awayScore: 48 },
    { date: '2025-05-25', category: 'DAMES', homeTeam: 'FALCONS DAMES', awayTeam: 'MC NOAH DAMES', homeScore: 28, awayScore: 54 },
    { date: '2025-05-25', category: 'DAMES', homeTeam: 'LENA DAMES', awayTeam: 'MARIK YD2', homeScore: 28, awayScore: 25 },
    { date: '2025-05-25', category: 'L1 MESSIEURS', homeTeam: 'ACPBA MESSIEURS', awayTeam: 'FRIENDSHIP MESSIEURS', homeScore: 49, awayScore: 57 },
    { date: '2025-05-25', category: 'L1 MESSIEURS', homeTeam: 'NYBA', awayTeam: 'NYBA', homeScore: 72, awayScore: 50 },
    { date: '2025-05-25', category: 'L1 MESSIEURS', homeTeam: 'LIGHT ACADEMY', awayTeam: 'ANGELS', homeScore: 66, awayScore: 54 },
    { date: '2025-05-25', category: 'L1 MESSIEURS', homeTeam: 'ALPH', awayTeam: 'ONYX MESSIEURS', homeScore: 53, awayScore: 55 },
    { date: '2025-05-25', category: 'L1 MESSIEURS', homeTeam: 'BEAC', awayTeam: 'MC NOAH MESSIEURS', homeScore: 65, awayScore: 37 },
    // image 6
    { date: '2025-05-30', category: 'L2A MESSIEURS', homeTeam: 'BOFIA BB', awayTeam: 'SEED EXPENDABLE', homeScore: 35, awayScore: 30 },
    { date: '2025-05-30', category: 'L2A MESSIEURS', homeTeam: 'MENDONG', awayTeam: 'EXPENDABLES', homeScore: 53, awayScore: 49 },
    { date: '2025-05-30', category: 'DAMES', homeTeam: 'LENA DAMES', awayTeam: 'FAP2 DAMES', homeScore: 19, awayScore: 46 },
    { date: '2025-05-30', category: 'L1 MESSIEURS', homeTeam: 'MC NOAH MESSIEURS', awayTeam: 'ETOUDI MESSIEURS', homeScore: 63, awayScore: 47 },
    { date: '2025-05-30', category: 'L1 MESSIEURS', homeTeam: 'FALCONS MESSIEURS', awayTeam: '512 SA', homeScore: 76, awayScore: 57 },
    { date: '2025-05-30', category: 'L1 MESSIEURS', homeTeam: 'FAP MESSIEURS', awayTeam: 'ALPH', homeScore: 65, awayScore: 45 },
    { date: '2025-06-01', category: 'L2A MESSIEURS', homeTeam: 'AS KEEP L2A', awayTeam: 'LENA MESSIEURS L2A', homeScore: 30, awayScore: 48 },
    { date: '2025-06-01', category: 'L2A MESSIEURS', homeTeam: 'MSA', awayTeam: 'SEED EXPENDABLE', homeScore: 55, awayScore: 32 },
    { date: '2025-06-01', category: 'L2A MESSIEURS', homeTeam: 'KLOES YD2 L2A', awayTeam: 'WOLVES2', homeScore: 52, awayScore: 44 },
    { date: '2025-06-01', category: 'L2A MESSIEURS', homeTeam: 'APEJES', awayTeam: 'FUSEE L2A', homeScore: 69, awayScore: 43 },
    { date: '2025-06-01', category: 'DAMES', homeTeam: 'AS KEEP2', awayTeam: 'FALCONS DAMES', homeScore: 43, awayScore: 25 },
    { date: '2025-06-01', category: 'DAMES', homeTeam: 'MC NOAH DAMES', awayTeam: 'ONYX DAMES', homeScore: 34, awayScore: 57 },
    { date: '2025-06-01', category: 'L1 MESSIEURS', homeTeam: 'ANGELS', awayTeam: 'ONYX MESSIEURS', homeScore: 67, awayScore: 52 },
    { date: '2025-06-01', category: 'L1 MESSIEURS', homeTeam: 'LIGHT ACADEMY', awayTeam: 'WILDCATS', homeScore: 68, awayScore: 67 },
    { date: '2025-06-01', category: 'L1 MESSIEURS', homeTeam: 'ACPBA MESSIEURS', awayTeam: 'BEAC', homeScore: 63, awayScore: 47 },
    // image 7
    { date: '2025-06-07', category: 'L2A MESSIEURS', homeTeam: 'ALL SPORT', awayTeam: 'WOLVES1', homeScore: 31, awayScore: 70 },
    { date: '2025-06-07', category: 'L1 MESSIEURS', homeTeam: 'LIGHT ACADEMY', awayTeam: 'FAP MESSIEURS', homeScore: 46, awayScore: 74 },
    { date: '2025-06-07', category: 'L1 MESSIEURS', homeTeam: 'ANGELS', awayTeam: 'WILDCATS', homeScore: 48, awayScore: 71 },
    { date: '2025-06-08', category: 'L2A MESSIEURS', homeTeam: 'JOAKIM BB', awayTeam: 'ALPH2', homeScore: 37, awayScore: 57 },
    { date: '2025-06-08', category: 'L1 MESSIEURS', homeTeam: 'ALPH', awayTeam: 'BEAC', homeScore: 70, awayScore: 77 },
    { date: '2025-06-08', category: 'L1 MESSIEURS', homeTeam: 'WILDCATS', awayTeam: 'ONYX MESSIEURS', homeScore: 61, awayScore: 53 },
    { date: '2025-06-08', category: 'L1 MESSIEURS', homeTeam: 'ACPBA MESSIEURS', awayTeam: 'ANGELS', homeScore: 63, awayScore: 47 },
    // image 8
    { date: '2025-06-14', category: 'U18 FILLES', homeTeam: 'MARIK KLOES', awayTeam: 'FUSEE U18 FILLES', homeScore: 47, awayScore: 51 },
    { date: '2025-06-14', category: 'U18 GARCONS', homeTeam: 'PEPINIERE', awayTeam: 'KLOES YD2', homeScore: 49, awayScore: 65 },
    { date: '2025-06-14', category: 'U18 GARCONS', homeTeam: 'PLAY2LEAD', awayTeam: 'FUSEE U18', homeScore: 37, awayScore: 14 },
    { date: '2025-06-14', category: 'U18 GARCONS', homeTeam: 'GREEN CITY', awayTeam: 'FX VOGT2', homeScore: 51, awayScore: 43 },
    { date: '2025-06-15', category: 'U18 FILLES', homeTeam: '3A BB FILLES', awayTeam: 'ONYX U18 FILLES', homeScore: 17, awayScore: 38 },
    { date: '2025-06-15', category: 'U18 FILLES', homeTeam: 'FRIENDSHIP FILLES', awayTeam: 'SANTA BARBARA FILLES', homeScore: 17, awayScore: 23 },
    { date: '2025-06-15', category: 'U18 FILLES', homeTeam: 'DESBA', awayTeam: 'PLAY2LEAD FILLES', homeScore: 36, awayScore: 29 },
    { date: '2025-06-15', category: 'U18 FILLES', homeTeam: 'FX VOGT', awayTeam: 'FALCONS U18 FILLES', homeScore: 35, awayScore: 21 },
    { date: '2025-06-15', category: 'U18 GARCONS', homeTeam: 'PLAY2LEAD', awayTeam: 'EAST BB U18', homeScore: 44, awayScore: 37 },
    { date: '2025-06-15', category: 'U18 GARCONS', homeTeam: 'JOAKIM BB U18', awayTeam: '512 SA U18', homeScore: 40, awayScore: 42 },
    { date: '2025-06-15', category: 'U18 GARCONS', homeTeam: 'FALCONS U18', awayTeam: 'WILDCATS U18', homeScore: 61, awayScore: 53 },
    { date: '2025-06-15', category: 'DAMES', homeTeam: 'OVERDOSE', awayTeam: 'KLOES YD2', homeScore: 20, awayScore: 0 },
];
const addMoreMatches = async () => {
    try {
        await (0, db_1.default)();
        console.log('Connected to MongoDB for seeding more matches.');
        const teams = await Team_1.default.find().select('_id name');
        const teamMap = new Map(teams.map(team => [team.name, team._id]));
        const categories = await Category_1.default.find().select('_id name');
        const categoryMap = new Map(categories.map(cat => [cat.name, cat._id]));
        const matchesToCreate = [];
        for (const matchData of matchesData) {
            const homeTeamName = teamNameMapping[matchData.homeTeam] || matchData.homeTeam;
            const awayTeamName = teamNameMapping[matchData.awayTeam] || matchData.awayTeam;
            const categoryName = categoryNameMapping[matchData.category] || matchData.category;
            const homeTeam = teamMap.get(homeTeamName);
            const awayTeam = teamMap.get(awayTeamName);
            const category = categoryMap.get(categoryName);
            if (!homeTeam) {
                console.warn(`Team not found: ${homeTeamName} (original: ${matchData.homeTeam})`);
                continue;
            }
            if (!awayTeam) {
                console.warn(`Team not found: ${awayTeamName} (original: ${matchData.awayTeam})`);
                continue;
            }
            if (!category) {
                console.warn(`Category not found: ${categoryName} (original: ${matchData.category})`);
                continue;
            }
            if (matchData.homeTeam === 'OVERDOSE' && matchData.awayTeam === 'KLOES YD2') {
                console.warn('Skipping match with incorrect data: OVERDOSE vs KLOES YD2');
                continue;
            }
            if (matchData.homeTeam === 'NYBA' && matchData.awayTeam === 'NYBA') {
                console.warn('Skipping match with identical teams: NYBA vs NYBA');
                continue;
            }
            matchesToCreate.push({
                date: new Date(matchData.date),
                category,
                homeTeam,
                awayTeam,
                homeScore: matchData.homeScore,
                awayScore: matchData.awayScore,
                status: 'Terminé',
                venue: 'PAPOSY',
            });
        }
        if (matchesToCreate.length > 0) {
            await Match_1.default.insertMany(matchesToCreate);
            console.log(`Inserted ${matchesToCreate.length} new matches.`);
        }
        else {
            console.log('No new matches to insert.');
        }
        console.log('Match seeding completed successfully.');
    }
    catch (error) {
        console.error('Error seeding matches:', error);
    }
    finally {
        mongoose_1.default.disconnect();
    }
};
addMoreMatches();
