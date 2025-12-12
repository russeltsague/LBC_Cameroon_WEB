# Requirements Document

## Introduction

This specification defines the enhancement of the LBC (Ligue de Basketball du Congo) admin dashboard to provide comprehensive management capabilities and intelligent automation features. The system currently supports basic CRUD operations for teams and matches but lacks automated schedule generation, real-time classification updates, and intelligent data validation. This enhancement will transform the admin experience from manual data entry to an intelligent, automated management system that reduces errors, saves time, and ensures data consistency across the platform.

## Glossary

- **System**: The LBC admin dashboard web application
- **Admin**: An authenticated administrator user with full management privileges
- **Match**: A basketball game between two teams with date, time, venue, and score information
- **Team**: A basketball team entity with name, category, poule, and other metadata
- **Classification**: The standings table showing team rankings, points, wins, losses, and statistics
- **Category**: A competition division (L1 MESSIEUR, L1 DAME, L2A MESSIEUR, L2B MESSIEUR, U18 GARCONS, U18 FILLES, VETERANT, CORPO, DAMES)
- **Poule**: A sub-group within certain categories (A, B, or C) used for U18 GARCONS and L2A MESSIEUR
- **Journée**: A matchday or round number in the competition schedule
- **Round-Robin**: A tournament format where each team plays every other team
- **FIBA Rules**: International basketball federation scoring rules (2 points for win, 1 for loss, 0 for forfeit)
- **Forfeit**: A match where one team fails to appear or withdraws
- **Schedule Generation**: The automated creation of match fixtures using round-robin algorithm
- **Classification Update**: The automatic recalculation of standings when match scores are entered
- **Public Website**: The user-facing website that displays matches and standings

## Requirements

### Requirement 1

**User Story:** As an admin, I want to automatically generate complete match schedules for a category, so that I can create an entire season's fixtures in seconds instead of manually entering each match.

#### Acceptance Criteria

1. WHEN an admin selects a category with at least 2 teams and initiates schedule generation, THEN the System SHALL create round-robin fixtures where each team plays every other team exactly once
2. WHEN the System generates fixtures for categories with poules, THEN the System SHALL create separate schedules for each poule where teams only play others within their poule
3. WHEN the System generates a schedule, THEN the System SHALL alternate home and away assignments to ensure fair distribution of home matches for each team
4. WHEN the System generates fixtures, THEN the System SHALL assign the home team's arena as the default venue for each match
5. WHEN an admin provides a start date for schedule generation, THEN the System SHALL distribute matches across journées with configurable intervals between matchdays
6. WHEN the System generates a schedule, THEN the System SHALL create all matches with status set to upcoming and without scores
7. WHEN an admin attempts to generate a schedule for a category with fewer than 2 teams, THEN the System SHALL prevent generation and display an error message indicating insufficient teams

### Requirement 2

**User Story:** As an admin, I want the classification tables to update automatically when I enter match scores, so that I never have to manually calculate points, rankings, or statistics.

#### Acceptance Criteria

1. WHEN an admin updates a match status to completed with valid scores, THEN the System SHALL immediately recalculate classification entries for both participating teams
2. WHEN the System updates classification after a match, THEN the System SHALL increment the played count for both teams by one
3. WHEN the System processes a completed match where the home team wins, THEN the System SHALL award 2 FIBA points to the home team and 1 FIBA point to the away team
4. WHEN the System processes a completed match where the away team wins, THEN the System SHALL award 2 FIBA points to the away team and 1 FIBA point to the home team
5. WHEN the System processes a match with a forfeit flag, THEN the System SHALL award 2 FIBA points to the non-forfeiting team and 0 points to the forfeiting team
6. WHEN the System updates classification, THEN the System SHALL recalculate pointsFor, pointsAgainst, and pointsDifference for both teams based on match scores
7. WHEN the System updates classification, THEN the System SHALL reorder all teams in the category by FIBA rules: points descending, then pointsDifference descending, then pointsFor descending
8. WHEN the System updates team positions, THEN the System SHALL assign position numbers starting from 1 for the highest-ranked team
9. WHEN the System updates classification for categories with poules, THEN the System SHALL calculate separate rankings for each poule

### Requirement 3

**User Story:** As an admin, I want to view comprehensive statistics for teams and categories, so that I can analyze performance without manual calculations.

#### Acceptance Criteria

1. WHEN an admin views a team's statistics, THEN the System SHALL display total matches played, wins, losses, win percentage, points scored, points conceded, and average points per game
2. WHEN an admin views category-wide statistics, THEN the System SHALL display total matches played, total matches completed, total matches upcoming, and average points per match
3. WHEN an admin views a team's recent form, THEN the System SHALL display the last 5 match results as a sequence of wins and losses
4. WHEN the System calculates win percentage, THEN the System SHALL compute it as wins divided by total matches played multiplied by 100
5. WHEN the System calculates average points per game, THEN the System SHALL divide total points scored by total matches played

### Requirement 4

**User Story:** As an admin, I want classification updates to automatically publish to the public website, so that users see current standings immediately without manual intervention.

#### Acceptance Criteria

