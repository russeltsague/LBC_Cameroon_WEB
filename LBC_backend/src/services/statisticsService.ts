import mongoose from 'mongoose';
import Team, { ITeam } from '../models/Team';
import Match, { IMatch } from '../models/Match';
import Classification from '../models/Classification';
import classificationService, { TeamStatistics } from './classificationService';
import { EventEmitter } from 'events';

// Create an event emitter for statistics updates
export const statsEmitter = new EventEmitter();

export interface CategoryStatistics {
  category: string;
  poule?: string;
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  upcomingMatches: number;
  averagePointsPerMatch: number;
  highestScoringTeam?: {
    teamId: string;
    teamName: string;
    averagePoints: number;
  };
  topTeam?: {
    teamId: string;
    teamName: string;
    points: number;
    position: number;
  };
}

export interface DashboardMetrics {
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  upcomingMatches: number;
  liveMatches: number;
  recentMatches: any[];
  upcomingWeek: any[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  teams: number;
  matches: number;
  completedMatches: number;
}

interface MatchUpdateEvent {
  matchId: string;
  homeTeam: string | ITeam;
  awayTeam: string | ITeam;
  homeScore: number;
  awayScore: number;
  category: string;
  poule?: string;
}

class StatisticsService {
  private isUpdating = new Set<string>();

  constructor() {
    // Listen for match completion events
    statsEmitter.on('matchCompleted', this.handleMatchCompleted.bind(this));
  }

  /**
   * Handle match completion and update statistics
   */
  private async handleMatchCompleted(matchId: string) {
    // Prevent concurrent updates for the same match
    if (this.isUpdating.has(matchId)) return;
    this.isUpdating.add(matchId);

    try {
      const match = await Match.findById(matchId)
        .populate('homeTeam', 'name')
        .populate('awayTeam', 'name');

      if (!match || match.status !== 'completed' || match.homeScore === undefined || match.awayScore === undefined) {
        return;
      }

      // Update classification for both teams
      await this.updateClassificationForMatch(match);
      
      // Update positions after stats are updated
      await (Classification as any).updatePositions(match.category, match.poule);
      
      // Emit event for real-time updates
      statsEmitter.emit('statsUpdated', {
        matchId: match._id,
        category: match.category,
        poule: match.poule
      });
    } catch (error) {
      console.error('Error updating statistics for match:', matchId, error);
    } finally {
      this.isUpdating.delete(matchId);
    }
  }

  /**
   * Update classification for a completed match
   */
  private async updateClassificationForMatch(match: IMatch) {
    const { homeTeam, awayTeam, homeScore, awayScore, category, poule } = match;

    if (homeScore === undefined || awayScore === undefined) {
      return;
    }

    // Update home team stats
    await this.updateTeamStats({
      teamId: homeTeam.toString(),
      opponent: (awayTeam as any)?.name || 'Unknown',
      isHome: true,
      goalsFor: homeScore,
      goalsAgainst: awayScore,
      date: match.date,
      category,
      poule
    });

    // Update away team stats
    await this.updateTeamStats({
      teamId: awayTeam.toString(),
      opponent: (homeTeam as any)?.name || 'Unknown',
      isHome: false,
      goalsFor: awayScore,
      goalsAgainst: homeScore,
      date: match.date,
      category,
      poule
    });
  }

  /**
   * Update team statistics based on match result
   */
  private async updateTeamStats({
    teamId,
    opponent,
    isHome,
    goalsFor,
    goalsAgainst,
    date,
    category,
    poule
  }: {
    teamId: string;
    opponent: string;
    isHome: boolean;
    goalsFor: number;
    goalsAgainst: number;
    date: Date;
    category: string;
    poule?: string;
  }) {
    const teamStats = await Classification.findOneAndUpdate(
      { 
        team: teamId, 
        category, 
        ...(poule && { poule }) 
      },
      {},
      { 
        upsert: true, 
        new: true, 
        setDefaultsOnInsert: true 
      }
    );

    // Use the model method to update stats
    await teamStats.updateStats({
      isHome,
      opponent,
      goalsFor,
      goalsAgainst,
      date
    });
  }
  /**
   * Get comprehensive statistics for a team
   */
  async getTeamStatistics(teamId: string): Promise<TeamStatistics | null> {
    return await classificationService.getTeamStatistics(teamId);
  }

