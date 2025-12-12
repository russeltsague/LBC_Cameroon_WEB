# Implementation Plan

- [x] 1. Set up Category model and management infrastructure
  - Create Category model with schema validation
  - Implement category CRUD controller and routes
  - Add category seeding script for existing categories
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 1.1 Write property test for category uniqueness validation
  - **Property: Category name uniqueness**
  - **Validates: Requirements 10.1**

- [ ] 1.2 Write property test for category deletion validation
  - **Property: Category deletion prevention with dependencies**
  - **Validates: Requirements 10.4, 10.5**

- [x] 2. Implement enhanced ValidationService
  - Create ValidationService class with all validation methods
  - Implement team compatibility validation (category and poule matching)
  - Implement scheduling conflict detection
  - Implement self-match prevention
  - Implement score validation
  - Implement journée validation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ] 2.1 Write property test for team compatibility validation
  - **Property: Category and poule mismatch detection**
  - **Validates: Requirements 6.1, 6.2**

- [ ] 2.2 Write property test for scheduling conflict detection
  - **Property: Scheduling conflict prevention**
  - **Validates: Requirements 6.3**

- [ ] 2.3 Write property test for score validation
  - **Property: Non-negative integer score validation**
  - **Validates: Requirements 6.6**

- [x] 3. Build SchedulerService with round-robin algorithm
  - Implement round-robin algorithm for schedule generation
  - Add home/away alternation logic
  - Implement venue assignment from home team arena
  - Add date distribution with configurable intervals
  - Handle odd number of teams (bye weeks)
  - Implement poule-specific schedule generation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 3.1 Write property test for round-robin completeness
  - **Property 1: Round-robin completeness**
  - **Validates: Requirements 1.1**

- [ ] 3.2 Write property test for poule isolation
  - **Property 2: Poule isolation**
  - **Validates: Requirements 1.2**

- [ ] 3.3 Write property test for home/away fairness
  - **Property 3: Home/away fairness**
  - **Validates: Requirements 1.3**

- [ ] 3.4 Write property test for venue assignment
  - **Property 4: Venue assignment correctness**
  - **Validates: Requirements 1.4**

- [ ] 3.5 Write property test for match date distribution
  - **Property 5: Match date distribution**
  - **Validates: Requirements 1.5**

- [ ] 3.6 Write property test for initial match state
  - **Property 6: Initial match state**
  - **Validates: Requirements 1.6**

- [x] 4. Create ScheduleController and API endpoints
  - Implement POST /api/schedules/generate endpoint
  - Implement POST /api/schedules/save endpoint
  - Implement GET /api/schedules/preview/:category endpoint
  - Add request validation middleware
  - Add error handling for insufficient teams
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 9.4, 9.5_

- [ ] 4.1 Write property test for schedule confirmation
  - **Property 35: Batch save correctness**
  - **Validates: Requirements 9.4**

- [ ] 4.2 Write property test for schedule cancellation
  - **Property 36: Cancellation side-effect prevention**
  - **Validates: Requirements 9.5**

- [x] 5. Enhance ClassificationService with automatic updates
  - Refactor updateClassification to handle all match completion scenarios
  - Implement FIBA point allocation logic (2 for win, 1 for loss, 0 for forfeit)
  - Add played count increment logic
  - Implement statistics calculation (pointsFor, pointsAgainst, pointsDifference)
  - Implement FIBA ranking algorithm
  - Add position numbering logic
  - Implement poule-specific ranking calculation
  - Add recent form tracking (last 5 results)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 5.1 Write property test for classification update trigger
  - **Property 7: Classification update trigger**
  - **Validates: Requirements 2.1**

- [ ] 5.2 Write property test for played count increment
  - **Property 8: Played count increment**
  - **Validates: Requirements 2.2**

- [ ] 5.3 Write property test for home win point allocation
  - **Property 9: Home win point allocation**
  - **Validates: Requirements 2.3**

- [ ] 5.4 Write property test for away win point allocation
  - **Property 10: Away win point allocation**
  - **Validates: Requirements 2.4**

- [ ] 5.5 Write property test for forfeit point allocation
  - **Property 11: Forfeit point allocation**
  - **Validates: Requirements 2.5**

