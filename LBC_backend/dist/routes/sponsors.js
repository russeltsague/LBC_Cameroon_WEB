"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sponsorController_1 = require("../controllers/sponsorController");
// import { requireAdminAuth } from '../middleware/authMiddleware';
const router = express_1.default.Router();
// Admin routes (no auth)
router.get('/admin', sponsorController_1.getAllSponsors);
router.post('/', sponsorController_1.createSponsor);
router.put('/:id', sponsorController_1.updateSponsor);
router.delete('/:id', sponsorController_1.deleteSponsor);
router.patch('/:id/toggle', sponsorController_1.toggleSponsorStatus);
// Public routes
router.get('/', sponsorController_1.getActiveSponsors);
router.get('/:id', sponsorController_1.getSponsorById);
exports.default = router;
