import { Request, Response } from 'express';
import calendarClassificationService from '../services/calendarClassificationService';

// Get classification from database
export const getClassification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category, poule } = req.query;
    
    if (!category) {
      res.status(400).json({
        success: false,
        error: 'Category is required'
      });
      return;
    }

    const classification = await calendarClassificationService.getClassification(category as string, poule as string);

    res.json({
      success: true,
      data: classification,
      category,
      poule: poule || null
    });

  } catch (error: any) {
    console.error('Error getting classification:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get classification'
    });
  }
};

// Calculate classification from calendar data
export const calculateClassificationFromCalendar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category, poule } = req.query;
    
    if (!category) {
      res.status(400).json({
        success: false,
        error: 'Category is required'
      });
      return;
    }

    const classification = await calendarClassificationService.recalculateClassificationFromCalendar(category as string, poule as string);

    res.json({
      success: true,
      data: classification,
      category,
      poule: poule || null
    });

  } catch (error: any) {
    console.error('Error calculating classification from calendar:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate classification from calendar'
    });
  }
};

// Update classification (recalculate from calendar)
export const updateClassification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category, poule } = req.body;
    
    if (!category) {
      res.status(400).json({ 
        success: false,
        error: 'Category is required' 
      });
      return;
    }

    const classification = await calendarClassificationService.recalculateClassificationFromCalendar(category, poule);
    
    res.json({ 
      success: true,
      message: 'Classification recalculated from calendar data',
      data: classification
    });
  } catch (error: any) {
    console.error('Error updating classification:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};