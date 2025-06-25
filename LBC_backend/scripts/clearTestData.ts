import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models with correct syntax
import { Match } from '../src/models/Match';
import Team from '../src/models/Team';
import Classification from '../src/models/Classification';
import Category from '../src/models/Category';
import News from '../src/models/News';
import Sponsor from '../src/models/Sponsor';
import Player from '../src/models/Player';
import Stats from '../src/models/Stats';

async function clearTestData() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    console.log('\n🗑️  Clearing test data...');

    // Clear matches
    const matchResult = await Match.deleteMany({});
    console.log(`✅ Cleared ${matchResult.deletedCount} matches`);

    // Clear teams
    const teamResult = await Team.deleteMany({});
    console.log(`✅ Cleared ${teamResult.deletedCount} teams`);

    // Clear classifications
    const classificationResult = await Classification.deleteMany({});
    console.log(`✅ Cleared ${classificationResult.deletedCount} classifications`);

    // Clear stats
    const statsResult = await Stats.deleteMany({});
    console.log(`✅ Cleared ${statsResult.deletedCount} stats`);

    // Clear news
    const newsResult = await News.deleteMany({});
    console.log(`✅ Cleared ${newsResult.deletedCount} news articles`);

    // Clear sponsors
    const sponsorResult = await Sponsor.deleteMany({});
    console.log(`✅ Cleared ${sponsorResult.deletedCount} sponsors`);

    // Clear players
    const playerResult = await Player.deleteMany({});
    console.log(`✅ Cleared ${playerResult.deletedCount} players`);

    // Note: We'll keep categories as they define the structure
    console.log('ℹ️  Categories preserved (they define the league structure)');

    console.log('\n🎉 All test data cleared successfully!');
    console.log('📝 You can now start adding real data to your application.');

  } catch (error) {
    console.error('❌ Error clearing test data:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
clearTestData(); 