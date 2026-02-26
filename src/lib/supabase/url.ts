/**
 * Installs a global fetch interceptor that rewrites Supabase API requests
 * to go through our /supabase-proxy rewrite, bypassing ISP DNS issues.
 *
 * All Supabase clients keep using the real URL (so cookies/storage keys
 * stay consistent with the middleware). Only the actual HTTP requests
 * are rerouted through the proxy at the fetch level.
 *
 * Call this once at app startup (e.g. in AuthProvider or root layout).
 */
export function installSupabaseProxy(): void {
  if (typeof window === 'undefined') return;
  if ((window as any).__supabaseProxyInstalled) return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string'
      ? input
      : input instanceof Request
        ? input.url
        : String(input);

    if (url.startsWith(supabaseUrl)) {
      const proxiedUrl = url.replace(supabaseUrl, `${window.location.origin}/supabase-proxy`);
      if (input instanceof Request) {
        return originalFetch(new Request(proxiedUrl, input), init);
      }
      return originalFetch(proxiedUrl, init);
    }

    return originalFetch(input, init);
  };

  (window as any).__supabaseProxyInstalled = true;
}
