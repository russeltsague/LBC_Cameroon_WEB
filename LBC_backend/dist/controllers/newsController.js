"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleNewsStatus = exports.deleteNews = exports.updateNews = exports.createNews = exports.getNewsById = exports.getPublishedNews = exports.getAllNews = void 0;
const News_1 = __importDefault(require("../models/News"));
// Get all news (admin)
const getAllNews = async (req, res) => {
    try {
        const news = await News_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: news
        });
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news'
        });
    }
};
exports.getAllNews = getAllNews;
// Get published news (public)
const getPublishedNews = async (req, res) => {
    try {
        const { limit = 10, page = 1, category } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        let query = { isPublished: true };
        if (category) {
            query.category = category;
        }
        const news = await News_1.default.find(query)
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await News_1.default.countDocuments(query);
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
    }
    catch (error) {
        console.error('Error fetching published news:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news'
        });
    }
};
exports.getPublishedNews = getPublishedNews;
// Get single news by ID
const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await News_1.default.findById(id);
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
    }
    catch (error) {
        console.error('Error fetching news by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news'
        });
    }
};
exports.getNewsById = getNewsById;
// Create new news
const createNews = async (req, res) => {
    try {
        const { title, content, summary, imageUrl, author, category, tags, isPublished } = req.body;
        const newsData = {
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
        const news = await News_1.default.create(newsData);
        res.status(201).json({
            success: true,
            data: news,
            message: 'News created successfully'
        });
    }
    catch (error) {
        console.error('Error creating news:', error);
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
            message: 'Failed to create news'
        });
    }
};
exports.createNews = createNews;
// Update news
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, summary, imageUrl, author, category, tags, isPublished } = req.body;
        const news = await News_1.default.findById(id);
        if (!news) {
            res.status(404).json({
                success: false,
                message: 'News not found'
            });
            return;
        }
        const updateData = {
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
        }
        else if (!isPublished) {
            updateData.publishedAt = undefined;
        }
        const updatedNews = await News_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: updatedNews,
            message: 'News updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating news:', error);
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
            message: 'Failed to update news'
        });
    }
};
exports.updateNews = updateNews;
// Delete news
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await News_1.default.findById(id);
        if (!news) {
            res.status(404).json({
                success: false,
                message: 'News not found'
            });
            return;
        }
        await News_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'News deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete news'
        });
    }
};
exports.deleteNews = deleteNews;
// Toggle news status
const toggleNewsStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await News_1.default.findById(id);
        if (!news) {
            res.status(404).json({
                success: false,
                message: 'News not found'
            });
            return;
        }
        const newStatus = !news.isPublished;
        const updateData = { isPublished: newStatus };
        if (newStatus) {
            updateData.publishedAt = new Date();
        }
        else {
            updateData.publishedAt = undefined;
        }
        const updatedNews = await News_1.default.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({
            success: true,
            data: updatedNews,
            message: `News ${newStatus ? 'published' : 'unpublished'} successfully`
        });
    }
    catch (error) {
        console.error('Error toggling news status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle news status'
        });
    }
};
exports.toggleNewsStatus = toggleNewsStatus;
