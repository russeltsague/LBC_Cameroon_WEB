import { Request, Response } from 'express';
import { Calendar } from '../models/Calendar';

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

export const convertScoreFields = async (req: Request, res: Response) => {
  try {
    console.log('Starting calendar score conversion...');
    
    // Find all calendars
    const calendars = await Calendar.find({});
    console.log(`Found ${calendars.length} calendars to process`);

    let totalUpdated = 0;
    let totalProcessed = 0;

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
              totalProcessed++;
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
                  totalUpdated++;
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
            totalProcessed++;
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
                totalUpdated++;
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
    console.log(`Total matches processed: ${totalProcessed}`);
    console.log(`Total matches updated: ${totalUpdated}`);

    res.status(200).json({
      success: true,
      message: 'Score conversion completed successfully',
      stats: {
        totalProcessed,
        totalUpdated,
        calendarsCount: calendars.length
      }
    });
  } catch (error) {
    console.error('Error during calendar score conversion:', error);
    res.status(500).json({
      success: false,
      message: 'Score conversion failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
