import mongoose from 'mongoose';
import News from '../models/News';
import Sponsor from '../models/Sponsor';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lbc_league';

const sampleNews = [
  {
    title: 'Ouverture de la Saison 2024-2025',
    content: `La Ligue de Basket du Cameroun est fière d'annoncer l'ouverture officielle de la saison 2024-2025. Cette nouvelle saison promet d'être passionnante avec de nombreuses équipes talentueuses qui s'affronteront pour remporter le titre de champion.

Les équipes ont été préparées tout l'été et sont prêtes à donner le meilleur d'elles-mêmes. Les fans peuvent s'attendre à des matchs de haute qualité avec des joueurs talentueux qui feront tout pour faire gagner leur équipe.

Le calendrier des matchs sera bientôt disponible et nous encourageons tous les fans à venir soutenir leurs équipes favorites.`,
    summary: 'La LBC annonce l\'ouverture officielle de la saison 2024-2025 avec de nombreuses équipes talentueuses.',
    author: 'Équipe LBC',
    category: 'League News',
    tags: ['Saison 2024-2025', 'Ouverture', 'LBC'],
    isPublished: true,
    publishedAt: new Date()
  },
  {
    title: 'Nouveau Sponsor Principal : Orange Cameroun',
    content: `Nous sommes ravis d'annoncer qu'Orange Cameroun devient notre sponsor principal pour la saison 2024-2025. Cette collaboration marque un nouveau chapitre dans l'histoire de la Ligue de Basket du Cameroun.

Orange Cameroun apporte son soutien financier et technologique à notre ligue, ce qui nous permettra d'améliorer l'expérience des joueurs et des fans. Cette partnership nous aidera à développer le basketball au Cameroun et à promouvoir le sport auprès de la jeunesse.

Nous remercions Orange Cameroun pour sa confiance et nous nous réjouissons de cette collaboration qui bénéficiera à toute la communauté du basketball camerounais.`,
    summary: 'Orange Cameroun devient le sponsor principal de la LBC pour la saison 2024-2025.',
    author: 'Équipe LBC',
    category: 'League News',
    tags: ['Sponsor', 'Orange Cameroun', 'Partnership'],
    isPublished: true,
    publishedAt: new Date()
  },
  {
    title: 'Interview : Le Coach de l\'Équipe Championne',
    content: `Nous avons rencontré le coach de l'équipe championne de la saison dernière pour discuter de ses stratégies et de ses objectifs pour cette nouvelle saison.

"La clé du succès, c'est le travail d'équipe et la préparation mentale", nous confie-t-il. "Nous avons une équipe soudée qui sait se donner à 100% sur le terrain. Cette saison, notre objectif est de défendre notre titre et de continuer à progresser."

Le coach souligne également l'importance du soutien des fans et de la communauté. "Les encouragements de nos supporters nous donnent une force supplémentaire sur le terrain."`,
    summary: 'Interview exclusive avec le coach de l\'équipe championne sur ses stratégies pour la nouvelle saison.',
    author: 'Journaliste LBC',
    category: 'Player Spotlight',
    tags: ['Interview', 'Coach', 'Champion'],
    isPublished: true,
    publishedAt: new Date()
  },
  {
    title: 'Résultats de la Première Semaine',
    content: `La première semaine de compétition s'est terminée avec des résultats surprenants et des performances exceptionnelles. Voici un résumé des matchs les plus marquants :

- Match 1 : Équipe A vs Équipe B (78-72)
- Match 2 : Équipe C vs Équipe D (85-79)
- Match 3 : Équipe E vs Équipe F (91-88)

Les joueurs ont montré un excellent niveau de jeu et les fans ont été ravis par la qualité des matchs. La saison s'annonce passionnante avec des équipes très compétitives.`,
    summary: 'Résumé des matchs de la première semaine avec des performances exceptionnelles.',
    author: 'Équipe LBC',
    category: 'Match Report',
    tags: ['Résultats', 'Première Semaine', 'Matchs'],
    isPublished: true,
    publishedAt: new Date()
  }
];

