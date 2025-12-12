import { Calendar } from '../models/Calendar';
import Team from '../models/Team';
import Classification, { IClassification } from '../models/Classification';
import mongoose from 'mongoose';

/**
 * Service to manage classification calculations from calendar data
 */
export class CalendarClassificationService {
  /**
   * Recalculate and update classification for a category/poule from calendar data
   */
  async recalculateClassificationFromCalendar(category: string, poule?: string): Promise<IClassification[]> {
    try {
      console.log(`Recalculating classification for category: ${category}, poule: ${poule || 'all'}`);

      // Get calendar for the category
      const calendar = await Calendar.findOne({ category });
      if (!calendar) {
        throw new Error(`No calendar found for category: ${category}`);
      }

      // Get all teams from calendar poules
      let teamNames: string[] = [];
      let pouleName: string | undefined;

      if (calendar.poules) {
        for (const calendarPoule of calendar.poules) {
          // Normalize poule name (remove "POULE " prefix if present)
          const normalizedPouleName = calendarPoule.name.replace(/^POULE\s+/i, '').trim();

          // If poule is specified, only process that poule
          if (poule && normalizedPouleName !== poule) {
            continue;
          }
          teamNames.push(...calendarPoule.teams);
          pouleName = normalizedPouleName;
        }
      }

      if (teamNames.length === 0) {
        console.log(`No teams found for category: ${category}, poule: ${poule || 'all'}`);
        return [];
      }

      // Remove duplicates
      const uniqueTeamNames = [...new Set(teamNames)];

      // Get team documents
      const teams = await Team.find({
        name: { $in: uniqueTeamNames },
        category
      });

      if (teams.length === 0) {
        console.log(`No team documents found for category: ${category}`);
        return [];
      }

      // Create a map of team name to team object and team name to poule name
      const teamMap = new Map<string, any>();
      const teamPouleMap = new Map<string, string>();

      teams.forEach(team => {
        teamMap.set(team.name, team);
      });

      // Populate teamPouleMap
      if (calendar.poules) {
        for (const calendarPoule of calendar.poules) {
          const normalizedPouleName = calendarPoule.name.replace(/^POULE\s+/i, '').trim();
          for (const teamName of calendarPoule.teams) {
            teamPouleMap.set(teamName, normalizedPouleName);
          }
        }
      }

      // Initialize or reset classification entries
      const classificationMap = new Map<string, IClassification>();

      for (const team of teams) {
        // Delete existing classification for this team/category
        // IMPORTANT: Do NOT filter by poule here, as we want to replace any existing classification
        // for this team in this category, regardless of what poule it was previously assigned to.
        await Classification.deleteMany({
          team: team._id,
          category
        });

        // Determine poule for this team
        const teamPoule = teamPouleMap.get(team.name) || pouleName;

        // Create new classification entry
        const classification = new Classification({
          team: team._id,
          category,
          poule: teamPoule,
          position: 0,
          gamesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          form: [],
          cleanSheets: 0,
          failedToScore: 0,
          last5: []
        });

        await classification.save();
        classificationMap.set(team.name, classification);
      }

      // Process matches from calendar
      if (calendar.poules) {
        for (const calendarPoule of calendar.poules) {
          // Normalize poule name
          const normalizedPouleName = calendarPoule.name.replace(/^POULE\s+/i, '').trim();

          // If poule is specified, only process that poule
          if (poule && normalizedPouleName !== poule) {
            continue;
          }

          for (const journee of calendarPoule.journées) {
            for (const match of journee.matches) {
              await this.processMatchForClassification(match, classificationMap, teamMap);
            }
          }
        }
      }

      // Update positions
      await this.updatePositions(category, poule);

      // Return updated classifications
      const query: any = { category };
      if (poule) {
        query.poule = poule;
      }

      const classifications = await Classification.find(query)
        .populate('team', 'name logo')
        .sort({ position: 1 });

      console.log(`Classification updated for ${classifications.length} teams in category: ${category}, poule: ${poule || 'all'}`);

      return classifications;

    } catch (error) {
      console.error('Error recalculating classification from calendar:', error);
      throw error;
    }
  }

