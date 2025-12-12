import express from 'express';
import {
  getAllNews,
  getPublishedNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  toggleNewsStatus
} from '../controllers/newsController';
// import { requireAdminAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Admin routes (no auth)
router.get('/admin', getAllNews);
router.post('/', createNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);
router.patch('/:id/toggle', toggleNewsStatus);

// Public routes
router.get('/', getPublishedNews);
router.get('/:id', getNewsById);

export default router; 