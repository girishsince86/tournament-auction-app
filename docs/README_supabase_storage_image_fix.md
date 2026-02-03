# Profile Image URL Fix for Volleyball Players

## Problem Statement

The profile image URLs for volleyball players in the `players` table have been replaced with UI avatar URLs (from ui-avatars.com) instead of using the actual profile images stored in Supabase storage. This has resulted in all players displaying generic avatar images rather than their actual profile photos.

## Actual Supabase Storage URL Format

Based on the provided example, the correct format for profile image URLs in Supabase storage is:

```
https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/0a6783a0-e742-4c02-9914-b32ad7e851d4-1740479749111.jpg
```

This URL follows the pattern:
- Base URL: `https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public`
- Bucket/Path: `tournament-media/profile-images`
- Filename: `0a6783a0-e742-4c02-9914-b32ad7e851d4-1740479749111.jpg` (UUID-timestamp format)

## Available Solutions

We've created several SQL scripts to address this issue, with different approaches:

### 1. Direct Filename Approach: `update_player_profile_images_from_filenames.sql` (Recommended)

This script directly uses a list of known image filenames to update the profile image URLs in both the `players` and `tournament_registrations` tables. This is the most direct and reliable approach if you know the exact filenames of the images in your Supabase storage.

### 2. Comprehensive Solution: `comprehensive_profile_image_fix.sql`

This script tries multiple approaches in sequence to ensure the best possible results:
1. First, it tries to restore original URLs from the `profile_image_url` field in the `tournament_registrations` table
2. Then, it tries to extract URLs from the `registration_data` field in the `players` table (checking multiple possible field names)
3. Next, it performs a deep scan of all fields in `registration_data` for URL patterns
4. Finally, it generates new UUID-based URLs for any remaining players with avatar URLs

### 3. Restore Original URLs: `restore_original_profile_images.sql`

This script checks if there are valid profile image URLs in the `profile_image_url` field of the `tournament_registrations` table and restores them to the `players` table.

### 4. Extract URLs from Registration Data: `extract_profile_images_from_registration_data.sql`

This script checks if there are profile image URLs stored in the `registration_data` JSONB field of the `players` table and extracts them to update the `profile_image_url` field. It checks for multiple possible field names (`profileImageUrl`, `profile_image_url`, and `profile_url`) to handle different data structures.

### 5. Basic Solution: `update_player_profile_images_from_storage.sql`

This script updates profile image URLs for volleyball players using a simple naming convention based on player names.

### 6. Configurable Solution: `update_player_profile_images_from_storage_configurable.sql`

This script allows you to configure the storage URL and bucket name to match your Supabase setup.

### 7. Manual Mapping Solution: `update_player_profile_images_manual_mapping.sql`

This script allows you to manually map player names to specific image filenames in Supabase storage.

### 8. UUID-Based Solution: `update_player_profile_images_from_supabase.sql`

This script generates new profile image URLs using the correct Supabase storage URL format with UUIDs and timestamps.

## Recommended Approach

We now strongly recommend using the direct filename approach first:

```sql
\i update_player_profile_images_from_filenames.sql
```

This script will:
1. Create a temporary table with the known image filenames
2. Assign these images to volleyball players who are currently using avatar URLs
3. Update both the `players` and `tournament_registrations` tables

If there are not enough image files for all players, the script will update as many as possible and leave the rest with avatar URLs. You can then run the comprehensive solution for any remaining players:

```sql
\i comprehensive_profile_image_fix.sql
```

## How to Use These Scripts

### Prerequisites

For the UUID-based solutions, make sure the uuid-ossp extension is enabled in your database:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Steps to Fix Profile Image URLs

1. **Configure the script**:
   - For the direct filename approach, update the configuration variables at the top of the script:
     ```sql
     \set storage_base_url 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public'
     \set bucket_name 'tournament-media/profile-images'
     ```
   - If you have more image files to add, modify the INSERT statement in Step 2 of the script.

2. **Run the script**:
   ```
   \i update_player_profile_images_from_filenames.sql
   ```

3. **Review the output**:
   - The script will provide detailed logging of what it's doing at each step
   - It will show how many players were updated with each approach
   - At the end, it will show the final state and a sample of updated profile image URLs

4. **Handle any remaining issues**:
   - If some players still have avatar URLs, you can run the comprehensive solution:
     ```
     \i comprehensive_profile_image_fix.sql
     ```

## Important Notes

1. **Direct Filename Approach**: The `update_player_profile_images_from_filenames.sql` script directly uses a list of known image filenames to update the profile image URLs. This is the most reliable approach if you know the exact filenames of the images in your Supabase storage.

2. **Comprehensive Solution**: The `comprehensive_profile_image_fix.sql` script tries multiple approaches in sequence and provides detailed logging. This is recommended for any players not covered by the direct filename approach.

3. **Restoring Original URLs**: The `restore_original_profile_images.sql` script will only work if valid URLs still exist in the `profile_image_url` field of the `tournament_registrations` table.

4. **Extracting from JSON**: The `extract_profile_images_from_registration_data.sql` script will only work if valid URLs exist in the `registration_data` JSONB object in the `players` table. The script checks for multiple possible field names (`profileImageUrl`, `profile_image_url`, and `profile_url`) to handle different data structures.

5. **UUID-Based Solution**: If you use a solution that generates new UUID-based URLs, you'll need to upload actual images to the generated URLs in Supabase storage. The script only updates the database records, not the actual image files.

6. **Manual Mapping**: If you have specific image filenames that don't follow a consistent naming convention, use the manual mapping solution and add mappings for each player.

## Troubleshooting

If you encounter issues with the scripts:

1. **Check the configuration variables** to ensure they match your Supabase setup.
2. **Verify that the uuid-ossp extension is enabled** if using a solution that generates UUIDs.
3. **Check the format of your existing image URLs** in Supabase storage to ensure the scripts are generating compatible URLs.
4. **Test the scripts on a small subset of players** before applying them to all players.
5. **Check the JSON structure** of the `registration_data` field if using the extraction script. The scripts are designed to check for multiple possible field names, but your data might use a different structure.

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [PostgreSQL UUID Functions](https://www.postgresql.org/docs/current/functions-uuid.html)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [PostgreSQL Text Functions](https://www.postgresql.org/docs/current/functions-string.html) 