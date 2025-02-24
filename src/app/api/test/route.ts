import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('Test endpoint called');
        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        console.log('Auth check result:', {
            session: session ? {
                id: session.user.id,
                email: session.user.email,
                role: session.user.app_metadata?.role
            } : null,
            error: authError ? {
                message: authError.message,
                status: authError.status
            } : null
        });

        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            message: 'Authentication successful',
            user: {
                id: session.user.id,
                email: session.user.email,
                role: session.user.app_metadata?.role
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 