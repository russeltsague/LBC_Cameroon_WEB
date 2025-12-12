import Team from '../models/Team';
import Match from '../models/Match';
import Category from '../models/Category';
import mongoose from 'mongoose';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  details?: any;
}

class ValidationService {
  /**
   * Validate match creation data
   * Checks: team compatibility, scheduling conflicts, self-match prevention, score validation
   */
  async validateMatchCreation(matchData: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!matchData.homeTeam || !matchData.awayTeam) {
      errors.push({
        field: 'teams',
        message: 'Both home and away teams are required',
        code: 'MISSING_TEAMS'
      });
      return { valid: false, errors };
    }

    // Validate self-match
    if (matchData.homeTeam.toString() === matchData.awayTeam.toString()) {
      errors.push({
        field: 'teams',
        message: 'A team cannot play against itself',
        code: 'SELF_MATCH'
      });
    }

    // Validate team compatibility (category and poule)
    const compatibilityResult = await this.validateTeamCompatibility(
      matchData.homeTeam,
      matchData.awayTeam
    );
    if (!compatibilityResult.valid) {
      errors.push(...compatibilityResult.errors);
    }

    // Validate scheduling conflicts
    if (matchData.date && matchData.time) {
      const homeConflict = await this.validateScheduleConflict(
        matchData.homeTeam,
        matchData.date,
        matchData.time,
        matchData._id
      );
      if (homeConflict) {
        errors.push({
          field: 'schedule',
          message: 'Home team already has a match scheduled at this time',
          code: 'SCHEDULING_CONFLICT',
          details: { team: 'home' }
        });
      }

      const awayConflict = await this.validateScheduleConflict(
        matchData.awayTeam,
        matchData.date,
        matchData.time,
        matchData._id
      );
      if (awayConflict) {
        errors.push({
          field: 'schedule',
          message: 'Away team already has a match scheduled at this time',
          code: 'SCHEDULING_CONFLICT',
          details: { team: 'away' }
        });
      }
    }

    // Validate scores if provided
    if (matchData.homeScore !== undefined || matchData.awayScore !== undefined) {
      const scoresResult = this.validateScores(matchData.homeScore, matchData.awayScore);
      if (!scoresResult.valid) {
        errors.push(...scoresResult.errors);
      }
    }

    // Validate journée
    if (matchData.journee !== undefined) {
      const journeeResult = this.validateJournee(matchData.journee);
      if (!journeeResult.valid) {
        errors.push(...journeeResult.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate that two teams are compatible for a match
   * Teams must be from the same category and same poule (if applicable)
   */
  async validateTeamCompatibility(
    homeTeamId: string | mongoose.Types.ObjectId,
    awayTeamId: string | mongoose.Types.ObjectId
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      const homeTeam = await Team.findById(homeTeamId);
      const awayTeam = await Team.findById(awayTeamId);

      if (!homeTeam || !awayTeam) {
        errors.push({
          field: 'teams',
          message: 'One or both teams not found',
          code: 'TEAM_NOT_FOUND'
        });
        return { valid: false, errors };
      }

      // Check category match
      if (homeTeam.category !== awayTeam.category) {
        errors.push({
          field: 'category',
          message: 'Teams must be from the same category',
          code: 'CATEGORY_MISMATCH',
          details: {
            homeCategory: homeTeam.category,
            awayCategory: awayTeam.category
          }
        });
      }

      // Check poule match for categories that require poules
      const category = await Category.findOne({ name: homeTeam.category });
      if (category?.hasPoules) {
        if (homeTeam.poule !== awayTeam.poule) {
          errors.push({
            field: 'poule',
            message: 'Teams must be from the same poule',
            code: 'POULE_MISMATCH',
            details: {
              homePoule: homeTeam.poule,
              awayPoule: awayTeam.poule
            }
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      errors.push({
        field: 'teams',
        message: 'Error validating team compatibility',
        code: 'VALIDATION_ERROR',
        details: { error: error.message }
      });
      return { valid: false, errors };
    }
  }

  /**
   * Check if a team has a scheduling conflict at the given date and time
   */
  async validateScheduleConflict(
    teamId: string | mongoose.Types.ObjectId,
    date: Date,
    time: string,
    excludeMatchId?: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    try {
      const matchDate = new Date(date);
      matchDate.setHours(0, 0, 0, 0);

      const query: any = {
        $or: [
          { homeTeam: teamId },
          { awayTeam: teamId }
        ],
        date: matchDate,
        time: time,
        status: { $ne: 'completed' } // Only check upcoming and live matches
      };

      // Exclude current match if updating
      if (excludeMatchId) {
        query._id = { $ne: excludeMatchId };
      }

      const conflictingMatch = await Match.findOne(query);
      return conflictingMatch !== null;
    } catch (error) {
      console.error('Error checking schedule conflict:', error);
      return false;
    }
  }

  /**
   * Validate match scores
   * Scores must be non-negative integers
   */
  validateScores(homeScore: number, awayScore: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (homeScore !== undefined && homeScore !== null) {
      if (!Number.isInteger(homeScore) || homeScore < 0) {
        errors.push({
          field: 'homeScore',
          message: 'Home score must be a non-negative integer',
          code: 'INVALID_SCORE'
        });
      }
    }

    if (awayScore !== undefined && awayScore !== null) {
      if (!Number.isInteger(awayScore) || awayScore < 0) {
        errors.push({
          field: 'awayScore',
          message: 'Away score must be a non-negative integer',
          code: 'INVALID_SCORE'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate journée (matchday) number
   * Must be a positive integer
   */
  validateJournee(journee: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Number.isInteger(journee) || journee < 1) {
      errors.push({
        field: 'journee',
        message: 'Journée must be a positive integer (minimum 1)',
        code: 'INVALID_JOURNEE'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate category and poule configuration
   */
  async validateCategoryPoule(category: string, poule?: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      const categoryDoc = await Category.findOne({ name: category });
      
      if (!categoryDoc) {
        errors.push({
          field: 'category',
          message: 'Category not found',
          code: 'CATEGORY_NOT_FOUND'
        });
        return { valid: false, errors };
      }

      if (categoryDoc.hasPoules && !poule) {
        errors.push({
          field: 'poule',
          message: 'Poule is required for this category',
          code: 'MISSING_POULE'
        });
      }

      if (categoryDoc.hasPoules && poule && !categoryDoc.poules.includes(poule)) {
        errors.push({
          field: 'poule',
          message: `Invalid poule for category ${category}`,
          code: 'INVALID_POULE',
          details: { validPoules: categoryDoc.poules }
        });
      }

      if (!categoryDoc.hasPoules && poule) {
        errors.push({
          field: 'poule',
          message: 'This category does not use poules',
          code: 'POULE_NOT_ALLOWED'
        });
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      errors.push({
        field: 'category',
        message: 'Error validating category and poule',
        code: 'VALIDATION_ERROR',
        details: { error: error.message }
      });
      return { valid: false, errors };
    }
  }

  /**
   * Validate that sufficient teams exist for schedule generation
   */
  async validateSufficientTeams(category: string, poule?: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      const query: any = { category };
      if (poule) {
        query.poule = poule;
      }

      const teamCount = await Team.countDocuments(query);

      if (teamCount < 2) {
        errors.push({
          field: 'teams',
          message: 'At least 2 teams are required to generate a schedule',
          code: 'INSUFFICIENT_TEAMS',
          details: { teamCount }
        });
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      errors.push({
        field: 'teams',
        message: 'Error checking team count',
        code: 'VALIDATION_ERROR',
        details: { error: error.message }
      });
      return { valid: false, errors };
    }
  }
}

export default new ValidationService();
