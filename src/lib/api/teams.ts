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

export async function getAllTeams() {
  console.log('Starting getAllTeams function')
  const supabase = getServerSupabase()
  
  try {
    // First, let's check what columns we have in the table
    const { data: tableInfo, error: tableError } = await supabase
      .from('teams')
      .select('*')
      .limit(1)

    console.log('Teams table info:', tableInfo, 'Table error:', tableError)

    if (tableError) {
      console.error('Error checking teams table:', tableError)
      return null
    }

    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching teams:', error)
      return null
    }

    console.log('getAllTeams response:', { 
      teams, 
      error,
      teamsCount: teams?.length,
      teamIds: teams?.map(t => t.id)
    })
    return teams
  } catch (error) {
    console.error('Unexpected error in getAllTeams:', error)
    return null
  }
}

export async function getTeamById(teamId: string) {
  console.log('Starting getTeamById function for teamId:', teamId)
  const supabase = getServerSupabase()
  
  try {
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (error) {
      console.error('Error fetching team:', error)
      return null
    }

    console.log('getTeamById response:', { team, error })
    return team
  } catch (error) {
    console.error('Unexpected error in getTeamById:', error)
    return null
  }
} 