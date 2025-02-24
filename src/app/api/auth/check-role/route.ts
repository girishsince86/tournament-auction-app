export const dynamic = 'force-dynamic';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/types/supabase';

export async function GET(request: Request) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Get the user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            return NextResponse.json({ error: 'Error fetching session' }, { status: 500 });
        }

        if (!session) {
            return NextResponse.json({ error: 'No active session' }, { status: 401 });
        }

        // Get the user's role from the user_roles table
        const { data: userRole, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        if (roleError) {
            return NextResponse.json({ error: 'Error fetching user role' }, { status: 500 });
        }

        return NextResponse.json({
            role: userRole?.role || 'user',
            user: {
                id: session.user.id,
                email: session.user.email
            }
        });
    } catch (error) {
        console.error('Error in check-role route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 