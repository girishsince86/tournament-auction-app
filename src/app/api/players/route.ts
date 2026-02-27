import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const position = searchParams.get('position');
        const skillLevel = searchParams.get('skillLevel');
        const categoryId = searchParams.get('categoryId');
        const tournamentId = searchParams.get('tournamentId');

        console.log('API /players - Query parameters:', { 
            status, position, skillLevel, categoryId, tournamentId 
        });

        // Build the query
        let query = supabase
            .from('players')
            .select(`
                id,
                name,
                player_position,
                skill_level,
                base_price,
                status,
                profile_image_url,
                category_id,
                categories:player_categories(
                    id,
                    category_type,
                    name,
                    base_points
                )
            `);

        // Apply filters
        if (status) {
            console.log(`Filtering by status: ${status}`);
            query = query.eq('status', status);
        }

        if (position) {
            console.log(`Filtering by position: ${position}`);
            query = query.eq('player_position', position);
        }

        if (skillLevel) {
            console.log(`Filtering by skill level: ${skillLevel}`);
            query = query.eq('skill_level', skillLevel);
        }

        if (categoryId) {
            console.log(`Filtering by category ID: ${categoryId}`);
            query = query.eq('category_id', categoryId);
        }

        // First get the players
        const { data: players, error } = await query.order('name');

        if (error) {
            console.error('Error fetching players:', error);
            return NextResponse.json(
                { error: 'Failed to fetch players' },
                { status: 500 }
            );
        }

        // Fetch categories for the tournament (only if tournamentId is provided)
        let categories: Record<string, any> = {};
        const categoryByType: Record<string, any> = {};
        if (tournamentId) {
            console.log(`Fetching categories for tournament ID: ${tournamentId}`);
            const { data: tournamentCategories, error: categoriesError } = await supabase
                .from('player_categories')
                .select('*')
                .eq('tournament_id', tournamentId);

            if (categoriesError) {
                console.error('Error fetching categories:', categoriesError);
            }

            if (tournamentCategories) {
                categories = tournamentCategories.reduce((acc: Record<string, any>, category) => {
                    acc[category.id] = category;
                    return acc;
                }, {});
                for (const cat of tournamentCategories) {
                    categoryByType[cat.category_type] = cat;
                }
            }
        }

        console.log(`API /players - Found ${players?.length || 0} players`);

        // Format the response
        const formattedPlayers = players.map(player => {
            // Determine category based on player attributes if not already assigned
            let categoryId = player.category_id;

            if (!categoryId) {
                // Assign category based on skill level and base price, using dynamic lookup
                if (player.base_price >= 40000000 && categoryByType['LEVEL_1']) {
                    categoryId = categoryByType['LEVEL_1'].id;
                } else if (player.skill_level === 'COMPETITIVE_A' && categoryByType['LEVEL_2']) {
                    categoryId = categoryByType['LEVEL_2'].id;
                } else if (categoryByType['LEVEL_3']) {
                    categoryId = categoryByType['LEVEL_3'].id;
                }
            }

            // Get the category from our map if available
            const category = categoryId && categories[categoryId]
                ? categories[categoryId]
                : (player.categories && player.categories.length > 0 ? player.categories[0] : null);
                    
            return {
                id: player.id,
                name: player.name,
                player_position: player.player_position,
                skill_level: player.skill_level,
                base_price: player.base_price,
                status: player.status,
                profile_image_url: player.profile_image_url,
                category_id: categoryId,
                category: category
            };
        });

        return NextResponse.json({ players: formattedPlayers });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 