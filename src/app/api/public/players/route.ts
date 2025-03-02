import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types/supabase';

// Create a Supabase client with the public anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Log the request for debugging
    console.log(`API /public/players - Request received at ${new Date().toISOString()}`);
    
    // Validate Supabase client
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const position = searchParams.get('position');
    const skillLevel = searchParams.get('skillLevel');
    const categoryId = searchParams.get('categoryId');
    const timestamp = searchParams.get('_t'); // Get the cache-busting parameter
    // Use hardcoded tournament ID instead of getting from search params
    const tournamentId = '11111111-1111-1111-1111-111111111111';

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

    // Get the marquee players (Level-1 category) separately
    console.log('Fetching marquee players...');
    const { data: marqueePlayers, error: marqueeError } = await supabase
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
      `)
      .eq('category_id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .order('name');

    if (marqueeError) {
      console.error('Error fetching marquee players:', marqueeError);
    } else {
      console.log(`Successfully fetched ${marqueePlayers?.length || 0} marquee players`);
    }

    // Combine regular players with marquee players, avoiding duplicates
    const allPlayers = players.slice();
    if (marqueePlayers && marqueePlayers.length > 0) {
      console.log(`Found ${marqueePlayers.length} marquee players`);
      
      // Add marquee players that aren't already in the list
      const playerIds = new Set(allPlayers.map(p => p.id));
      marqueePlayers.forEach(player => {
        if (!playerIds.has(player.id)) {
          allPlayers.push(player);
        }
      });
    }

    // Define default categories
    const defaultCategories = {
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa': {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Marquee',
        category_type: 'LEVEL_1',
        base_points: 50000000,
        tournament_id: tournamentId
      },
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb': {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Capped',
        category_type: 'LEVEL_2',
        base_points: 30000000,
        tournament_id: tournamentId
      },
      'cccccccc-cccc-cccc-cccc-cccccccccccc': {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'UnCapped',
        category_type: 'LEVEL_3',
        base_points: 10000000,
        tournament_id: tournamentId
      }
    };

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

    // Add default categories if they don't exist
    Object.keys(defaultCategories).forEach(categoryId => {
      if (!categories[categoryId]) {
        categories[categoryId] = defaultCategories[categoryId as keyof typeof defaultCategories];
      }
    });

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