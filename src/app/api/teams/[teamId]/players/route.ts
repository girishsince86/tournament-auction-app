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

        // Get players with their auction details
        const { data: players, error } = await supabase
            .from('players')
            .select(`
                id,
                name,
                player_position,
                skill_level,
                base_price,
                profile_image_url,
                category_id,
                auction_rounds (
                    final_points,
                    created_at
                )
            `)
            .eq('current_team_id', teamId)
            .order('name');

        if (error) {
            console.error('Error fetching team players:', error);
            return NextResponse.json(
                { error: 'Failed to fetch team players' },
                { status: 500 }
            );
        }

        // Fetch categories for players with category_id
        const categoryIds = players
            .filter(player => player.category_id)
            .map(player => player.category_id);

        interface PlayerCategory {
            id: string;
            name: string;
            category_type: string;
            base_points: number;
        }

        let categories: PlayerCategory[] = [];
        if (categoryIds.length > 0) {
            const { data: categoryData, error: categoryError } = await supabase
                .from('player_categories')
                .select('id, name, category_type, base_points')
                .in('id', categoryIds);

            if (categoryError) {
                console.error('Error fetching player categories:', categoryError);
            } else {
                categories = categoryData || [];
            }
        }

        // Format the response
        const formattedPlayers = players.map(player => {
            const playerCategory = player.category_id 
                ? categories.find(cat => cat.id === player.category_id) 
                : null;
                
            return {
                id: player.id,
                name: player.name,
                player_position: player.player_position,
                skill_level: player.skill_level,
                base_price: player.base_price,
                profile_image_url: player.profile_image_url,
                category: playerCategory ? {
                    id: playerCategory.id,
                    name: playerCategory.name,
                    category_type: playerCategory.category_type,
                    base_points: playerCategory.base_points
                } : null,
                auction_details: player.auction_rounds?.[0] ? {
                    final_points: player.auction_rounds[0].final_points,
                    auction_date: player.auction_rounds[0].created_at
                } : undefined
            };
        });

        return NextResponse.json({
            players: formattedPlayers
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 