import { Request, Response } from 'express';
import schedulerService from '../services/schedulerService';
import validationService from '../services/validationService';

/**
 * Generate schedule preview
 * POST /api/schedules/generate
 */
export const generateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, poule, startDate, daysBetweenMatches, timeSlots, defaultVenue } = req.body;

    // Validate required fields
    if (!category || !startDate || !daysBetweenMatches || !timeSlots || timeSlots.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: category, startDate, daysBetweenMatches, timeSlots'
      });
      return;
    }

    // Validate category and poule
    const categoryValidation = await validationService.validateCategoryPoule(category, poule);
    if (!categoryValidation.valid) {
      res.status(400).json({
        success: false,
        error: 'Invalid category or poule',
        details: categoryValidation.errors
      });
      return;
    }

    // Validate sufficient teams
    const teamsValidation = await validationService.validateSufficientTeams(category, poule);
    if (!teamsValidation.valid) {
      res.status(400).json({
        success: false,
        error: 'Insufficient teams',
        details: teamsValidation.errors
      });
      return;
    }

    // Generate schedule
    const preview = await schedulerService.generateSchedule({
      category,
      poule,
      startDate: new Date(startDate),
      daysBetweenMatches: parseInt(daysBetweenMatches),
      timeSlots,
      defaultVenue
    });

    res.json({
      success: true,
      data: preview
    });
  } catch (error: any) {
    console.error('Error generating schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate schedule'
    });
  }
};

/**
 * Save generated schedule
 * POST /api/schedules/save
 */
export const saveSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { preview } = req.body;

    if (!preview || !preview.matches || preview.matches.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No schedule preview provided'
      });
      return;
    }

    // Save schedule
    const savedMatches = await schedulerService.saveSchedule(preview);

    res.json({
      success: true,
      message: `Successfully saved ${savedMatches.length} matches`,
      data: {
        matchCount: savedMatches.length,
        category: preview.category,
        poule: preview.poule
      }
    });
  } catch (error: any) {
    console.error('Error saving schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save schedule'
    });
  }
};

/**
 * Get schedule preview for a category/poule
 * GET /api/schedules/preview/:category
 */
export const getSchedulePreview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { poule } = req.query;

    const matches = await schedulerService.getSchedulePreview(
      category,
      poule as string | undefined
    );

    res.json({
      success: true,
      data: matches
    });
  } catch (error: any) {
    console.error('Error getting schedule preview:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get schedule preview'
    });
  }
};

/**
 * Delete schedule for a category/poule
 * DELETE /api/schedules/:category
 */
export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { poule } = req.query;

    const deletedCount = await schedulerService.deleteSchedule(
      category,
      poule as string | undefined
    );

    res.json({
      success: true,
      message: `Deleted ${deletedCount} matches`,
      data: { deletedCount }
    });
  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete schedule'
    });
  }
};
