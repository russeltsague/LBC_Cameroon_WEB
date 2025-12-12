import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../src/models/Category';

dotenv.config();

const categories = [
  {
    name: 'L1 MESSIEUR',
    description: 'Ligue 1 Messieurs - Top tier men\'s basketball',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'L1 DAME',
    description: 'Ligue 1 Dames - Top tier women\'s basketball',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'L2A MESSIEUR',
    description: 'Ligue 2A Messieurs - Second tier men\'s basketball',
    hasPoules: true,
    poules: ['A', 'B'],
    isActive: true
  },
  {
    name: 'L2B MESSIEUR',
    description: 'Ligue 2B Messieurs - Second tier men\'s basketball',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'U18 GARCONS',
    description: 'Under 18 Boys - Youth basketball',
    hasPoules: true,
    poules: ['A', 'B', 'C'],
    isActive: true
  },
  {
    name: 'U18 FILLES',
    description: 'Under 18 Girls - Youth basketball',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'VETERANT',
    description: 'Veterans - Senior basketball',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'CORPO',
    description: 'Corporate - Corporate basketball league',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'DAMES',
    description: 'Dames - Women\'s basketball',
    hasPoules: false,
    poules: [],
    isActive: true
  }
];

async function seedCategories() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lbc';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const result = await Category.insertMany(categories);
    console.log(`Successfully seeded ${result.length} categories`);

    // Display seeded categories
    console.log('\nSeeded categories:');
    result.forEach(cat => {
      console.log(`- ${cat.name} (hasPoules: ${cat.hasPoules}, poules: ${cat.poules.join(', ') || 'none'})`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
