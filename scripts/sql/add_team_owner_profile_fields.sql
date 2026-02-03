-- Add new fields to team_owner_profiles table
-- These fields will be added to the database schema but the actual data
-- will be sourced from the JSON file at src/data/team-owners-data.json
ALTER TABLE team_owner_profiles
ADD COLUMN profession TEXT,
ADD COLUMN sports_interests TEXT,
ADD COLUMN family_impact TEXT,
ADD COLUMN philosophy TEXT;

-- Note: We are NOT populating these fields in the database.
-- All content data is stored in the JSON file at:
-- src/data/team-owners-data.json
--
-- This approach allows for complete content management through the JSON file
-- without requiring database migrations for content changes.
--
-- The API will use only essential fields from the database (IDs, profile image)
-- and replace all content fields with data from the JSON file at runtime.
--
-- If you need to update the team owner profile data, please edit the JSON file instead
-- of running SQL updates. 