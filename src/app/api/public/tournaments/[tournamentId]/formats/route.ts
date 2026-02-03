import { NextRequest, NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 503 });
    }
    console.log(`API /public/tournaments/${params.tournamentId}/formats - Fetching formats`);
    
    const { tournamentId } = params;
    
    if (!tournamentId) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch tournament formats
    const { data: formats, error: formatsError } = await supabase
      .from('tournament_formats')
      .select('*')
      .eq('tournament_id', tournamentId);
    
    if (formatsError) {
      console.error('Error fetching formats:', formatsError);
      return NextResponse.json(
        { error: 'Failed to fetch tournament formats' },
        { status: 500 }
      );
    }
    
    console.log(`API /public/tournaments/${tournamentId}/formats - Found ${formats?.length || 0} formats`);
    
    // If no formats found, return mock data for development
    if (!formats || formats.length === 0) {
      console.log(`API /public/tournaments/${tournamentId}/formats - No formats found, returning mock data`);
      
      const mockFormats = [
        {
          id: "db1fb6d1-fc5d-4f2a-9075-1528956d2c5f",
          tournament_id: "11111111-1111-1111-1111-111111111111",
          name: "Volleyball - Open Men",
          format_type: "VOLLEYBALL",
          team_formation_method: "AUCTION",
          scoring_system: {
            sets_to_win: 2,
            win_by_margin: 2,
            points_for_win: 2,
            points_per_set: 25,
            points_for_loss: 0,
            final_set_points: 15,
            registration_category: "VOLLEYBALL_OPEN_MEN"
          },
          match_duration: "45 minutes",
          created_at: "2025-03-03 13:28:15.166181+00",
          updated_at: "2025-03-03 13:28:15.166181+00"
        },
        {
          id: "26bae4a8-6b56-419a-97cc-b2b2a5455d18",
          tournament_id: "11111111-1111-1111-1111-111111111111",
          name: "Throwball - Women",
          format_type: "THROWBALL",
          team_formation_method: "SPIN_THE_WHEEL",
          scoring_system: {
            sets_to_win: 2,
            win_by_margin: 2,
            points_for_win: 2,
            points_per_set: 21,
            points_for_loss: 0,
            final_set_points: 15,
            registration_category: "THROWBALL_WOMEN"
          },
          match_duration: "30 minutes",
          created_at: "2025-03-03 13:28:42.96504+00",
          updated_at: "2025-03-03 13:28:42.96504+00"
        },
        {
          id: "3a393dcd-f120-4c89-8bcc-7588d2c956a6",
          tournament_id: "11111111-1111-1111-1111-111111111111",
          name: "Throwball - 13-17 Mixed",
          format_type: "THROWBALL",
          team_formation_method: "SPIN_THE_WHEEL",
          scoring_system: {
            sets_to_win: 2,
            win_by_margin: 2,
            points_for_win: 2,
            points_per_set: 21,
            points_for_loss: 0,
            final_set_points: 15,
            registration_category: "THROWBALL_13_17_MIXED"
          },
          match_duration: "30 minutes",
          created_at: "2025-03-03 13:28:49.242044+00",
          updated_at: "2025-03-03 13:28:49.242044+00"
        },
        {
          id: "37dbc183-c84a-4a36-862f-e84ffd89a0a4",
          tournament_id: "11111111-1111-1111-1111-111111111111",
          name: "Throwball - 8-12 Mixed",
          format_type: "THROWBALL",
          team_formation_method: "SPIN_THE_WHEEL",
          scoring_system: {
            sets_to_win: 2,
            win_by_margin: 2,
            points_for_win: 2,
            points_per_set: 15,
            points_for_loss: 0,
            final_set_points: 11,
            registration_category: "THROWBALL_8_12_MIXED"
          },
          match_duration: "25 minutes",
          created_at: "2025-03-03 13:28:55.720913+00",
          updated_at: "2025-03-03 13:28:55.720913+00"
        }
      ];
      
      return NextResponse.json({
        data: mockFormats
      });
    }
    
    return NextResponse.json({
      data: formats
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 