import express from 'express';
import {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  bulkImportTeams,
  getBulkImportTemplate
} from '../controllers/teamController';

const router = express.Router();

// Bulk import routes (must come before /:id routes)
router.post('/bulk-import', bulkImportTeams);
router.get('/bulk-import/template', getBulkImportTemplate);

// Standard CRUD routes
router.get('/', getTeams);
router.get('/:id', getTeam);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

export default router;