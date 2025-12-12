import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Calendar } from '../src/models/Calendar';

// Load environment variables
dotenv.config();

/**
 * Migration script to convert old score format to separate homeScore/awayScore fields
 * This script processes Calendar documents that may have scores stored in the old "score" field
 * and converts them to the new homeScore/awayScore structure
 */

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

  // Try to parse patterns like "80-75", "80 - 75", "80:75", etc.
  const patterns = [
    /^(\d+)\s*[-:]\s*(\d+)$/,  // 80-75, 80 - 75, 80:75
    /^(\d+)\s*\/\s*(\d+)$/,    // 80/75
    /^(\d+)\s*[aA]\s*(\d+)$/,  // 80a75 (some systems use 'a' for 'vs')
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

const migrateCalendarScores = async () => {
  try {
    console.log('Starting calendar score migration...');
    
    // Find all calendars
    const calendars = await Calendar.find({});
    console.log(`Found ${calendars.length} calendars to process`);

    for (const calendar of calendars) {
      console.log(`\n=== Processing calendar: ${calendar.category} ===`);
      console.log(`Has poules: ${!!calendar.poules}, Poules count: ${calendar.poules?.length || 0}`);
      console.log(`Has playoffs: ${!!calendar.playoffs}, Playoffs count: ${calendar.playoffs?.length || 0}`);
      let updated = false;

      // Process matches from calendar poules
      if (calendar.poules) {
        for (const poule of calendar.poules) {
          console.log(`\n--- Processing poule: ${poule.name} ---`);
          console.log(`Journées count: ${poule.journées?.length || 0}`);
          
          for (const journee of poule.journées) {
            console.log(`  Processing journee: ${journee.n}, Matches count: ${journee.matches?.length || 0}`);
            
            for (const match of journee.matches) {
              console.log(`    Match: ${match.homeTeam} vs ${match.awayTeam}`);
              console.log(`      Old score field: "${(match as any).score}"`);
              console.log(`      Current homeScore: ${match.homeScore}, awayScore: ${match.awayScore}`);
              console.log(`      Score types: homeScore(${typeof match.homeScore}), awayScore(${typeof match.awayScore})`);
              
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
              // Also check if homeScore/awayScore exist but are strings
              else if (typeof match.homeScore === 'string' || typeof match.awayScore === 'string') {
                const homeScoreNum = Number(match.homeScore);
                const awayScoreNum = Number(match.awayScore);
                
                if (typeof homeScoreNum === 'number' && typeof awayScoreNum === 'number' && !isNaN(homeScoreNum) && !isNaN(awayScoreNum)) {
                  (match as any).homeScore = homeScoreNum;
                  (match as any).awayScore = awayScoreNum;
                  
                  console.log(`  Converted string scores: ${match.homeTeam} vs ${match.awayTeam} -> ${homeScoreNum}-${awayScoreNum}`);
                  updated = true;
                }
              }
              // Handle case where scores are missing but match should have them (completed matches)
              else if ((!match.homeScore && !match.awayScore) || (match.homeScore === undefined && match.awayScore === undefined)) {
                console.log(`  No scores found for match: ${match.homeTeam} vs ${match.awayTeam}`);
              }
            }
          }
        }
      }

      // Process playoffs
      if (calendar.playoffs) {
        for (const playoffRound of calendar.playoffs) {
          console.log(`\n--- Processing playoff round: ${playoffRound.name} ---`);
          console.log(`Matches count: ${playoffRound.matches?.length || 0}`);
          
          for (const match of playoffRound.matches) {
            console.log(`    Playoff match: ${match.homeTeam} vs ${match.awayTeam}`);
            console.log(`      Old score field: "${(match as any).score}"`);
            console.log(`      Current homeScore: ${match.homeScore}, awayScore: ${match.awayScore}`);
            console.log(`      Score types: homeScore(${typeof match.homeScore}), awayScore(${typeof match.awayScore})`);
            
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
            // Also check if homeScore/awayScore exist but are strings in playoffs
            else if (typeof match.homeScore === 'string' || typeof match.awayScore === 'string') {
              const homeScoreNum = Number(match.homeScore);
              const awayScoreNum = Number(match.awayScore);
              
              if (typeof homeScoreNum === 'number' && typeof awayScoreNum === 'number' && !isNaN(homeScoreNum) && !isNaN(awayScoreNum)) {
                (match as any).homeScore = homeScoreNum;
                (match as any).awayScore = awayScoreNum;
                
                console.log(`  Converted playoff string scores: ${match.homeTeam} vs ${match.awayTeam} -> ${homeScoreNum}-${awayScoreNum}`);
                updated = true;
              }
            }
            // Handle case where playoff scores are missing
            else if ((!match.homeScore && !match.awayScore) || (match.homeScore === undefined && match.awayScore === undefined)) {
              console.log(`  No playoff scores found for match: ${match.homeTeam} vs ${match.awayTeam}`);
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

    console.log('\nCalendar score migration completed successfully!');
  } catch (error) {
    console.error('Error during calendar score migration:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  
  try {
    await migrateCalendarScores();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
if (require.main === module) {
  main().catch(console.error);
}

export { migrateCalendarScores, parseScoreString };
