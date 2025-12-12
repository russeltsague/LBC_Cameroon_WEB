import { Router } from 'express';
import { convertScoreFields } from '../controllers/migrationController';

const router = Router();

// Convert score fields from "63-21" format to separate homeScore/awayScore
router.post('/convert-scores', convertScoreFields);

export default router;
