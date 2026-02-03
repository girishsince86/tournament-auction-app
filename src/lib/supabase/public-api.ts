import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';

/**
 * Returns a Supabase client for public API routes (anon key).
 * Only creates the client when env vars are set, so safe during Next.js build.
 */
export function getPublicSupabaseClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key);
}

/**
 * Returns a Supabase client with service role for public API routes that need to bypass RLS.
 * Only creates the client when env vars are set, so safe during Next.js build.
 */
export function getServiceRoleSupabaseClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key);
}
