"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
// import { requireAdminAuth } from '../middleware/authMiddleware';
const router = express_1.default.Router();
// Admin routes (no auth)
router.get('/', categoryController_1.getAllCategories);
router.post('/', categoryController_1.createCategory);
router.put('/:id', categoryController_1.updateCategory);
router.delete('/:id', categoryController_1.deleteCategory);
router.patch('/:id/toggle', categoryController_1.toggleCategoryStatus);
// Public routes
router.get('/active', categoryController_1.getActiveCategories);
// Get a single category by ID
router.get('/:id', categoryController_1.getCategoryById);
exports.default = router;
