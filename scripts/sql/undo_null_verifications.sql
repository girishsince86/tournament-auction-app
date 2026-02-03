-- Script to undo verification of registrations where the verified_by field is null
-- This script identifies and fixes registrations that were incorrectly marked as verified

-- Begin transaction
BEGIN;

-- First, count and identify registrations that are verified but have null verified_by
DO $$
DECLARE
    v_invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_invalid_count
    FROM tournament_registrations
    WHERE is_verified = TRUE
    AND (verified_by IS NULL OR verified_by = '');
    
    RAISE NOTICE 'Found % registrations that are verified but have null or empty verified_by', v_invalid_count;
END;
$$ LANGUAGE plpgsql;

-- Show sample of registrations that will be updated
SELECT 
    id,
    first_name || ' ' || last_name AS player_name,
    registration_category,
    is_verified,
    verified_by,
    verified_at
FROM tournament_registrations
WHERE is_verified = TRUE
AND (verified_by IS NULL OR verified_by = '')
ORDER BY registration_category, first_name, last_name
LIMIT 10;

-- Update registrations to set is_verified to FALSE where verified_by is NULL or empty
UPDATE tournament_registrations
SET 
    is_verified = FALSE,
    verified_at = NULL
WHERE is_verified = TRUE
AND (verified_by IS NULL OR verified_by = '');

-- Verify the updates
DO $$
DECLARE
    v_updated_count INTEGER;
    v_remaining_count INTEGER;
BEGIN
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    SELECT COUNT(*) INTO v_remaining_count
    FROM tournament_registrations
    WHERE is_verified = TRUE
    AND (verified_by IS NULL OR verified_by = '');
    
    RAISE NOTICE 'Updated % registrations to unverified status', v_updated_count;
    RAISE NOTICE 'Remaining invalid registrations: % (should be 0)', v_remaining_count;
END;
$$ LANGUAGE plpgsql;

-- Commit the transaction
COMMIT;

-- Instructions:
-- 1. Run this script with:
--    \i undo_null_verifications.sql
--
-- 2. This script will:
--    - Identify registrations that are marked as verified but have null or empty verified_by
--    - Show a sample of these registrations before making changes
--    - Update these registrations to set is_verified to FALSE and verified_at to NULL
--    - Verify that all invalid registrations have been fixed
--
-- 3. The script uses a transaction to ensure that all updates are applied atomically.
--    If any update fails, all changes will be rolled back.
--
-- 4. After running this script, you should see a message indicating how many registrations
--    were updated and confirming that no invalid registrations remain. 