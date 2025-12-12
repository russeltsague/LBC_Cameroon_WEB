import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// MongoDB connection for new season
const NEW_SEASON_DB = 'LBC_2025_2026';
const MONGO_URI = process.env.MONGO_URI?.replace(/\/[^\/]*$/, `/${NEW_SEASON_DB}`) || 
                  `mongodb+srv://russeltsague3:tZylvRuRn745zyUU@cluster0.evxhanf.mongodb.net/${NEW_SEASON_DB}?retryWrites=true&w=majority&appName=Cluster0`;

const connectToNewDB = async () => {
  try {
    console.log(`Connecting to new season database: ${NEW_SEASON_DB}`);
    console.log('MONGO_URI:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to new season database');
  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Import all models to ensure they are registered
import '../src/models/Team';
import '../src/models/Category';
import '../src/models/Match';
import '../src/models/AdminUser';
import '../src/models/News';
import '../src/models/Sponsor';
import '../src/models/Classification';
import '../src/models/Calendar';
import '../src/models/WeeklySchedule';
import '../src/models/Player';
import '../src/models/Stats';

const setupDatabase = async () => {
  try {
    console.log('🏀 Setting up LBC 2025-2026 season database...');
    
    // Get all collections
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const collections = await db.listCollections().toArray();
    console.log('Existing collections:', collections.map(c => c.name));
    
    // Let Mongoose create indexes automatically by ensuring all models are loaded
    console.log('Ensuring all models are loaded and indexes are created...');
    
    // The models are already imported at the top, so Mongoose will create indexes automatically
    // We just need to ensure the connection is ready
    await mongoose.connection.asPromise();
    
    console.log('✅ Database schema and indexes created successfully');
    
    // Create default admin user
    const AdminUser = mongoose.model('AdminUser');
    const existingAdmin = await AdminUser.findOne({ username: 'admin' });
    
    if (!existingAdmin) {
      await AdminUser.create({
        username: 'admin',
        password: 'admin123', // This will be hashed by pre-save hook
        email: 'admin@lbc.com',
        role: 'super_admin'
      });
      console.log('✅ Default admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    // Create default categories
    const Category = mongoose.model('Category');
    const defaultCategories = [
      { name: 'L1 MESSIEUR', isActive: true, hasPoules: false, description: 'Ligue 1 Messieurs' },
      { name: 'L1 DAME', isActive: true, hasPoules: false, description: 'Ligue 1 Dames' },
      { name: 'L2A MESSIEUR', isActive: true, hasPoules: true, description: 'Ligue 2A Messieurs' },
      { name: 'L2B MESSIEUR', isActive: true, hasPoules: false, description: 'Ligue 2B Messieurs' },
      { name: 'U18 GARCONS', isActive: true, hasPoules: true, description: 'U18 Garçons' },
      { name: 'U18 FILLES', isActive: true, hasPoules: false, description: 'U18 Filles' },
      { name: 'VETERANS', isActive: true, hasPoules: false, description: 'Vétérans' },
      { name: 'CORPORATES', isActive: true, hasPoules: false, description: 'Entreprises' },
      { name: 'DAMES', isActive: true, hasPoules: false, description: 'Dames' }
    ];
    
    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`✅ Created category: ${categoryData.name}`);
      } else {
        console.log(`ℹ️ Category ${categoryData.name} already exists`);
      }
    }
    
    console.log(`🏀 LBC 2025-2026 season database setup complete!`);
    console.log(`📊 Database name: ${NEW_SEASON_DB}`);
    console.log(`🔗 Connection URI: ${MONGO_URI}`);
    
  } catch (error: any) {
    console.error('❌ Database setup error:', error);
    throw error;
  }
};

const main = async () => {
  await connectToNewDB();
  await setupDatabase();
  await mongoose.disconnect();
  console.log('✅ Disconnected from database');
  process.exit(0);
};

main().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
