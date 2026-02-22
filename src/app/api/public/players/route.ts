import { NextRequest, NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/public-api';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 503 });
    }
    // Log the request for debugging
    console.log(`API /public/players - Request received at ${new Date().toISOString()}`);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const position = searchParams.get('position');
    const skillLevel = searchParams.get('skillLevel');
    const categoryId = searchParams.get('categoryId');
    const timestamp = searchParams.get('_t'); // Get the cache-busting parameter
    // Use the actual active tournament ID
    const tournamentId = searchParams.get('tournamentId') || 'dd0f011f-116d-4546-8cbf-2acc3d68312d';

    console.log('API /public/players - Query parameters:', {
      status, position, skillLevel, categoryId, tournamentId, timestamp
    });
    console.log(`API /public/players - Request time: ${new Date().toISOString()}`);

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
        height,
        registration_data,
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
    console.log('Executing players query...');
    const { data: players, error } = await query.order('name');

    if (error) {
      console.error('Error fetching players:', error);
      return NextResponse.json(
        { error: 'Failed to fetch players', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${players?.length || 0} players`);

    // Use all fetched players directly
    const allPlayers = players || [];



    // If tournament ID is provided, fetch categories for that tournament
    let categories: Record<string, any> = {};
    if (tournamentId) {
      console.log(`Fetching categories for tournament ID: ${tournamentId}`);
      const { data: tournamentCategories, error: categoriesError } = await supabase
        .from('player_categories')
        .select('*')
        .eq('tournament_id', tournamentId);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else if (tournamentCategories) {
        console.log(`Successfully fetched ${tournamentCategories.length} categories`);
        // Create a map of category IDs to category objects
        categories = tournamentCategories.reduce((acc: Record<string, any>, category) => {
          acc[category.id] = category;
          return acc;
        }, {});
      }
    }



    console.log(`API /public/players - Found ${allPlayers?.length || 0} players total`);

    // Format the response
    const formattedPlayers = allPlayers.map(player => {
      // Determine category based on player attributes if not already assigned
      let categoryId = player.category_id;

      if (!categoryId) {
        // Assign category based on skill level and base price
        if (player.base_price >= 40000000) {
          categoryId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; // Marquee
        } else if (player.skill_level === 'COMPETITIVE_A') {
          categoryId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'; // Capped
        } else {
          categoryId = 'cccccccc-cccc-cccc-cccc-cccccccccccc'; // UnCapped
        }
      }

      // Get the category from our map
      const category = categoryId && categories[categoryId]
        ? categories[categoryId]
        : (player.categories && player.categories.length > 0 ? player.categories[0] : null);

      return {
        id: player.id,
        name: player.name,
        player_position: player.player_position,
        skill_level: player.skill_level,
        base_price: category ? category.base_points : player.base_price,
        status: player.status,
        profile_image_url: player.profile_image_url,
        category_id: categoryId,
        category: category,
        height: player.height,
        registration_data: player.registration_data
      };
    });

    console.log(`API /public/players - Successfully formatted ${formattedPlayers.length} players`);

    // Create response with no-cache headers
    const response = NextResponse.json({ players: formattedPlayers });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Unexpected error in /api/public/players:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorResponse = NextResponse.json(
      { error: 'An unexpected error occurred', details: errorMessage },
      { status: 500 }
    );
    errorResponse.headers.set('Cache-Control', 'no-store, max-age=0');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');

    return errorResponse;
  }
} 