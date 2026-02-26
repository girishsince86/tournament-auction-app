import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseUrl } from '@/lib/supabase/url';

/**
 * Helper function to refresh the auth session
 * @returns {Promise<boolean>} True if session was refreshed successfully
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const supabase = createBrowserClient(
      getSupabaseUrl(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get current session and refresh it
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      console.error('[Auth] Session refresh failed:', error);
      // Redirect to login if we can't refresh the session
      window.location.href = '/login';
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Auth] Error refreshing session:', error);
    return false;
  }
}

// Define the interface for fetch options
interface FetchOptions extends RequestInit {
  body?: any;
}

/**
 * Wrapper around fetch that handles authentication and session refresh
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The response data
 */
export async function fetchWithAuth<T>(url: string, options: FetchOptions = {}): Promise<T> {
  // Clone the options to avoid modifying the original
  const fetchOptions: RequestInit = { ...options };
  
  // Set default headers if not provided
  fetchOptions.headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };
  
  // Convert body to JSON string if it's an object
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    fetchOptions.body = JSON.stringify(options.body);
  }
  
  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle 401 Unauthorized errors by refreshing the session
      if (response.status === 401) {
        console.log('Unauthorized, attempting to refresh session...');
        const refreshed = await refreshSession();
        
        if (refreshed) {
          console.log('Session refreshed, retrying request...');
          return fetchWithAuth<T>(url, options);
        } else {
          console.error('Failed to refresh session');
          throw new Error(`${response.status}: ${data.error || 'Unauthorized'}`);
        }
      }
      
      // Handle validation errors (400 Bad Request)
      if (response.status === 400 && data.fieldErrors) {
        console.error('Validation error:', data.fieldErrors);
        throw new Error(`Validation error: ${data.error || 'Please check your form inputs'}`, { 
          cause: { fieldErrors: data.fieldErrors } 
        });
      }
      
      // Handle other errors
      throw new Error(`${response.status}: ${data.error || response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
} 