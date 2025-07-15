import mongoose from 'mongoose';
import Team from '../src/models/Team';
import dotenv from 'dotenv';
dotenv.config();

async function listTeams() {
  await mongoose.connect(process.env.MONGO_URI!);
  const teams = await Team.find({ category: 'L2A MESSIEUR' });
  teams.forEach(team => {
    console.log(`Name: "${team.name}", Poule: "${team.poule || ''}"`);
  });
  process.exit(0);
}

listTeams(); 