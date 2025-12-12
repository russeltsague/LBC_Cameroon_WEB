"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassification = exports.calculateClassificationFromCalendar = exports.getClassification = void 0;
const calendarClassificationService_1 = __importDefault(require("../services/calendarClassificationService"));
// Get classification from database
const getClassification = async (req, res) => {
    try {
        const { category, poule } = req.query;
        if (!category) {
            res.status(400).json({
                success: false,
                error: 'Category is required'
            });
            return;
        }
        const classification = await calendarClassificationService_1.default.getClassification(category, poule);
        res.json({
            success: true,
            data: classification,
            category,
            poule: poule || null
        });
    }
    catch (error) {
        console.error('Error getting classification:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get classification'
        });
    }
};
exports.getClassification = getClassification;
// Calculate classification from calendar data
const calculateClassificationFromCalendar = async (req, res) => {
    try {
        const { category, poule } = req.query;
        if (!category) {
            res.status(400).json({
                success: false,
                error: 'Category is required'
            });
            return;
        }
        const classification = await calendarClassificationService_1.default.recalculateClassificationFromCalendar(category, poule);
        res.json({
            success: true,
            data: classification,
            category,
            poule: poule || null
        });
    }
    catch (error) {
        console.error('Error calculating classification from calendar:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to calculate classification from calendar'
        });
    }
};
exports.calculateClassificationFromCalendar = calculateClassificationFromCalendar;
// Update classification (recalculate from calendar)
const updateClassification = async (req, res) => {
    try {
        const { category, poule } = req.body;
        if (!category) {
            res.status(400).json({
                success: false,
                error: 'Category is required'
            });
            return;
        }
        const classification = await calendarClassificationService_1.default.recalculateClassificationFromCalendar(category, poule);
        res.json({
            success: true,
            message: 'Classification recalculated from calendar data',
            data: classification
        });
    }
    catch (error) {
        console.error('Error updating classification:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.updateClassification = updateClassification;
