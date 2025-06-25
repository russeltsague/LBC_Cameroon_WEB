import express from 'express';
import cors from 'cors';
import teamRoutes from './routes/teamRoutes';
import playerRoutes from './routes/playerRoutes';
import matchRoutes from './routes/matchRoutes';
import classificationRoutes from './routes/classificationRoutes';
import categoryRoutes from './routes/categoryRoutes';
import newsRoutes from './routes/news';
import sponsorRoutes from './routes/sponsors';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
// app.use(cors({
//   origin: ['http://localhost:3000','https://lbc-cameroon-web.onrender.com'], // Allow frontend requests
//   credentials: true
// }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/classifications', classificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/', (req, res) => {
  res.send('the backend is running');
});

// Serve static files
app.use('/uploads', express.static('public/uploads'));

// Error handling
app.use(errorHandler);

export default app;