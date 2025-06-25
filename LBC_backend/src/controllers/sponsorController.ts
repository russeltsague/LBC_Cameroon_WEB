import { Request, Response } from 'express';
import Sponsor, { ISponsor } from '../models/Sponsor';

// Get all sponsors (admin)
export const getAllSponsors = async (req: Request, res: Response): Promise<void> => {
  try {
    const sponsors = await Sponsor.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: sponsors
    });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsors'
    });
  }
};

// Get active sponsors (public)
export const getActiveSponsors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level } = req.query;
    
    let query: any = { isActive: true };
    
    if (level) {
      query.sponsorshipLevel = level;
    }
    
    const sponsors = await Sponsor.find(query).sort({ sponsorshipLevel: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: sponsors
    });
  } catch (error) {
    console.error('Error fetching active sponsors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsors'
    });
  }
};

// Get single sponsor by ID
export const getSponsorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const sponsor = await Sponsor.findById(id);
    
    if (!sponsor) {
      res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    console.error('Error fetching sponsor by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsor'
    });
  }
};

// Create new sponsor
export const createSponsor = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      logoUrl,
      websiteUrl,
      contactEmail,
      contactPhone,
      sponsorshipLevel,
      isActive,
      startDate,
      endDate
    } = req.body;
    
    const sponsorData: Partial<ISponsor> = {
      name,
      description,
      logoUrl,
      websiteUrl,
      contactEmail,
      contactPhone,
      sponsorshipLevel,
      isActive: isActive || false,
      startDate,
      endDate
    };
    
    const sponsor = await Sponsor.create(sponsorData);
    
    res.status(201).json({
      success: true,
      data: sponsor,
      message: 'Sponsor created successfully'
    });
  } catch (error: any) {
    console.error('Error creating sponsor:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create sponsor'
    });
  }
};

// Update sponsor
export const updateSponsor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      logoUrl,
      websiteUrl,
      contactEmail,
      contactPhone,
      sponsorshipLevel,
      isActive,
      startDate,
      endDate
    } = req.body;
    
    const sponsor = await Sponsor.findById(id);
    
    if (!sponsor) {
      res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
      return;
    }
    
    const updateData: Partial<ISponsor> = {
      name,
      description,
      logoUrl,
      websiteUrl,
      contactEmail,
      contactPhone,
      sponsorshipLevel,
      isActive,
      startDate,
      endDate
    };
    
    const updatedSponsor = await Sponsor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedSponsor,
      message: 'Sponsor updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating sponsor:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update sponsor'
    });
  }
};

// Delete sponsor
export const deleteSponsor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const sponsor = await Sponsor.findById(id);
    
    if (!sponsor) {
      res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
      return;
    }
    
    await Sponsor.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Sponsor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sponsor'
    });
  }
};

// Toggle sponsor status
export const toggleSponsorStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const sponsor = await Sponsor.findById(id);
    
    if (!sponsor) {
      res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
      return;
    }
    
    const newStatus = !sponsor.isActive;
    
    const updatedSponsor = await Sponsor.findByIdAndUpdate(
      id,
      { isActive: newStatus },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedSponsor,
      message: `Sponsor ${newStatus ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling sponsor status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle sponsor status'
    });
  }
}; 