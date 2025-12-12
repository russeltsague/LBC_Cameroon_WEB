import express from 'express';
import { getClassification, updateClassification } from '../controllers/classificationController';

const router = express.Router();

// Get all classifications or filter by category
router.get('/', getClassification);

// Update classification after a match
router.post('/update', updateClassification);

export default router;