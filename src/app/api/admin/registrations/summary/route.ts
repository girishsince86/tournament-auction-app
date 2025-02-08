import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

// Create a Supabase client with the service role key for admin operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Fixed registration fee for all categories
const REGISTRATION_FEE = 600

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch total registrations
    const { count: totalRegistrations } = await supabase
      .from('tournament_registrations')
      .select('*', { count: 'exact', head: true })

    // Fetch all registrations for category distribution and timeline
    const { data: registrations } = await supabase
      .from('tournament_registrations')
      .select('*')
      .order('created_at', { ascending: true })

    if (!registrations) {
      throw new Error('Failed to fetch registrations')
    }

    // Category distribution
    const categoryDistribution = registrations.reduce((acc: Record<string, number>, curr) => {
      const category = curr.registration_category
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    // Count by sport type
    const volleyballCount = registrations.filter(
      (reg) => reg.registration_category === 'VOLLEYBALL_OPEN_MEN'
    ).length

    const throwballCount = registrations.filter(
      (reg) => reg.registration_category === 'THROWBALL_WOMEN'
    ).length

    const youth8To12Count = registrations.filter(
      (reg) => reg.registration_category === 'THROWBALL_8_12_MIXED'
    ).length

    const youth13To17Count = registrations.filter(
      (reg) => reg.registration_category === 'THROWBALL_13_17_MIXED'
    ).length

    // Jersey size distribution
    const jerseySizes = registrations.reduce((acc: Record<string, number>, curr) => {
      const size = curr.tshirt_size
      acc[size] = (acc[size] || 0) + 1
      return acc
    }, {})

    // Fetch recent registrations (last 10)
    const recentRegistrations = registrations
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(reg => ({
        id: reg.id,
        first_name: reg.first_name,
        last_name: reg.last_name,
        registration_category: reg.registration_category,
        tshirt_number: reg.tshirt_number,
        created_at: reg.created_at,
        is_verified: reg.is_verified
      }))

    // Prepare timeline data
    const timelineData = registrations.map(reg => ({
      created_at: reg.created_at,
      registration_category: reg.registration_category
    }))

    // Calculate total fees (₹600 per registration)
    const totalFees = registrations.length * REGISTRATION_FEE

    // Count registrations by receiver
    const vasuRegistrations = registrations.filter(r => r.paid_to === 'Vasu Chepuru')
    const amitRegistrations = registrations.filter(r => r.paid_to === 'Amit Saxena')

    const mockPaymentCollections = [
      {
        receiver: 'Vasu Chepuru',
        totalAmount: vasuRegistrations.length * REGISTRATION_FEE,
        verifiedAmount: vasuRegistrations.filter(r => r.is_verified).length * REGISTRATION_FEE,
        registrationCount: vasuRegistrations.length,
        verifiedCount: vasuRegistrations.filter(r => r.is_verified).length
      },
      {
        receiver: 'Amit Saxena',
        totalAmount: amitRegistrations.length * REGISTRATION_FEE,
        verifiedAmount: amitRegistrations.filter(r => r.is_verified).length * REGISTRATION_FEE,
        registrationCount: amitRegistrations.length,
        verifiedCount: amitRegistrations.filter(r => r.is_verified).length
      }
    ]

    // Add unassigned registrations count
    const unassignedRegistrations = registrations.filter(r => !r.paid_to)
    if (unassignedRegistrations.length > 0) {
      mockPaymentCollections.push({
        receiver: 'Unassigned',
        totalAmount: unassignedRegistrations.length * REGISTRATION_FEE,
        verifiedAmount: unassignedRegistrations.filter(r => r.is_verified).length * REGISTRATION_FEE,
        registrationCount: unassignedRegistrations.length,
        verifiedCount: unassignedRegistrations.filter(r => r.is_verified).length
      })
    }

    return NextResponse.json({
      totalRegistrations,
      volleyballCount,
      throwballCount,
      youth8To12Count,
      youth13To17Count,
      categoryDistribution: Object.entries(categoryDistribution).map(([name, count]) => ({
        name,
        count,
      })),
      jerseySizes: Object.entries(jerseySizes).map(([size, count]) => ({
        size,
        count,
      })),
      recentRegistrations,
      timelineData,
      paymentCollections: mockPaymentCollections,
    })
  } catch (error) {
    console.error('Error fetching registration summary:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 