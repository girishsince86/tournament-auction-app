import { NextRequest, NextResponse } from 'next/server'
import { getAllOrganizersData } from '@/lib/utils/organizers-data'
import { v4 as uuidv4 } from 'uuid'

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get all organizers data from the JSON file
    const organizers = getAllOrganizersData().map(organizer => ({
      ...organizer,
      id: uuidv4(), // Generate a unique ID for each organizer
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    return NextResponse.json({ data: organizers })
  } catch (error) {
    console.error('Public organizers fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 