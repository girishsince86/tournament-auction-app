import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

// Create a Supabase client with the service role key for admin operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch total registrations
    const { count: totalRegistrations } = await supabase
      .from('tournament_registrations')
      .select('*', { count: 'exact', head: true })

    // Fetch category distribution
    const { data: categoryData } = await supabase
      .from('tournament_registrations')
      .select('registration_category')

    const categoryDistribution = categoryData?.reduce((acc: Record<string, number>, curr) => {
      const category = curr.registration_category
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    // Count by sport type
    const volleyballCount = categoryData?.filter(
      (reg) =>
        reg.registration_category === 'VOLLEYBALL_OPEN_MEN'
    ).length

    const throwballCount = categoryData?.filter(
      (reg) => 
        reg.registration_category === 'THROWBALL_WOMEN'
    ).length

    const youth8To12Count = categoryData?.filter(
      (reg) => reg.registration_category === 'THROWBALL_8_12_MIXED'
    ).length

    const youth13To17Count = categoryData?.filter(
      (reg) => reg.registration_category === 'THROWBALL_13_17_MIXED'
    ).length

    // Fetch jersey size distribution
    const { data: sizeData } = await supabase
      .from('tournament_registrations')
      .select('tshirt_size')

    const jerseySizes = sizeData?.reduce((acc: Record<string, number>, curr) => {
      const size = curr.tshirt_size
      acc[size] = (acc[size] || 0) + 1
      return acc
    }, {})

    // Fetch recent registrations
    const { data: recentRegistrations } = await supabase
      .from('tournament_registrations')
      .select('id, first_name, last_name, registration_category, tshirt_number, created_at, is_verified')
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      totalRegistrations,
      volleyballCount: volleyballCount || 0,
      throwballCount: throwballCount || 0,
      youth8To12Count: youth8To12Count || 0,
      youth13To17Count: youth13To17Count || 0,
      categoryDistribution: Object.entries(categoryDistribution || {}).map(([name, count]) => ({
        name,
        count,
      })),
      jerseySizes: Object.entries(jerseySizes || {}).map(([size, count]) => ({
        size,
        count,
      })),
      recentRegistrations: recentRegistrations || [],
    })
  } catch (error) {
    console.error('Error fetching registration summary:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 