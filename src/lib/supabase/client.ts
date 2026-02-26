import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseStorageKey } from './url';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(getSupabaseUrl(), supabaseAnonKey, {
  auth: { storageKey: getSupabaseStorageKey() },
}); 