"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AdminUser_1 = __importDefault(require("../models/AdminUser"));
const router = express_1.default.Router();
// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, message: 'Access token required' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            res.status(403).json({ success: false, message: 'Invalid or expired token' });
            return;
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// Register new admin user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Check if user already exists
        const existingUser = await AdminUser_1.default.findOne({ username });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
            return;
        }
        // Create new admin user
        const adminUser = new AdminUser_1.default({ username, password });
        await adminUser.save();
        // Generate JWT token with roles
        const token = jsonwebtoken_1.default.sign({
            userId: adminUser._id,
            username: adminUser.username,
            roles: adminUser.roles
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            data: {
                user: {
                    id: adminUser._id,
                    username: adminUser.username,
                    roles: adminUser.roles
                },
                token
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Login admin user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Find user by username
        const adminUser = await AdminUser_1.default.findOne({ username });
        if (!adminUser) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // Check password
        const isPasswordValid = await adminUser.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // Generate JWT token with roles
        const token = jsonwebtoken_1.default.sign({
            userId: adminUser._id,
            username: adminUser.username,
            roles: adminUser.roles
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: adminUser._id,
                    username: adminUser.username,
                    roles: adminUser.roles
                },
                token
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Verify token
router.get('/verify', exports.authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            user: req.user
        }
    });
});
exports.default = router;
