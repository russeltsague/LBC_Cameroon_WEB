import express from 'express';
import {
  getAllSponsors,
  getActiveSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  toggleSponsorStatus
} from '../controllers/sponsorController';
// import { requireAdminAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Admin routes (no auth)
router.get('/admin', getAllSponsors);
router.post('/', createSponsor);
router.put('/:id', updateSponsor);
router.delete('/:id', deleteSponsor);
router.patch('/:id/toggle', toggleSponsorStatus);

// Public routes
router.get('/', getActiveSponsors);
router.get('/:id', getSponsorById);

export default router; 