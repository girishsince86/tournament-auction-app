# Cleaning Up and Reloading the Players Table

This set of SQL scripts provides solutions for cleaning up the Players table and reloading it with volleyball registrations.

## Problem Statement

You currently have 104 records in the Players table but only 78 volleyball registrations. This indicates that there are extra records in the Players table that need to be cleaned up before importing the volleyball registrations.

## Scripts Overview

1. **analyze_players_and_registrations.sql**
   - Analyzes the current state of the Players table and tournament registrations
   - Provides detailed counts and breakdowns to help diagnose issues
   - Includes recommendations based on the analysis

2. **reset_players_table.sql**
   - Provides several options for cleaning up the Players table
   - Option 1: Delete ALL players (complete reset)
   - Option 2: Delete only players that came from registrations (default)
   - Option 3: Delete only players that came from volleyball registrations
   - Option 4: Delete orphaned players (without corresponding registration records)

3. **cleanup_and_reload_volleyball_players.sql**
   - Comprehensive script that handles the entire process in one go
   - Cleans up existing players from volleyball registrations
   - Cleans up orphaned players
   - Loads volleyball registrations into the Players table
   - Verifies the final counts

4. **copy_volleyball_registrations_to_players.sql**
   - Copies volleyball registrations to the Players table
   - Sets status to 'AVAILABLE' for all players
   - Properly populates profile_image_url and registration_data fields

5. **fix_enum_issue.sql**
   - Explains the issue with using LIKE operator with enum types
   - Provides examples of how to properly query enum types
   - Demonstrates alternative approaches for working with enum values

## Important Note About Enum Types

The scripts have been updated to fix an issue with the `registration_category` column, which is an enum type. When using the LIKE operator with enum types, you need to cast them to text first:

```sql
-- INCORRECT (will cause an error):
WHERE registration_category LIKE 'VOLLEYBALL%'

-- CORRECT:
WHERE registration_category::text LIKE 'VOLLEYBALL%'
```

All scripts have been updated to use the correct syntax. If you encounter any similar errors with other enum columns, make sure to cast them to text before using string operators like LIKE.

## Important Note About Table Structure

The scripts have been updated to reflect the actual structure of the `players` table. The original scripts incorrectly referenced a `tournament_id` column, but the actual column name is `current_team_id`. All scripts have been updated to use the correct column name and to reference the `teams` table instead of the `tournaments` table.

If you encounter any errors related to column names or table references, please check the actual structure of your database tables using the following command:

```sql
\d players
```

## Recommended Approach

### Step 1: Analyze the Current State

Run the analysis script to understand the current state of your database:

```sql
\i analyze_players_and_registrations.sql
```

This will provide detailed information about your Players table and tournament registrations, which will help you decide which approach to take.

### Step 2: Choose a Cleanup Approach

Based on the analysis, choose one of the following approaches:

#### Approach 1: Complete Solution (Recommended)

Run the comprehensive cleanup and reload script:

```sql
\i cleanup_and_reload_volleyball_players.sql
```

This script will:
1. Clean up existing players from volleyball registrations
2. Clean up orphaned players
3. Load volleyball registrations into the Players table
4. Verify the final counts

#### Approach 2: Step-by-Step Solution

If you prefer more control over the process, follow these steps:

1. Reset the Players table:
   ```sql
   \i reset_players_table.sql
   ```
   
   By default, this will delete only players that came from registrations. If you want to delete ALL players, uncomment Option 1 in the script.

2. Copy volleyball registrations to the Players table:
   ```sql
   \i copy_volleyball_registrations_to_players.sql
   ```

3. Verify the results:
   ```sql
   SELECT COUNT(*) FROM players;
   SELECT COUNT(*) FROM tournament_registrations WHERE registration_category::text LIKE 'VOLLEYBALL%';
   ```

## Notes

- The scripts are designed to be run in a PostgreSQL environment
- Make sure to back up your database before running these scripts
- The scripts include RAISE NOTICE statements to provide feedback on the operations
- If you encounter any issues, run the analysis script again to diagnose the problem 