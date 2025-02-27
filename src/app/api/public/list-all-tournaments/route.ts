import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    console.log('Listing all tournaments from database');
    
    // Get all tournaments without any filtering
    const { data, error } = await supabase
      .from('tournaments')
      .select('*');
    
    if (error) {
      console.error('Error listing tournaments:', error);
      return NextResponse.json(
        { error: 'Failed to list tournaments', details: error },
        { status: 500 }
      );
    }
    
    console.log(`Found ${data?.length || 0} tournaments in database`);
    console.log('Tournament data:', data);
    
    return NextResponse.json({ 
      count: data?.length || 0,
      tournaments: data || [] 
    });
  } catch (error) {
    console.error('Unexpected error listing tournaments:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error },
      { status: 500 }
    );
  }
} 