1. WHEN the System updates classification tables in the database, THEN the System SHALL make updated standings immediately available to the public website API
2. WHEN a user views standings on the public website, THEN the System SHALL display the most recently calculated classification data
3. WHEN the System updates a team's position, THEN the System SHALL reflect the new position on the public website within 1 second

### Requirement 5

**User Story:** As an admin, I want matches to automatically transition from upcoming to completed based on their date, so that the match list stays organized without manual status updates.

#### Acceptance Criteria

1. WHEN the System checks match statuses, THEN the System SHALL identify matches with status upcoming where the match date is in the past
2. WHEN a match date has passed and status is upcoming, THEN the System SHALL keep the status as upcoming until scores are entered
3. WHEN an admin views the match list, THEN the System SHALL visually distinguish upcoming matches, live matches, and completed matches
4. WHEN an admin filters matches by status, THEN the System SHALL return only matches matching the selected status

### Requirement 6

**User Story:** As an admin, I want the system to validate data entry automatically, so that I cannot create invalid matches or schedules that would cause errors.

#### Acceptance Criteria

1. WHEN an admin attempts to create a match with teams from different categories, THEN the System SHALL prevent creation and display an error message indicating category mismatch
2. WHEN an admin attempts to create a match with teams from different poules within the same category, THEN the System SHALL prevent creation and display an error message indicating poule mismatch
3. WHEN an admin attempts to schedule two matches for the same team at the same date and time, THEN the System SHALL prevent creation and display an error message indicating scheduling conflict
4. WHEN an admin attempts to create a match where homeTeam equals awayTeam, THEN the System SHALL prevent creation and display an error message indicating a team cannot play itself
5. WHEN an admin attempts to generate a schedule for a category, THEN the System SHALL verify all teams in that category have valid arena information before proceeding
6. WHEN an admin enters match scores, THEN the System SHALL validate that both homeScore and awayScore are non-negative integers
7. WHEN an admin attempts to create a match with a journée value less than 1, THEN the System SHALL prevent creation and display an error message indicating invalid journée
8. WHEN an admin selects a category requiring poules for match creation, THEN the System SHALL require poule selection and prevent creation without it

### Requirement 7

**User Story:** As an admin, I want a dashboard overview showing key metrics and recent activity, so that I can quickly understand the current state of the league.

#### Acceptance Criteria

1. WHEN an admin views the dashboard, THEN the System SHALL display total number of teams across all categories
2. WHEN an admin views the dashboard, THEN the System SHALL display total number of matches scheduled, completed, and upcoming
3. WHEN an admin views the dashboard, THEN the System SHALL display a list of the 5 most recently updated matches with scores
4. WHEN an admin views the dashboard, THEN the System SHALL display upcoming matches for the next 7 days
5. WHEN an admin views the dashboard, THEN the System SHALL display category-wise breakdown of teams and matches

### Requirement 8

**User Story:** As an admin, I want to bulk import teams from a file, so that I can quickly populate the system with multiple teams instead of entering them one by one.

#### Acceptance Criteria

1. WHEN an admin uploads a valid JSON file containing team data, THEN the System SHALL parse the file and validate each team entry
2. WHEN the System processes a bulk import, THEN the System SHALL validate that each team has required fields: name, category, city, arena, coach, and about
3. WHEN the System processes a bulk import for categories requiring poules, THEN the System SHALL validate that each team has a valid poule assignment
4. WHEN the System encounters invalid team data during import, THEN the System SHALL skip that entry, log the error, and continue processing remaining teams
5. WHEN the System completes a bulk import, THEN the System SHALL display a summary showing number of teams successfully imported and number of errors
6. WHEN the System imports a team with a name that already exists in the same category and poule, THEN the System SHALL skip that team and log a duplicate error

### Requirement 9

**User Story:** As an admin, I want to edit or delete generated schedules before finalizing them, so that I can make adjustments for venue changes or special circumstances.

#### Acceptance Criteria

1. WHEN an admin generates a schedule, THEN the System SHALL display a preview of all generated matches before saving to the database
2. WHEN an admin views a schedule preview, THEN the System SHALL allow editing of date, time, and venue for individual matches
3. WHEN an admin views a schedule preview, THEN the System SHALL allow removal of individual matches from the generated schedule
4. WHEN an admin confirms a schedule, THEN the System SHALL save all matches to the database with status upcoming
5. WHEN an admin cancels a schedule preview, THEN the System SHALL discard all generated matches without saving

### Requirement 10

**User Story:** As an admin, I want to manage categories and their configuration, so that I can add new competition divisions or modify existing ones.

#### Acceptance Criteria

1. WHEN an admin creates a new category, THEN the System SHALL require a unique category name
2. WHEN an admin configures a category, THEN the System SHALL allow specification of whether the category uses poules
3. WHEN an admin configures a category with poules, THEN the System SHALL allow specification of poule names
4. WHEN an admin attempts to delete a category with existing teams, THEN the System SHALL prevent deletion and display an error message indicating the category is in use
5. WHEN an admin attempts to delete a category with existing matches, THEN the System SHALL prevent deletion and display an error message indicating the category has scheduled matches
