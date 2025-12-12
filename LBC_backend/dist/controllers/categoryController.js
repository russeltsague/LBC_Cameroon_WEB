"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCategoryStatus = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getActiveCategories = exports.getAllCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const Team_1 = __importDefault(require("../models/Team"));
const Match_1 = __importDefault(require("../models/Match"));
// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category_1.default.find().sort({ name: 1 });
        // Move 'CORPORATES' to the end
        const sortedCategories = categories.sort((a, b) => {
            if (a.name === 'CORPORATES')
                return 1;
            if (b.name === 'CORPORATES')
                return -1;
            return 0;
        });
        res.json({
            success: true,
            data: sortedCategories
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.getAllCategories = getAllCategories;
// Get active categories only
const getActiveCategories = async (req, res) => {
    try {
        const categories = await Category_1.default.find({ isActive: true }).sort({ name: 1 });
        // Move 'CORPORATES' to the end
        const sortedCategories = categories.sort((a, b) => {
            if (a.name === 'CORPORATES')
                return 1;
            if (b.name === 'CORPORATES')
                return -1;
            return 0;
        });
        res.json({
            success: true,
            data: sortedCategories
        });
    }
    catch (error) {
        console.error('Error fetching active categories:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.getActiveCategories = getActiveCategories;
// Get a single category by ID
const getCategoryById = async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({
                success: false,
                error: 'Category not found'
            });
            return;
        }
        res.json({
            success: true,
            data: category
        });
    }
    catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.getCategoryById = getCategoryById;
// Create a new category
const createCategory = async (req, res) => {
    try {
        const { name, description, hasPoules, poules } = req.body;
        // Validate required fields
        if (!name) {
            res.status(400).json({
                success: false,
                error: 'Category name is required'
            });
            return;
        }
        // Check if category already exists
        const existingCategory = await Category_1.default.findOne({ name: name.trim() });
        if (existingCategory) {
            res.status(400).json({
                success: false,
                error: 'Category with this name already exists'
            });
            return;
        }
        // Validate poules configuration
        if (hasPoules && (!poules || poules.length === 0)) {
            res.status(400).json({
                success: false,
                error: 'Poules are required when hasPoules is true'
            });
            return;
        }
        if (!hasPoules && poules && poules.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Poules should not be provided when hasPoules is false'
            });
            return;
        }
        const categoryData = {
            name: name.trim(),
            description: description?.trim(),
            hasPoules: hasPoules || false,
            poules: hasPoules ? poules : []
        };
        const category = await Category_1.default.create(categoryData);
        res.status(201).json({
            success: true,
            data: category
        });
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.createCategory = createCategory;
// Update a category
const updateCategory = async (req, res) => {
    try {
        const { name, description, hasPoules, poules, isActive } = req.body;
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({
                success: false,
                error: 'Category not found'
            });
            return;
        }
        // Check if name is being changed and if it conflicts with existing category
        if (name && name.trim() !== category.name) {
            const existingCategory = await Category_1.default.findOne({
                name: name.trim(),
                _id: { $ne: req.params.id }
            });
            if (existingCategory) {
                res.status(400).json({
                    success: false,
                    error: 'Category with this name already exists'
                });
                return;
            }
        }
        // Validate poules configuration
        if (hasPoules && (!poules || poules.length === 0)) {
            res.status(400).json({
                success: false,
                error: 'Poules are required when hasPoules is true'
            });
            return;
        }
        if (!hasPoules && poules && poules.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Poules should not be provided when hasPoules is false'
            });
            return;
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name.trim();
        if (description !== undefined)
            updateData.description = description?.trim();
        if (hasPoules !== undefined)
            updateData.hasPoules = hasPoules;
        if (poules !== undefined)
            updateData.poules = hasPoules ? poules : [];
        if (isActive !== undefined)
            updateData.isActive = isActive;
        console.log('Updating category with data:', updateData);
        const updatedCategory = await Category_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: false } // Disable validators temporarily
        );
        res.json({
            success: true,
            data: updatedCategory
        });
    }
    catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.updateCategory = updateCategory;
// Delete a category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({
                success: false,
                error: 'Category not found'
            });
            return;
        }
        // Check if category is being used by teams
        const teamsCount = await Team_1.default.countDocuments({ category: category.name });
        if (teamsCount > 0) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete category with existing teams',
                code: 'CATEGORY_IN_USE',
                details: { teamsCount }
            });
            return;
        }
        // Check if category is being used by matches
        const matchesCount = await Match_1.default.countDocuments({ category: category.name });
        if (matchesCount > 0) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete category with scheduled matches',
                code: 'CATEGORY_IN_USE',
                details: { matchesCount }
            });
            return;
        }
        await Category_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.deleteCategory = deleteCategory;
// Toggle category active status
const toggleCategoryStatus = async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({
                success: false,
                error: 'Category not found'
            });
            return;
        }
        category.isActive = !category.isActive;
        await category.save();
        res.json({
            success: true,
            data: category
        });
    }
    catch (error) {
        console.error('Error toggling category status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
exports.toggleCategoryStatus = toggleCategoryStatus;
