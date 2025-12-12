# Design Document

## Overview

This design document outlines the technical architecture and implementation approach for enhancing the LBC admin dashboard with comprehensive automation capabilities. The system will transform from a basic CRUD interface into an intelligent management platform that automates schedule generation, classification updates, data validation, and statistics calculation.

The enhancement builds upon the existing MERN stack (MongoDB, Express, React, Node.js) with TypeScript, leveraging the current models (Match, Team, Classification) and extending them with new services, controllers, and UI components. The design emphasizes real-time updates, data integrity, and user experience improvements.

## Architecture

### System Architecture

The system follows a three-tier architecture:

**Presentation Layer (Frontend)**
- Next.js 15 with React 19
- Admin dashboard components with Framer Motion animations
- Real-time UI updates using React hooks and state management
- Form validation with React Hook Form and Zod

**Application Layer (Backend)**
- Express.js REST API with TypeScript
- Service layer for business logic (schedulerService, classificationService, validationService, statisticsService)
- Controller layer for request handling
- Middleware for authentication and error handling

**Data Layer**
- MongoDB with Mongoose ODM
- Existing models: Match, Team, Classification, Category
- Indexes for query optimization
- Transactions for data consistency

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard (Frontend)               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │   Schedule   │  │ Statistics   │      │
│  │   Overview   │  │  Generator   │  │    Panel     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Match     │  │     Team     │  │   Category   │      │
│  │  Management  │  │  Management  │  │  Management  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend (API)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Match     │  │     Team     │  │   Category   │      │
│  │  Controller  │  │  Controller  │  │  Controller  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Scheduler   │  │Classification│  │  Statistics  │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Validation  │  │  Bulk Import │                        │
│  │   Service    │  │   Service    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Match     │  │     Team     │  │Classification│      │
│  │  Collection  │  │  Collection  │  │  Collection  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                           │
│  │   Category   │                                           │
│  │  Collection  │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Services

#### SchedulerService

Handles automatic schedule generation using round-robin algorithm.

```typescript
interface ScheduleGenerationOptions {
  category: string;
  poule?: string;
  startDate: Date;
  daysBetweenMatches: number;
  timeSlots: string[];
  defaultVenue?: string;
}

interface SchedulePreview {
  matches: IMatch[];
  totalMatches: number;
  journees: number;
  startDate: Date;
  endDate: Date;
}

class SchedulerService {
  generateSchedule(options: ScheduleGenerationOptions): Promise<SchedulePreview>
  saveSchedule(preview: SchedulePreview): Promise<IMatch[]>
  validateSchedule(matches: IMatch[]): Promise<ValidationResult>
}
```

**Round-Robin Algorithm:**
- For n teams, generate n-1 rounds (or 2(n-1) for double round-robin)
- Each team plays every other team exactly once per round
- Use rotation method: fix one team, rotate others
- Alternate home/away assignments each round

#### ClassificationService

Manages automatic classification updates with FIBA rules.

```typescript
interface ClassificationUpdate {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  forfeit?: 'home' | 'away' | null;
}

class ClassificationService {
  updateClassification(matchId: string): Promise<void>
  recalculateCategory(category: string, poule?: string): Promise<IClassification[]>
  calculatePositions(category: string, poule?: string): Promise<void>
  getTeamStatistics(teamId: string): Promise<TeamStatistics>
}
```

**FIBA Ranking Rules:**
1. Total points (2 for win, 1 for loss, 0 for forfeit)
2. Point difference (pointsFor - pointsAgainst)
3. Points scored (pointsFor)

#### ValidationService

Provides comprehensive data validation before operations.

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

class ValidationService {
  validateMatchCreation(matchData: Partial<IMatch>): Promise<ValidationResult>
  validateScheduleConflict(teamId: string, date: Date, time: string): Promise<boolean>
  validateTeamCompatibility(homeTeamId: string, awayTeamId: string): Promise<ValidationResult>
  validateScores(homeScore: number, awayScore: number): ValidationResult
}
```

#### StatisticsService

Calculates team and league statistics.

```typescript
interface TeamStatistics {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  winPercentage: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifference: number;
  averagePointsScored: number;
  averagePointsConceded: number;
  recentForm: ('W' | 'L')[];
  homeRecord: { wins: number; losses: number };
  awayRecord: { wins: number; losses: number };
}

interface CategoryStatistics {
  category: string;
  poule?: string;
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  upcomingMatches: number;
  averagePointsPerMatch: number;
  highestScoringTeam: string;
  topScorer: TeamStatistics;
}

