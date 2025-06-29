import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser';

const router = express.Router();

// Extend Request interface to include user
interface AuthRequest extends Request {
  user?: any;
}

// Middleware to verify JWT token
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      res.status(403).json({ success: false, message: 'Invalid or expired token' });
      return;
    }
    req.user = user;
    next();
  });
};

// Register new admin user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await AdminUser.findOne({ username });
    if (existingUser) {
      res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
      return;
    }

    // Create new admin user
    const adminUser = new AdminUser({ username, password });
    await adminUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: adminUser._id, username: adminUser.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        user: {
          id: adminUser._id,
          username: adminUser.username
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Login admin user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const adminUser = await AdminUser.findOne({ username });
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: adminUser._id, username: adminUser.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: adminUser._id,
          username: adminUser.username
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req: AuthRequest, res: Response): void => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

export default router; 