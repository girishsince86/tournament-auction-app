'use client';

import { useState, useEffect } from 'react';
import { isClient, safeWindowAccess } from '@/lib/utils/build-debug';

interface LocationState {
  pathname: string;
  search: string;
  hash: string;
  href: string;
  origin: string;
  host: string;
  hostname: string;
  protocol: string;
  port: string;
}

const defaultLocation: LocationState = {
  pathname: '/',
  search: '',
  hash: '',
  href: '',
  origin: '',
  host: '',
  hostname: '',
  protocol: '',
  port: ''
};

/**
 * A hook that safely provides access to window.location properties
 * with SSR support and proper client-side hydration.
 */
export function useLocation(): LocationState {
  const [location, setLocation] = useState<LocationState>(defaultLocation);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only access window.location on the client side
    if (isClient()) {
      const locationData = safeWindowAccess(() => ({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        href: window.location.href,
        origin: window.location.origin,
        host: window.location.host,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port
      }), defaultLocation);
      
      setLocation(locationData);
    }
  }, []);

  return location;
} 