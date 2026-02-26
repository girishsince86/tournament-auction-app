/**
 * Returns the Supabase URL for browser clients.
 * Uses a proxy path to bypass ISP DNS resolution issues
 * (some ISPs return wrong IPs for supabase.co).
 * Server-side clients use the direct URL since Vercel has proper DNS.
 */
export function getSupabaseUrl(): string {
  const directUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/supabase-proxy`;
  }

  return directUrl;
}

/**
 * Returns the auth storage key derived from the direct Supabase URL.
 * This must be consistent across browser and server clients so that
 * session cookies set by the browser client are found by the middleware.
 */
export function getSupabaseStorageKey(): string {
  const directUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = new URL(directUrl).hostname.split('.')[0];
  return `sb-${projectRef}-auth-token`;
}
