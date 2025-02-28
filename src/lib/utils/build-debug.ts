/**
 * Utility functions for debugging build issues
 */

/**
 * Check if code is running on the client side
 * @returns boolean indicating if code is running in a browser environment
 */
export function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Check if code is running on the server side
 * @returns boolean indicating if code is running in a server environment
 */
export function isServer(): boolean {
  return !isClient();
}

/**
 * Log build environment information
 * This can help debug issues during build time
 */
export function logBuildEnvironment(): void {
  console.log('Build Environment:', {
    isClient: isClient(),
    isServer: isServer(),
    nodeEnv: process.env.NODE_ENV,
    nextRuntimeEnv: process.env.NEXT_RUNTIME,
    hasWindow: typeof window !== 'undefined',
    hasDocument: typeof document !== 'undefined',
  });
}

/**
 * Safe wrapper for accessing window properties
 * @param accessor Function that accesses window properties
 * @param fallback Fallback value if window is not available
 * @returns The result of the accessor or the fallback value
 */
export function safeWindowAccess<T>(accessor: () => T, fallback: T): T {
  if (isClient()) {
    try {
      return accessor();
    } catch (error) {
      console.error('Error accessing window property:', error);
      return fallback;
    }
  }
  return fallback;
} 