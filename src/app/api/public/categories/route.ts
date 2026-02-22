import { NextRequest, NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/public-api';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 503 });
    }

    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get('tournamentId') || 'dd0f011f-116d-4546-8cbf-2acc3d68312d';
    const timestamp = searchParams.get('_t');

    console.log(`API /public/categories - Fetching for tournament: ${tournamentId}`);

    const { data, error } = await supabase
      .from('player_categories')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`API /public/categories - Found ${data?.length || 0} categories`);

    const response = NextResponse.json({ categories: data || [] });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Unexpected error in /api/public/categories:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    const errorResponse = NextResponse.json({
      categories: [],
      error: errorMessage
    }, { status: 500 });
    errorResponse.headers.set('Cache-Control', 'no-store, max-age=0');

    return errorResponse;
  }
} 