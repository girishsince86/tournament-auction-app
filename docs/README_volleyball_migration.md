# Volleyball Registrations to Players Migration

This set of SQL scripts provides a comprehensive solution for migrating volleyball registrations from the `tournament_registrations` table to the `players` table in the Tournament Auction App database.

## Overview

The migration process includes:

1. Copying only volleyball registrations to the Players table
2. Setting the status to 'AVAILABLE' for all players
3. Properly populating the profile_image_url and registration_data JSONB fields
4. Not populating the category_id field as requested

## Files

- `copy_volleyball_registrations_to_players.sql`: Basic script to copy volleyball registrations to players
- `manage_volleyball_players.sql`: Additional functions for updating and cleaning up players
- `volleyball_players_migration.sql`: Comprehensive script with all functionality combined

## Usage

### Basic Copy Operation

To simply copy volleyball registrations to the players table:

```sql
-- Execute the function to copy volleyball registrations to players
SELECT * FROM copy_volleyball_registrations_to_players();

-- Check the results
SELECT * FROM check_volleyball_players_copy();
```

### Comprehensive Migration

For a more comprehensive migration with options:

```sql
-- To copy new players only:
SELECT * FROM execute_volleyball_players_migration();

-- To clean up existing players and then copy new ones:
SELECT * FROM execute_volleyball_players_migration(NULL, FALSE, TRUE);

-- To copy new players and update existing ones:
SELECT * FROM execute_volleyball_players_migration(NULL, TRUE, FALSE);

-- To clean up, copy new players, and update existing ones:
SELECT * FROM execute_volleyball_players_migration(NULL, TRUE, TRUE);

-- To get statistics after migration:
SELECT * FROM get_volleyball_players_statistics();
```

## Function Parameters

### execute_volleyball_players_migration

```sql
execute_volleyball_players_migration(
    p_team_id UUID DEFAULT NULL,
    p_update_existing BOOLEAN DEFAULT FALSE,
    p_cleanup_first BOOLEAN DEFAULT FALSE
)
```

- `p_team_id`: The team ID to associate with the players. If NULL, uses the most recent team.
- `p_update_existing`: Whether to update existing players that were already copied from registrations.
- `p_cleanup_first`: Whether to clean up (delete) existing players that were copied from registrations before copying new ones.

## Data Mapping

The following fields are mapped from `tournament_registrations` to `players`:

| Players Field       | Tournament Registrations Field | Notes                                      |
|---------------------|--------------------------------|--------------------------------------------|
| id                  | id                             | Uses the same UUID                         |
| name                | first_name + last_name         | Concatenated with a space                  |
| player_position     | playing_positions[1]           | Takes the first position from the array    |
| base_price          | skill_level                    | Mapped based on skill level                |
| phone_number        | phone_number                   | Direct mapping                             |
| apartment_number    | flat_number                    | Direct mapping                             |
| jersey_number       | tshirt_number                  | Direct mapping                             |
| skill_level         | skill_level                    | Direct mapping                             |
| height              | height                         | Converted to integer                       |
| status              | 'AVAILABLE'                    | Hardcoded as requested                     |
| tshirt_size         | tshirt_size                    | Direct mapping                             |
| profile_image_url   | profile_image_url              | Direct mapping                             |
| registration_data   | Multiple fields                | Stored as JSONB with all registration data |
| category_id         | NULL                           | Not populated as requested                 |
| current_team_id     | NULL                           | Set to the most recent team ID             |

## Important Note About Table Structure

The scripts have been updated to reflect the actual structure of the `players` table. The original scripts incorrectly referenced a `tournament_id` column, but the actual column name is `current_team_id`. All scripts have been updated to use the correct column name and to reference the `teams` table instead of the `tournaments` table.

If you encounter any errors related to column names or table references, please check the actual structure of your database tables using the following command:

```sql
\d players
```

## JSONB Structure

The `registration_data` JSONB field contains the following structure:

```json
{
  "registration_category": "VOLLEYBALL_OPEN_MEN",
  "registration_type": "...",
  "all_positions": ["P1_RIGHT_BACK", "P2_RIGHT_FRONT"],
  "email": "user@example.com",
  "date_of_birth": "1990-01-01",
  "parent_name": "...",
  "parent_phone_number": "...",
  "tshirt_name": "...",
  "verification_info": {
    "verified_by": "...",
    "verified_at": "2023-01-01T00:00:00Z",
    "verification_notes": "..."
  },
  "payment_info": {
    "upi_id": "...",
    "transaction_id": "...",
    "paid_to": "...",
    "amount_received": 100
  }
}
```

## Notes

- Only registrations with `registration_category` like 'VOLLEYBALL%' are copied
- The script checks for existing players to avoid duplicates
- The status is set to 'AVAILABLE' for all players as requested
- The category_id field is not populated as requested 