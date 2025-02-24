import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { tournamentId: string } }
) {
    try {
        const { tournamentId } = params;

        if (!tournamentId) {
            return NextResponse.json(
                { error: 'Tournament ID is required' },
                { status: 400 }
            );
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get players with registration details
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select(`
                id,
                name,
                email,
                phone,
                skill_level,
                base_price,
                profile_image_url,
                player_position,
                height,
                last_played_date,
                registration_details,
                tournament_history,
                achievements,
                created_at,
                updated_at,
                registrations!inner (
                    tournament_id
                )
            `)
            .eq('registrations.tournament_id', tournamentId)
            .order('name');

        if (playersError) {
            console.error('Error fetching players:', playersError);
            return NextResponse.json(
                { error: 'Failed to fetch players' },
                { status: 500 }
            );
        }

        return NextResponse.json({ players: players || [] });
    } catch (err) {
        console.error('Tournament players API error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 