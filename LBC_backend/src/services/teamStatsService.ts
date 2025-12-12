import { Calendar } from '../models/Calendar';
import Team, { ITeam } from '../models/Team';
import mongoose from 'mongoose';

export interface MatchResult {
  opponent: string;
  isHome: boolean;
  pointsFor: number;
  pointsAgainst: number;
  result: 'W' | 'D' | 'L' | 'F';
  date: Date;
}

export interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  forfeits: number;
  points: number;
  pointsFor: number;
  pointsAgainst: number;
  goalDifference: number;
  last5: MatchResult[];
}

/**
 * Update team statistics from calendar data
 */
export const updateTeamStatsFromCalendar = async (category: string): Promise<void> => {
  try {
    console.log(`Updating team stats for category: ${category}`);
    
    // Get calendar for the category
    const calendar = await Calendar.findOne({ category });
    if (!calendar) {
      console.log(`No calendar found for category: ${category}`);
      throw new Error(`No calendar found for category: ${category}`);
    }

    console.log(`Found calendar for category: ${category}`);
    console.log(`Calendar has ${calendar.poules?.length || 0} poules`);

    // Get all teams in this category
    const teams = await Team.find({ category });
    console.log(`Found ${teams.length} teams in category: ${category}`);
    teams.forEach(team => console.log(`  - ${team.name}`));

    // Reset all team stats
    console.log('Resetting all team stats...');
    await Team.updateMany(
      { category },
      {
        $set: {
          'classificationStats.played': 0,
          'classificationStats.wins': 0,
          'classificationStats.draws': 0,
          'classificationStats.losses': 0,
          'classificationStats.forfeits': 0,
          'classificationStats.points': 0,
          'classificationStats.pointsFor': 0,
          'classificationStats.pointsAgainst': 0,
          'classificationStats.goalDifference': 0,
          'classificationStats.last5': []
        }
      }
    );

    // Process matches from calendar poules
    if (calendar.poules) {
      for (const poule of calendar.poules) {
        console.log(`Processing poule: ${poule.name}`);
        
        for (const journee of poule.journées) {
          console.log(`Processing journee: ${journee.n}`);
          
          for (const match of journee.matches) {
            console.log(`Found match: ${match.homeTeam} vs ${match.awayTeam} - Score: ${match.homeScore || 'N/A'}-${match.awayScore || 'N/A'}`);
            
            await processMatch(match);
          }
        }
      }
    }

    console.log(`Team stats updated for category: ${category}`);
  } catch (error) {
    console.error('Error updating team stats from calendar:', error);
    throw error;
  }
};

/**
 * Process a single match and update team statistics
 */
