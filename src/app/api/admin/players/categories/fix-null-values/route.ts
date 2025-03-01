import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    // Get all categories with null min_points or base_points
    const { data: categoriesWithNullMin, error: fetchErrorMin } = await supabase
      .from('player_categories')
      .select('*')
      .is('min_points', null);

    if (fetchErrorMin) {
      console.error('Error fetching categories with null min_points:', fetchErrorMin);
      return NextResponse.json(
        { error: 'Failed to fetch categories with null min_points' },
        { status: 500 }
      );
    }

    // Get all categories with null base_points
    const { data: categoriesWithNullBase, error: fetchErrorBase } = await supabase
      .from('player_categories')
      .select('*')
      .is('base_points', null);

    if (fetchErrorBase) {
      console.error('Error fetching categories with null base_points:', fetchErrorBase);
      return NextResponse.json(
        { error: 'Failed to fetch categories with null base_points' },
        { status: 500 }
      );
    }

    // Get all categories with base_points = 0
    const { data: categoriesWithZeroBase, error: fetchErrorZeroBase } = await supabase
      .from('player_categories')
      .select('*')
      .eq('base_points', 0);

    if (fetchErrorZeroBase) {
      console.error('Error fetching categories with zero base_points:', fetchErrorZeroBase);
      return NextResponse.json(
        { error: 'Failed to fetch categories with zero base_points' },
        { status: 500 }
      );
    }

    // Combine and deduplicate categories
    const allCategories = [
      ...(categoriesWithNullMin || []), 
      ...(categoriesWithNullBase || []),
      ...(categoriesWithZeroBase || [])
    ];
    const uniqueCategories = Array.from(new Map(allCategories.map(cat => [cat.id, cat])).values());

    if (uniqueCategories.length === 0) {
      return NextResponse.json({
        message: 'No categories with null or zero values found',
        fixedCount: 0
      });
    }

    // Update each category with null values
    const updatePromises = uniqueCategories.map(async (category) => {
      const updateData: Record<string, any> = {};
      
      if (category.min_points === null) {
        updateData.min_points = 0;
      }
      
      if (category.base_points === null || category.base_points === 0) {
        // Set a reasonable default value (1 Cr = 10,000,000)
        updateData.base_points = 10000000;
      }
      
      // Only update if there are fields to update
      if (Object.keys(updateData).length === 0) {
        return { id: category.id, success: true, message: 'No fields needed updating' };
      }

      const { error } = await supabase
        .from('player_categories')
        .update(updateData)
        .eq('id', category.id);

      if (error) {
        console.error(`Error updating category ${category.id}:`, error);
        return { id: category.id, success: false, error: error.message };
      }

      return { 
        id: category.id, 
        success: true, 
        updatedFields: Object.keys(updateData) 
      };
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Fixed ${successCount} categories, ${failureCount} failures`,
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