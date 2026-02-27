import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/types/supabase'

// Helper function to check if a user is a full admin
const isFullAdmin = (email?: string): boolean => {
  // Define known admin emails (these will have full admin access)
  const adminEmails = [
    'gk@pbel.in', // Super admin
    'admin@pbel.in',  // Admin
    'amit@pbel.in',   // Admin
    'vasu@pbel.in'    // Admin
  ]; // Add all admin emails here
  return email ? adminEmails.includes(email) : false;
}

// Define explicit list of team owner emails
const teamOwnerEmails = [
  'bhupinder@pbel.in',
  'jawid@pbel.in',
  'surya@pbel.in',
  'romesh@pbel.in',
  'shiva@pbel.in',
  'shubhamitra@pbel.in',
  'vikram@pbel.in',
  'rajendra@pbel.in',
  'prateek@pbel.in',
  'naveen@pbel.in',
];

// Helper function to check if a user is a team owner
const isTeamOwner = (email?: string): boolean => {
  return email ? teamOwnerEmails.includes(email) : false;
}

// Only keep columns that actually exist in the team_owner_profiles table
// Note: production DB uses the original schema WITHOUT team_id or phone_number
const VALID_PROFILE_COLUMNS = new Set([
  'user_id', 'first_name', 'last_name', 'sports_background',
  'notable_achievements', 'team_role', 'contact_email', 'social_media',
  'profile_image_url', 'bio', 'created_at', 'updated_at',
])

function sanitizeProfileData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (VALID_PROFILE_COLUMNS.has(key) && value !== undefined) {
      sanitized[key] = value
    }
  }
  // Ensure NOT NULL columns have defaults
  if (!sanitized.team_role) sanitized.team_role = 'Owner'
  if (!sanitized.sports_background) sanitized.sports_background = ''
  if (!sanitized.bio) sanitized.bio = ''
  if (!sanitized.notable_achievements) sanitized.notable_achievements = []
  if (!sanitized.social_media) sanitized.social_media = {}
  return sanitized
}

// Helper function to check if user has access to team owner profile
const hasTeamOwnerAccess = (userEmail?: string, userId?: string, profileUserId?: string): boolean => {
  // Full admins can access any profile
  if (isFullAdmin(userEmail)) {
    return true;
  }

  // Team owners can only access their own profile
  if (isTeamOwner(userEmail) && userId === profileUserId) {
    return true;
  }

  // Regular users can only access their own profile
  return userId === profileUserId;
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profileData = await request.json()

    // Sanitize and add user_id to the profile data
    const data = sanitizeProfileData({
      ...profileData,
      user_id: session.user.id,
      updated_at: new Date().toISOString()
    })

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('team_owner_profiles')
      .select('id, user_id')
      .eq('user_id', session.user.id)
      .single()

    // Check if user has access to this profile
    if (existingProfile && !hasTeamOwnerAccess(session.user.email, session.user.id, existingProfile.user_id)) {
      return NextResponse.json(
        { error: 'You do not have permission to update this profile' },
        { status: 403 }
      )
    }

    let result

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('team_owner_profiles')
        .update(data)
        .eq('user_id', session.user.id)
        .select()
        .single()
    } else {
      // Create new profile
      result = await supabase
        .from('team_owner_profiles')
        .insert({
          ...data,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving profile:', result.error)
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID from query params if provided (for admins to view other profiles)
    const url = new URL(request.url)
    const queryUserId = url.searchParams.get('userId')

    // Determine which user's profile to fetch
    const targetUserId = queryUserId || session.user.id

    // Check if user has access to this profile
    if (queryUserId && !hasTeamOwnerAccess(session.user.email, session.user.id, queryUserId)) {
      return NextResponse.json(
        { error: 'You do not have permission to view this profile' },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('team_owner_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 