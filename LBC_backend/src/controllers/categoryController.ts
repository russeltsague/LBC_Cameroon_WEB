import { Request, Response } from 'express';
import Category, { ICategory } from '../models/Category';

// Get all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    res.json({ 
      success: true,
      data: categories 
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
    
    res.json({ 
      success: true,
      data: categories 
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
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (hasPoules !== undefined) updateData.hasPoules = hasPoules;
    if (poules !== undefined) updateData.poules = hasPoules ? poules : [];
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
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
    
    // Check if category is being used by teams or matches
    // This would require additional queries to Team and Match models
    // For now, we'll just delete the category
    
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