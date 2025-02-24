import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get budget analysis
        const { data: analysis, error: analysisError } = await supabase
            .rpc('get_preferred_players_budget_analysis', {
                p_team_id: teamId
            });

        if (analysisError) {
            console.error('Error fetching budget analysis:', analysisError);
            return NextResponse.json(
                { error: 'Failed to fetch budget analysis' },
                { status: 500 }
            );
        }

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 