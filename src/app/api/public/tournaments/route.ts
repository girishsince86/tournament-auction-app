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
    console.log('API /public/tournaments - Fetching tournaments');

    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching tournaments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tournaments' },
        { status: 500 }
      );
    }

    console.log(`API /public/tournaments - Found ${tournaments?.length || 0} tournaments`);

    // Find the current (active) tournament
    const currentTournament = tournaments?.find(t => t.is_active);

    // Return in the same format as the authenticated API
    return NextResponse.json({
      tournaments,
      currentTournament
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 