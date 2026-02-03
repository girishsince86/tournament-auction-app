# Profile Image URL Fix

## Problem

We discovered that all players in the `players` table had the same profile image URL, even though many of the original registrations in the `tournament_registrations` table had valid, unique profile image URLs. This happened because our migration scripts were not properly checking if the original profile image URL was valid before deciding to generate a placeholder avatar URL.

## Solution

We've updated all the migration scripts to properly check if the original profile image URL is valid before deciding to generate a placeholder avatar URL. The scripts now:

1. Use the original profile image URL from `tournament_registrations` if it exists and is not empty
2. Only generate a placeholder avatar URL if the original URL is NULL, empty, or already contains 'ui-avatars.com'
3. Generate unique placeholder avatar URLs based on player names when needed

## Updated Scripts

The following scripts have been updated to fix the profile image URL issue:

1. `copy_volleyball_registrations_to_players.sql` - Updated to properly check profile image URLs
2. `cleanup_and_reload_volleyball_players.sql` - Updated to properly check profile image URLs and added statistics about avatar vs. original URLs
3. `volleyball_players_migration.sql` - Updated to properly check profile image URLs in both copy and update functions
4. `update_player_profile_images.sql` - Updated to use original URLs when available instead of always generating avatars

## New Scripts

We've also created a new script to analyze the profile image URLs in the `tournament_registrations` table:

- `analyze_profile_images.sql` - Analyzes profile image URLs in the `tournament_registrations` table, counting how many have valid URLs, how many have NULL or empty URLs, and how many have ui-avatars.com URLs

## How to Fix Existing Players

To fix the profile image URLs for existing players, run the updated `update_player_profile_images.sql` script:

```sql
\i update_player_profile_images.sql
```

This script will:
1. Check the current state of profile image URLs in the `players` table
2. Update the URLs to use the original URLs from `tournament_registrations` when available
3. Only generate placeholder avatar URLs when necessary
4. Show statistics about how many players are using original URLs vs. avatar URLs

## How to Analyze Profile Image URLs

To analyze the profile image URLs in the `tournament_registrations` table, run the new `analyze_profile_images.sql` script:

```sql
\i analyze_profile_images.sql
```

This script will:
1. Count total volleyball registrations
2. Analyze profile image URLs, counting how many are NULL, empty, avatar URLs, or valid URLs
3. Show a sample of valid profile image URLs
4. Count distinct profile image URLs
5. Show the most common profile image URLs

## How to Reload Players with Correct Profile Image URLs

If you want to completely reload the `players` table with correct profile image URLs, run the updated `cleanup_and_reload_volleyball_players.sql` script:

```sql
\i cleanup_and_reload_volleyball_players.sql
```

This script will:
1. Clean up existing players
2. Reload volleyball registrations with correct profile image URLs
3. Show statistics about how many players are using original URLs vs. avatar URLs 