class StatisticsService {
  getTeamStatistics(teamId: string): Promise<TeamStatistics>
  getCategoryStatistics(category: string, poule?: string): Promise<CategoryStatistics>
  getDashboardMetrics(): Promise<DashboardMetrics>
}
```

#### BulkImportService

Handles bulk team imports from JSON files.

```typescript
interface BulkImportResult {
  successful: number;
  failed: number;
  errors: ImportError[];
  importedTeams: ITeam[];
}

interface ImportError {
  row: number;
  teamName: string;
  error: string;
}

class BulkImportService {
  importTeams(file: Express.Multer.File): Promise<BulkImportResult>
  validateTeamData(teamData: any): ValidationResult
  parseJSONFile(file: Express.Multer.File): Promise<any[]>
}
```

### Backend Controllers

#### ScheduleController

```typescript
// POST /api/schedules/generate
generateSchedule(req: Request, res: Response): Promise<void>

// POST /api/schedules/save
saveSchedule(req: Request, res: Response): Promise<void>

// GET /api/schedules/preview/:category
previewSchedule(req: Request, res: Response): Promise<void>
```

#### StatisticsController

```typescript
// GET /api/statistics/team/:teamId
getTeamStatistics(req: Request, res: Response): Promise<void>

// GET /api/statistics/category/:category
getCategoryStatistics(req: Request, res: Response): Promise<void>

// GET /api/statistics/dashboard
getDashboardMetrics(req: Request, res: Response): Promise<void>
```

#### CategoryController

```typescript
// GET /api/categories
getAllCategories(req: Request, res: Response): Promise<void>

// POST /api/categories
createCategory(req: Request, res: Response): Promise<void>

// PUT /api/categories/:id
updateCategory(req: Request, res: Response): Promise<void>

// DELETE /api/categories/:id
deleteCategory(req: Request, res: Response): Promise<void>
```

#### BulkImportController

```typescript
// POST /api/teams/bulk-import
bulkImportTeams(req: Request, res: Response): Promise<void>
```

### Frontend Components

#### ScheduleGenerator Component

```typescript
interface ScheduleGeneratorProps {
  categories: Category[];
  onScheduleGenerated: (matches: Match[]) => void;
}

const ScheduleGenerator: React.FC<ScheduleGeneratorProps> = ({
  categories,
  onScheduleGenerated
}) => {
  // Form for schedule generation options
  // Preview table for generated matches
  // Edit/delete individual matches
  // Confirm/cancel actions
}
```

#### DashboardOverview Component

```typescript
interface DashboardMetrics {
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  upcomingMatches: number;
  recentMatches: Match[];
  upcomingWeek: Match[];
  categoryBreakdown: CategoryBreakdown[];
}

const DashboardOverview: React.FC = () => {
  // Metric cards
  // Recent matches list
  // Upcoming matches calendar
  // Category breakdown charts
}
```

#### StatisticsPanel Component

```typescript
interface StatisticsPanelProps {
  category: string;
  poule?: string;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  category,
  poule
}) => {
  // Team statistics table
  // Category-wide metrics
  // Performance charts
  // Export functionality
}
```

#### BulkImportModal Component

```typescript
interface BulkImportModalProps {
  onImportComplete: (result: BulkImportResult) => void;
  onClose: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({
  onImportComplete,
  onClose
}) => {
  // File upload dropzone
  // Import progress indicator
  // Results summary
  // Error list
}
```

#### CategoryManagement Component

```typescript
interface CategoryManagementProps {
  categories: Category[];
  onCategoryChange: () => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onCategoryChange
}) => {
  // Category list
  // Add/edit category form
  // Poule configuration
  // Delete with validation
}
```

## Data Models

### Category Model (New)

```typescript
interface ICategory extends Document {
  name: string;
  displayName: string;
  hasPoules: boolean;
  poules: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'L1 MESSIEUR',
      'L1 DAME',
      'L2A MESSIEUR',
      'L2B MESSIEUR',
      'U18 GARCONS',
      'U18 FILLES',
      'VETERANT',
      'CORPO',
      'DAMES'
    ]
  },
  displayName: { type: String, required: true },
  hasPoules: { type: Boolean, default: false },
  poules: [{ type: String, enum: ['A', 'B', 'C'] }],
  active: { type: Boolean, default: true }
}, { timestamps: true });
```

### Enhanced Classification Model

Add methods for statistics calculation:

```typescript
ClassificationSchema.methods.getWinPercentage = function(): number {
  return this.played > 0 ? (this.wins / this.played) * 100 : 0;
};

