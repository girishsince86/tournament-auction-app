import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types/supabase';

export async function PUT(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;
        const body = await request.json();
        const { player_id, max_bid_points, notes } = body;

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify team ownership
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('owner_id')
            .eq('id', teamId)
            .single();

        if (teamError || !team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        if (team.owner_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Update or insert player preference
        const { data: preference, error: preferenceError } = await supabase
            .from('preferred_players')
            .upsert({
                team_id: teamId,
                player_id,
                max_bid: max_bid_points,
                notes,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (preferenceError) {
            console.error('Error updating preference:', preferenceError);
            return NextResponse.json(
                { error: 'Failed to update preference', details: preferenceError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true,
            preference 
        });

    } catch (error) {
        console.error('Error in team preferences:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;
        const playerId = request.nextUrl.searchParams.get('playerId');

        if (!playerId) {
            return NextResponse.json(
                { error: 'Player ID is required' },
                { status: 400 }
            );
        }

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify team ownership
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('owner_id')
            .eq('id', teamId)
            .single();

        if (teamError || !team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        if (team.owner_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Delete player preference
        const { error: deleteError } = await supabase
            .from('preferred_players')
            .delete()
            .eq('team_id', teamId)
            .eq('player_id', playerId);

        if (deleteError) {
            console.error('Error deleting preference:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete preference', details: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in team preferences:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;
        const body = await request.json();
        const { player_ids } = body;

        if (!Array.isArray(player_ids) || player_ids.length === 0) {
            return NextResponse.json(
                { error: 'Player IDs are required' },
                { status: 400 }
            );
        }

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify team ownership
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('owner_id')
            .eq('id', teamId)
            .single();

        if (teamError || !team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        if (team.owner_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Create preference records for all selected players
        const preferencesToInsert = player_ids.map(player_id => ({
            team_id: teamId,
            player_id,
            priority: 1, // Default priority
            max_bid: 0, // Default value, can be updated later
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        const { data: preferences, error: preferenceError } = await supabase
            .from('preferred_players')
            .upsert(preferencesToInsert)
            .select();

        if (preferenceError) {
            console.error('Error adding preferred players:', preferenceError);
            return NextResponse.json(
                { error: 'Failed to add preferred players', details: preferenceError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true,
            preferences 
        });

    } catch (error) {
        console.error('Error in team preferences:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 