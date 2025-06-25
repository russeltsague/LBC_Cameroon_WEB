import connectDB from '../config/db';
import { Match } from '../models/Match';

const matchDates = [
  '2025-04-13', '2025-04-18', '2025-04-26', '2025-05-10', '2025-05-11', '2025-05-17', '2025-05-18',
  '2025-05-24', '2025-05-25', '2025-05-30', '2025-06-01', '2025-06-07', '2025-06-08', '2025-06-14', '2025-06-15'
];

const run = async () => {
  await connectDB();
  const result = await Match.deleteMany({
    date: { $in: matchDates.map(d => new Date(d)) }
  });
  console.log(`Deleted ${result.deletedCount} matches for dates:`, matchDates);
  process.exit(0);
};

run(); 