import { NextRequest, NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define types for the response data
interface TournamentGroup {
  id: string;
  name: string;
  description: string | null;
  tournament_id: string;
  format_id: string;
  tournaments: {
    id: string;
    name: string;
  };
  tournament_formats: {
    id: string;
    name: string;
    format_type: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 503 });
    }
    console.log('API /public/tournament-groups - Fetching tournament groups');
    
    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get('tournamentId');
    const formatId = searchParams.get('formatId');
    const formatType = searchParams.get('formatType');
    const groupId = searchParams.get('groupId');
    
    console.log('API /public/tournament-groups - Query parameters:', { 
      tournamentId, formatId, formatType, groupId
    });
    
    if (!tournamentId) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }
    
    // Build the query for tournament groups
    let groupsQuery = supabase
      .from('tournament_groups')
      .select(`
        id,
        name,
        description,
        tournament_id,
        format_id,
        tournaments!inner(id, name),
        tournament_formats!inner(id, name, format_type)
      `);
    
    // Apply filters
    groupsQuery = groupsQuery.eq('tournament_id', tournamentId);
    
    if (formatId) {
      groupsQuery = groupsQuery.eq('format_id', formatId);
    }
    
    if (groupId) {
      groupsQuery = groupsQuery.eq('id', groupId);
    }
    
    if (formatType) {
      groupsQuery = groupsQuery.eq('tournament_formats.format_type', formatType);
    }
    
    // Execute the query
    const { data: groups, error: groupsError } = await groupsQuery;
    
    if (groupsError) {
      console.error('Error fetching tournament groups:', groupsError);
      return NextResponse.json(
        { error: 'Failed to fetch tournament groups' },
        { status: 500 }
      );
    }
    
    console.log(`API /public/tournament-groups - Found ${groups?.length || 0} groups`);
    
    if (!groups || groups.length === 0) {
      return NextResponse.json({
        data: []
      });
    }
    
    // For each group, get the team standings
    const groupsWithStandings = await Promise.all(
      groups.map(async (group: any) => {
        // Get team standings from the view
        const { data: standings, error: standingsError } = await supabase
          .from('group_standings_view')
          .select('*')
          .eq('group_id', group.id)
          .order('ranking', { ascending: true })
          .order('points', { ascending: false })
          .order('matches_won', { ascending: false })
          .order('sets_won', { ascending: false });
        
        if (standingsError) {
          console.error(`Error fetching standings for group ${group.name}:`, standingsError);
          return {
            ...group,
            standings: []
          };
        }
        
        console.log(`API /public/tournament-groups - Found ${standings?.length || 0} team standings for group ${group.name}`);
        
        // Get upcoming matches for this group
        const { data: matches, error: matchesError } = await supabase
          .from('match_schedule_view')
          .select('*')
          .eq('group_id', group.id)
          .order('scheduled_date', { ascending: true })
          .order('scheduled_start_time', { ascending: true });
        
        if (matchesError) {
          console.error(`Error fetching matches for group ${group.name}:`, matchesError);
          return {
            ...group,
            standings: standings || [],
            matches: []
          };
        }
        
        console.log(`API /public/tournament-groups - Found ${matches?.length || 0} matches for group ${group.name}`);
        
        // Extract tournament and format data
        const tournamentData = group.tournaments || {};
        const formatData = group.tournament_formats || {};
        
        // Transform the data to the expected format
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          tournament: {
            id: tournamentData.id,
            name: tournamentData.name
          },
          format: {
            id: formatData.id,
            name: formatData.name,
            format_type: formatData.format_type
          },
          standings: standings || [],
          matches: matches || []
        };
      })
    );
    
    return NextResponse.json({
      data: groupsWithStandings
    });
    
  } catch (error) {
    console.error('Unexpected error in /public/tournament-groups:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 