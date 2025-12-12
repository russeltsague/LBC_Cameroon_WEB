import mongoose from 'mongoose';
import Match, { IMatch } from '../models/Match';
import Team, { ITeam } from '../models/Team';
import Category from '../models/Category';
import validationService from './validationService';

export interface ScheduleGenerationOptions {
  category: string;
  poule?: string;
  startDate: Date;
  daysBetweenMatches: number;
  timeSlots: string[];
  defaultVenue?: string;
}

export interface SchedulePreview {
  matches: Partial<IMatch>[];
  totalMatches: number;
  journees: number;
  startDate: Date;
  endDate: Date;
  category: string;
  poule?: string;
}

class SchedulerService {
  /**
   * Generate a complete schedule using round-robin algorithm
   */
  async generateSchedule(options: ScheduleGenerationOptions): Promise<SchedulePreview> {
    const { category, poule, startDate, daysBetweenMatches, timeSlots, defaultVenue } = options;

    // Validate category and poule
    const categoryValidation = await validationService.validateCategoryPoule(category, poule);
    if (!categoryValidation.valid) {
      throw new Error(categoryValidation.errors.map(e => e.message).join(', '));
    }

    // Validate sufficient teams
    const teamsValidation = await validationService.validateSufficientTeams(category, poule);
    if (!teamsValidation.valid) {
      throw new Error(teamsValidation.errors.map(e => e.message).join(', '));
    }

    // Fetch teams
    const query: any = { category };
    if (poule) {
      query.poule = poule;
    }
    const teams = await Team.find(query).sort({ name: 1 });

    if (teams.length < 2) {
      throw new Error('At least 2 teams are required to generate a schedule');
    }

    // Generate matches using round-robin algorithm
    const matches = this.generateRoundRobinMatches(
      teams,
      category,
      poule,
      startDate,
      daysBetweenMatches,
      timeSlots,
      defaultVenue
    );

    const journees = teams.length % 2 === 0 ? teams.length - 1 : teams.length;
    const endDate = this.calculateEndDate(startDate, journees, daysBetweenMatches);

    return {
      matches,
      totalMatches: matches.length,
      journees,
      startDate,
      endDate,
      category,
      poule
    };
  }

  /**
   * Generate round-robin matches
   * Each team plays every other team exactly once
   */
  private generateRoundRobinMatches(
    teams: ITeam[],
    category: string,
    poule: string | undefined,
    startDate: Date,
    daysBetweenMatches: number,
    timeSlots: string[],
    defaultVenue?: string
  ): Partial<IMatch>[] {
    const matches: Partial<IMatch>[] = [];
    const teamList = [...teams];

    // Handle odd number of teams by adding a "bye" (null)
    const hasBye = teamList.length % 2 !== 0;
    if (hasBye) {
      teamList.push(null as any);
    }

    const numTeams = teamList.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    // Round-robin algorithm using rotation method
    for (let round = 0; round < numRounds; round++) {
      const roundMatches: Partial<IMatch>[] = [];

      for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex++) {
        let homeIndex: number;
        let awayIndex: number;

        if (matchIndex === 0) {
          // First match: fixed team vs rotating team
          homeIndex = 0;
          awayIndex = numTeams - 1 - round;
        } else {
          // Other matches: rotating teams
          homeIndex = (round + matchIndex) % (numTeams - 1);
          if (homeIndex === 0) homeIndex = numTeams - 1;
          awayIndex = (numTeams - 1 - round - matchIndex + numTeams - 1) % (numTeams - 1);
          if (awayIndex === 0) awayIndex = numTeams - 1;
        }

        const homeTeam = teamList[homeIndex];
        const awayTeam = teamList[awayIndex];

        // Skip matches with bye
        if (!homeTeam || !awayTeam) {
          continue;
        }

        // Alternate home/away for fairness
        const shouldSwap = round % 2 === 1 && matchIndex % 2 === 0;
        const finalHomeTeam = shouldSwap ? awayTeam : homeTeam;
        const finalAwayTeam = shouldSwap ? homeTeam : awayTeam;

        // Assign time slot (cycle through available slots)
        const timeSlot = timeSlots[roundMatches.length % timeSlots.length];

        // Calculate match date
        const matchDate = new Date(startDate);
        matchDate.setDate(matchDate.getDate() + (round * daysBetweenMatches));

        const match: Partial<IMatch> = {
          homeTeam: new mongoose.Types.ObjectId((finalHomeTeam as ITeam & { _id: any })._id.toString()),
          awayTeam: new mongoose.Types.ObjectId((finalAwayTeam as ITeam & { _id: any })._id.toString()),
          category,
          poule,
          date: matchDate,
          time: timeSlot,
          venue: finalHomeTeam.arena || defaultVenue || 'TBD',
          terrain: finalHomeTeam.arena || defaultVenue || 'TBD',
          status: 'upcoming',
          journee: round + 1,
          homeScore: undefined,
          awayScore: undefined,
          forfeit: undefined
        };
        roundMatches.push(match);
      }

      matches.push(...roundMatches);
    }

    return matches;
  }

  /**
   * Save generated schedule to database
   */
  async saveSchedule(preview: SchedulePreview): Promise<IMatch[]> {
    try {
      // Validate all matches before saving
      for (const matchData of preview.matches) {
        const validation = await validationService.validateMatchCreation(matchData);
        if (!validation.valid) {
          throw new Error(`Match validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
      }

      // Save all matches
      const savedMatches = await Match.insertMany(preview.matches as IMatch[]);
      return savedMatches;
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      throw new Error(`Failed to save schedule: ${error.message}`);
    }
  }

  /**
   * Get schedule preview for a category/poule
   */
  async getSchedulePreview(category: string, poule?: string): Promise<IMatch[]> {
    const query: any = { category, status: 'upcoming' };
    if (poule) {
      query.poule = poule;
    }

    return await Match.find(query)
      .populate('homeTeam awayTeam')
      .sort({ journee: 1, date: 1, time: 1 });
  }

  /**
   * Calculate end date based on number of journées and interval
   */
  private calculateEndDate(startDate: Date, journees: number, daysBetweenMatches: number): Date {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + ((journees - 1) * daysBetweenMatches));
    return endDate;
  }

  /**
   * Delete all matches for a category/poule (for regeneration)
   */
  async deleteSchedule(category: string, poule?: string): Promise<number> {
    const query: any = { category, status: 'upcoming' };
    if (poule) {
      query.poule = poule;
    }

    const result = await Match.deleteMany(query);
    return result.deletedCount || 0;
  }
}

export default new SchedulerService();