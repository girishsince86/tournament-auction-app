import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

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

    // Find categories with zero base_points
    const { data: zeroBasePointsCategories, error: zeroError } = await supabase
      .from('player_categories')
      .select('id, name, category_type, base_points, tournament_id')
      .eq('base_points', 0);

    if (zeroError) {
      console.error('Error fetching categories with zero base_points:', zeroError);
      return NextResponse.json(
        { error: 'Failed to fetch categories with zero base_points' },
        { status: 500 }
      );
    }

    // Find categories with null base_points
    const { data: nullBasePointsCategories, error: nullError } = await supabase
      .from('player_categories')
      .select('id, name, category_type, base_points, tournament_id')
      .is('base_points', null);

    if (nullError) {
      console.error('Error fetching categories with null base_points:', nullError);
      return NextResponse.json(
        { error: 'Failed to fetch categories with null base_points' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      zeroBasePointsCategories: zeroBasePointsCategories || [],
      nullBasePointsCategories: nullBasePointsCategories || [],
      zeroCount: zeroBasePointsCategories?.length || 0,
      nullCount: nullBasePointsCategories?.length || 0,
      totalIssues: (zeroBasePointsCategories?.length || 0) + (nullBasePointsCategories?.length || 0),
    });
  } catch (error) {
    console.error('Error checking zero base points categories:', error);
    return NextResponse.json(
      { error: 'Failed to check zero base points categories' },
      { status: 500 }
    );
  }
} 