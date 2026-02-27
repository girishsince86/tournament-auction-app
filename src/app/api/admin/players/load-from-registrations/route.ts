import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and has admin role
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', session.user.email);

    // TEMPORARY: Allow specific email addresses to bypass admin check
    const bypassEmails = ['admin@pbel.in', 'amit@pbel.in', 'vasu@pbel.in'];
    const bypassAdminCheck = bypassEmails.includes(session.user.email || '');
    
    if (!bypassAdminCheck) {
      // Check if user has admin role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user role:', userError);
        return NextResponse.json(
          { error: `Failed to verify admin status: ${userError.message}` },
          { status: 500 }
        );
      }
      
      console.log('User data:', userData);

      if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'admin')) {
        console.log('Admin check failed:', { 
          hasUserData: !!userData, 
          role: userData?.role 
        });
        return NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        );
      }
    } else {
      console.log('Admin check bypassed for:', session.user.email);
    }

    // Parse request body
    const body = await request.json();
    const {
      category = null,
      tournamentId = null,
      updateExisting = false,
      sportCategory = null
    } = body;

    console.log('Loading players from registrations:', {
      category,
      tournamentId,
      updateExisting,
      sportCategory
    });

    // Use the throwball-specific function when loading THROWBALL_WOMEN
    if (sportCategory === 'THROWBALL_WOMEN' || category === 'THROWBALL_WOMEN') {
      const { data, error } = await supabase.rpc(
        'load_throwball_women_players',
        {
          p_tournament_id: tournamentId,
          p_update_existing: updateExisting
        }
      );

      if (error) {
        console.error('Error loading throwball women players:', error);
        return NextResponse.json(
          { error: `Failed to load throwball women players: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data[0]
      });
    }

    // Call the volleyball database function
    const { data, error } = await supabase.rpc(
      'load_players_from_registrations',
      {
        p_registration_category: category,
        p_tournament_id: tournamentId,
        p_update_existing: updateExisting
      }
    );

    if (error) {
      console.error('Error loading players from registrations:', error);
      return NextResponse.json(
        { error: `Failed to load players: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Unexpected error loading players from registrations:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and has admin role
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user role:', userError);
      return NextResponse.json(
        { error: `Failed to verify admin status: ${userError.message}` },
        { status: 500 }
      );
    }
    
    console.log('User data:', userData);

    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'admin')) {
      console.log('Admin check failed:', { 
        hasUserData: !!userData, 
        role: userData?.role 
      });
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Parse URL parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    console.log('Cleaning up players from registrations:', { category });

    // Call the database function
    const { data, error } = await supabase.rpc(
      'cleanup_players_from_registrations',
      {
        p_registration_category: category
      }
    );

    if (error) {
      console.error('Error cleaning up players from registrations:', error);
      return NextResponse.json(
        { error: `Failed to clean up players: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      playersDeleted: data
    });
  } catch (error) {
    console.error('Unexpected error cleaning up players from registrations:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found');
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }
    
    console.log('User authenticated:', session.user.email);

    // TEMPORARY: Allow specific email addresses to bypass admin check
    const bypassEmails = ['admin@pbel.in', 'amit@pbel.in', 'vasu@pbel.in'];
    const bypassAdminCheck = bypassEmails.includes(session.user.email || '');
    
    if (!bypassAdminCheck) {
      // Check if user has admin role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user role:', userError);
        return NextResponse.json(
          { error: `Failed to verify admin status: ${userError.message}` },
          { status: 500 }
        );
      }
      
      console.log('User data:', userData);

      if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'admin')) {
        console.log('Admin check failed:', { 
          hasUserData: !!userData, 
          role: userData?.role 
        });
        return NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        );
      }
    } else {
      console.log('Admin check bypassed for:', session.user.email);
    }

    // Call the database function to get registration statistics
    const { data, error } = await supabase.rpc('get_registration_statistics');

    if (error) {
      console.error('Error getting registration statistics:', error);
      return NextResponse.json(
        { error: `Failed to get statistics: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      statistics: data
    });
  } catch (error) {
    console.error('Unexpected error getting registration statistics:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 