import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get('tournamentId');

    // Check if user is authenticated and is an admin
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an admin (email ends with @pbel.in)
    const isAdmin = session.user.email?.endsWith('@pbel.in');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Build the query
    let query = supabase
      .from('player_categories')
      .select('*');

    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId);
    }

    // Execute the query
    const { data: categories, error } = await query.order('name');

    if (error) {
      console.error('Error fetching player categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch player categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const data = await request.json();

    // Check if user is authenticated and is an admin
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an admin (email ends with @pbel.in)
    const isAdmin = session.user.email?.endsWith('@pbel.in');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!data.tournament_id || !data.name || !data.category_type || 
        data.base_points === undefined || data.min_points === undefined || 
        !data.skill_level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure min_points is not null (required field in the database)
    const categoryData = {
      tournament_id: data.tournament_id,
      name: data.name,
      category_type: data.category_type,
      base_points: data.base_points || 0,
      min_points: data.min_points || 0,
      max_points: data.max_points || null,
      description: data.description,
      skill_level: data.skill_level
    };

    // Create new category
    const { data: category, error } = await supabase
      .from('player_categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating player category:', error);
      return NextResponse.json(
        { error: 'Failed to create player category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 