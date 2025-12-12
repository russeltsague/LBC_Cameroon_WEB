const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Calendar = require('./dist/models/Calendar').default;

async function migrateScores() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lbc_cameroon');
    console.log('Connected to MongoDB');

    // Get all calendars
    const calendars = await Calendar.find({});
    console.log(`Found ${calendars.length} calendars to update`);

    let totalUpdated = 0;

    for (const calendar of calendars) {
      console.log(`\nProcessing calendar: ${calendar.category}`);
      let calendarUpdated = false;

      // Process poules
      if (calendar.poules) {
        for (let pIndex = 0; pIndex < calendar.poules.length; pIndex++) {
          const poule = calendar.poules[pIndex];
          
          if (poule.journées) {
            for (let jIndex = 0; jIndex < poule.journées.length; jIndex++) {
              const journee = poule.journées[jIndex];
              
              if (journee.matches) {
                for (let mIndex = 0; mIndex < journee.matches.length; mIndex++) {
                  const match = journee.matches[mIndex];
                  
                  // Convert score string to separate fields if needed
                  if (match.score && match.score !== '' && !match.homeScore && !match.awayScore) {
                    const scoreParts = match.score.split('-');
                    if (scoreParts.length === 2) {
                      const homeScore = parseInt(scoreParts[0]) || undefined;
                      const awayScore = parseInt(scoreParts[1]) || undefined;
                      
                      // Update the match
                      calendar.poules[pIndex].journées[jIndex].matches[mIndex].homeScore = homeScore;
                      calendar.poules[pIndex].journées[jIndex].matches[mIndex].awayScore = awayScore;
                      
                      console.log(`  Updated: ${match.homeTeam} vs ${match.awayTeam} - ${match.score} -> homeScore: ${homeScore}, awayScore: ${awayScore}`);
                      calendarUpdated = true;
                    }
                  } else if (match.homeScore !== undefined || match.awayScore !== undefined) {
                    console.log(`  Already has separate scores: ${match.homeTeam} vs ${match.awayTeam} - ${match.homeScore}-${match.awayScore}`);
                  } else {
                    console.log(`  No scores: ${match.homeTeam} vs ${match.awayTeam}`);
                  }
                }
              }
            }
          }
        }
      }

      // Process playoffs
      if (calendar.playoffs) {
        for (let pIndex = 0; pIndex < calendar.playoffs.length; pIndex++) {
          const playoff = calendar.playoffs[pIndex];
          
          if (playoff.matches) {
            for (let mIndex = 0; mIndex < playoff.matches.length; mIndex++) {
              const match = playoff.matches[mIndex];
              
              // Convert score string to separate fields if needed
              if (match.score && match.score !== '' && !match.homeScore && !match.awayScore) {
                const scoreParts = match.score.split('-');
                if (scoreParts.length === 2) {
                  const homeScore = parseInt(scoreParts[0]) || undefined;
                  const awayScore = parseInt(scoreParts[1]) || undefined;
                  
                  // Update the match
                  calendar.playoffs[pIndex].matches[mIndex].homeScore = homeScore;
                  calendar.playoffs[pIndex].matches[mIndex].awayScore = awayScore;
                  
                  console.log(`  Updated playoff: ${match.homeTeam} vs ${match.awayTeam} - ${match.score} -> homeScore: ${homeScore}, awayScore: ${awayScore}`);
                  calendarUpdated = true;
                }
              } else if (match.homeScore !== undefined || match.awayScore !== undefined) {
                console.log(`  Playoff already has separate scores: ${match.homeTeam} vs ${match.awayTeam} - ${match.homeScore}-${match.awayScore}`);
              } else {
                console.log(`  Playoff no scores: ${match.homeTeam} vs ${match.awayTeam}`);
              }
            }
          }
        }
      }

      // Save the calendar if it was updated
      if (calendarUpdated) {
        await calendar.save();
        console.log(`  ✓ Calendar ${calendar.category} updated`);
        totalUpdated++;
      } else {
        console.log(`  - Calendar ${calendar.category} already up to date`);
      }
    }

    console.log(`\n=== Migration Complete ===`);
    console.log(`Total calendars updated: ${totalUpdated}`);

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateScores();
