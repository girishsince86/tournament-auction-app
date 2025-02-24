import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const isAdmin = session.user.email?.endsWith('@pbel.in');

        // Get team basic info
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select(`
                *,
                owner_id,
                tournament_id,
                tournaments!inner (
                    id,
                    name
                )
            `)
            .eq('id', teamId)
            .single();

        if (teamError || !team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        // Verify team ownership or admin status
        if (!isAdmin && team.owner_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get tournament category requirements
        const { data: categoryRequirements, error: categoryError } = await supabase
            .from('player_categories')
            .select(`
                category_type,
                min_points,
                max_points,
                description
            `)
            .eq('tournament_id', team.tournament_id);

        if (categoryError) {
            console.error('Error fetching category requirements:', categoryError);
        }

        // Get team combined requirements
        const { data: combinedRequirements, error: requirementsError } = await supabase
            .from('team_combined_requirements')
            .select('*')
            .eq('team_id', teamId);

        // Get current team players
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select(`
                id,
                name,
                player_position,
                skill_level,
                base_price,
                status,
                category:player_categories!inner (
                    category_type,
                    name,
                    base_points
                ),
                auction_rounds!inner (
                    final_points
                )
            `)
            .eq('current_team_id', teamId);

        // Transform players data to include final_bid_points
        const playersWithBids = players?.map(player => ({
            ...player,
            final_bid_points: player.auction_rounds?.[0]?.final_points || player.base_price,
            auction_rounds: undefined // Remove the auction_rounds from the response
        })) || [];

        // Get budget information
        const { data: budgetHistory, error: budgetError } = await supabase
            .from('budget_history')
            .select('*')
            .eq('team_id', teamId)
            .order('created_at', { ascending: false })
            .limit(10);

        // Get available players for this tournament
        const { data: availablePlayers, error: availablePlayersError } = await supabase
            .from('players')
            .select(`
                id,
                name,
                player_position,
                skill_level,
                base_price,
                status,
                category:player_categories!inner (
                    tournament_id,
                    category_type,
                    name,
                    base_points
                )
            `)
            .eq('category.tournament_id', team.tournament_id)
            .order('name');

        // Get team's player preferences
        const { data: preferences, error: preferencesError } = await supabase
            .from('preferred_players')
            .select('*')
            .eq('team_id', teamId);

        // Add preference information to available players
        const availablePlayersWithPreferences = availablePlayers?.map(player => ({
            ...player,
            is_preferred: preferences?.some(pref => pref.player_id === player.id) || false,
            preference: preferences?.find(pref => pref.player_id === player.id)
        })) || [];

        return NextResponse.json({
            team: {
                id: team.id,
                name: team.name,
                initial_budget: team.initial_budget,
                remaining_budget: team.remaining_budget,
            },
            tournament: team.tournaments,
            requirements: combinedRequirements || [],
            categoryRequirements: categoryRequirements || [],
            current_players: playersWithBids,
            available_players: availablePlayersWithPreferences,
            budget_history: budgetHistory || [],
            isAdmin
        });

    } catch (error) {
        console.error('Error in team management:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;
        const body = await request.json();

        // Validate request body
        const { requirements } = body;

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const isAdmin = session.user.email?.endsWith('@pbel.in');

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

        // Allow both admin and team owner to update
        if (!isAdmin && team.owner_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Update requirements
        if (requirements) {
            for (const req of requirements) {
                await supabase
                    .from('team_combined_requirements')
                    .upsert({
                        team_id: teamId,
                        position: req.position,
                        skill_level: req.skill_level,
                        min_players: req.min_players,
                        max_players: req.max_players,
                        points_allocated: req.points_allocated,
                        updated_at: new Date().toISOString()
                    });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Team requirements updated successfully'
        });

    } catch (error) {
        console.error('Error updating team requirements:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 