  /**
   * Process a single match and update classification
   */
  private async processMatchForClassification(
    match: any,
    classificationMap: Map<string, IClassification>,
    teamMap: Map<string, any>
  ): Promise<void> {
    const homeTeamName = match.homeTeam;
    const awayTeamName = match.awayTeam;

    const homeTeam = teamMap.get(homeTeamName);
    const awayTeam = teamMap.get(awayTeamName);

    if (!homeTeam || !awayTeam) {
      console.log(`Team not found - Home: ${!homeTeam ? homeTeamName : 'FOUND'}, Away: ${!awayTeam ? awayTeamName : 'FOUND'}`);
      return;
    }

    // Check if match has scores - skip if not
    if (match.homeScore === undefined || match.awayScore === undefined ||
      match.homeScore === null || match.awayScore === null ||
      match.homeScore === 'N/A' || match.awayScore === 'N/A' ||
      isNaN(Number(match.homeScore)) || isNaN(Number(match.awayScore))) {
      return;
    }

    const homeScoreNum = Number(match.homeScore);
    const awayScoreNum = Number(match.awayScore);

    const homeClassification = classificationMap.get(homeTeamName);
    const awayClassification = classificationMap.get(awayTeamName);

    if (!homeClassification || !awayClassification) {
      console.log(`Classification not found for teams`);
      return;
    }

    // Update home team stats
    homeClassification.gamesPlayed += 1;
    homeClassification.goalsFor += homeScoreNum;
    homeClassification.goalsAgainst += awayScoreNum;
    homeClassification.goalDifference = homeClassification.goalsFor - homeClassification.goalsAgainst;

    // Update away team stats
    awayClassification.gamesPlayed += 1;
    awayClassification.goalsFor += awayScoreNum;
    awayClassification.goalsAgainst += homeScoreNum;
    awayClassification.goalDifference = awayClassification.goalsFor - awayClassification.goalsAgainst;

    // Determine results and points (New rules: 2 for win, 1 for loss, 0 for forfeit)
    const isForfeit = (homeScoreNum === 20 && awayScoreNum === 0) || (homeScoreNum === 0 && awayScoreNum === 20);

    if (isForfeit) {
      if (homeScoreNum === 20) {
        // Home wins by forfeit
        homeClassification.wins += 1;
        homeClassification.points += 2;
        awayClassification.losses += 1;
        awayClassification.points += 0; // Forfeit gives 0 points

        homeClassification.form.unshift('W');
        awayClassification.form.unshift('L');
      } else {
        // Away wins by forfeit
        homeClassification.losses += 1;
        homeClassification.points += 0; // Forfeit gives 0 points
        awayClassification.wins += 1;
        awayClassification.points += 2;

        homeClassification.form.unshift('L');
        awayClassification.form.unshift('W');
      }

      // Update last5 for forfeit
      homeClassification.last5.unshift({
        opponent: awayTeamName,
        isHome: true,
        goalsFor: homeScoreNum,
        goalsAgainst: awayScoreNum,
        result: homeClassification.form[0] as 'W' | 'D' | 'L',
        date: new Date()
      });

      awayClassification.last5.unshift({
        opponent: homeTeamName,
        isHome: false,
        goalsFor: awayScoreNum,
        goalsAgainst: homeScoreNum,
        result: awayClassification.form[0] as 'W' | 'D' | 'L',
        date: new Date()
      });

    } else if (homeScoreNum > awayScoreNum) {
      // Home team wins
      homeClassification.wins += 1;
      homeClassification.points += 2;
      awayClassification.losses += 1;
      awayClassification.points += 1; // Loss gives 1 point

      // Update form
      homeClassification.form.unshift('W');
      awayClassification.form.unshift('L');

      // Update last5
      homeClassification.last5.unshift({
        opponent: awayTeamName,
        isHome: true,
        goalsFor: homeScoreNum,
        goalsAgainst: awayScoreNum,
        result: 'W',
        date: new Date()
      });

      awayClassification.last5.unshift({
        opponent: homeTeamName,
        isHome: false,
        goalsFor: awayScoreNum,
        goalsAgainst: homeScoreNum,
        result: 'L',
        date: new Date()
      });

    } else if (homeScoreNum < awayScoreNum) {
      // Away team wins
      homeClassification.losses += 1;
      homeClassification.points += 1; // Loss gives 1 point
      awayClassification.wins += 1;
      awayClassification.points += 2;

      // Update form
      homeClassification.form.unshift('L');
      awayClassification.form.unshift('W');

      // Update last5
      homeClassification.last5.unshift({
        opponent: awayTeamName,
        isHome: true,
        goalsFor: homeScoreNum,
        goalsAgainst: awayScoreNum,
        result: 'L',
        date: new Date()
      });

      awayClassification.last5.unshift({
        opponent: homeTeamName,
        isHome: false,
        goalsFor: awayScoreNum,
        goalsAgainst: homeScoreNum,
        result: 'W',
        date: new Date()
      });

    } else {
      // Draw (rare in basketball) - 0 points for each team
      homeClassification.draws += 1;
      homeClassification.points += 0;
      awayClassification.draws += 1;
      awayClassification.points += 0;

      // Update form
      homeClassification.form.unshift('D');
      awayClassification.form.unshift('D');

      // Update last5
      homeClassification.last5.unshift({
        opponent: awayTeamName,
        isHome: true,
        goalsFor: homeScoreNum,
        goalsAgainst: awayScoreNum,
        result: 'D',
        date: new Date()
      });

      awayClassification.last5.unshift({
        opponent: homeTeamName,
        isHome: false,
        goalsFor: awayScoreNum,
        goalsAgainst: homeScoreNum,
        result: 'D',
        date: new Date()
      });
    }

    // Keep only last 5 in form and last5 arrays
    if (homeClassification.form.length > 5) {
      homeClassification.form = homeClassification.form.slice(0, 5);
    }
    if (awayClassification.form.length > 5) {
      awayClassification.form = awayClassification.form.slice(0, 5);
    }
    if (homeClassification.last5.length > 5) {
      homeClassification.last5 = homeClassification.last5.slice(0, 5);
    }
    if (awayClassification.last5.length > 5) {
      awayClassification.last5 = awayClassification.last5.slice(0, 5);
    }

    // Update clean sheets and failed to score
    if (awayScoreNum === 0) homeClassification.cleanSheets += 1;
    if (homeScoreNum === 0) awayClassification.cleanSheets += 1;
    if (homeScoreNum === 0) homeClassification.failedToScore += 1;
    if (awayScoreNum === 0) awayClassification.failedToScore += 1;

    // Save classifications
    await homeClassification.save();
    await awayClassification.save();
  }

  /**
   * Update positions for teams in a category/poule
   */
  private async updatePositions(category: string, poule?: string): Promise<void> {
    const query: any = { category };
    if (poule) {
      query.poule = poule;
    }

    const teams = await Classification.find(query)
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 });

    // Update positions
    for (let i = 0; i < teams.length; i++) {
      teams[i].position = i + 1;
      await teams[i].save();
    }
  }

  /**
   * Get classification for a category/poule
   */
  async getClassification(category: string, poule?: string): Promise<IClassification[]> {
    const query: any = { category };
    if (poule) {
      query.poule = poule;
    }

    return await Classification.find(query)
      .populate('team', 'name logo')
      .sort({ position: 1 });
  }
}

export default new CalendarClassificationService();
