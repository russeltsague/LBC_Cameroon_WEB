import Team, { ITeam } from '../models/Team';
import Category from '../models/Category';
import validationService from './validationService';

export interface BulkImportResult {
  successful: number;
  failed: number;
  errors: ImportError[];
  importedTeams: ITeam[];
  skipped: number;
}

export interface ImportError {
  row: number;
  teamName: string;
  error: string;
  code: string;
}

class BulkImportService {
  /**
   * Import teams from JSON data
   */
  async importTeams(teamsData: any[]): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      successful: 0,
      failed: 0,
      errors: [],
      importedTeams: [],
      skipped: 0
    };

    for (let i = 0; i < teamsData.length; i++) {
      const teamData = teamsData[i];
      const rowNumber = i + 1;

      try {
        // Validate team data
        const validation = await this.validateTeamData(teamData, rowNumber);
        if (!validation.valid) {
          result.failed++;
          result.errors.push(...validation.errors);
          continue;
        }

        // Check for duplicates
        const existingTeam = await Team.findOne({
          name: teamData.name,
          category: teamData.category,
          ...(teamData.poule && { poule: teamData.poule })
        });

        if (existingTeam) {
          result.skipped++;
          result.errors.push({
            row: rowNumber,
            teamName: teamData.name,
            error: 'Team already exists in this category/poule',
            code: 'DUPLICATE_TEAM'
          });
          continue;
        }

        // Create team
        const team = await Team.create({
          name: teamData.name,
          city: teamData.city,
          arena: teamData.arena,
          coach: teamData.coach,
          about: teamData.about,
          category: teamData.category,
          poule: teamData.poule,
          logo: teamData.logo || '/default-logo.png',
          founded: teamData.founded || new Date().getFullYear(),
          championships: teamData.championships || 0
        });

        result.successful++;
        result.importedTeams.push(team);
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          teamName: teamData.name || 'Unknown',
          error: error.message || 'Unknown error occurred',
          code: 'IMPORT_ERROR'
        });
      }
    }

    return result;
  }

  /**
   * Validate team data for import
   */
  private async validateTeamData(teamData: any, rowNumber: number): Promise<{
    valid: boolean;
    errors: ImportError[];
  }> {
    const errors: ImportError[] = [];
    const teamName = teamData.name || 'Unknown';

    // Check required fields
    const requiredFields = ['name', 'category', 'city', 'arena', 'coach', 'about'];
    for (const field of requiredFields) {
      if (!teamData[field] || teamData[field].toString().trim() === '') {
        errors.push({
          row: rowNumber,
          teamName,
          error: `Missing required field: ${field}`,
          code: 'MISSING_REQUIRED_FIELD'
        });
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Validate category exists
    const category = await Category.findOne({ name: teamData.category });
    if (!category) {
      errors.push({
        row: rowNumber,
        teamName,
        error: `Invalid category: ${teamData.category}`,
        code: 'INVALID_CATEGORY'
      });
      return { valid: false, errors };
    }

    // Validate poule if category requires it
    if (category.hasPoules) {
      if (!teamData.poule) {
        errors.push({
          row: rowNumber,
          teamName,
          error: `Poule is required for category ${teamData.category}`,
          code: 'MISSING_POULE'
        });
      } else if (!category.poules.includes(teamData.poule)) {
        errors.push({
          row: rowNumber,
          teamName,
          error: `Invalid poule '${teamData.poule}' for category ${teamData.category}. Valid poules: ${category.poules.join(', ')}`,
          code: 'INVALID_POULE'
        });
      }
    } else if (teamData.poule) {
      errors.push({
        row: rowNumber,
        teamName,
        error: `Category ${teamData.category} does not use poules`,
        code: 'POULE_NOT_ALLOWED'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse JSON file content
   */
  parseJSONFile(fileContent: string): any[] {
    try {
      const data = JSON.parse(fileContent);
      
      if (!Array.isArray(data)) {
        throw new Error('JSON file must contain an array of teams');
      }

      return data;
    } catch (error: any) {
      throw new Error(`Failed to parse JSON file: ${error.message}`);
    }
  }

  /**
   * Generate sample JSON template
   */
  generateSampleTemplate(): any[] {
    return [
      {
        name: "Team Name",
        category: "L1 MESSIEUR",
        poule: "A",
        city: "City Name",
        arena: "Arena Name",
        coach: "Coach Name",
        about: "Team description and history",
        logo: "/path/to/logo.png",
        founded: 2020,
        championships: 0
      },
      {
        name: "Another Team",
        category: "L2A MESSIEUR",
        poule: "B",
        city: "Another City",
        arena: "Another Arena",
        coach: "Another Coach",
        about: "Another team description",
        logo: "/path/to/logo.png",
        founded: 2018,
        championships: 2
      }
    ];
  }
}

export default new BulkImportService();
