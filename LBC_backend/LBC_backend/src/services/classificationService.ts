import Classification from '../models/Classification';
import Match from '../models/Match';
import Team from '../models/Team';

// FIBA classification rules:
// 1. Points (2 for win, 1 for loss, 0 for forfeit)
// 2. Head-to-head results
// 3. Goal difference
// 4. Goals scored
export const updateClassification = async (matchId: string) => {
  try {
    const match = await Match.findById(matchId).populate('homeTeam awayTeam');
    if (!match || match.status !== 'completed') return;

    const category = match.category;
    
    // Get or create classification entries for both teams
    const homeClassification = await Classification.findOneAndUpdate(
      { team: match.homeTeam, category },
      { $setOnInsert: { 
        team: match.homeTeam, 
        category,
        played: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        points: 0,
        position: 0 // Set temporary position
      }},
      { upsert: true, new: true }
    );
    
    const awayClassification = await Classification.findOneAndUpdate(
      { team: match.awayTeam, category },
      { $setOnInsert: { 
        team: match.awayTeam, 
        category,
        played: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        points: 0,
        position: 0 // Set temporary position
      }},
      { upsert: true, new: true }
    );

    // Update match statistics
    if (match.homeScore !== undefined && match.awayScore !== undefined) {
      // Home team update
      homeClassification.played += 1;
      homeClassification.pointsFor += match.homeScore;
      homeClassification.pointsAgainst += match.awayScore;
      homeClassification.pointsDifference = homeClassification.pointsFor - homeClassification.pointsAgainst;
      
      // Away team update
      awayClassification.played += 1;
      awayClassification.pointsFor += match.awayScore;
      awayClassification.pointsAgainst += match.homeScore;
      awayClassification.pointsDifference = awayClassification.pointsFor - awayClassification.pointsAgainst;
      
      // Handle forfeits
      if (match.forfeit === 'home') {
        // Home team forfeits
        homeClassification.losses += 1;
        homeClassification.points += 0; // No points for forfeit
        awayClassification.wins += 1;
        awayClassification.points += 2;
      } else if (match.forfeit === 'away') {
        // Away team forfeits
        homeClassification.wins += 1;
        homeClassification.points += 2;
        awayClassification.losses += 1;
        awayClassification.points += 0; // No points for forfeit
      } else {
        // Normal match result
        if (match.homeScore > match.awayScore) {
          homeClassification.wins += 1;
          homeClassification.points += 2;
          awayClassification.losses += 1;
          awayClassification.points += 1;
        } else {
          homeClassification.losses += 1;
          homeClassification.points += 1;
          awayClassification.wins += 1;
          awayClassification.points += 2;
        }
      }
    }

    // Ensure position is set before saving
    if (typeof homeClassification.position !== 'number') homeClassification.position = 0;
    if (typeof awayClassification.position !== 'number') awayClassification.position = 0;
    await homeClassification.save();
    await awayClassification.save();

    // Update positions based on FIBA rules
    await calculatePositions(category);
    
  } catch (error) {
    console.error('Error updating classification:', error);
  }
};

const calculatePositions = async (category: string) => {
  const classifications = await Classification.find({ category })
    .populate('team')
    .sort({
      points: -1, // Points descending
      pointsDifference: -1, // Goal difference descending
      pointsFor: -1 // Goals scored descending
    });

  // Update positions
  for (let i = 0; i < classifications.length; i++) {
    classifications[i].position = i + 1;
    await classifications[i].save();
  }
};