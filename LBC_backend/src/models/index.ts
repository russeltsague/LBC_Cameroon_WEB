// Import all models to ensure they are registered with Mongoose
import './Team';
import './Category';
import './Match';
import './AdminUser';
import './News';
import './Sponsor';
import './Classification';
import './Calendar';
import './WeeklySchedule';
import './Report';

// Export models for use in other files
import Team from './Team';
import Category from './Category';
import Match from './Match';
import { Calendar } from './Calendar';
import WeeklySchedule, { IWeeklySchedule, IWeeklyMatch } from './WeeklySchedule';
import Report, { IReport } from './Report';

export { Team, Category, Match, Calendar, WeeklySchedule, Report };
export { ITeam } from './Team';
export { ICategory } from './Category';
export { IMatch } from './Match';
export { ICalendar } from './Calendar';
export { IWeeklySchedule, IWeeklyMatch } from './WeeklySchedule';
export { IReport } from './Report';
