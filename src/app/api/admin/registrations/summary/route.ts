import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export const dynamic = 'force-dynamic'

const REGISTRATION_CATEGORIES = [
  'VOLLEYBALL_OPEN_MEN',
  'THROWBALL_WOMEN',
  'THROWBALL_13_17_MIXED',
  'THROWBALL_8_12_MIXED',
] as const;

const DEFAULT_REGISTRATION_AMOUNT = 600;

interface AgeDistribution {
  age: number;
  count: number;
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get total registrations
    const { count: totalRegistrations } = await supabase
      .from('tournament_registrations')
      .select('*', { count: 'exact', head: true })

    // Get verified registrations count
    const { data: verifiedData, error: verifiedError } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('is_verified', true)

    if (verifiedError) {
      throw verifiedError
    }

    const verifiedRegistrations = verifiedData?.length || 0

    // Get category distribution
    const categoryPromises = REGISTRATION_CATEGORIES.map(async (category) => {
      const { count } = await supabase
        .from('tournament_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('registration_category', category)

      return {
        name: category,
        count: count || 0
      }
    })

    const categoryDistribution = await Promise.all(categoryPromises)

    // Get age distribution by year
    const { data: registrationsWithDOB } = await supabase
      .from('tournament_registrations')
      .select('date_of_birth')
      .not('date_of_birth', 'is', null)

    const cutoffDate = new Date('2025-04-30')
    const ageDistributionMap = new Map<number, number>()

    registrationsWithDOB?.forEach(registration => {
      const dob = new Date(registration.date_of_birth)
      const age = cutoffDate.getFullYear() - dob.getFullYear()
      const monthDiff = cutoffDate.getMonth() - dob.getMonth()
      const finalAge = monthDiff < 0 || (monthDiff === 0 && cutoffDate.getDate() < dob.getDate()) 
        ? age - 1 
        : age

      ageDistributionMap.set(finalAge, (ageDistributionMap.get(finalAge) || 0) + 1)
    })

    // Convert map to array and sort by age
    const ageDistribution: AgeDistribution[] = Array.from(ageDistributionMap.entries())
      .map(([age, count]) => ({ age, count }))
      .sort((a, b) => a.age - b.age)

    // Get age distribution for youth categories
    const { data: youthData } = await supabase
      .from('tournament_registrations')
      .select('registration_category, date_of_birth')
      .in('registration_category', ['THROWBALL_8_12_MIXED', 'THROWBALL_13_17_MIXED'])
      .not('date_of_birth', 'is', null)

    const ageDistributionByCategory = {
      '8-12': 0,
      '13-17': 0,
      byCategory: {
        'THROWBALL_8_12_MIXED': { within: 0, outside: 0 },
        'THROWBALL_13_17_MIXED': { within: 0, outside: 0 }
      }
    }

    youthData?.forEach(registration => {
      const dob = new Date(registration.date_of_birth)
      const age = cutoffDate.getFullYear() - dob.getFullYear()
      const monthDiff = cutoffDate.getMonth() - dob.getMonth()
      const finalAge = monthDiff < 0 || (monthDiff === 0 && cutoffDate.getDate() < dob.getDate()) 
        ? age - 1 
        : age

      if (finalAge >= 8 && finalAge <= 12) {
        ageDistributionByCategory['8-12']++
        if (registration.registration_category === 'THROWBALL_8_12_MIXED') {
          ageDistributionByCategory.byCategory['THROWBALL_8_12_MIXED'].within++
        } else {
          ageDistributionByCategory.byCategory['THROWBALL_8_12_MIXED'].outside++
        }
      } else if (finalAge >= 13 && finalAge <= 17) {
        ageDistributionByCategory['13-17']++
        if (registration.registration_category === 'THROWBALL_13_17_MIXED') {
          ageDistributionByCategory.byCategory['THROWBALL_13_17_MIXED'].within++
        } else {
          ageDistributionByCategory.byCategory['THROWBALL_13_17_MIXED'].outside++
        }
      }
    })

    // Get jersey size distribution
    const { data: jerseyData } = await supabase
      .from('tournament_registrations')
      .select('tshirt_size')

    const jerseySizes = jerseyData?.reduce((acc: { size: string; count: number }[], curr) => {
      const size = curr.tshirt_size
      const existing = acc.find(item => item.size === size)
      if (existing) {
        existing.count++
      } else {
        acc.push({ size, count: 1 })
      }
      return acc
    }, []) || []

    // Get timeline data
    const { data: timelineData } = await supabase
      .from('tournament_registrations')
      .select('created_at, registration_category')
      .order('created_at', { ascending: true })

    // Get payment collections by receiver
    const { data: paymentData } = await supabase
      .from('tournament_registrations')
      .select('paid_to, amount_received, is_verified')

    // Initialize collections for known receivers
    const paymentCollections = [
      { receiver: 'Vasu Chepuru', totalAmount: 0, verifiedAmount: 0 },
      { receiver: 'Amit Saxena', totalAmount: 0, verifiedAmount: 0 }
    ];

    // Process payment data
    paymentData?.forEach(registration => {
      const receiver = registration.paid_to;
      if (!receiver) return; // Skip if no receiver specified

      const collection = paymentCollections.find(p => p.receiver === receiver);
      if (collection) {
        // For verified registrations, use the actual amount received
        if (registration.is_verified && registration.amount_received) {
          collection.totalAmount += registration.amount_received;
          collection.verifiedAmount += registration.amount_received;
        } 
        // For unverified registrations, use the default amount
        else if (!registration.is_verified) {
          collection.totalAmount += DEFAULT_REGISTRATION_AMOUNT;
        }
      }
    });

    // Count registrations by category type
    const volleyballCount = categoryDistribution.find(c => c.name === 'VOLLEYBALL_OPEN_MEN')?.count || 0
    const throwballCount = categoryDistribution
      .filter(c => c.name.startsWith('THROWBALL_'))
      .reduce((sum, curr) => sum + curr.count, 0)
    const youth8To12Count = categoryDistribution.find(c => c.name === 'THROWBALL_8_12_MIXED')?.count || 0
    const youth13To17Count = categoryDistribution.find(c => c.name === 'THROWBALL_13_17_MIXED')?.count || 0

    return NextResponse.json({
      totalRegistrations: totalRegistrations || 0,
      verifiedRegistrations,
      volleyballCount,
      throwballCount,
      youth8To12Count,
      youth13To17Count,
      categoryDistribution,
      ageDistribution,
      ageDistributionByCategory,
      jerseySizes,
      timelineData: timelineData || [],
      paymentCollections: paymentCollections || [],
      recentRegistrations: [], // This can be added later if needed
      pendingVerification: (totalRegistrations || 0) - verifiedRegistrations,
    })
  } catch (error) {
    console.error('Error fetching registration summary:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 