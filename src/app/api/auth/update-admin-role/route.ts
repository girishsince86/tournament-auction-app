export const dynamic = 'force-dynamic';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/types/supabase';

// Define extended User type to include raw_app_meta_data
interface ExtendedUser {
    id: string;
    email?: string;
    app_metadata: Record<string, any>;
    user_metadata: Record<string, any>;
    raw_app_meta_data?: {
        role?: string;
        provider?: string;
        providers?: string[];
    };
}

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

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
        }

        // Cast to extended user type
        const extendedUser = user as unknown as ExtendedUser;

        // Check current role
        const currentRole = user.app_metadata?.role || user.user_metadata?.role;
        const rawAppMetaDataRole = extendedUser.raw_app_meta_data?.role;

        // Update the user's role to admin
        const { data: updateData, error: updateError } = await supabase.auth.updateUser({
            data: { role: 'admin' }
        });

        if (updateError) {
            return NextResponse.json({ 
                error: 'Error updating user role',
                details: updateError.message
            }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Role updated successfully. Please sign out and sign back in to apply changes.',
            previousRole: {
                appMetadataRole: currentRole,
                rawAppMetaDataRole: rawAppMetaDataRole
            },
            currentUser: {
                id: user.id,
                email: user.email,
                appMetadata: user.app_metadata,
                userMetadata: user.user_metadata,
                rawAppMetaData: extendedUser.raw_app_meta_data
            },
            updatedUser: updateData.user
        });
    } catch (error) {
        console.error('Error in update-admin-role route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 