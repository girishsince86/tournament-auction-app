// Import the DebugLocation component directly
// The component itself is already wrapped with withClientOnly
import DebugLocation from '../debug-location'
import { redirect } from 'next/navigation'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function DebugPage() {
  // Redirect to home page if not in development mode
  if (process.env.NODE_ENV !== 'development') {
    redirect('/')
    return null
  }

  return (
    <div>
      <h1>Debug Page</h1>
      <p>This page tests client-side access to window.location</p>
      <DebugLocation />
    </div>
  )
} 