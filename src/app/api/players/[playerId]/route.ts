import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: NextRequest,
    { params }: { params: { playerId: string } }
) {
    try {
        const { playerId } = params;
        const updates = await request.json();

        if (!playerId) {
            return NextResponse.json(
                { error: 'Player ID is required' },
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

        // Update player details
        const { data: player, error: updateError } = await supabase
            .from('players')
            .update({
                name: updates.name,
                player_position: updates.player_position,
                skill_level: updates.skill_level,
                base_price: updates.base_price,
                height: updates.height,
                updated_at: new Date().toISOString()
            })
            .eq('id', playerId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating player:', updateError);
            return NextResponse.json(
                { error: 'Failed to update player' },
                { status: 500 }
            );
        }

        return NextResponse.json({ player });
    } catch (err) {
        console.error('Player update API error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 