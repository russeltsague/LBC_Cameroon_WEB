import { Request, Response } from 'express';
import News, { INews } from '../models/News';

// Get all news (admin)
export const getAllNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
};

// Get published news (public)
export const getPublishedNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10, page = 1, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let query: any = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    const news = await News.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await News.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching published news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
};

// Get single news by ID
export const getNewsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const news = await News.findById(id);
    
    if (!news) {
      res.status(404).json({
        success: false,
        message: 'News not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
};

// Create new news
export const createNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      content,
      summary,
      imageUrl,
      author,
      category,
      tags,
      isPublished
    } = req.body;
    
    const newsData: Partial<INews> = {
      title,
      content,
      summary,
      imageUrl,
      author,
      category,
      tags: tags || [],
      isPublished: isPublished || false
    };
    
    // Set publishedAt if publishing
    if (isPublished) {
      newsData.publishedAt = new Date();
    }
    
    const news = await News.create(newsData);
    
    res.status(201).json({
      success: true,
      data: news,
      message: 'News created successfully'
    });
  } catch (error: any) {
    console.error('Error creating news:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create news'
    });
  }
};

// Update news
export const updateNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      summary,
      imageUrl,
      author,
      category,
      tags,
      isPublished
    } = req.body;
    
    const news = await News.findById(id);
    
    if (!news) {
      res.status(404).json({
        success: false,
        message: 'News not found'
      });
      return;
    }
    
    const updateData: Partial<INews> = {
      title,
      content,
      summary,
      imageUrl,
      author,
      category,
      tags: tags || [],
      isPublished
    };
    
    // Handle publishedAt logic
    if (isPublished && !news.isPublished) {
      updateData.publishedAt = new Date();
    } else if (!isPublished) {
      updateData.publishedAt = undefined;
    }
    
    const updatedNews = await News.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedNews,
      message: 'News updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating news:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update news'
    });
  }
};

// Delete news
export const deleteNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const news = await News.findById(id);
    
    if (!news) {
      res.status(404).json({
        success: false,
        message: 'News not found'
      });
      return;
    }
    
    await News.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news'
    });
  }
};

// Toggle news status
export const toggleNewsStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const news = await News.findById(id);
    
    if (!news) {
      res.status(404).json({
        success: false,
        message: 'News not found'
      });
      return;
    }
    
    const newStatus = !news.isPublished;
    const updateData: any = { isPublished: newStatus };
    
    if (newStatus) {
      updateData.publishedAt = new Date();
    } else {
      updateData.publishedAt = undefined;
    }
    
    const updatedNews = await News.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedNews,
      message: `News ${newStatus ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    console.error('Error toggling news status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle news status'
    });
  }
}; 