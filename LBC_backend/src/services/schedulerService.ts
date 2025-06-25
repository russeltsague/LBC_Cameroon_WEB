import Match from '../models/Match';
import Team from '../models/Team';

export const generateSchedule = async (teams: any[], competition: string, rounds: number = 1) => {
  try {
    if (teams.length % 2 !== 0) {
      teams.push(null); // Add a dummy team for bye weeks
    }

    const teamCount = teams.length;
    const roundsTotal = rounds * (teamCount - 1);
    const matches = [];

    for (let round = 0; round < roundsTotal; round++) {
      for (let i = 0; i < teamCount / 2; i++) {
        const homeIndex = (round + i) % (teamCount - 1);
        let awayIndex = (teamCount - 1 - i + round) % (teamCount - 1);
        
        // Last team stays in the same place while others rotate
        if (i === 0) {
          awayIndex = teamCount - 1;
        }
        
        const homeTeam = teams[homeIndex];
        const awayTeam = teams[awayIndex];
        
        // Skip matches with dummy team
        if (homeTeam && awayTeam) {
          // Alternate home/away each round
          const isHome = round % 2 === 0;
          const match = {
            homeTeam: isHome ? homeTeam._id : awayTeam._id,
            awayTeam: isHome ? awayTeam._id : homeTeam._id,
            date: calculateMatchDate(round),
            venue: isHome ? homeTeam.arena : awayTeam.arena,
            status: 'SCHEDULED',
            round: round + 1,
            competition
          };
          matches.push(match);
        }
      }
    }

    // Insert all matches
    await Match.insertMany(matches);
    return matches;
    
  } catch (error) {
    console.error('Error generating schedule:', error);
    throw error;
  }
};

const calculateMatchDate = (round: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + (round * 7)); // 7 days between rounds
  return date;
};