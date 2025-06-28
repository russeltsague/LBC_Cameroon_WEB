"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const newsController_1 = require("../controllers/newsController");
// import { requireAdminAuth } from '../middleware/authMiddleware';
const router = express_1.default.Router();
// Admin routes (no auth)
router.get('/admin', newsController_1.getAllNews);
router.post('/', newsController_1.createNews);
router.put('/:id', newsController_1.updateNews);
router.delete('/:id', newsController_1.deleteNews);
router.patch('/:id/toggle', newsController_1.toggleNewsStatus);
// Public routes
router.get('/', newsController_1.getPublishedNews);
router.get('/:id', newsController_1.getNewsById);
exports.default = router;
