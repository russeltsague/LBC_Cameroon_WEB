const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Calendar = require('./dist/models/Calendar').default;
const Team = require('./dist/models/Team').default;

async function debugU18() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lbc_cameroon');
    console.log('Connected to MongoDB');

    // Get U18 GARCONS calendar
    const calendar = await Calendar.findOne({ category: 'U18 GARCONS' });
    if (!calendar) {
      console.log('No U18 GARCONS calendar found');
      return;
    }

    console.log('\n=== U18 GARCONS Calendar ===');
    console.log('Category:', calendar.category);
    console.log('Has Poulés:', calendar.hasPoules);
    console.log('Number of Poulés:', calendar.poules?.length || 0);

    // Get all teams in U18 GARCONS category
    const teams = await Team.find({ category: 'U18 GARCONS' });
    console.log('\n=== U18 GARCONS Teams ===');
    console.log('Number of teams:', teams.length);
    teams.forEach(team => {
      console.log(`- "${team.name}" (ID: ${team._id})`);
    });

    // Check matches with scores
    console.log('\n=== Matches with Scores ===');
    let scoredMatches = 0;
    calendar.poules?.forEach((poule, pIndex) => {
      console.log(`\nPoule ${pIndex + 1}: ${poule.name}`);
      poule.journées?.forEach((journee, jIndex) => {
        journee.matches?.forEach((match, mIndex) => {
          if (match.score && match.score !== '') {
            scoredMatches++;
            console.log(`  J${journee.n} Match ${mIndex + 1}: "${match.homeTeam}" vs "${match.awayTeam}" - ${match.score}`);
            
            // Check if teams exist in database
            const homeTeam = teams.find(t => t.name === match.homeTeam);
            const awayTeam = teams.find(t => t.name === match.awayTeam);
            
            console.log(`    Home team found: ${homeTeam ? 'YES' : 'NO - "' + match.homeTeam + '"'}`);
            console.log(`    Away team found: ${awayTeam ? 'YES' : 'NO - "' + match.awayTeam + '"'}`);
          }
        });
      });
    });

    console.log(`\nTotal matches with scores: ${scoredMatches}`);

    // Check current team stats
    console.log('\n=== Current Team Stats ===');
    teams.forEach(team => {
      const stats = team.classificationStats || {};
      console.log(`${team.name}: P=${stats.played || 0} W=${stats.wins || 0} L=${stats.losses || 0} D=${stats.draws || 0} PF=${stats.pointsFor || 0} PA=${stats.pointsAgainst || 0}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugU18();
