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
