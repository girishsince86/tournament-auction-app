-- Drop the trigger first
DROP TRIGGER IF EXISTS validate_youth_category_fields_trigger ON tournament_registrations;

-- Drop the validation function
DROP FUNCTION IF EXISTS validate_youth_category_fields();

-- Remove the columns (this will be re-added by the new migration)
ALTER TABLE tournament_registrations
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS date_of_birth,
DROP COLUMN IF EXISTS parent_name,
DROP COLUMN IF EXISTS parent_phone_number; 