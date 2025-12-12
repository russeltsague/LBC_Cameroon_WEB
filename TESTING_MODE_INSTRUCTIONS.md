# Testing Mode Instructions

## Authentication Bypass for Testing

The admin authentication has been disabled for testing purposes. You can now access the admin dashboard directly without logging in.

### How to Access Admin Dashboard

1. **From the main website**: Click on "Admin" in the navigation bar
2. **Direct URL**: Navigate to `/admin` in your browser
3. **No login required**: You'll be automatically authenticated in testing mode

### Testing Mode Indicator

A yellow banner will appear at the top of the admin dashboard indicating "TESTING MODE - Authentication Disabled"

### What's Available in Admin Dashboard

#### 1. Dashboard (Home)
- **URL**: `/admin`
- **Features**:
  - Real-time statistics (Total Teams, Matches, Completed, Upcoming)
  - Recent matches with scores
  - Upcoming matches for the week
  - Category breakdown with team and match counts

#### 2. Schedule Generator
- **URL**: `/admin/schedules`
- **Features**:
  - Automatic match schedule generation using round-robin algorithm
  - Category and poule selection
  - Configurable start date and days between matches
  - Multiple time slots support
  - Preview before saving
  - Ensures each team plays every other team exactly once
  - Automatic home/away fairness
  - Venue assignment from home team's arena

#### 3. Teams Management
- **URL**: `/admin/teams`
- **Features**:
  - View all teams
  - Add/Edit/Delete teams
  - Bulk import teams from JSON

#### 4. Matches Management
- **URL**: `/admin/matches`
- **Features**:
  - View all matches
  - Add/Edit/Delete matches
  - Update scores
  - Automatic classification updates when match is completed

#### 5. Categories Management
- **URL**: `/admin/categories`
- **Features**:
  - View all categories
  - Add/Edit/Delete categories
  - Configure poules for categories

### Backend API Endpoints Available

#### Statistics
- `GET /api/statistics/dashboard` - Dashboard metrics
- `GET /api/statistics/team/:teamId` - Team statistics
- `GET /api/statistics/category/:category` - Category statistics
- `GET /api/statistics/league` - League-wide statistics

#### Schedule Generation
- `POST /api/schedules/generate` - Generate schedule preview
- `POST /api/schedules/save` - Save generated schedule
- `GET /api/schedules/preview/:category` - Get schedule preview
- `DELETE /api/schedules/:category` - Delete schedule

#### Bulk Import
- `POST /api/teams/bulk-import` - Import teams from JSON
- `GET /api/teams/bulk-import/template` - Get sample JSON template

#### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Automated Features

1. **Automatic Schedule Generation**
   - Round-robin algorithm ensures fair matchups
   - Home/away alternation
   - Configurable intervals between matches
   - Handles odd number of teams (bye weeks)

2. **Automatic Classification Updates**
   - FIBA point allocation (2 for win, 1 for loss, 0 for forfeit)
   - Automatic ranking calculation
   - Position updates based on points, goal difference, and goals scored
   - Separate rankings for poules

3. **Automatic Validation**
   - Prevents teams from playing themselves
   - Prevents scheduling conflicts
   - Validates category and poule compatibility
   - Validates scores (non-negative integers)

4. **Automatic Statistics**
   - Win percentage calculation
   - Average points scored/conceded
   - Recent form (last 5 matches)
   - Home/away records

### Disabling Testing Mode (For Production)

To re-enable authentication:

1. Open `LBC_Frontend/components/admin/AuthGuard.tsx`
2. Change `const TESTING_MODE = true` to `const TESTING_MODE = false`
3. Open `LBC_Frontend/components/admin/AdminLayout.tsx`
4. Change `const TESTING_MODE = true` to `const TESTING_MODE = false`

### Testing Checklist

- [ ] Access admin dashboard from navbar
- [ ] View dashboard statistics
- [ ] Generate a schedule for a category
- [ ] Preview generated schedule
- [ ] Save schedule to database
- [ ] View matches in matches page
- [ ] Update a match score
- [ ] Verify classification table updates automatically
- [ ] Test bulk team import
- [ ] View team statistics
- [ ] View category statistics

### Notes

- All backend services are fully implemented and validated
- No TypeScript errors in backend or frontend
- Database operations use proper validation
- Error handling is in place for all API endpoints
- The system is ready for integration testing

### Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify environment variables are set correctly
4. Ensure MongoDB is running and accessible
5. Verify backend server is running on the correct port
