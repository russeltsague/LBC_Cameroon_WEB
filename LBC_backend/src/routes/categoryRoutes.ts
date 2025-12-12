import express from 'express';
import {
  getAllCategories,
  getActiveCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/categoryController';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes (no auth required)
router.get('/active', getActiveCategories);

// Apply admin authentication to protected routes
router.use(authenticateAdmin);

// Admin routes (protected)
router.get('/', getAllCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.patch('/:id/toggle', toggleCategoryStatus);

// Get a single category by ID
router.get('/:id', getCategoryById);

export default router;