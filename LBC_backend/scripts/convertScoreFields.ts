import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Calendar } from '../src/models/Calendar';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27016/lbc-league';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const parseScoreString = (scoreString: string): { homeScore: number; awayScore: number } | null => {
  if (!scoreString || scoreString === 'N/A' || scoreString === '') {
    return null;
  }

  // Try to parse patterns like "63-21", "63 - 21", "63:21", etc.
  const patterns = [
    /^(\d+)\s*[-:]\s*(\d+)$/,  // 63-21, 63 - 21, 63:21
    /^(\d+)\s*\/\s*(\d+)$/,    // 63/21
    /^(\d+)\s*[aA]\s*(\d+)$/,  // 63a21 (some systems use 'a' for 'vs')
  ];

  for (const pattern of patterns) {
    const match = scoreString.trim().match(pattern);
    if (match) {
      const homeScore = parseInt(match[1], 10);
      const awayScore = parseInt(match[2], 10);
      
      if (!isNaN(homeScore) && !isNaN(awayScore)) {
        return { homeScore, awayScore };
      }
    }
  }

  // If no pattern matches, try to split by common delimiters
  const delimiters = ['-', ':', '/', 'a', 'A', 'vs', 'VS'];
  for (const delimiter of delimiters) {
    if (scoreString.includes(delimiter)) {
      const parts = scoreString.split(delimiter);
      if (parts.length === 2) {
        const homeScore = parseInt(parts[0].trim(), 10);
        const awayScore = parseInt(parts[1].trim(), 10);
        
        if (!isNaN(homeScore) && !isNaN(awayScore)) {
          return { homeScore, awayScore };
        }
      }
    }
  }

  return null;
};

const convertCalendarScores = async () => {
  try {
    console.log('Starting calendar score conversion...');
    
    // Find all calendars
    const calendars = await Calendar.find({});
    console.log(`Found ${calendars.length} calendars to process`);

    for (const calendar of calendars) {
      console.log(`\n=== Processing calendar: ${calendar.category} ===`);
      let updated = false;

      // Process matches from calendar poules
      if (calendar.poules) {
        for (const poule of calendar.poules) {
          console.log(`\n--- Processing poule: ${poule.name} ---`);
          
          for (const journee of poule.journées) {
            console.log(`  Processing journee: ${journee.n}, Matches count: ${journee.matches?.length || 0}`);
            
            for (const match of journee.matches) {
              console.log(`    Match: ${match.homeTeam} vs ${match.awayTeam}`);
              console.log(`      Old score field: "${(match as any).score}"`);
              
              // Check if match has the old score field (as string)
              if ((match as any).score && typeof (match as any).score === 'string') {
                const parsedScore = parseScoreString((match as any).score);
                
                if (parsedScore) {
                  // Update the match with separated scores
                  (match as any).homeScore = parsedScore.homeScore;
                  (match as any).awayScore = parsedScore.awayScore;
                  
                  console.log(`  Updated match: ${match.homeTeam} vs ${match.awayTeam} - ${(match as any).score} -> ${parsedScore.homeScore}-${parsedScore.awayScore}`);
                  updated = true;
                } else {
                  console.log(`  Could not parse score: ${(match as any).score} for match: ${match.homeTeam} vs ${match.awayTeam}`);
                }
                
                // Remove the old score field
                delete (match as any).score;
              }
            }
          }
        }
      }

      // Process playoffs
      if (calendar.playoffs) {
        for (const playoffRound of calendar.playoffs) {
          console.log(`\n--- Processing playoff round: ${playoffRound.name} ---`);
          
          for (const match of playoffRound.matches) {
            console.log(`    Playoff match: ${match.homeTeam} vs ${match.awayTeam}`);
            console.log(`      Old score field: "${(match as any).score}"`);
            
            // Same logic as above for playoff matches
            if ((match as any).score && typeof (match as any).score === 'string') {
              const parsedScore = parseScoreString((match as any).score);
              
              if (parsedScore) {
                (match as any).homeScore = parsedScore.homeScore;
                (match as any).awayScore = parsedScore.awayScore;
                
                console.log(`  Updated playoff match: ${match.homeTeam} vs ${match.awayTeam} - ${(match as any).score} -> ${parsedScore.homeScore}-${parsedScore.awayScore}`);
                updated = true;
              } else {
                console.log(`  Could not parse playoff score: ${(match as any).score} for match: ${match.homeTeam} vs ${match.awayTeam}`);
              }
              
              delete (match as any).score;
            }
          }
        }
      }

      // Save the calendar if it was updated
      if (updated) {
        await calendar.save();
        console.log(`  ✓ Saved updated calendar: ${calendar.category}`);
      } else {
        console.log(`  No updates needed for calendar: ${calendar.category}`);
      }
    }

    console.log('\nCalendar score conversion completed successfully!');
  } catch (error) {
    console.error('Error during calendar score conversion:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  
  try {
    await convertCalendarScores();
    console.log('Conversion completed successfully');
  } catch (error) {
    console.error('Conversion failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the conversion
if (require.main === module) {
  main().catch(console.error);
}

export { convertCalendarScores, parseScoreString };