- [ ] 5.6 Write property test for statistics calculation
  - **Property 12: Statistics calculation correctness**
  - **Validates: Requirements 2.6**

- [ ] 5.7 Write property test for FIBA ranking order
  - **Property 13: FIBA ranking order**
  - **Validates: Requirements 2.7**

- [ ] 5.8 Write property test for position numbering
  - **Property 14: Position numbering**
  - **Validates: Requirements 2.8**

- [ ] 5.9 Write property test for poule ranking isolation
  - **Property 15: Poule ranking isolation**
  - **Validates: Requirements 2.9**

- [x] 6. Integrate classification updates into match controller
  - Update updateMatch controller to trigger classification updates
  - Add transaction support for atomic updates
  - Ensure classification updates on status change to 'completed'
  - Add error handling and rollback logic
  - _Requirements: 2.1, 4.1, 4.2, 4.3_

- [x] 7. Build StatisticsService for analytics
  - Implement getTeamStatistics method
  - Implement getCategoryStatistics method
  - Implement getDashboardMetrics method
  - Add win percentage calculation
  - Add average points calculation
  - Add recent form retrieval
  - Add home/away record calculation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7.1 Write property test for team statistics completeness
  - **Property 16: Team statistics completeness**
  - **Validates: Requirements 3.1**

- [ ] 7.2 Write property test for category statistics aggregation
  - **Property 17: Category statistics aggregation**
  - **Validates: Requirements 3.2**

- [ ] 7.3 Write property test for recent form tracking
  - **Property 18: Recent form tracking**
  - **Validates: Requirements 3.3**

- [ ] 7.4 Write property test for win percentage calculation
  - **Property 19: Win percentage calculation**
  - **Validates: Requirements 3.4**

- [ ] 7.5 Write property test for average points calculation
  - **Property 20: Average points calculation**
  - **Validates: Requirements 3.5**

- [x] 8. Create StatisticsController and API endpoints
  - Implement GET /api/statistics/team/:teamId endpoint
  - Implement GET /api/statistics/category/:category endpoint
  - Implement GET /api/statistics/dashboard endpoint
  - Add query parameter support for poule filtering
  - Add caching for performance optimization
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8.1 Write property test for dashboard metrics accuracy
  - **Property 24: Team count accuracy**
  - **Property 25: Match count categorization**
  - **Property 28: Category breakdown accuracy**
  - **Validates: Requirements 7.1, 7.2, 7.5**

- [ ] 8.2 Write property test for dashboard recent matches
  - **Property 26: Recent matches ordering**
  - **Validates: Requirements 7.3**

- [ ] 8.3 Write property test for dashboard upcoming matches
  - **Property 27: Upcoming matches date filtering**
  - **Validates: Requirements 7.4**

- [x] 9. Implement BulkImportService
  - Create BulkImportService class
  - Implement JSON file parsing
  - Add team data validation
  - Implement required field validation
  - Add poule validation for applicable categories
  - Implement duplicate detection
  - Add error collection and reporting
  - Implement batch team creation
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 9.1 Write property test for JSON parsing
  - **Property 29: JSON parsing correctness**
  - **Validates: Requirements 8.1**

- [ ] 9.2 Write property test for required field validation
  - **Property 30: Required field validation**
  - **Validates: Requirements 8.2**

- [ ] 9.3 Write property test for poule validation
  - **Property 31: Poule validation for required categories**
  - **Validates: Requirements 8.3**

- [ ] 9.4 Write property test for error resilience
  - **Property 32: Error resilience**
  - **Validates: Requirements 8.4**

- [ ] 9.5 Write property test for import summary
  - **Property 33: Import summary accuracy**
  - **Validates: Requirements 8.5**

- [ ] 9.6 Write property test for duplicate detection
  - **Property 34: Duplicate detection**
  - **Validates: Requirements 8.6**

