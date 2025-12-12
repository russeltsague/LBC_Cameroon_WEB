import mongoose from 'mongoose';
import { Calendar } from '../src/models/Calendar';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27016/lbc-league';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugU18Calendar = async () => {
  try {
    console.log('Debugging U18 GARCONS calendar...');
    
    // Find U18 GARCONS calendar specifically
    const calendar = await Calendar.findOne({ category: 'U18 GARCONS' });
    
    if (!calendar) {
      console.log('U18 GARCONS calendar not found');
      return;
    }

    console.log(`\n=== U18 GARCONS Calendar Debug ===`);
    console.log(`Category: ${calendar.category}`);
    console.log(`Has poules: ${!!calendar.poules}`);
    console.log(`Poules count: ${calendar.poules?.length || 0}`);
    console.log(`Has playoffs: ${!!calendar.playoffs}`);
    console.log(`Playoffs count: ${calendar.playoffs?.length || 0}`);

    if (calendar.poules) {
      for (let i = 0; i < calendar.poules.length; i++) {
        const poule = calendar.poules[i];
        console.log(`\n--- Poule ${i + 1}: ${poule.name} ---`);
        console.log(`Teams: ${poule.teams?.join(', ')}`);
        console.log(`Journées count: ${poule.journées?.length || 0}`);
        
        if (poule.journées) {
          for (let j = 0; j < Math.min(3, poule.journées.length); j++) { // Show first 3 journées
            const journee = poule.journées[j];
            console.log(`  \n  Journee ${journee.n}:`);
            console.log(`  Matches count: ${journee.matches?.length || 0}`);
            
            if (journee.matches) {
              for (let m = 0; m < Math.min(3, journee.matches.length); m++) { // Show first 3 matches
                const match = journee.matches[m];
                console.log(`    Match ${m + 1}: ${match.homeTeam} vs ${match.awayTeam}`);
                console.log(`      Raw match object:`, JSON.stringify(match, null, 2));
                console.log(`      homeScore: ${match.homeScore} (type: ${typeof match.homeScore})`);
                console.log(`      awayScore: ${match.awayScore} (type: ${typeof match.awayScore})`);
                console.log(`      score field: ${(match as any).score} (type: ${typeof (match as any).score})`);
                console.log(`      venue: ${match.venue}`);
                console.log(`      date: ${match.date}`);
                console.log(`      time: ${match.time}`);
              }
              
              if (journee.matches.length > 3) {
                console.log(`    ... and ${journee.matches.length - 3} more matches`);
              }
            }
          }
          
          if (poule.journées.length > 3) {
            console.log(`  ... and ${poule.journées.length - 3} more journées`);
          }
        }
      }
    }

    if (calendar.playoffs) {
      console.log(`\n--- Playoffs ---`);
      for (let i = 0; i < calendar.playoffs.length; i++) {
        const playoff = calendar.playoffs[i];
        console.log(`Playoff ${i + 1}: ${playoff.name}`);
        console.log(`Matches count: ${playoff.matches?.length || 0}`);
        
        if (playoff.matches) {
          for (let m = 0; m < Math.min(2, playoff.matches.length); m++) {
            const match = playoff.matches[m];
            console.log(`  Match ${m + 1}: ${match.homeTeam} vs ${match.awayTeam}`);
            console.log(`    homeScore: ${match.homeScore}, awayScore: ${match.awayScore}`);
            console.log(`    score field: ${(match as any).score}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error debugging U18 calendar:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  
  try {
    await debugU18Calendar();
    console.log('\nDebug completed successfully');
  } catch (error) {
    console.error('Debug failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the debug
if (require.main === module) {
  main().catch(console.error);
}

export { debugU18Calendar };
