import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { players, categoryId } = await request.json();

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
    if (!players || !Array.isArray(players) || players.length === 0 || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the category details to get base_price
    const { data: category, error: categoryError } = await supabase
      .from('player_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryError || !category) {
      console.error('Error fetching category:', categoryError);
      return NextResponse.json(
        { error: 'Failed to fetch category details' },
        { status: 500 }
      );
    }

    // Update players with the new category and base price
    const updatePromises = players.map(async (playerId: string) => {
      const { error } = await supabase
        .from('players')
        .update({
          category_id: categoryId,
          base_price: category.base_points
        })
        .eq('id', playerId);

      if (error) {
        console.error(`Error updating player ${playerId}:`, error);
        return { playerId, success: false, error: error.message };
      }

      return { playerId, success: true };
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} players, ${failureCount} failures`,
      results
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 