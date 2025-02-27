import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';
import { TeamNameUpdateRequest } from '@/types/team-owner';

// Validation function for team name
function validateTeamName(name: string): { isValid: boolean; error?: string } {
  if (!name?.trim()) {
    return { isValid: false, error: 'Team name is required' };
  }

  if (name.length < 3 || name.length > 50) {
    return { isValid: false, error: 'Team name must be between 3 and 50 characters' };
  }

  // Allow letters, numbers, spaces, and basic punctuation
  if (!/^[a-zA-Z0-9\s\-_'.]+$/.test(name)) {
    return { isValid: false, error: 'Team name can only contain letters, numbers, spaces, and basic punctuation' };
  }

  return { isValid: true };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { teamId } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team ID format' },
        { status: 400 }
      );
    }

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json() as TeamNameUpdateRequest;
    
    // Validate team name
    const validation = validateTeamName(body.name);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if user is admin
    const isAdmin = session.user.email?.endsWith('@pbel.in');

    // Verify team ownership if not admin
    if (!isAdmin) {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select(`
          id,
          tournament_id,
          team_owners!inner (
            auth_user_id
          )
        `)
        .eq('id', teamId)
        .single();

      if (teamError) {
        console.error('Team fetch error:', teamError);
        return NextResponse.json(
          { error: 'Failed to verify team ownership' },
          { status: 500 }
        );
      }

      if (!team) {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }

      const isTeamOwner = team.team_owners.some(
        (owner: { auth_user_id: string }) => owner.auth_user_id === session.user.id
      );

      if (!isTeamOwner) {
        return NextResponse.json(
          { error: 'You do not have permission to update this team' },
          { status: 403 }
        );
      }

      // Check if name is unique within the tournament
      const { data: existingTeam, error: nameCheckError } = await supabase
        .from('teams')
        .select('id')
        .eq('tournament_id', team.tournament_id)
        .eq('name', body.name)
        .neq('id', teamId)
        .single();

      if (nameCheckError && nameCheckError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        console.error('Name check error:', nameCheckError);
        return NextResponse.json(
          { error: 'Failed to verify team name uniqueness' },
          { status: 500 }
        );
      }

      if (existingTeam) {
        return NextResponse.json(
          { error: 'Team name already exists in this tournament' },
          { status: 400 }
        );
      }
    }

    // Update team name
    const { data: updatedTeam, error: updateError } = await supabase
      .from('teams')
      .update({ 
        name: body.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single();

    if (updateError) {
      console.error('Team update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update team name' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedTeam });
  } catch (error) {
    console.error('Team name update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 