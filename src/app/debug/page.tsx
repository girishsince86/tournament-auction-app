import { DebugLocation } from '../debug-location'

export const dynamic = 'force-dynamic'

export default function DebugPage() {
  return (
    <div>
      <h1>Debug Page</h1>
      <DebugLocation />
    </div>
  )
} 