const processMatch = async (match: any): Promise<void> => {
  const homeTeamName = match.homeTeam;
  const awayTeamName = match.awayTeam;
  
  // Find teams
  const homeTeam = await Team.findOne({ name: homeTeamName });
  const awayTeam = await Team.findOne({ name: awayTeamName });
  
  if (!homeTeam || !awayTeam) {
    console.log(`Team not found - Home: ${!homeTeam ? homeTeamName : 'FOUND'}, Away: ${!awayTeam ? awayTeamName : 'FOUND'}`);
    return;
  }

  // Check if match has scores - skip if not
  if (match.homeScore === undefined || match.awayScore === undefined || 
      match.homeScore === null || match.awayScore === null ||
      match.homeScore === 'N/A' || match.awayScore === 'N/A' ||
      isNaN(Number(match.homeScore)) || isNaN(Number(match.awayScore))) {
    console.log(`Skipping match without valid scores: ${homeTeamName} vs ${awayTeamName} (${match.homeScore}-${match.awayScore})`);
    return;
  }

  const homeScoreNum = Number(match.homeScore);
  const awayScoreNum = Number(match.awayScore);
  
  console.log(`Processing match: ${homeTeamName} (${homeScoreNum}) vs ${awayTeamName} (${awayScoreNum})`);

  // Determine if it's a forfeit match (common basketball forfeit patterns)
  const isForfeit = (homeScoreNum === 20 && awayScoreNum === 0) || 
                   (homeScoreNum === 0 && awayScoreNum === 20) ||
                   (homeScoreNum >= 40 && awayScoreNum === 0) ||  // High margin with zero points
                   (homeScoreNum === 0 && awayScoreNum >= 40);   // High margin with zero points

  // Calculate results
  let homeResult: 'W' | 'D' | 'L' | 'F';
  let awayResult: 'W' | 'D' | 'L' | 'F';
  let homePoints: number;
  let awayPoints: number;

  if (isForfeit) {
    console.log(`FORFEIT DETECTED: ${homeTeamName} (${homeScoreNum}) vs ${awayTeamName} (${awayScoreNum})`);
  }

  if (homeScoreNum > awayScoreNum) {
    homeResult = 'W';
    awayResult = isForfeit ? 'F' : 'L';
    homePoints = 2;
    awayPoints = isForfeit ? 0 : 1;
  } else if (homeScoreNum < awayScoreNum) {
    homeResult = isForfeit ? 'F' : 'L';
    awayResult = 'W';
    homePoints = isForfeit ? 0 : 1;
    awayPoints = 2;
  } else {
    // Draw (rare in basketball)
    homeResult = 'D';
    awayResult = 'D';
    homePoints = 1;
    awayPoints = 1;
  }

  console.log(`Results: Home ${homeResult} (${homePoints}pts), Away ${awayResult} (${awayPoints}pts)`);

  // Update home team stats
  await updateTeamMatchStats(homeTeam, {
    opponent: awayTeamName,
    isHome: true,
    pointsFor: homeScoreNum,
    pointsAgainst: awayScoreNum,
    result: homeResult,
    date: new Date()
  }, homePoints);

  // Update away team stats
  await updateTeamMatchStats(awayTeam, {
    opponent: homeTeamName,
    isHome: false,
    pointsFor: awayScoreNum,
    pointsAgainst: homeScoreNum,
    result: awayResult,
    date: new Date()
  }, awayPoints);
};

/**
 * Update a single team's statistics for one match
 */
const updateTeamMatchStats = async (
  team: ITeam, 
  matchResult: MatchResult, 
  points: number
): Promise<void> => {
  const updates: any = {
    $inc: {
      'classificationStats.played': 1,
      'classificationStats.pointsFor': matchResult.pointsFor,
      'classificationStats.pointsAgainst': matchResult.pointsAgainst,
      'classificationStats.points': points
    },
    $push: {
      'classificationStats.last5': {
        $each: [matchResult],
        $position: 0,
        $slice: 5 // Keep only last 5
      }
    }
  };

  // Update specific result counters
  switch (matchResult.result) {
    case 'W':
      updates.$inc['classificationStats.wins'] = 1;
      break;
    case 'D':
      updates.$inc['classificationStats.draws'] = 1;
      break;
    case 'L':
      updates.$inc['classificationStats.losses'] = 1;
      break;
    case 'F':
      updates.$inc['classificationStats.losses'] = 1;
      updates.$inc['classificationStats.forfeits'] = 1;
      break;
  }

  await Team.updateOne({ _id: team._id }, updates);

  // Update goal difference
  await Team.updateOne(
    { _id: team._id },
    [
      {
        $set: {
          'classificationStats.goalDifference': {
            $subtract: [
              '$classificationStats.pointsFor',
              '$classificationStats.pointsAgainst'
            ]
          }
        }
      }
    ]
  );
};

/**
 * Get team classification data from team statistics
 */
export const getTeamClassification = async (category: string, poule?: string): Promise<any[]> => {
  const query: any = { category };
  if (poule) {
    query.poule = poule;
  }

  const teams = await Team.find(query)
    .select('name logo classificationStats')
    .sort({ 'classificationStats.points': -1, 'classificationStats.goalDifference': -1, 'classificationStats.pointsFor': -1 });

  return teams.map((team, index) => ({
    _id: team._id,
    team: {
      _id: team._id,
      name: team.name,
      logo: team.logo
    },
    position: index + 1,
    played: team.classificationStats.played,
    wins: team.classificationStats.wins,
    draws: team.classificationStats.draws,
    losses: team.classificationStats.losses,
    pointsFor: team.classificationStats.pointsFor,
    pointsAgainst: team.classificationStats.pointsAgainst,
    pointsDifference: team.classificationStats.goalDifference,
    points: team.classificationStats.points,
    recentResults: team.classificationStats.last5.map(match => match.result),
    category: category
  }));
};
