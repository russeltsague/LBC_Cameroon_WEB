import { Request, Response } from 'express';
import { Calendar } from '../models/Calendar';
import { updateTeamStatsFromCalendar } from '../services/teamStatsService';
import calendarClassificationService from '../services/calendarClassificationService';

// Helper function to convert score string to separate homeScore/awayScore
const processCalendarScores = (calendarData: any) => {
  if (calendarData.poules) {
    calendarData.poules.forEach((poule: any) => {
      if (poule.journées) {
        poule.journées.forEach((journee: any) => {
          if (journee.matches) {
            journee.matches.forEach((match: any) => {
              // Convert score string to separate fields
              if ((match as any).score && (match as any).score !== '' && !match.homeScore && !match.awayScore) {
                const scoreParts = (match as any).score.split('-');
                if (scoreParts.length === 2) {
                  match.homeScore = parseInt(scoreParts[0]) || undefined;
                  match.awayScore = parseInt(scoreParts[1]) || undefined;
                }
              }
            });
          }
        });
      }
    });
  }

  if (calendarData.playoffs) {
    calendarData.playoffs.forEach((playoff: any) => {
      if (playoff.matches) {
        playoff.matches.forEach((match: any) => {
          // Convert score string to separate fields
          if ((match as any).score && (match as any).score !== '' && !match.homeScore && !match.awayScore) {
            const scoreParts = (match as any).score.split('-');
            if (scoreParts.length === 2) {
              match.homeScore = parseInt(scoreParts[0]) || undefined;
              match.awayScore = parseInt(scoreParts[1]) || undefined;
            }
          }
        });
      }
    });
  }

  return calendarData;
};

// Migration endpoint to update existing calendars
export const migrateCalendarScores = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Starting calendar score migration...');

    // Get all calendars
    const calendars = await Calendar.find({});
    console.log(`Found ${calendars.length} calendars to update`);

    let totalUpdated = 0;

    for (const calendar of calendars) {
      console.log(`Processing calendar: ${calendar.category}`);
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
                  if ((match as any).score && (match as any).score !== '' && !match.homeScore && !match.awayScore) {
                    const scoreParts = (match as any).score.split('-');
                    if (scoreParts.length === 2) {
                      const homeScore = parseInt(scoreParts[0]) || undefined;
                      const awayScore = parseInt(scoreParts[1]) || undefined;

                      // Update the match
                      calendar.poules[pIndex].journées[jIndex].matches[mIndex].homeScore = homeScore;
                      calendar.poules[pIndex].journées[jIndex].matches[mIndex].awayScore = awayScore;

                      console.log(`  Updated: ${match.homeTeam} vs ${match.awayTeam} - ${(match as any).score} -> homeScore: ${homeScore}, awayScore: ${awayScore}`);
                      calendarUpdated = true;
                    }
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
              if ((match as any).score && (match as any).score !== '' && !match.homeScore && !match.awayScore) {
                const scoreParts = (match as any).score.split('-');
                if (scoreParts.length === 2) {
                  const homeScore = parseInt(scoreParts[0]) || undefined;
                  const awayScore = parseInt(scoreParts[1]) || undefined;

                  // Update the match
                  calendar.playoffs[pIndex].matches[mIndex].homeScore = homeScore;
                  calendar.playoffs[pIndex].matches[mIndex].awayScore = awayScore;

                  console.log(`  Updated playoff: ${match.homeTeam} vs ${match.awayTeam} - ${(match as any).score} -> homeScore: ${homeScore}, awayScore: ${awayScore}`);
                  calendarUpdated = true;
                }
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
      }
    }

    console.log(`Migration complete. Total calendars updated: ${totalUpdated}`);

    res.json({
      success: true,
      message: `Migration complete. Total calendars updated: ${totalUpdated}`,
      totalUpdated
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed' });
  }
};

// Get all calendars
export const getCalendars = async (req: Request, res: Response): Promise<void> => {
  try {
    const calendars = await Calendar.find().sort({ category: 1 });
    res.json({ data: calendars });
  } catch (error) {
    console.error('Error fetching calendars:', error);
    res.status(500).json({ error: 'Failed to fetch calendars' });
  }
};

// Get calendar by category
export const getCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const calendar = await Calendar.findOne({ category });

    if (!calendar) {
      res.status(404).json({ error: 'Calendar not found' });
      return;
    }

    res.json({ data: calendar });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
};

