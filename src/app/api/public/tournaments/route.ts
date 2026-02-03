import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types/supabase';

// Create a Supabase client with the public anon key
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('API /public/tournaments - Fetching tournaments');

    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching tournaments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tournaments' },
        { status: 500 }
      );
    }

    console.log(`API /public/tournaments - Found ${tournaments?.length || 0} tournaments`);

    // Find the current (active) tournament
    const currentTournament = tournaments?.find(t => t.is_active);

    // If no tournaments found, return mock data for development
    if (!tournaments || tournaments.length === 0) {
      console.log('API /public/tournaments - No tournaments found, returning mock data');
      
      const mockTournaments = [
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "PCVC Volley Ball and Throwball League 2026",
          description: "Annual PCVC volleyball and throwball tournament",
          start_date: "2026-01-01",
          end_date: "2026-02-28",
          registration_deadline: "2025-12-15",
          max_teams: 8,
          max_players_per_team: 12,
          min_players_per_team: 6,
          team_points_budget: 1000,
          is_active: true,
          created_at: "2025-02-20 11:33:18.71794+00",
          updated_at: "2025-02-26 01:43:17.049264+00",
          team_budget: 1000000000
        }
      ];
      
      return NextResponse.json({
        tournaments: mockTournaments,
        currentTournament: mockTournaments[0]
      });
    }

    // Return in the same format as the authenticated API
    return NextResponse.json({
      tournaments,
      currentTournament
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 