ClassificationSchema.methods.getAveragePointsScored = function(): number {
  return this.played > 0 ? this.pointsFor / this.played : 0;
};

ClassificationSchema.methods.getAveragePointsConceded = function(): number {
  return this.played > 0 ? this.pointsAgainst / this.played : 0;
};
```

### Match Model Enhancements

Add validation middleware:

```typescript
matchSchema.pre('save', async function(next) {
  // Validate teams are from same category
  // Validate teams are from same poule if applicable
  // Validate no scheduling conflicts
  // Validate team cannot play itself
  next();
});

matchSchema.index({ homeTeam: 1, date: 1, time: 1 });
matchSchema.index({ awayTeam: 1, date: 1, time: 1 });
```

## Correc
tness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Schedule Generation Properties

Property 1: Round-robin completeness
*For any* set of teams in a category, when generating a schedule, each team should play every other team exactly once
**Validates: Requirements 1.1**

Property 2: Poule isolation
*For any* category with poules, when generating schedules, no match should contain teams from different poules
**Validates: Requirements 1.2**

Property 3: Home/away fairness
*For any* generated schedule, each team should have approximately equal numbers of home and away matches (difference ≤ 1)
**Validates: Requirements 1.3**

Property 4: Venue assignment correctness
*For any* generated match, the venue should equal the home team's arena
**Validates: Requirements 1.4**

Property 5: Match date distribution
*For any* generated schedule with start date and interval, matches should be distributed across journées with the specified interval between matchdays
**Validates: Requirements 1.5**

Property 6: Initial match state
*For any* generated match, the status should be 'upcoming' and both scores should be null
**Validates: Requirements 1.6**

### Classification Update Properties

Property 7: Classification update trigger
*For any* match updated to completed status with valid scores, classification entries for both teams should be recalculated
**Validates: Requirements 2.1**

Property 8: Played count increment
*For any* completed match, the played count for both participating teams should increase by exactly 1
**Validates: Requirements 2.2**

Property 9: Home win point allocation
*For any* completed match where homeScore > awayScore and no forfeit, home team should receive 2 points and away team should receive 1 point
**Validates: Requirements 2.3**

Property 10: Away win point allocation
*For any* completed match where awayScore > homeScore and no forfeit, away team should receive 2 points and home team should receive 1 point
**Validates: Requirements 2.4**

Property 11: Forfeit point allocation
*For any* completed match with a forfeit flag, the non-forfeiting team should receive 2 points and the forfeiting team should receive 0 points
**Validates: Requirements 2.5**

Property 12: Statistics calculation correctness
*For any* completed match, pointsFor, pointsAgainst, and pointsDifference should be correctly calculated based on match scores
**Validates: Requirements 2.6**

Property 13: FIBA ranking order
*For any* category classification, teams should be ordered by points descending, then pointsDifference descending, then pointsFor descending
**Validates: Requirements 2.7**

Property 14: Position numbering
*For any* category classification, position numbers should be sequential starting from 1 for the highest-ranked team
**Validates: Requirements 2.8**

Property 15: Poule ranking isolation
*For any* category with poules, classification rankings should be calculated separately for each poule
**Validates: Requirements 2.9**

### Statistics Calculation Properties

Property 16: Team statistics completeness
*For any* team, statistics should include all required fields: played, wins, losses, winPercentage, pointsFor, pointsAgainst, and averagePointsScored
**Validates: Requirements 3.1**

Property 17: Category statistics aggregation
*For any* category, statistics should correctly aggregate total matches, completed matches, upcoming matches, and average points per match
**Validates: Requirements 3.2**

Property 18: Recent form tracking
*For any* team, recent form should contain the last 5 match results in chronological order
**Validates: Requirements 3.3**

Property 19: Win percentage calculation
*For any* team with played > 0, winPercentage should equal (wins / played) * 100
**Validates: Requirements 3.4**

Property 20: Average points calculation
*For any* team with played > 0, averagePointsScored should equal pointsFor / played
**Validates: Requirements 3.5**

### Match Status Properties

Property 21: Past match identification
*For any* match with status 'upcoming' and date in the past, the system should identify it as requiring attention
**Validates: Requirements 5.1**

Property 22: Status persistence without scores
*For any* match with date in the past and status 'upcoming', the status should remain 'upcoming' until scores are entered
**Validates: Requirements 5.2**

Property 23: Match filtering correctness
*For any* status filter, returned matches should only include matches with that exact status
**Validates: Requirements 5.4**

### Dashboard Metrics Properties

Property 24: Team count accuracy
*For any* dashboard view, total teams should equal the count of all teams across all categories
**Validates: Requirements 7.1**

Property 25: Match count categorization
*For any* dashboard view, match counts should correctly categorize all matches as scheduled, completed, or upcoming
**Validates: Requirements 7.2**

Property 26: Recent matches ordering
*For any* dashboard view, the 5 most recently updated matches should be ordered by updatedAt descending
**Validates: Requirements 7.3**

Property 27: Upcoming matches date filtering
*For any* dashboard view, upcoming matches should only include matches with dates within the next 7 days
**Validates: Requirements 7.4**

Property 28: Category breakdown accuracy
*For any* dashboard view, category-wise breakdown should correctly group and count teams and matches by category
**Validates: Requirements 7.5**

### Bulk Import Properties

Property 29: JSON parsing correctness
*For any* valid JSON file, the system should successfully parse and extract team data
**Validates: Requirements 8.1**

Property 30: Required field validation
*For any* team entry in bulk import, entries missing required fields (name, category, city, arena, coach, about) should be rejected
**Validates: Requirements 8.2**

Property 31: Poule validation for required categories
*For any* team entry in categories requiring poules (U18 GARCONS, L2A MESSIEUR), entries without valid poule should be rejected
**Validates: Requirements 8.3**

Property 32: Error resilience
*For any* bulk import with mixed valid and invalid entries, valid entries should be imported and invalid entries should be skipped with errors logged
**Validates: Requirements 8.4**

Property 33: Import summary accuracy
*For any* completed bulk import, the summary should correctly count successful imports and errors
**Validates: Requirements 8.5**

Property 34: Duplicate detection
*For any* team entry with name matching an existing team in the same category and poule, the entry should be skipped and logged as duplicate
**Validates: Requirements 8.6**

### Schedule Confirmation Properties

Property 35: Batch save correctness
*For any* confirmed schedule, all matches should be saved to the database with status 'upcoming'
**Validates: Requirements 9.4**

Property 36: Cancellation side-effect prevention
*For any* cancelled schedule preview, no matches should be saved to the database
**Validates: Requirements 9.5**

## Error Handling

### Validation Errors

All validation errors should follow a consistent format:

```typescript
interface ValidationError {
  field: string;
  message: string;
  code: string;
  details?: any;
}
```

**Error Codes:**
- `CATEGORY_MISMATCH`: Teams from different categories
- `POULE_MISMATCH`: Teams from different poules
- `SCHEDULING_CONFLICT`: Team already has match at same time
- `SELF_MATCH`: Team cannot play itself
- `INSUFFICIENT_TEAMS`: Less than 2 teams for schedule generation
- `INVALID_SCORE`: Score is negative or not an integer
- `INVALID_JOURNEE`: Journée is less than 1
- `MISSING_POULE`: Poule required but not provided
- `MISSING_ARENA`: Team missing arena information
- `DUPLICATE_TEAM`: Team already exists
- `CATEGORY_IN_USE`: Cannot delete category with teams/matches
- `MISSING_REQUIRED_FIELD`: Required field missing in import

### Error Response Format

```typescript
{
  status: 'error',
  message: string,
  errors: ValidationError[],
  code: string
}
```

### Transaction Handling

For operations that modify multiple documents (schedule generation, classification updates), use MongoDB transactions to ensure atomicity:

```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Perform operations
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify individual functions and methods:

