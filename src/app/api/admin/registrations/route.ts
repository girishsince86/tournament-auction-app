import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const supabase = createRouteHandlerClient({ cookies });

    // Verify admin access
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email?.endsWith('@pbel.in')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Build query
    let query = supabase
      .from('tournament_registrations')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%,flat_number.ilike.%${search}%`
      );
    }

    if (category) {
      query = query.eq('registration_category', category);
    }

    if (status !== null && status !== undefined) {
      query = query.eq('is_verified', status === 'true');
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: registrations, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching registrations:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json({
      registrations,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error in registrations API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 