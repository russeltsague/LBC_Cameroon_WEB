import { Request, Response } from 'express';
import Report, { IReport } from '../models/Report';

// Get all reports
export const getAllReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, season, isActive } = req.query;
    
    const query: any = {};
    if (season) query.season = season;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get report by ID
export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    
    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create new report
export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportData = req.body;
    
    const report = new Report(reportData);
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update report
export const updateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete report
export const deleteReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get latest active reports for home page
export const getLatestReports = async (req: Request, res: Response): Promise<void> => {
  try {
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({ error: 'Request timeout' });
      }
    }, 20000); // 20 second timeout for reports

    const { limit = 3 } = req.query;

    const reports = await Report.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    clearTimeout(timeout);
    
    if (!res.headersSent) {
      res.json({
        success: true,
        data: reports
      });
    }
  } catch (error) {
    console.error('Error fetching latest reports:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch latest reports'
      });
    }
  }
};

// Toggle report active status
export const toggleReportStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    
    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
      return;
    }

    report.isActive = !report.isActive;
    await report.save();

    res.json({
      success: true,
      message: `Report ${report.isActive ? 'activated' : 'deactivated'} successfully`,
      data: report
    });
  } catch (error) {
    console.error('Error toggling report status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling report status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
