'use client'

import { useEffect, useState } from 'react'
import { withClientOnly } from '@/components/with-client-only'

function DebugLocationComponent() {
  const [error, setError] = useState<string | null>(null)
  const [locationInfo, setLocationInfo] = useState<Record<string, string>>({})
  
  useEffect(() => {
    try {
      // Try to access window.location
      const location = window.location
      const info = {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        href: location.href,
        origin: location.origin,
        host: location.host,
        hostname: location.hostname,
        protocol: location.protocol,
      }
      
      setLocationInfo(info)
      console.log('Successfully accessed window.location:', info)
    } catch (err) {
      console.error('Error accessing window.location:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])
  
  return (
    <div>
      <h2>Debug Location</h2>
      {error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <>
          <p style={{ color: 'green' }}>Successfully accessed window.location</p>
          <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(locationInfo, null, 2)}
          </pre>
        </>
      )}
    </div>
  )
}

// Export the component wrapped with withClientOnly to ensure it only renders on the client
export const DebugLocation = withClientOnly(DebugLocationComponent)

// Default export also wrapped with withClientOnly
export default withClientOnly(DebugLocationComponent) 