- **SchedulerService**: Test round-robin algorithm, date calculations, venue assignments
- **ClassificationService**: Test point calculations, ranking logic, position assignments
- **ValidationService**: Test each validation rule independently
- **StatisticsService**: Test aggregation calculations, percentage calculations
- **BulkImportService**: Test JSON parsing, validation, error handling

### Property-Based Testing

Property-based tests will verify universal properties using **fast-check** library for TypeScript:

- Configure each property test to run minimum 100 iterations
- Each property test must reference the design document property using format: `**Feature: admin-automation-enhancement, Property {number}: {property_text}**`
- Generate random test data (teams, matches, scores) to verify properties hold across all inputs
- Test edge cases: empty sets, single team, odd/even team counts, boundary values

**Example Property Test:**

```typescript
import fc from 'fast-check';

describe('Schedule Generation Properties', () => {
  it('Property 1: Round-robin completeness', () => {
    /**
     * Feature: admin-automation-enhancement, Property 1: Round-robin completeness
     * For any set of teams in a category, when generating a schedule,
     * each team should play every other team exactly once
     */
    fc.assert(
      fc.property(
        fc.array(teamArbitrary(), { minLength: 2, maxLength: 20 }),
        async (teams) => {
          const schedule = await schedulerService.generateSchedule({
            category: teams[0].category,
            startDate: new Date(),
            daysBetweenMatches: 7,
            timeSlots: ['14:00']
          });
          
          // Verify each team plays every other team exactly once
          for (const team1 of teams) {
            for (const team2 of teams) {
              if (team1._id !== team2._id) {
                const matchCount = schedule.matches.filter(m =>
                  (m.homeTeam === team1._id && m.awayTeam === team2._id) ||
                  (m.homeTeam === team2._id && m.awayTeam === team1._id)
                ).length;
                expect(matchCount).toBe(1);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests will verify component interactions:

- API endpoint testing with supertest
- Database operations with test database
- Full workflow testing (create teams → generate schedule → complete matches → verify classification)

### Test Data Generators

Create arbitraries for property-based testing:

```typescript
const teamArbitrary = () => fc.record({
  name: fc.string({ minLength: 3, maxLength: 50 }),
  category: fc.constantFrom('L1 MESSIEUR', 'L1 DAME', 'U18 GARCONS'),
  city: fc.string({ minLength: 3, maxLength: 30 }),
  arena: fc.string({ minLength: 3, maxLength: 50 }),
  coach: fc.string({ minLength: 3, maxLength: 50 }),
  about: fc.string({ minLength: 10, maxLength: 200 }),
  poule: fc.option(fc.constantFrom('A', 'B', 'C'))
});

