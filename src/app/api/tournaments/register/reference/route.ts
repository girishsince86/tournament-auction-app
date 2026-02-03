import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 10 ? digits.slice(-10) : digits || raw
}

/**
 * GET /api/tournaments/register/reference?email=... | ?phone=...
 * Returns 2025 reference row for pre-filling 2026 registration form.
 * First match by email, or by phone (normalized to last 10 digits).
 */
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.trim()
  const phone = searchParams.get('phone')?.trim()

  if (!email && !phone) {
    return NextResponse.json(
      { error: 'Provide email or phone query parameter' },
      { status: 400 }
    )
  }

  try {
    if (email) {
      const { data, error } = await supabase
        .from('registration_reference_2025')
        .select('*')
        .ilike('email', email)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Reference lookup error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      if (!data) return NextResponse.json({ reference: null })
      return NextResponse.json({ reference: toPreFillShape(data) })
    }

    const normalized = normalizePhone(phone!)
    if (!normalized) {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('registration_reference_2025')
      .select('*')
      .eq('phone_number', normalized)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Reference lookup error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) return NextResponse.json({ reference: null })
    return NextResponse.json({ reference: toPreFillShape(data) })
  } catch (e) {
    console.error('Reference API error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function toPreFillShape(row: {
  first_name: string
  last_name: string
  email: string | null
  phone_number: string
  date_of_birth: string | null
  category: string
  jersey_size: string | null
  jersey_number: string | null
}) {
  return {
    first_name: row.first_name ?? '',
    last_name: row.last_name ?? '',
    email: row.email ?? '',
    phone_number: row.phone_number ?? '',
    date_of_birth: row.date_of_birth ?? '',
    registration_category: row.category ?? 'VOLLEYBALL_OPEN_MEN',
    tshirt_size: mapJerseySize(row.jersey_size),
    tshirt_number: row.jersey_number ?? '',
  }
}

function mapJerseySize(size: string | null): string {
  if (!size) return ''
  const s = (size || '').toUpperCase().trim()
  if (s === '2XL' || s === 'XXL') return '2XL'
  if (s === '3XL' || s === 'XXXL') return '3XL'
  return ['XS', 'S', 'M', 'L', 'XL'].includes(s) ? s : size
}