// Create new calendar
export const createCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const calendarData = req.body;

    // Check if calendar for this category already exists
    const existingCalendar = await Calendar.findOne({ category: calendarData.category });
    if (existingCalendar) {
      res.status(400).json({ error: 'Calendar for this category already exists' });
      return;
    }

    // Process scores to convert string format to separate fields
    const processedCalendarData = processCalendarScores(calendarData);

    const calendar = new Calendar(processedCalendarData);
    await calendar.save();

    // Update team statistics after calendar creation
    try {
      await updateTeamStatsFromCalendar(calendar.category);
      console.log(`Updated team stats for category: ${calendar.category}`);
    } catch (error) {
      console.error(`Error updating team stats for category ${calendar.category}:`, error);
    }

    // Recalculate classification from calendar data
    try {
      await calendarClassificationService.recalculateClassificationFromCalendar(calendar.category);
      console.log(`Recalculated classification for category: ${calendar.category}`);
    } catch (error) {
      console.error(`Error recalculating classification for category ${calendar.category}:`, error);
    }

    res.status(201).json({ data: calendar });
  } catch (error) {
    console.error('Error creating calendar:', error);
    res.status(500).json({ error: 'Failed to create calendar' });
  }
};

// Update calendar
export const updateCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Process scores to convert string format to separate fields
    const processedUpdateData = processCalendarScores(updateData);

    const calendar = await Calendar.findByIdAndUpdate(
      id,
      processedUpdateData,
      { new: true, runValidators: true }
    );

    if (!calendar) {
      res.status(404).json({ error: 'Calendar not found' });
      return;
    }

    // Update team statistics after calendar modification
    try {
      await updateTeamStatsFromCalendar(calendar.category);
      console.log(`Updated team stats for category: ${calendar.category}`);
    } catch (error) {
      console.error(`Error updating team stats for category ${calendar.category}:`, error);
    }

    // Recalculate classification from calendar data
    try {
      await calendarClassificationService.recalculateClassificationFromCalendar(calendar.category);
      console.log(`Recalculated classification for category: ${calendar.category}`);
    } catch (error) {
      console.error(`Error recalculating classification for category ${calendar.category}:`, error);
    }

    res.json({ data: calendar });
  } catch (error) {
    console.error('Error updating calendar:', error);
    res.status(500).json({ error: 'Failed to update calendar' });
  }
};

// Delete calendar
export const deleteCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const calendar = await Calendar.findByIdAndDelete(id);

    if (!calendar) {
      res.status(404).json({ error: 'Calendar not found' });
      return;
    }

    res.json({ message: 'Calendar deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar:', error);
    res.status(500).json({ error: 'Failed to delete calendar' });
  }
};

