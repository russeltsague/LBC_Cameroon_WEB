"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleSponsorStatus = exports.deleteSponsor = exports.updateSponsor = exports.createSponsor = exports.getSponsorById = exports.getActiveSponsors = exports.getAllSponsors = void 0;
const Sponsor_1 = __importDefault(require("../models/Sponsor"));
// Get all sponsors (admin)
const getAllSponsors = async (req, res) => {
    try {
        const sponsors = await Sponsor_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: sponsors
        });
    }
    catch (error) {
        console.error('Error fetching sponsors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sponsors'
        });
    }
};
exports.getAllSponsors = getAllSponsors;
// Get active sponsors (public)
const getActiveSponsors = async (req, res) => {
    try {
        const { level } = req.query;
        let query = { isActive: true };
        if (level) {
            query.sponsorshipLevel = level;
        }
        const sponsors = await Sponsor_1.default.find(query).sort({ sponsorshipLevel: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            data: sponsors
        });
    }
    catch (error) {
        console.error('Error fetching active sponsors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sponsors'
        });
    }
};
exports.getActiveSponsors = getActiveSponsors;
// Get single sponsor by ID
const getSponsorById = async (req, res) => {
    try {
        const { id } = req.params;
        const sponsor = await Sponsor_1.default.findById(id);
        if (!sponsor) {
            res.status(404).json({
                success: false,
                message: 'Sponsor not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: sponsor
        });
    }
    catch (error) {
        console.error('Error fetching sponsor by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sponsor'
        });
    }
};
exports.getSponsorById = getSponsorById;
// Create new sponsor
const createSponsor = async (req, res) => {
    try {
        const { name, description, logoUrl, websiteUrl, contactEmail, contactPhone, sponsorshipLevel, isActive, startDate, endDate } = req.body;
        const sponsorData = {
            name,
            description,
            logoUrl,
            websiteUrl,
            contactEmail,
            contactPhone,
            sponsorshipLevel,
            isActive: isActive || false,
            startDate,
            endDate
        };
        const sponsor = await Sponsor_1.default.create(sponsorData);
        res.status(201).json({
            success: true,
            data: sponsor,
            message: 'Sponsor created successfully'
        });
    }
    catch (error) {
        console.error('Error creating sponsor:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create sponsor'
        });
    }
};
exports.createSponsor = createSponsor;
// Update sponsor
const updateSponsor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, logoUrl, websiteUrl, contactEmail, contactPhone, sponsorshipLevel, isActive, startDate, endDate } = req.body;
        const sponsor = await Sponsor_1.default.findById(id);
        if (!sponsor) {
            res.status(404).json({
                success: false,
                message: 'Sponsor not found'
            });
            return;
        }
        const updateData = {
            name,
            description,
            logoUrl,
            websiteUrl,
            contactEmail,
            contactPhone,
            sponsorshipLevel,
            isActive,
            startDate,
            endDate
        };
        const updatedSponsor = await Sponsor_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: updatedSponsor,
            message: 'Sponsor updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating sponsor:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update sponsor'
        });
    }
};
exports.updateSponsor = updateSponsor;
// Delete sponsor
const deleteSponsor = async (req, res) => {
    try {
        const { id } = req.params;
        const sponsor = await Sponsor_1.default.findById(id);
        if (!sponsor) {
            res.status(404).json({
                success: false,
                message: 'Sponsor not found'
            });
            return;
        }
        await Sponsor_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Sponsor deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting sponsor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete sponsor'
        });
    }
};
exports.deleteSponsor = deleteSponsor;
// Toggle sponsor status
const toggleSponsorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const sponsor = await Sponsor_1.default.findById(id);
        if (!sponsor) {
            res.status(404).json({
                success: false,
                message: 'Sponsor not found'
            });
            return;
        }
        const newStatus = !sponsor.isActive;
        const updatedSponsor = await Sponsor_1.default.findByIdAndUpdate(id, { isActive: newStatus }, { new: true });
        res.status(200).json({
            success: true,
            data: updatedSponsor,
            message: `Sponsor ${newStatus ? 'activated' : 'deactivated'} successfully`
        });
    }
    catch (error) {
        console.error('Error toggling sponsor status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle sponsor status'
        });
    }
};
exports.toggleSponsorStatus = toggleSponsorStatus;
