import express from 'express';
import cors from 'cors';
import teamRoutes from './routes/teamRoutes';
import playerRoutes from './routes/playerRoutes';
import matchRoutes from './routes/matchRoutes';
import classificationRoutes from './routes/classificationRoutes';
import categoryRoutes from './routes/categoryRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import statisticsRoutes from './routes/statisticsRoutes';
import newsRoutes from './routes/news';
import sponsorRoutes from './routes/sponsors';
import authRoutes from './routes/auth';
import calendarRoutes from './routes/calendarRoutes';
import weeklyScheduleRoutes from './routes/weeklyScheduleRoutes';
import testRoutes from './routes/testRoutes';
import migrationRoutes from './routes/migrationRoutes';
import reportRoutes from './routes/reportRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
// app.use(cors({
//   origin: ['http://localhost:3000','https://lbc-cameroon-web-zeck-2glvwr1f4-russeltsagues-projects.vercel.app/'], // Allow frontend requests
//   credentials: true
// }));
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/classifications', classificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/weekly-schedules', weeklyScheduleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/test', testRoutes);
app.use('/api/migration', migrationRoutes);
// app.use('/', (req, res) => {
//   res.send('the backend is running');
// });

// Serve static files
app.use('/uploads', express.static('public/uploads'));

// Error handling
app.use(errorHandler);

export default app;

// i have created a new calendar ( u18 garcon) with some scores updated but the classification for that category is not beign updated 