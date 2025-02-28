-- Script to directly update the profile image URLs for the 6 mismatched players
-- This script fixes the mismatches between player UUIDs and image filenames

-- Begin transaction
BEGIN;

-- First, set all profile image URLs to NULL to clear any incorrect values
-- This helps ensure we're starting from a clean state

-- Clear URLs in players table
UPDATE players 
SET profile_image_url = NULL
WHERE id IN (
    'f565d332-9cac-4cff-9ceb-a45457213c35',
    '84a0618e-8da1-4f0a-a7ed-0a58b75e56c7',
    'b798ce9d-d55d-4cec-aa38-31ce46fe5a64',
    'fbcb18bf-8636-465f-99d7-d330c7d03505',
    '837f011f-178d-4262-81aa-6bd88583fb0a',
    'f38be24c-f139-48f4-903b-a926fb3971d9'
);

-- Clear URLs in tournament_registrations table
UPDATE tournament_registrations 
SET profile_image_url = NULL
WHERE id IN (
    'f565d332-9cac-4cff-9ceb-a45457213c35',
    '84a0618e-8da1-4f0a-a7ed-0a58b75e56c7',
    'b798ce9d-d55d-4cec-aa38-31ce46fe5a64',
    'fbcb18bf-8636-465f-99d7-d330c7d03505',
    '837f011f-178d-4262-81aa-6bd88583fb0a',
    'f38be24c-f139-48f4-903b-a926fb3971d9'
);

-- Now update with the correct URLs

-- 1. Devaraju Mandapati (VERIFIED FILENAME)
UPDATE players 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/f565d332-9cac-4cff-9ceb-a45457213c35-1740534995514.jpg'
WHERE id = 'f565d332-9cac-4cff-9ceb-a45457213c35';

UPDATE tournament_registrations 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/f565d332-9cac-4cff-9ceb-a45457213c35-1740534995514.jpg'
WHERE id = 'f565d332-9cac-4cff-9ceb-a45457213c35';

-- 2. Hemant Deka (VERIFY THIS FILENAME BEFORE RUNNING)
UPDATE players 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/84a0618e-8da1-4f0a-a7ed-0a58b75e56c7-1740643965352.jpg'
WHERE id = '84a0618e-8da1-4f0a-a7ed-0a58b75e56c7';

UPDATE tournament_registrations 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/84a0618e-8da1-4f0a-a7ed-0a58b75e56c7-1740643965352.jpg'
WHERE id = '84a0618e-8da1-4f0a-a7ed-0a58b75e56c7';

-- 3. Kishore Babu (VERIFY THIS FILENAME BEFORE RUNNING)
UPDATE players 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/b798ce9d-d55d-4cec-aa38-31ce46fe5a64-1740533820997.jpg'
WHERE id = 'b798ce9d-d55d-4cec-aa38-31ce46fe5a64';

UPDATE tournament_registrations 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/b798ce9d-d55d-4cec-aa38-31ce46fe5a64-1740533820997.jpg'
WHERE id = 'b798ce9d-d55d-4cec-aa38-31ce46fe5a64';

-- 4. Mulpuri Krishnapriya (VERIFY THIS FILENAME BEFORE RUNNING)
UPDATE players 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/fbcb18bf-8636-465f-99d7-d330c7d03505-1740492906342.jpg'
WHERE id = 'fbcb18bf-8636-465f-99d7-d330c7d03505';

UPDATE tournament_registrations 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/fbcb18bf-8636-465f-99d7-d330c7d03505-1740492906342.jpg'
WHERE id = 'fbcb18bf-8636-465f-99d7-d330c7d03505';

-- 5. RAJ KIRAN SINGH (VERIFY THIS FILENAME BEFORE RUNNING)
UPDATE players 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/837f011f-178d-4262-81aa-6bd88583fb0a-1740452625158.jpg'
WHERE id = '837f011f-178d-4262-81aa-6bd88583fb0a';

UPDATE tournament_registrations 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/837f011f-178d-4262-81aa-6bd88583fb0a-1740452625158.jpg'
WHERE id = '837f011f-178d-4262-81aa-6bd88583fb0a';

-- 6. Servejeet Singh (VERIFY THIS FILENAME BEFORE RUNNING)
UPDATE players 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/f38be24c-f139-48f4-903b-a926fb3971d9-1740404262877.jpg'
WHERE id = 'f38be24c-f139-48f4-903b-a926fb3971d9';

UPDATE tournament_registrations 
SET profile_image_url = 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/f38be24c-f139-48f4-903b-a926fb3971d9-1740404262877.jpg'
WHERE id = 'f38be24c-f139-48f4-903b-a926fb3971d9';

-- Commit the transaction
COMMIT;

-- Verify the updates
SELECT 
    p.id AS player_uuid,
    p.name AS player_name,
    p.profile_image_url AS image_url,
    CASE 
        WHEN p.id::text = SUBSTRING(p.profile_image_url FROM '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})') THEN 'ALIGNED'
        ELSE 'MISMATCHED'
    END AS alignment_status
FROM players p
WHERE p.id IN (
    'f565d332-9cac-4cff-9ceb-a45457213c35',
    '84a0618e-8da1-4f0a-a7ed-0a58b75e56c7',
    'b798ce9d-d55d-4cec-aa38-31ce46fe5a64',
    'fbcb18bf-8636-465f-99d7-d330c7d03505',
    '837f011f-178d-4262-81aa-6bd88583fb0a',
    'f38be24c-f139-48f4-903b-a926fb3971d9'
)
ORDER BY p.name;

-- Instructions:
-- 1. IMPORTANT: Verify all filenames before running this script!
--    Only the filename for Devaraju Mandapati has been confirmed.
--    The other filenames need to be checked against your actual storage bucket.
--
-- 2. Run this script with:
--    \i update_volleyball_player_mismatches.sql
--
-- 3. This script will:
--    - First clear all profile image URLs for the 6 players
--    - Then update with the correct URLs
--    - Update both the players and tournament_registrations tables
--    - Verify that the updates were successful
--
-- 4. The script uses a transaction to ensure that all updates are applied atomically.
--    If any update fails, all changes will be rolled back. 