const sampleSponsors = [
  {
    name: 'Orange Cameroun',
    description: 'Opérateur télécoms leader au Cameroun, Orange soutient le développement du basketball local.',
    logoUrl: 'https://via.placeholder.com/200x100/FF6600/FFFFFF?text=Orange',
    websiteUrl: 'https://www.orange.cm',
    contactEmail: 'contact@orange.cm',
    contactPhone: '+237 233 33 33 33',
    sponsorshipLevel: 'Platinum',
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31')
  },
  {
    name: 'MTN Cameroun',
    description: 'MTN Cameroun, partenaire technologique de la LBC pour la digitalisation du basketball.',
    logoUrl: 'https://via.placeholder.com/200x100/FFCC00/000000?text=MTN',
    websiteUrl: 'https://www.mtn.cm',
    contactEmail: 'sponsorship@mtn.cm',
    contactPhone: '+237 233 44 44 44',
    sponsorshipLevel: 'Gold',
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-06-30')
  },
  {
    name: 'Canal+ Cameroun',
    description: 'Canal+ Cameroun, diffuseur officiel des matchs de la Ligue de Basket du Cameroun.',
    logoUrl: 'https://via.placeholder.com/200x100/FF0000/FFFFFF?text=Canal+',
    websiteUrl: 'https://www.canalplus.cm',
    contactEmail: 'sport@canalplus.cm',
    contactPhone: '+237 233 55 55 55',
    sponsorshipLevel: 'Gold',
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31')
  },
  {
    name: 'Brasseries du Cameroun',
    description: 'Brasseries du Cameroun, partenaire officiel des boissons de la LBC.',
    logoUrl: 'https://via.placeholder.com/200x100/0066CC/FFFFFF?text=Brasseries',
    websiteUrl: 'https://www.brasseries.cm',
    contactEmail: 'marketing@brasseries.cm',
    contactPhone: '+237 233 66 66 66',
    sponsorshipLevel: 'Silver',
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31')
  },
  {
    name: 'Ecobank Cameroun',
    description: 'Ecobank Cameroun, partenaire financier officiel de la Ligue de Basket du Cameroun.',
    logoUrl: 'https://via.placeholder.com/200x100/00A651/FFFFFF?text=Ecobank',
    websiteUrl: 'https://www.ecobank.cm',
    contactEmail: 'corporate@ecobank.cm',
    contactPhone: '+237 233 77 77 77',
    sponsorshipLevel: 'Silver',
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31')
  },
  {
    name: 'Dangote Cement',
    description: 'Dangote Cement, partenaire de construction et d\'infrastructure pour la LBC.',
    logoUrl: 'https://via.placeholder.com/200x100/666666/FFFFFF?text=Dangote',
    websiteUrl: 'https://www.dangote.com',
    contactEmail: 'cameroon@dangote.com',
    contactPhone: '+237 233 88 88 88',
    sponsorshipLevel: 'Bronze',
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31')
  }
];

async function initializeNewsAndSponsors() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing news and sponsors...');
    await News.deleteMany({});
    await Sponsor.deleteMany({});

    // Insert sample news
    console.log('Inserting sample news...');
    const createdNews = await News.insertMany(sampleNews);
    console.log(`Created ${createdNews.length} news articles`);

    // Insert sample sponsors
    console.log('Inserting sample sponsors...');
    const createdSponsors = await Sponsor.insertMany(sampleSponsors);
    console.log(`Created ${createdSponsors.length} sponsors`);

    console.log('News and Sponsors initialization completed successfully!');
    
    // Display created data
    console.log('\nCreated News:');
    createdNews.forEach(news => {
      console.log(`- ${news.title} (${news.category})`);
    });

    console.log('\nCreated Sponsors:');
    createdSponsors.forEach(sponsor => {
      console.log(`- ${sponsor.name} (${sponsor.sponsorshipLevel})`);
    });

  } catch (error) {
    console.error('Error initializing news and sponsors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the initialization
if (require.main === module) {
  initializeNewsAndSponsors();
}

export default initializeNewsAndSponsors; 