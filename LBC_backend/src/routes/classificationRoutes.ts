import express from 'express';
import { getClassification, updateClassification, calculateClassificationFromCalendar } from '../controllers/classificationController';

const router = express.Router();

// Get all classifications or filter by category
router.get('/', getClassification);

// Calculate classification from calendar data
router.get('/calendar', calculateClassificationFromCalendar);

// Update classification after a match
router.post('/update', updateClassification);

export default router;