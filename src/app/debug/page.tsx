// Import the DebugLocation component directly
// The component itself is already wrapped with withClientOnly
import DebugLocation from '../debug-location'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function DebugPage() {
  return (
    <div>
      <h1>Debug Page</h1>
      <p>This page tests client-side access to window.location</p>
      <DebugLocation />
    </div>
  )
} 