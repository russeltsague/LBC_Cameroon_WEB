import Classification, { IClassification } from '../models/Classification';
import Match, { IMatch } from '../models/Match';
import Team from '../models/Team';
import mongoose from 'mongoose';

export interface TeamStatistics {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  winPercentage: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifference: number;
  averagePointsScored: number;
  averagePointsConceded: number;
  recentForm: ('W' | 'D' | 'L')[];
  homeRecord: { wins: number; losses: number };
  awayRecord: { wins: number; losses: number };
  points: number;
  position: number;
}

class ClassificationService {
  /**
   * Update classification after a match is completed
   * Implements FIBA point allocation rules
   */
  async updateClassification(matchId: string | mongoose.Types.ObjectId): Promise<void> {
    try {
      const match = await Match.findById(matchId).populate('homeTeam awayTeam');
      
      if (!match || match.status !== 'completed') {
        console.log('Match not found or not completed');
        return;
      }

      if (match.homeScore === null || match.homeScore === undefined || 
          match.awayScore === null || match.awayScore === undefined) {
        console.log('Match scores not set');
        return;
      }

      const category = match.category;
      const poule = match.poule;

      // Get or create classification entries for both teams
      const homeClassification = await this.getOrCreateClassification(
        match.homeTeam._id,
        category,
        poule
      );
      
      const awayClassification = await this.getOrCreateClassification(
        match.awayTeam._id,
        category,
        poule
      );

      // Check if this match has already been counted
      const alreadyCounted = await this.isMatchAlreadyCounted(matchId, homeClassification, awayClassification);
      if (alreadyCounted) {
        console.log('Match already counted in classification');
        return;
      }

      // Update statistics
      homeClassification.gamesPlayed += 1;
      homeClassification.goalsFor += match.homeScore;
      homeClassification.goalsAgainst += match.awayScore;
      homeClassification.goalDifference = homeClassification.goalsFor - homeClassification.goalsAgainst;
      
      awayClassification.gamesPlayed += 1;
      awayClassification.goalsFor += match.awayScore;
      awayClassification.goalsAgainst += match.homeScore;
      awayClassification.goalDifference = awayClassification.goalsFor - awayClassification.goalsAgainst;
      
      // Point allocation: 2 points for victory, 1 point for loss, 0 points for forfeit (20-00 or 00-20)
      if (match.forfeit === 'home') {
        // Home team forfeits: away team gets 2 points, home team gets 0
        homeClassification.losses += 1;
        homeClassification.points += 0;
        awayClassification.wins += 1;
        awayClassification.points += 2;
      } else if (match.forfeit === 'away') {
        // Away team forfeits: home team gets 2 points, away team gets 0
        homeClassification.wins += 1;
        homeClassification.points += 2;
        awayClassification.losses += 1;
        awayClassification.points += 0;
      } else {
        // Normal match: winner gets 2 points, loser gets 1 point, draw gets 0 points each
        if (match.homeScore > match.awayScore) {
          homeClassification.wins += 1;
          homeClassification.points += 2;
          awayClassification.losses += 1;
          awayClassification.points += 1;
        } else if (match.homeScore === match.awayScore) {
          homeClassification.draws += 1;
          homeClassification.points += 0;
          awayClassification.draws += 1;
          awayClassification.points += 0;
        } else {
          homeClassification.losses += 1;
          homeClassification.points += 1;
          awayClassification.wins += 1;
          awayClassification.points += 2;
        }
      }

      // Save updated classifications
      await homeClassification.save();
      await awayClassification.save();

      // Recalculate positions for the category/poule
      await this.calculatePositions(category, poule);
      
    } catch (error) {
      console.error('Error updating classification:', error);
      throw error;
    }
  }

  /**
   * Get or create a classification entry for a team
   */
  private async getOrCreateClassification(
    teamId: mongoose.Types.ObjectId,
    category: string,
    poule?: string
  ): Promise<IClassification> {
    let classification = await Classification.findOne({ 
      team: teamId, 
      category,
      ...(poule && { poule })
    });

    if (!classification) {
      classification = await Classification.create({
        team: teamId,
        category,
        poule,
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        position: 0
      });
    }

    return classification;
  }

