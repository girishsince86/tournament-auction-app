import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
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

    // Ensure min_points is not null (required field in the database)
    const updatedData = {
      name: data.name,
      category_type: data.category_type,
      base_points: data.base_points || 0,
      min_points: data.min_points || 0,
      max_points: data.max_points || null,
      description: data.description,
      skill_level: data.skill_level
    };

    // Update the category
    const { data: category, error } = await supabase
      .from('player_categories')
      .update(updatedData)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating player category:', error);
      return NextResponse.json(
        { error: 'Failed to update player category' },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
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

    // Delete the category
    const { error } = await supabase
      .from('player_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting player category:', error);
      return NextResponse.json(
        { error: 'Failed to delete player category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 