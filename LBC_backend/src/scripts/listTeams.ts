import connectDB from '../config/db';
import Team from '../models/Team';

const run = async () => {
  await connectDB();
  const teams = await Team.find().select('name');
  for (const t of teams) {
    console.log(t.name);
  }
  process.exit(0);
};

run(); 