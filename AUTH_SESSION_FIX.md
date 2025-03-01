# Authentication Session Fix

## Problem
After team owners changed their passwords, several API endpoints were returning 401 Unauthorized responses. This was happening because:

1. When a user changes their password in Supabase, the current session token is invalidated
2. The client-side application was continuing to use the old (now invalid) token
3. API requests were failing with 401 errors

Affected endpoints included:
- `/api/tournaments`
- `/api/team-management/owner-profiles`
- `/api/teams/available`
- `/api/team-management/owner-profile`

## Solution

We implemented several changes to fix this issue:

### 1. Enhanced Password Update Function
- Modified the `updatePassword` function in `src/features/auth/context/auth-context.tsx` to properly refresh the session after a password change
- Added error handling to ensure users are redirected to login if session refresh fails

### 2. Created API Client Utility
- Added a new utility file `src/lib/utils/api-client.ts` with:
  - `refreshSession()` function to refresh the authentication token
  - `fetchWithAuth()` function that automatically handles 401 errors by refreshing the session and retrying the request

### 3. Updated API Clients
- Refactored API client functions to use the new `fetchWithAuth` utility:
  - `src/hooks/useTournaments.ts`
  - `src/hooks/useTeams.ts`
  - `src/lib/api/team-owner.ts`

### 4. Added Type Definitions
- Created type definition files to support the refactored API clients:
  - `src/types/tournament.ts`
  - `src/types/team.ts`

## How It Works

1. When a user changes their password, we now:
   - Update the password with Supabase
   - Immediately refresh the session to get a new valid token
   - Update the application state with the new user session

2. For all API requests, we now:
   - Make the initial request
   - If a 401 error is received, automatically refresh the session
   - Retry the request with the new token
   - If the session refresh fails, redirect to login

This approach ensures that even if a session token becomes invalid (due to password change or other reasons), the application will automatically recover without requiring the user to manually log out and log back in.

## Testing

To test this fix:
1. Log in as a team owner
2. Change the password in the profile settings
3. Navigate to pages that use the affected API endpoints
4. Verify that the data loads correctly without 401 errors 