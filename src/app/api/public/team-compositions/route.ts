import { NextRequest, NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 503 });
    }
    console.log('API /public/team-compositions - Fetching team compositions');
    
    const searchParams = request.nextUrl.searchParams;
    const formatType = searchParams.get('formatType');
    const formatId = searchParams.get('formatId');
    const tournamentId = searchParams.get('tournamentId') || '11111111-1111-1111-1111-111111111111';
    
    console.log('API /public/team-compositions - Query parameters:', { 
      formatType, formatId, tournamentId
    });
    
    // Step 1: Get tournament formats
    let formatsQuery = supabase
      .from('tournament_formats')
      .select('id, name, format_type, team_formation_method')
      .eq('tournament_id', tournamentId);
    
    if (formatType) {
      formatsQuery = formatsQuery.eq('format_type', formatType);
    }
    
    if (formatId) {
      formatsQuery = formatsQuery.eq('id', formatId);
    }
    
    const { data: formats, error: formatsError } = await formatsQuery;
    
    if (formatsError) {
      console.error('Error fetching formats:', formatsError);
      return NextResponse.json(
        { error: 'Failed to fetch tournament formats' },
        { status: 500 }
      );
    }
    
    console.log(`API /public/team-compositions - Found ${formats?.length || 0} formats`);
    
    // If no formats found or for development purposes, return mock data
    if (!formats || formats.length === 0) {
      console.log('API /public/team-compositions - No formats found or using mock data');
      
      // Mock data for volleyball format
      const mockTeamCompositions = [
        {
          id: "vb-team-1",
          name: "Smash Hitters",
          format_id: "db1fb6d1-fc5d-4f2a-9075-1528956d2c5f",
          format_name: "Volleyball - Open Men",
          format_type: "VOLLEYBALL",
          tournament_id: "11111111-1111-1111-1111-111111111111",
          players: [
            {
              id: "player-1",
              name: "Rahul Sharma",
              tshirt_number: "7",
              tshirt_name: "RAHUL",
              apartment_number: "A-101",
              profile_image_url: "",
              position: "SETTER",
              skill_level: "ADVANCED"
            },
            {
              id: "player-2",
              name: "Vikram Singh",
              tshirt_number: "9",
              tshirt_name: "VIKRAM",
              apartment_number: "B-205",
              profile_image_url: "",
              position: "OUTSIDE_HITTER",
              skill_level: "INTERMEDIATE"
            },
            {
              id: "player-3",
              name: "Ajay Kumar",
              tshirt_number: "11",
              tshirt_name: "AJAY",
              apartment_number: "C-304",
              profile_image_url: "",
              position: "MIDDLE_BLOCKER",
              skill_level: "ADVANCED"
            }
          ]
        },
        {
          id: "vb-team-2",
          name: "Net Ninjas",
          format_id: "db1fb6d1-fc5d-4f2a-9075-1528956d2c5f",
          format_name: "Volleyball - Open Men",
          format_type: "VOLLEYBALL",
          tournament_id: "11111111-1111-1111-1111-111111111111",
          players: [
            {
              id: "player-4",
              name: "Suresh Patel",
              tshirt_number: "5",
              tshirt_name: "SURESH",
              apartment_number: "D-401",
              profile_image_url: "",
              position: "LIBERO",
              skill_level: "ADVANCED"
            },
            {
              id: "player-5",
              name: "Karan Malhotra",
              tshirt_number: "8",
              tshirt_name: "KARAN",
              apartment_number: "A-202",
              profile_image_url: "",
              position: "OPPOSITE",
              skill_level: "INTERMEDIATE"
            }
          ]
        },
        {
          id: "tb-team-1",
          name: "Throwball Queens",
          format_id: "26bae4a8-6b56-419a-97cc-b2b2a5455d18",
          format_name: "Throwball - Women",
          format_type: "THROWBALL",
          tournament_id: "11111111-1111-1111-1111-111111111111",
          players: [
            {
              id: "player-6",
              name: "Priya Desai",
              tshirt_number: "3",
              tshirt_name: "PRIYA",
              apartment_number: "B-101",
              profile_image_url: "",
              position: "ATTACKER",
              skill_level: "INTERMEDIATE"
            },
            {
              id: "player-7",
              name: "Neha Gupta",
              tshirt_number: "4",
              tshirt_name: "NEHA",
              apartment_number: "C-202",
              profile_image_url: "",
              position: "DEFENDER",
              skill_level: "ADVANCED"
            }
          ]
        }
      ];
      
      // Filter by formatId if provided
      let filteredTeams = mockTeamCompositions;
      if (formatId) {
        filteredTeams = mockTeamCompositions.filter(team => team.format_id === formatId);
      }
      
      return NextResponse.json({
        data: filteredTeams
      });
    }
    
    // Step 2: Get teams for each format
    const teamCompositions = [];
    
    for (const format of formats) {
      // Get teams for this format
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          owner_name,
          tournament_id,
          format_id
        `)
        .eq('format_id', format.id);
      
      if (teamsError) {
        console.error(`Error fetching teams for format ${format.name}:`, teamsError);
        continue;
      }
      
      console.log(`API /public/team-compositions - Found ${teams.length} teams for format ${format.name}`);
      
      // Get team owners
      for (const team of teams) {
        // Get team owners
        const { data: owners, error: ownersError } = await supabase
          .from('team_owner_profiles')
          .select('id, first_name, last_name, profile_image_url')
          .eq('team_id', team.id);
        
        if (ownersError) {
          console.error(`Error fetching owners for team ${team.name}:`, ownersError);
        }
        
        // Get players for this team
        const { data: players, error: playersError } = await supabase
          .from('players')
          .select(`
            id,
            name,
            player_position,
            skill_level,
            jersey_number,
            apartment_number,
            profile_image_url,
            registration_data
          `)
          .eq('current_team_id', team.id);
        
        if (playersError) {
          console.error(`Error fetching players for team ${team.name}:`, playersError);
          continue;
        }
        
        console.log(`API /public/team-compositions - Found ${players.length} players for team ${team.name}`);
        
        // Transform player data
        const transformedPlayers = players.map(player => {
          const registrationData = player.registration_data || {};
          
          return {
            id: player.id,
            name: player.name,
            tshirt_number: player.jersey_number || registrationData.tshirt_number || '',
            tshirt_name: registrationData.tshirt_name || '',
            apartment_number: player.apartment_number || registrationData.flat_number || '',
            profile_image_url: player.profile_image_url || '',
            position: player.player_position || '',
            skill_level: player.skill_level || ''
          };
        });
        
        // Add team composition to result
        teamCompositions.push({
          id: team.id,
          name: team.name,
          format_id: format.id,
          format_name: format.name,
          format_type: format.format_type,
          tournament_id: team.tournament_id,
          players: transformedPlayers
        });
      }
    }
    
    return NextResponse.json({
      data: teamCompositions
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 