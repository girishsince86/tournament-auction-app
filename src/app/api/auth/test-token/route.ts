import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const body = await request.json();
        const { email, password } = body;

        // Sign in and get session
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        // Return the access token
        return NextResponse.json({
            access_token: session?.access_token,
            refresh_token: session?.refresh_token
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 