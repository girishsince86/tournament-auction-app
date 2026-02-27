import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tournamentId = searchParams.get('tournamentId');

        if (!tournamentId) {
            return NextResponse.json(
                { error: 'tournamentId is required' },
                { status: 400 }
            );
        }

        const supabase = createRouteHandlerClient({ cookies });

        const { data: config, error } = await supabase
            .from('auction_display_config')
            .select('*')
            .eq('tournament_id', tournamentId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching display config:', error);
            return NextResponse.json(
                { error: 'Failed to fetch display config' },
                { status: 500 }
            );
        }

        return NextResponse.json({ config });
    } catch (err) {
        console.error('Display config API error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
