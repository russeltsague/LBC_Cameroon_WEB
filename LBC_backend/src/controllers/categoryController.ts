import { Request, Response } from 'express';
import Category, { ICategory } from '../models/Category';
import Team from '../models/Team';
import Match from '../models/Match';

// Get all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    // Move 'CORPORATES' to the end
    const sortedCategories = categories.sort((a, b) => {
      if (a.name === 'CORPORATES') return 1;
      if (b.name === 'CORPORATES') return -1;
      return 0;
    });
    res.json({
      success: true,
      data: sortedCategories
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get active categories only
export const getActiveCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    // Move 'CORPORATES' to the end
    const sortedCategories = categories.sort((a, b) => {
      if (a.name === 'CORPORATES') return 1;
      if (b.name === 'CORPORATES') return -1;
      return 0;
    });
    res.json({
      success: true,
      data: sortedCategories
    });
  } catch (error: any) {
    console.error('Error fetching active categories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get a single category by ID
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

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
  } catch (error: any) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
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
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
      return;
    }

    // Validation removed: Allow creating category with hasPoules=true but no poules yet

    // Validation removed: We will automatically set poules to [] if hasPoules is false


    const categoryData = {
      name: name.trim(),
      description: description?.trim(),
      hasPoules: hasPoules || false,
      poules: hasPoules ? poules : []
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, hasPoules, poules, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found'
      });
      return;
    }

    // Check if name is being changed and if it conflicts with existing category
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
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

    // Validation removed: Allow updating category with hasPoules=true but no poules yet


    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (hasPoules !== undefined) updateData.hasPoules = hasPoules;
    if (poules !== undefined) updateData.poules = hasPoules ? poules : [];
    if (isActive !== undefined) updateData.isActive = isActive;

    console.log('Updating category with data:', updateData);

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: false } // Disable validators temporarily
    );

    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found'
      });
      return;
    }

    // Check if category is being used by teams
    const teamsCount = await Team.countDocuments({ category: category.name });
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
    const matchesCount = await Match.countDocuments({ category: category.name });
    if (matchesCount > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete category with scheduled matches',
        code: 'CATEGORY_IN_USE',
        details: { matchesCount }
      });
      return;
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Toggle category active status
export const toggleCategoryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
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
  } catch (error: any) {
    console.error('Error toggling category status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 