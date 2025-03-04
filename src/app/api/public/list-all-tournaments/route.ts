import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Listing all tournaments from database');
    
    // Get all tournaments with minimal fields
    const { data, error } = await supabase
      .from('tournaments')
      .select('id, name, start_date, end_date, status')
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error('Error listing tournaments:', error);
      return NextResponse.json(
        { error: 'Failed to list tournaments', details: error },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store'
          }
        }
      );
    }
    
    console.log(`Found ${data?.length || 0} tournaments in database`);
    
    const response = NextResponse.json({ 
      count: data?.length || 0,
      tournaments: data || [] 
    });

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('Unexpected error listing tournaments:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
} 