  /**
   * Get statistics for a category/poule
   */
  async getCategoryStatistics(category: string, poule?: string): Promise<CategoryStatistics> {
    try {
      const teamQuery: any = { category };
      if (poule) {
        teamQuery.poule = poule;
      }

      const matchQuery: any = { category };
      if (poule) {
        matchQuery.poule = poule;
      }

      // Count teams
      const totalTeams = await Team.countDocuments(teamQuery);

      // Count matches by status
      const totalMatches = await Match.countDocuments(matchQuery);
      const completedMatches = await Match.countDocuments({ ...matchQuery, status: 'completed' });
      const upcomingMatches = await Match.countDocuments({ ...matchQuery, status: 'upcoming' });

      // Calculate average points per match
      const completedMatchesList = await Match.find({ ...matchQuery, status: 'completed' });
      const totalPoints = completedMatchesList.reduce((sum, match) => {
        return sum + (match.homeScore || 0) + (match.awayScore || 0);
      }, 0);
      const averagePointsPerMatch = completedMatches > 0 ? totalPoints / completedMatches : 0;

      // Find highest scoring team
      const classifications = await Classification.find(teamQuery)
        .populate('team')
        .sort({ goalsFor: -1 })
        .limit(1);

      let highestScoringTeam;
      if (classifications.length > 0 && classifications[0].gamesPlayed > 0) {
        const team = classifications[0].team as any;
        if (team && team._id) {
          highestScoringTeam = {
            teamId: team._id.toString(),
            teamName: team.name,
            averagePoints: classifications[0].goalsFor / classifications[0].gamesPlayed
          };
        }
      }

      // Find top team by position
      const topClassifications = await Classification.find(teamQuery)
        .populate('team')
        .sort({ position: 1 })
        .limit(1);

      let topTeam;
      if (topClassifications.length > 0) {
        const team = topClassifications[0].team as any;
        if (team && team._id) {
          topTeam = {
            teamId: team._id.toString(),
            teamName: team.name,
            points: topClassifications[0].points,
            position: topClassifications[0].position
          };
        }
      }

      return {
        category,
        poule,
        totalTeams,
        totalMatches,
        completedMatches,
        upcomingMatches,
        averagePointsPerMatch,
        highestScoringTeam,
        topTeam
      };
    } catch (error) {
      console.error('Error getting category statistics:', error);
      throw error;
    }
  }

  /**
   * Get dashboard metrics overview
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Count totals
      const totalTeams = await Team.countDocuments();
      const totalMatches = await Match.countDocuments();
      const completedMatches = await Match.countDocuments({ status: 'completed' });
      const upcomingMatches = await Match.countDocuments({ status: 'upcoming' });
      const liveMatches = await Match.countDocuments({ status: 'live' });

      // Get recent matches (last 5 completed)
      const recentMatches = await Match.find({ status: 'completed' })
        .populate('homeTeam awayTeam')
        .sort({ updatedAt: -1 })
        .limit(5);

      // Get upcoming matches (next 7 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const upcomingWeek = await Match.find({
        status: 'upcoming',
        date: { $gte: today, $lte: nextWeek }
      })
        .populate('homeTeam awayTeam')
        .sort({ date: 1, time: 1 })
        .limit(10);

      // Get category breakdown
      const categories = await Team.distinct('category');
      const categoryBreakdown: CategoryBreakdown[] = [];

      for (const category of categories) {
        const teams = await Team.countDocuments({ category });
        const matches = await Match.countDocuments({ category });
        const completed = await Match.countDocuments({ category, status: 'completed' });

        categoryBreakdown.push({
          category,
          teams,
          matches,
          completedMatches: completed
        });
      }

      return {
        totalTeams,
        totalMatches,
        completedMatches,
        upcomingMatches,
        liveMatches,
        recentMatches,
        upcomingWeek,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get league-wide statistics
   */
  async getLeagueStatistics() {
    try {
      const categories = await Team.distinct('category');
      const stats = [];

      for (const category of categories) {
        const categoryStats = await this.getCategoryStatistics(category);
        stats.push(categoryStats);
      }

      return stats;
    } catch (error) {
      console.error('Error getting league statistics:', error);
      throw error;
    }
  }

  /**
   * Get performance trends for a team over time
   */
  async getTeamTrends(teamId: string, limit: number = 10) {
    try {
      const matches = await Match.find({
        $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
        status: 'completed'
      })
        .sort({ date: -1 })
        .limit(limit)
        .populate('homeTeam awayTeam');

      const trends = matches.map(match => {
        const isHome = match.homeTeam._id.toString() === teamId;
        const teamScore = isHome ? match.homeScore : match.awayScore;
        const opponentScore = isHome ? match.awayScore : match.homeScore;
        const won = teamScore! > opponentScore!;

        return {
          date: match.date,
          opponent: isHome ? (match.awayTeam as any).name : (match.homeTeam as any).name,
          isHome,
          teamScore,
          opponentScore,
          won,
          pointsDifference: teamScore! - opponentScore!
        };
      }).reverse();

      return trends;
    } catch (error) {
      console.error('Error getting team trends:', error);
      throw error;
    }
  }
}

export default new StatisticsService();