  /**
   * Check if a match has already been counted in classification
   */
  private async isMatchAlreadyCounted(
    matchId: string | mongoose.Types.ObjectId,
    homeClassification: IClassification,
    awayClassification: IClassification
  ): Promise<boolean> {
    // This is a simple check - in production, you might want to track processed matches
    // For now, we'll assume if the match is completed and classifications exist, it might be counted
    // A more robust solution would be to add a processedMatches array to the classification model
    return false;
  }

  /**
   * Calculate and update positions based on FIBA ranking rules
   * 1. Total points (descending)
   * 2. Point difference (descending)
   * 3. Points scored (descending)
   */
  async calculatePositions(category: string, poule?: string): Promise<void> {
    const query: any = { category };
    if (poule) {
      query.poule = poule;
    }

    const classifications = await Classification.find(query)
      .populate('team')
      .sort({
        points: -1,
        goalDifference: -1,
        goalsFor: -1
      });

    // Update positions sequentially
    for (let i = 0; i < classifications.length; i++) {
      classifications[i].position = i + 1;
      await classifications[i].save();
    }
  }

  /**
   * Recalculate entire classification for a category/poule
   * Useful for fixing inconsistencies or after bulk updates
   */
  async recalculateCategory(category: string, poule?: string): Promise<IClassification[]> {
    try {
      // Reset all classifications for this category/poule
      const query: any = { category };
      if (poule) {
        query.poule = poule;
      }

      await Classification.updateMany(query, {
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        position: 0
      });

      // Get all completed matches for this category/poule
      const matchQuery: any = { category, status: 'completed' };
      if (poule) {
        matchQuery.poule = poule;
      }

      const matches = await Match.find(matchQuery).populate('homeTeam awayTeam');

      // Reprocess each match
      for (const match of matches) {
        if (match.homeScore !== null && match.awayScore !== null) {
          await this.updateClassification(String(match._id));
        }
      }

      // Return updated classifications
      return await Classification.find(query)
        .populate('team')
        .sort({ position: 1 });
    } catch (error) {
      console.error('Error recalculating category:', error);
      throw error;
    }
  }

  /**
   * Get detailed statistics for a team
   */
  async getTeamStatistics(teamId: string | mongoose.Types.ObjectId): Promise<TeamStatistics | null> {
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        return null;
      }

      const classification = await Classification.findOne({ team: teamId });
      if (!classification) {
        return null;
      }

      // Get home and away records
      const homeMatches = await Match.find({
        homeTeam: teamId,
        status: 'completed'
      });

      const awayMatches = await Match.find({
        awayTeam: teamId,
        status: 'completed'
      });

      const homeRecord = {
        wins: homeMatches.filter(m => m.homeScore! > m.awayScore!).length,
        losses: homeMatches.filter(m => m.homeScore! <= m.awayScore!).length
      };

      const awayRecord = {
        wins: awayMatches.filter(m => m.awayScore! > m.homeScore!).length,
        losses: awayMatches.filter(m => m.awayScore! <= m.homeScore!).length
      };

      // Get recent form (last 5 matches)
      const recentMatches = await Match.find({
        $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
        status: 'completed'
      })
        .sort({ date: -1, updatedAt: -1 })
        .limit(5);

      const recentForm: ('W' | 'L')[] = recentMatches.map(match => {
        const isHome = match.homeTeam.toString() === teamId.toString();
        const won = isHome 
          ? match.homeScore! > match.awayScore!
          : match.awayScore! > match.homeScore!;
        return won ? 'W' : 'L';
      }).reverse();

      return {
        teamId: String(team._id),
        teamName: team.name,
        played: classification.gamesPlayed,
        wins: classification.wins,
        draws: classification.draws,
        losses: classification.losses,
        winPercentage: classification.gamesPlayed > 0 
          ? (classification.wins / classification.gamesPlayed) * 100 
          : 0,
        pointsFor: classification.goalsFor,
        pointsAgainst: classification.goalsAgainst,
        pointsDifference: classification.goalDifference,
        averagePointsScored: classification.gamesPlayed > 0 
          ? classification.goalsFor / classification.gamesPlayed 
          : 0,
        averagePointsConceded: classification.gamesPlayed > 0 
          ? classification.goalsAgainst / classification.gamesPlayed 
          : 0,
        recentForm,
        homeRecord,
        awayRecord,
        points: classification.points,
        position: classification.position
      };
    } catch (error) {
      console.error('Error getting team statistics:', error);
      return null;
    }
  }
}

export default new ClassificationService();