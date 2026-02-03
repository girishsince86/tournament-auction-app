import { NextRequest, NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/public-api';

export async function POST(request: NextRequest) {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Insert tournament into database
    const { data, error } = await supabase
      .from('tournaments')
      .insert([
        {
          name: body.name,
          description: body.description,
          start_date: body.start_date,
          end_date: body.end_date,
          registration_deadline: body.registration_deadline,
          max_teams: body.max_teams,
          max_players_per_team: body.max_players_per_team,
          min_players_per_team: body.min_players_per_team,
          team_points_budget: body.team_points_budget,
          is_active: body.is_active || false,
          team_budget: body.team_budget
        },
      ])
      .select();
    
    if (error) {
      console.error('Error creating test tournament:', error);
      return NextResponse.json(
        { error: 'Failed to create tournament', details: error },
        { status: 500 }
      );
    }
    
    console.log('Test tournament created:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error creating test tournament:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error },
      { status: 500 }
    );
  }
} 