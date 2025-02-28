/**
 * Utility functions for safely handling browser-specific APIs
 */

import { isClient, safeWindowAccess } from './build-debug';

/**
 * Safely get the window object, returns undefined in server-side rendering
 */
export function getWindow(): Window | undefined {
  return isClient() ? window : undefined;
}

/**
 * Safely get the window.location object, returns undefined in server-side rendering
 * This function is safe to use in both client and server environments
 */
export function getLocation(): Location | undefined {
  return safeWindowAccess(() => window.location, undefined);
}

/**
 * Safely get the window.location.origin, returns fallback in server-side rendering
 */
export function getOrigin(fallback: string = ''): string {
  const defaultValue = process.env.NEXT_PUBLIC_APP_URL || fallback || 'http://localhost:3000';
  return safeWindowAccess(() => window.location.origin || defaultValue, defaultValue);
}

/**
 * Safely get the window.location.pathname, returns fallback in server-side rendering
 */
export function getPathname(fallback: string = '/'): string {
  return safeWindowAccess(() => window.location.pathname || fallback, fallback);
}

/**
 * Safely get the window.location.hash, returns fallback in server-side rendering
 */
export function getHash(fallback: string = ''): string {
  return safeWindowAccess(() => window.location.hash || fallback, fallback);
}

/**
 * Safely navigate to a URL, uses fallback in server-side rendering
 */
export function navigateTo(url: string): void {
  if (isClient()) {
    try {
      window.location.href = url;
    } catch (error) {
      console.warn('Error navigating to URL:', error);
    }
  }
} 