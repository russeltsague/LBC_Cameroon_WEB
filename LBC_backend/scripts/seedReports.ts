import mongoose from 'mongoose';
import Report from '../src/models/Report';
import { config } from '../src/config/env';

const sampleReports = [
  {
    season: 'Saison sportive 2024 – 2025',
    reportTitle: 'RAPPORT COMMISSION SPORTIVE N°12',
    date: 'Yaoundé, le 12 mai 2025',
    secretary: 'Le Secrétaire Général',
    resultsA: [
      {
        day: 'Samedi, 10 mai 2025',
        matches: [
          { category: 'U18 FILLES', results: ['SANTA B.  17 – 45  FUSEE'] },
          { category: 'L2A MESSIEURS', results: ['ALPH2   42 – 47  MENDONG', 'LENA   37 – 41  KLOES YD2'] },
          { category: 'L2B MESSIEURS', results: ['APEJES2  25 – 60  MBALMAYO', 'PHISLAMA  49 – 73  MBALMAYO'] },
          { category: 'DAMES', results: ['FAP2   38 – 26  MC NOAH'] },
          { category: 'L1 MESSIEURS', results: ['MC NOAH  71 – 58  NYBA'] }
        ]
      },
      {
        day: 'Dimanche, 11 mai 2025',
        matches: [
          { category: 'L2B MESSIEURS', results: ['MBOA BB  20 – 00  SANTA B.', 'PHISLAMA  52 – 59  HAND OF GOD'] },
          { category: 'L2A MESSIEURS', results: ['MESSASSI  71 – 73  AS KEEP', 'ALL SPORT  49 – 37  BOFIA', 'SEED EXP.  29 – 50  FUSEE', 'MARY JO  51 – 70  APEJES'] },
          { category: 'DAMES', results: ['ONYX   41 – 65  OVERDOSE', 'LENA   24 – 32  AS KEEP2'] },
          { category: 'L1 MESSIEURS', results: ['ETOUDI  61 – 79  WILDCATS', 'FALCONS  67 – 78  ANGELS'] }
        ]
      }
    ],
    decisionsB: 'Toutes les rencontres sont homologuées sous les scores acquis sur le terrain.',
    sanctionsC: {
      heading: 'RECAPITULATIF DES SANCTIONS DU 11eme REGROUPEMENT',
      columns: ['DATES', 'NOMS', 'N° EQUIPES', 'CATEGORIES', 'SANCTIONS', 'MONTANTS', 'OBSERVATION'],
      rows: [
        ['10/05/25', 'ESSENA L.', '11', 'MC NOAH', 'DAMES Antisportive (U2)', '2 000', 'IMPAYÉ'],
        ['10/05/25', 'ANGO D.', '12', 'MC NOAH', 'MESSIEURS L1 Antisportive (U2)', '2 000', 'IMPAYÉ'],
        ['11/05/25', 'NGONO C.', '12', 'SEED EXP.', 'MESSIEURS L2A Antisportive (U2)', '2 000', 'IMPAYÉ'],
        ['11/05/25', 'MELI COACH', '', 'LENA', 'DAMES Technique (B1)', '4 000', 'IMPAYÉ'],
        ['11/05/25', 'HOPP D.', '24', 'PHISLAMA', 'MESSIEURS L2B Antisportive (U2)', '2 000', 'IMPAYÉ'],
        ['11/05/25', 'ANOMBOGO P.', '17', 'MARY JO', 'MESSIEURS L2B Technique (T1)', '2 000', 'IMPAYÉ'],
        ['11/05/25', 'NDZIE X. COACH', '', 'SANTA B.', 'MESSIEURS L2B Forfait', '10 000', 'IMPAYÉ']
      ],
      note: "NB : AUCUN(E) N'EQUIPE/JOUEUR NE JOUERA SANS S'ETRE ACQUITTE DE TOUTES SES SANCTIONS.\nCE RAPPORT FAISANT OFFICE DE NOTIFICATION EN PLUS DES SOUCHES DES FEUILLES DE MARQUE QUI SONT REMISES AUX EQUIPES APRES LES RENCONTRES"
    },
    isActive: true
  },
  {
    season: 'Saison sportive 2024 – 2025',
    reportTitle: 'RAPPORT COMMISSION SPORTIVE N°11',
    date: 'Yaoundé, le 5 mai 2025',
    secretary: 'Le Secrétaire Général',
    resultsA: [],
    decisionsB: '',
    sanctionsC: { heading: '', columns: [], rows: [], note: '' },
    isActive: true
  },
  {
    season: 'Saison sportive 2024 – 2025',
    reportTitle: 'RAPPORT COMMISSION SPORTIVE N°10',
    date: 'Yaoundé, le 28 avril 2025',
    secretary: 'Le Secrétaire Général',
    resultsA: [],
    decisionsB: '',
    sanctionsC: { heading: '', columns: [], rows: [], note: '' },
    isActive: true
  }
];

async function seedReports() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing reports
    await Report.deleteMany({});
    console.log('Cleared existing reports');

    // Insert sample reports
    const insertedReports = await Report.insertMany(sampleReports);
    console.log(`Inserted ${insertedReports.length} reports`);

    console.log('Reports seeded successfully!');
  } catch (error) {
    console.error('Error seeding reports:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seeding function
seedReports();