- [x] 10. Create BulkImportController and file upload endpoint
  - Implement POST /api/teams/bulk-import endpoint
  - Add multer middleware for file upload
  - Add file type validation (JSON only)
  - Add file size limit (10MB)
  - Return detailed import results
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 11. Enhance Match model with validation middleware
  - Add pre-save validation hook
  - Implement category matching validation
  - Implement poule matching validation
  - Add scheduling conflict check
  - Add self-match prevention
  - Add database indexes for conflict detection
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 11.1 Write property test for match status filtering
  - **Property 23: Match filtering correctness**
  - **Validates: Requirements 5.4**

- [ ] 11.2 Write property test for past match identification
  - **Property 21: Past match identification**
  - **Validates: Requirements 5.1**

- [ ] 11.3 Write property test for status persistence
  - **Property 22: Status persistence without scores**
  - **Validates: Requirements 5.2**

- [ ] 12. Build frontend DashboardOverview component
  - Create DashboardOverview component with metric cards
  - Implement API integration for dashboard metrics
  - Add recent matches list with scores
  - Add upcoming matches for next 7 days
  - Add category breakdown visualization
  - Add loading states and error handling
  - Style with Tailwind CSS and Framer Motion
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 13. Build frontend ScheduleGenerator component
  - Create ScheduleGenerator component with form
  - Add category and poule selection
  - Add start date picker
  - Add interval configuration
  - Add time slots configuration
  - Implement schedule preview table
  - Add edit/delete functionality for preview matches
  - Add confirm/cancel actions
  - Integrate with schedule API endpoints
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 14. Build frontend StatisticsPanel component
  - Create StatisticsPanel component
  - Add category and poule filters
  - Implement team statistics table
  - Add category-wide metrics display
  - Add performance charts (optional visualization)
  - Integrate with statistics API endpoints
  - Add export functionality (CSV/PDF)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 15. Build frontend BulkImportModal component
  - Create BulkImportModal component
  - Add file upload dropzone with drag-and-drop
  - Add file validation (type, size)
  - Implement upload progress indicator
  - Display import results summary
  - Show error list with details
  - Add download sample JSON template button
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 16. Build frontend CategoryManagement component
  - Create CategoryManagement component
  - Add category list view
  - Implement add/edit category form
  - Add poule configuration interface
  - Implement delete with validation
  - Show error messages for categories in use
  - Integrate with category API endpoints
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 17. Enhance MatchManagement component with automation features
  - Add automatic classification update indicator
  - Add validation error display
  - Improve match status visual distinction
  - Add bulk actions (delete multiple matches)
  - Add schedule generation button
  - Integrate with enhanced validation
  - _Requirements: 2.1, 4.1, 4.2, 4.3, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.6, 6.7, 6.8_

- [ ] 18. Add database indexes for performance
  - Add Match indexes for category, poule, date, status
  - Add Match indexes for scheduling conflict detection
  - Add Classification indexes for ranking queries
  - Add Team indexes for category and poule queries
  - Add Category indexes
  - Test query performance with explain()
  - _Requirements: All (performance optimization)_

- [ ] 19. Implement caching layer
  - Add Redis or in-memory cache setup
  - Implement cache for dashboard metrics (5 min TTL)
  - Implement cache for category statistics (10 min TTL)
  - Add cache invalidation on match completion
  - Add cache invalidation on team changes
  - _Requirements: 4.1, 4.2, 4.3, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 20. Add comprehensive error handling
  - Implement global error handler middleware
  - Add specific error handlers for validation errors
  - Add error logging
  - Implement user-friendly error messages
  - Add error response formatting
  - _Requirements: All (error handling)_

- [ ] 21. Create database migration scripts
  - Create script to add Category collection
  - Create script to seed initial categories
  - Create script to add new indexes
  - Create script to update existing Match documents
  - Test migrations on development database
  - _Requirements: All (database setup)_

- [ ] 22. Add API documentation
  - Document all new endpoints with examples
  - Add request/response schemas
  - Document error codes and messages
  - Add authentication requirements
  - Create Postman collection
  - _Requirements: All (documentation)_

- [ ] 23. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 24. Integration testing
  - Test complete schedule generation workflow
  - Test match completion and classification update workflow
  - Test bulk import workflow
  - Test dashboard metrics accuracy
  - Test category management workflow
  - _Requirements: All (integration testing)_

- [ ] 25. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
