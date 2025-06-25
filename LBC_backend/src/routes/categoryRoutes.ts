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
// import { requireAdminAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Admin routes (no auth)
router.get('/', getAllCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.patch('/:id/toggle', toggleCategoryStatus);

// Public routes
router.get('/active', getActiveCategories);

// Get a single category by ID
router.get('/:id', getCategoryById);

export default router; 