const matchArbitrary = () => fc.record({
  homeScore: fc.integer({ min: 0, max: 150 }),
  awayScore: fc.integer({ min: 0, max: 150 }),
  date: fc.date(),
  time: fc.constantFrom('14:00', '16:00', '18:00', '20:00'),
  journee: fc.integer({ min: 1, max: 30 })
});
```

## Performance Considerations

### Database Indexing

Ensure proper indexes for query performance:

```typescript
// Match indexes
matchSchema.index({ category: 1, poule: 1, date: 1 });
matchSchema.index({ status: 1, date: 1 });
matchSchema.index({ homeTeam: 1, date: 1, time: 1 });
matchSchema.index({ awayTeam: 1, date: 1, time: 1 });

// Classification indexes
ClassificationSchema.index({ category: 1, poule: 1, points: -1, pointsDifference: -1 });
ClassificationSchema.index({ team: 1, category: 1 }, { unique: true });

// Team indexes
TeamSchema.index({ category: 1, poule: 1 });
TeamSchema.index({ name: 1, category: 1, poule: 1 }, { unique: true });
```

### Caching Strategy

Implement caching for frequently accessed data:

- Dashboard metrics: Cache for 5 minutes
- Category statistics: Cache for 10 minutes
- Team statistics: Invalidate on match completion

### Batch Operations

For bulk operations, use batch processing:

- Schedule generation: Create matches in batches of 100
- Bulk import: Process teams in batches of 50
- Classification recalculation: Update in batches

### Query Optimization

- Use projection to limit returned fields
- Populate only necessary fields
- Use lean() for read-only operations
- Implement pagination for large result sets

## Security Considerations

### Authentication & Authorization

- All admin endpoints require authentication
- Implement role-based access control (RBAC)
- Use JWT tokens for session management
- Validate token on every request

### Input Validation

- Sanitize all user inputs
- Validate file uploads (type, size, content)
- Use Zod schemas for request validation
- Prevent NoSQL injection

### Rate Limiting

- Implement rate limiting on API endpoints
- Bulk import: Limit file size to 10MB
- Schedule generation: Limit to 1 request per minute per user

## Deployment Considerations

### Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/lbc
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
MAX_UPLOAD_SIZE=10485760
CACHE_TTL=300
```

### Database Migrations

Create migration scripts for:
- Adding Category collection
- Adding indexes to existing collections
- Updating existing Match documents with default values

### Monitoring

- Log all schedule generations
- Log all classification updates
- Monitor API response times
- Track error rates

## Future Enhancements

- Real-time updates using WebSockets
- Advanced scheduling with venue availability
- Automated match reminders
- Performance analytics and trends
- Mobile app for admin management
- Multi-language support
- Export schedules to PDF/Excel
- Integration with external calendar systems
