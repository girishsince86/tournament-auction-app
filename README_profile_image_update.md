# Profile Image Update Guide

This guide explains how to update player profile images in the Tournament Auction App database.

## Background

The Tournament Auction App stores player profile images in Supabase Storage. The images are stored in the `tournament-media/profile-images` bucket with filenames in the format `[UUID]-[timestamp].jpg`.

The database has two tables that store profile image URLs:
- `players` table with a `profile_image_url` column
- `tournament_registrations` table with a `profile_image_url` column

## Solution

We've created a set of SQL scripts to update, verify, and troubleshoot profile image URLs in the database.

### Update Script

The script `update_volleyball_player_profile_images.sql` performs the following steps:

1. Creates a temporary table to store the known image filenames
2. Inserts the list of image filenames into the temporary table
3. Checks the current state of profile image URLs in the database
4. Assigns image files to players who are using default avatar URLs or have no profile image
5. Updates both the `players` and `tournament_registrations` tables
6. Checks the updated state of profile image URLs
7. Shows a sample of updated profile image URLs

### Verification Script

The script `verify_profile_images.sql` helps you verify that profile image URLs are correctly set in the database:

1. Checks profile image URLs in the `players` table
2. Checks profile image URLs in the `tournament_registrations` table
3. Identifies mismatches between the two tables
4. Lists players with Supabase URLs
5. Lists players still using avatar URLs

### Troubleshooting Script

The script `troubleshoot_profile_images.sql` helps identify and fix common issues with profile images:

1. Checks for invalid URLs
2. Identifies duplicate image assignments
3. Fixes mismatches between the `players` and `tournament_registrations` tables
4. Generates default avatar URLs for players with no profile image

## How to Run the Scripts

1. Make sure you have access to the Supabase database
2. Connect to the database using psql or any other PostgreSQL client
3. Run the update script:
   ```
   \i update_volleyball_player_profile_images.sql
   ```
4. Verify the results:
   ```
   \i verify_profile_images.sql
   ```
5. If needed, troubleshoot any issues:
   ```
   \i troubleshoot_profile_images.sql
   ```

## Configuration

The update script uses the following configuration variables:
- `storage_base_url`: The base URL for Supabase storage (e.g., `https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public`)
- `bucket_name`: The path to the profile images bucket (e.g., `tournament-media/profile-images`)

You can update these variables at the top of the script if needed.

## Troubleshooting

### Not Enough Images

If there are more players than image files, the script will update as many players as possible and leave the rest with avatar URLs. You can run the script again with additional image files to update the remaining players.

### Duplicate Filenames

The script handles duplicate filenames by using a PRIMARY KEY constraint on the temporary table. This ensures that each filename is only used once.

### Images Not Showing in UI

If the images are not showing in the UI after running the script, check the following:

1. Make sure the images actually exist in the Supabase storage bucket
2. Verify that the URLs in the database are correct
3. Check for any CORS issues in the browser console
4. Ensure that the Supabase storage bucket has the correct permissions

## Future Improvements

For future improvements, consider:

1. Creating a more robust image upload process that automatically updates the database
2. Implementing image compression to reduce storage usage
3. Adding image validation to ensure only appropriate images are uploaded
4. Creating a backup of profile images before making changes

## Related Files

- `update_volleyball_player_profile_images.sql`: The main script for updating profile image URLs
- `verify_profile_images.sql`: Script to verify profile image URLs in the database
- `troubleshoot_profile_images.sql`: Script to identify and fix common issues with profile images
- `update_player_profile_images_from_filenames.sql`: An alternative script that does similar updates
- `comprehensive_profile_image_fix.sql`: A more comprehensive fix for profile images 