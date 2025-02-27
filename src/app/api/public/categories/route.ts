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
    // Use hardcoded tournament ID
    const tournamentId = '11111111-1111-1111-1111-111111111111';

    console.log(`API /public/categories - Fetching categories for tournament ID: ${tournamentId}`);

    // Define default categories to ensure we always have a complete set
    const defaultCategories = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Marquee',
        category_type: 'LEVEL_1',
        base_points: 50000000,
        tournament_id: tournamentId
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Capped',
        category_type: 'LEVEL_2',
        base_points: 30000000,
        tournament_id: tournamentId
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'UnCapped',
        category_type: 'LEVEL_3',
        base_points: 20000000,
        tournament_id: tournamentId
      }
    ];

    // Try to fetch categories from the database, but don't fail if there's an error
    let dbCategories = [];
    try {
      const { data, error } = await supabase
        .from('player_categories')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('name');

      if (error) {
        console.error('Error fetching categories from database:', error);
      } else {
        dbCategories = data || [];
        console.log(`API /public/categories - Found ${dbCategories.length} categories from database`);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with default categories
    }

    // Create a new array with the database categories
    let allCategories = [...dbCategories];
    
    // Add default categories if they don't exist in the database results
    defaultCategories.forEach(defaultCategory => {
      const exists = allCategories.some(cat => cat.id === defaultCategory.id);
      if (!exists) {
        console.log(`Adding default category: ${defaultCategory.name}`);
        allCategories.push(defaultCategory);
      }
    });

    console.log(`API /public/categories - Returning ${allCategories.length} categories total`);

    return NextResponse.json({ categories: allCategories });
  } catch (error) {
    console.error('Unexpected error:', error);
    // Return default categories even if there's an error
    const defaultCategories = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Marquee',
        category_type: 'LEVEL_1',
        base_points: 50000000,
        tournament_id: '11111111-1111-1111-1111-111111111111'
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Capped',
        category_type: 'LEVEL_2',
        base_points: 30000000,
        tournament_id: '11111111-1111-1111-1111-111111111111'
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'UnCapped',
        category_type: 'LEVEL_3',
        base_points: 20000000,
        tournament_id: '11111111-1111-1111-1111-111111111111'
      }
    ];
    
    return NextResponse.json({ categories: defaultCategories });
  }
} 