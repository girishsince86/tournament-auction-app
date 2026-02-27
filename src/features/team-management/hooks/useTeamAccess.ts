import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface UseTeamAccessReturn {
    isLoading: boolean;
    isAuthorized: boolean;
    error: string | null;
}

// Helper function to check if a user is a full admin
const isFullAdmin = (email?: string): boolean => {
    // Define known admin emails (these will have full admin access)
    const adminEmails = [
        'gk@pbel.in', // Super admin
        'admin@pbel.in',  // Admin
        'amit@pbel.in',   // Admin
        'vasu@pbel.in'    // Admin
    ]; // Add all admin emails here
    return email ? adminEmails.includes(email) : false;
}

// Define explicit list of team owner emails
const teamOwnerEmails = [
    'bhupinder@pbel.in',
    'jawid@pbel.in',
    'surya@pbel.in',
    'romesh@pbel.in',
    'shiva@pbel.in',
    'shubhamitra@pbel.in',
    'vikram@pbel.in',
    'rajendra@pbel.in',
    'prateek@pbel.in',
    'naveen@pbel.in',
];

// Helper function to check if a user is a team owner
const isTeamOwner = (email?: string): boolean => {
    return email ? teamOwnerEmails.includes(email) : false;
}

export function useTeamAccess(teamId: string): UseTeamAccessReturn {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        async function checkAccess() {
            try {
                // Get current session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw new Error('Authentication error');
                if (!session) {
                    router.push('/auth/login');
                    return;
                }

                // Check if user is admin using the explicit admin list
                const userEmail = session.user.email;
                if (isFullAdmin(userEmail)) {
                    setIsAuthorized(true);
                    setIsLoading(false);
                    return;
                }

                // Check if user is a team owner using the explicit team owner list
                if (isTeamOwner(userEmail)) {
                    // Check team ownership
                    const { data: teamOwners, error: teamError } = await supabase
                        .from('teams')
                        .select(`
                            id,
                            team_owners (
                                auth_user_id,
                                email
                            )
                        `)
                        .eq('id', teamId)
                        .single();

                    if (teamError) throw new Error('Error fetching team data');
                    if (!teamOwners) throw new Error('Team not found');

                    const isOwnerOfThisTeam = teamOwners.team_owners.some(
                        (owner: { auth_user_id: string; email: string }) =>
                            owner.auth_user_id === session.user.id ||
                            owner.email === session.user.email
                    );

                    if (!isOwnerOfThisTeam) {
                        throw new Error('You do not have permission to access this team\'s data');
                    }

                    setIsAuthorized(true);
                } else {
                    throw new Error('You do not have permission to access team management');
                }

            } catch (error) {
                console.error('Access check error:', error);
                setError(error instanceof Error ? error.message : 'Access check failed');
                setIsAuthorized(false);
            } finally {
                setIsLoading(false);
            }
        }

        checkAccess();
    }, [teamId, router, supabase]);

    return {
        isLoading,
        isAuthorized,
        error
    };
} 