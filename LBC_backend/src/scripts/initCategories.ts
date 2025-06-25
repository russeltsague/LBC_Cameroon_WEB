import mongoose from 'mongoose';
import Category from '../models/Category';
import connectDB from '../config/db';
import dotenv from 'dotenv';

dotenv.config({ path: './LBC_backend02/.env' });

const defaultCategories = [
  {
    name: 'L1 MESSIEUR',
    description: 'Ligue 1 Messieurs - Division principale',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'L1 DAME',
    description: 'Ligue 1 Dames - Division principale',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'L2A MESSIEUR',
    description: 'Ligue 2A Messieurs - Division secondaire',
    hasPoules: true,
    poules: ['A', 'B'],
    isActive: true
  },
  {
    name: 'L2B MESSIEUR',
    description: 'Ligue 2B Messieurs - Division secondaire',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'U18 GARCONS',
    description: 'U18 Garçons - Catégorie jeunes',
    hasPoules: true,
    poules: ['A', 'B', 'C'],
    isActive: true
  },
  {
    name: 'U18 FILLES',
    description: 'U18 Filles - Catégorie jeunes',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'VETERANS',
    description: 'Vétérans - Catégorie senior',
    hasPoules: false,
    poules: [],
    isActive: true
  },
  {
    name: 'CORPORATES',
    description: 'Corporate - Compétition entreprise',
    hasPoules: false,
    poules: [],
    isActive: true
  }
];

const initCategories = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert default categories
    const categories = await Category.insertMany(defaultCategories);
    console.log(`Inserted ${categories.length} default categories`);

    console.log('Categories initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing categories:', error);
    process.exit(1);
  }
};

initCategories(); 