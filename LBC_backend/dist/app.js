"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const playerRoutes_1 = __importDefault(require("./routes/playerRoutes"));
const matchRoutes_1 = __importDefault(require("./routes/matchRoutes"));
const classificationRoutes_1 = __importDefault(require("./routes/classificationRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const statisticsRoutes_1 = __importDefault(require("./routes/statisticsRoutes"));
const news_1 = __importDefault(require("./routes/news"));
const sponsors_1 = __importDefault(require("./routes/sponsors"));
const auth_1 = __importDefault(require("./routes/auth"));
const calendarRoutes_1 = __importDefault(require("./routes/calendarRoutes"));
const weeklyScheduleRoutes_1 = __importDefault(require("./routes/weeklyScheduleRoutes"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const migrationRoutes_1 = __importDefault(require("./routes/migrationRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Middleware
// app.use(cors({
//   origin: ['http://localhost:3000','https://lbc-cameroon-web-zeck-2glvwr1f4-russeltsagues-projects.vercel.app/'], // Allow frontend requests
//   credentials: true
// }));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/teams', teamRoutes_1.default);
app.use('/api/players', playerRoutes_1.default);
app.use('/api/matches', matchRoutes_1.default);
app.use('/api/classifications', classificationRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/schedules', scheduleRoutes_1.default);
app.use('/api/statistics', statisticsRoutes_1.default);
app.use('/api/news', news_1.default);
app.use('/api/sponsors', sponsors_1.default);
app.use('/api/calendar', calendarRoutes_1.default);
app.use('/api/weekly-schedules', weeklyScheduleRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/test', testRoutes_1.default);
app.use('/api/migration', migrationRoutes_1.default);
// app.use('/', (req, res) => {
//   res.send('the backend is running');
// });
// Serve static files
app.use('/uploads', express_1.default.static('public/uploads'));
// Error handling
app.use(errorHandler_1.errorHandler);
exports.default = app;
// i have created a new calendar ( u18 garcon) with some scores updated but the classification for that category is not beign updated 
