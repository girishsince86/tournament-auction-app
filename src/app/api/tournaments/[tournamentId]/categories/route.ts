import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { tournamentId: string } }) {
    try {
        const tournamentId = params.tournamentId;
        
        if (!tournamentId) {
            return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
        }

        const supabase = createRouteHandlerClient({ cookies });
        
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get player categories for this tournament
        const { data: categories, error: categoriesError } = await supabase
            .from('player_categories')
            .select(`
                id,
                name,
                category_type,
                base_points,
                min_points,
                max_points,
                description,
                skill_level
            `)
            .eq('tournament_id', tournamentId)
            .order('name');

        if (categoriesError) {
            console.error('Error fetching categories:', categoriesError);
            return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
        }

        return NextResponse.json({ categories: categories || [] });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 