import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types/supabase'

function getServerSupabase() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
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
}

export interface TeamOwnerProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  profile_image_url?: string
  sports_background: string
  notable_achievements: string[]
  team_role: string
  contact_email?: string
  social_media: Record<string, string>
  bio: string
  created_at: string
  updated_at: string
}

export async function getTeamOwnerProfile(userId: string): Promise<TeamOwnerProfile | null> {
  console.log('Starting getTeamOwnerProfile function for userId:', userId)
  const supabase = getServerSupabase()
  
  try {
    // First verify the table exists and is accessible
    const { data: tableInfo, error: tableError } = await supabase
      .from('team_owner_profiles')
      .select('*')
      .limit(1)

    console.log('Team owner profiles table info:', tableInfo, 'Table error:', tableError)

    if (tableError) {
      console.error('Error checking team_owner_profiles table:', tableError)
      return null
    }

    const { data: profile, error } = await supabase
      .from('team_owner_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching team owner profile:', error)
      return null
    }

    console.log('getTeamOwnerProfile response:', { profile, error })
    return profile
  } catch (error) {
    console.error('Unexpected error in getTeamOwnerProfile:', error)
    return null
  }
} 