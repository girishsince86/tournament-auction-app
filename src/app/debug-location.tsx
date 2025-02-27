'use client'

import { useEffect, useState } from 'react'

export function DebugLocation() {
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    try {
      // Try to access window.location
      const pathname = window.location.pathname
      console.log('Successfully accessed window.location.pathname:', pathname)
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
        <p style={{ color: 'green' }}>Successfully accessed window.location</p>
      )}
    </div>
  )
}

export default DebugLocation 