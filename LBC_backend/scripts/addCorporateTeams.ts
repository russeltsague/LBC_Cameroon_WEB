import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from '../src/models/Team';

dotenv.config();

const corporateTeams = [
  { name: 'MINDCAF', category: 'CORPORATES', city: 'Yaounde', founded: 2020, arena: '.......', coach: '.......', about: '.......' },
  { name: 'MINFI', category: 'CORPORATES', city: 'Yaounde', founded: 2020, arena: '.......', coach: '.......', about: '.......' },
  { name: 'AFRILAND', category: 'CORPORATES', city: 'Yaounde', founded: 2020, arena: '.......', coach: '.......', about: '.......' },
  { name: 'BICEC', category: 'CORPORATES', city: 'Yaounde', founded: 2020, arena: '.......', coach: '.......', about: '.......' }
];

async function addCorporateTeams() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lbc');
    console.log('Connected to MongoDB');

    // Clear existing CORPORATES teams
    await Team.deleteMany({ category: 'CORPORATES' });
    console.log('Cleared existing CORPORATES teams');

    // Add new CORPORATES teams
    const createdTeams = await Team.insertMany(corporateTeams);
    console.log(`Successfully added ${createdTeams.length} CORPORATES teams`);

    console.log('\nCORPORATES teams added:');
    createdTeams.forEach(team => {
      console.log(`  - ${team.name}`);
    });

    console.log('\nCORPORATES teams added successfully!');
  } catch (error) {
    console.error('Error adding CORPORATES teams:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addCorporateTeams();
