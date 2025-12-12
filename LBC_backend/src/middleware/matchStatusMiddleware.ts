import { Request, Response, NextFunction } from 'express';
import { statsEmitter } from '../services/statisticsService';

/**
 * Middleware to handle match status changes and trigger statistics updates
 */
export const handleMatchStatusUpdate = (req: Request, res: Response, next: NextFunction) => {
  // Save the original JSON method
  const originalJson = res.json;

  // Override the response JSON method
  res.json = function(body) {
    // If this is a successful match update/creation and status is 'completed'
    if (
      (req.method === 'PUT' || req.method === 'POST') && 
      req.originalUrl.includes('/api/matches') &&
      res.statusCode >= 200 && 
      res.statusCode < 300 &&
      body?.status === 'completed'
    ) {
      // Emit event for statistics update
      statsEmitter.emit('matchCompleted', body._id || body.match?._id);
    }
    
    // Call the original method
    return originalJson.call(this, body);
  };

  next();
};

export default handleMatchStatusUpdate;
