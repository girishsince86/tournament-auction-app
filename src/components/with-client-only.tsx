'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Higher-order component that wraps a component with dynamic import and disables SSR.
 * This ensures the component only renders on the client side, preventing "location is not defined" errors.
 * 
 * @param Component The component to wrap
 * @returns A new component that only renders on the client side
 */
export function withClientOnly<P extends object>(Component: ComponentType<P>) {
  return dynamic(() => Promise.resolve(Component), {
    ssr: false,
  });
}

/**
 * Alternative approach using a function that returns a component with SSR disabled.
 * This can be used when you need to pass props to the dynamic component.
 * 
 * @param importFunc A function that returns a Promise resolving to a component
 * @returns A component with SSR disabled
 */
export function createClientOnlyComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFunc, {
    ssr: false,
  });
} 