// Update match score in calendar
export const updateMatchScore = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received calendar match score update request:', req.body);
    const { date, homeTeam, awayTeam, homeScore, awayScore, status } = req.body;

    if (!homeTeam || !awayTeam || homeScore === undefined || awayScore === undefined) {
      console.log('Missing required fields:', { homeTeam, awayTeam, homeScore, awayScore });
      res.status(400).json({ error: 'homeTeam, awayTeam, homeScore, and awayScore are required' });
      return;
    }

    console.log('Searching for calendars with teams:', { homeTeam, awayTeam });

    // Find all calendars (no date filter since calendar matches don't have dates)
    const calendars = await Calendar.find({});

    console.log('Found calendars:', calendars.length);

    if (calendars.length === 0) {
      console.log('No calendars found');
      res.status(404).json({ error: 'No calendars found' });
      return;
    }

    let totalUpdated = 0;

    // Update the match in each calendar
    for (const calendar of calendars) {
      let calendarUpdated = false;

      console.log('Checking calendar:', calendar.category);

      // Search in poules
      if (calendar.poules) {
        for (const poule of calendar.poules) {
          for (const journee of poule.journées) {
            for (let i = 0; i < journee.matches.length; i++) {
              const match = journee.matches[i];
              // Normalize team names for comparison (remove extra spaces)
              const matchHomeTeam = match.homeTeam.trim();
              const matchAwayTeam = match.awayTeam.trim();
              const searchHomeTeam = homeTeam.trim();
              const searchAwayTeam = awayTeam.trim();

              if (
                (matchHomeTeam.toLowerCase() === searchHomeTeam.toLowerCase() &&
                  matchAwayTeam.toLowerCase() === searchAwayTeam.toLowerCase()) ||
                (matchHomeTeam.toLowerCase() === searchAwayTeam.toLowerCase() &&
                  matchAwayTeam.toLowerCase() === searchHomeTeam.toLowerCase())
              ) {
                console.log('Found match in poule:', match);
                journee.matches[i].homeScore = homeScore;
                journee.matches[i].awayScore = awayScore;
                calendarUpdated = true;
                totalUpdated++;
              }
            }
          }
        }
      }

      // Search in playoffs
      if (calendar.playoffs) {
        for (const playoff of calendar.playoffs) {
          for (let i = 0; i < playoff.matches.length; i++) {
            const match = playoff.matches[i];
            // Normalize team names for comparison
            const matchHomeTeam = match.homeTeam.trim();
            const matchAwayTeam = match.awayTeam.trim();
            const searchHomeTeam = homeTeam.trim();
            const searchAwayTeam = awayTeam.trim();

            if (
              (matchHomeTeam.toLowerCase() === searchHomeTeam.toLowerCase() &&
                matchAwayTeam.toLowerCase() === searchAwayTeam.toLowerCase()) ||
              (matchHomeTeam.toLowerCase() === searchAwayTeam.toLowerCase() &&
                matchAwayTeam.toLowerCase() === searchHomeTeam.toLowerCase())
            ) {
              console.log('Found match in playoffs:', match);
              playoff.matches[i].homeScore = homeScore;
              playoff.matches[i].awayScore = awayScore;
              calendarUpdated = true;
              totalUpdated++;
            }
          }
        }
      }

      // Save the calendar if it was updated
      if (calendarUpdated) {
        console.log('Saving calendar:', calendar.category);
        await calendar.save();
      }
    }

    if (totalUpdated === 0) {
      console.log('No matches updated. Teams not found:', { homeTeam, awayTeam });
      res.status(404).json({ error: 'Match not found in any calendar' });
      return;
    }

    console.log('Successfully updated', totalUpdated, 'matches');

    // Update team statistics for each affected calendar
    // Update team statistics and classification for each affected calendar
    for (const calendar of calendars) {
      try {
        // Update team stats (Team model)
        await updateTeamStatsFromCalendar(calendar.category);
        console.log(`Updated team stats for category: ${calendar.category}`);

        // Recalculate classification (Classification model)
        await calendarClassificationService.recalculateClassificationFromCalendar(calendar.category);
        console.log(`Recalculated classification for category: ${calendar.category}`);
      } catch (error) {
        console.error(`Error updating stats/classification for category ${calendar.category}:`, error);
      }
    }

    res.json({
      success: true,
      message: 'Match scores updated successfully in calendar',
      updatedCalendars: calendars.length,
      totalMatchesUpdated: totalUpdated
    });
  } catch (error) {
    console.error('Error updating match score in calendar:', error);
    res.status(500).json({ error: 'Failed to update calendar' });
  }
};

// Recalculate all stats from calendar
export const recalculateAllStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Starting global stats recalculation...');

    // Get all calendars
    const calendars = await Calendar.find({});
    console.log(`Found ${calendars.length} calendars to process`);

    const results = [];

    for (const calendar of calendars) {
      console.log(`Processing category: ${calendar.category}`);
      try {
        // Update team stats (Team model)
        await updateTeamStatsFromCalendar(calendar.category);

        // Recalculate classification (Classification model)
        await calendarClassificationService.recalculateClassificationFromCalendar(calendar.category);

        results.push({ category: calendar.category, status: 'success' });
      } catch (error: any) {
        console.error(`Error processing category ${calendar.category}:`, error);
        results.push({ category: calendar.category, status: 'error', error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Global stats recalculation complete',
      results
    });
  } catch (error) {
    console.error('Error recalculating all stats:', error);
    res.status(500).json({ error: 'Failed to recalculate stats' });
  }
};
