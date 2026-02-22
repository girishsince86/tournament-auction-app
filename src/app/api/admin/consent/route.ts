import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies })

        // Verify admin session
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError || !session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        if (!session.user.email?.endsWith('@pbel.in')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        // Use service role client for cross-table queries
        const adminClient = createAdminClient()

        // 1. Get all THROWBALL_WOMEN registrations
        const { data: registrations, error: regError } = await adminClient
            .from('tournament_registrations')
            .select('id, first_name, last_name, phone_number, email, registration_category')
            .eq('registration_category', 'THROWBALL_WOMEN')
            .order('first_name', { ascending: true })

        if (regError) {
            console.error('Error fetching registrations:', regError)
            return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 })
        }

        // 2. Get all consent records
        const { data: consents, error: consentError } = await adminClient
            .from('auction_consent')
            .select('*')

        if (consentError) {
            console.error('Error fetching consents:', consentError)
            return NextResponse.json({ error: 'Failed to fetch consents' }, { status: 500 })
        }

        // 3. Build a consent map by registration_id
        const consentMap = new Map<string, typeof consents[0]>()
        consents?.forEach(c => consentMap.set(c.registration_id, c))

        // 4. Merge registrations with consent data
        const players = registrations?.map(reg => {
            const consent = consentMap.get(reg.id)
            return {
                id: reg.id,
                name: `${reg.first_name} ${reg.last_name}`.trim(),
                phone_number: reg.phone_number,
                email: reg.email,
                consent_status: consent ? 'RESPONDED' : 'PENDING',
                consent_choice: consent?.consent_choice || null,
                consent_submitted_at: consent?.updated_at || consent?.created_at || null,
            }
        }) || []

        // 5. Compute summary stats
        const total = players.length
        const responded = players.filter(p => p.consent_status === 'RESPONDED').length
        const pending = total - responded
        const auctionPool = players.filter(p => p.consent_choice === 'AUCTION_POOL').length
        const spinTheWheel = players.filter(p => p.consent_choice === 'SPIN_THE_WHEEL').length

        return NextResponse.json({
            players,
            summary: { total, responded, pending, auctionPool, spinTheWheel },
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
    }
}
