import express from 'express';
import {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getLatestReports,
  toggleReportStatus
} from '../controllers/reportController';

const router = express.Router();

// GET /api/reports/latest - Get latest active reports for home page
router.get('/latest', getLatestReports);

// GET /api/reports - Get all reports with pagination and filters
router.get('/', getAllReports);

// GET /api/reports/:id - Get report by ID
router.get('/:id', getReportById);

// POST /api/reports - Create new report
router.post('/', createReport);

// PUT /api/reports/:id - Update report
router.put('/:id', updateReport);

// DELETE /api/reports/:id - Delete report
router.delete('/:id', deleteReport);

// PATCH /api/reports/:id/toggle - Toggle report active status
router.patch('/:id/toggle', toggleReportStatus);

export default router;
