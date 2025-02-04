import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './types/supabase'

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // During static page generation, return null or a mock client
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return null
    }
    throw new Error('Missing Supabase environment variables')
  }
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
} 