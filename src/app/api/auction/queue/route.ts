import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

interface User {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
    app_metadata?: Record<string, any>;
    raw_app_meta_data?: {
        role?: string;
        provider?: string;
        providers?: string[];
    };
}

interface SessionUser extends User {
    aud: string;
    role?: string;
}

interface Player {
    id: string;
    name: string;
    base_price: number;
    skill_level: string;
    status: string;
    current_team_id: string | null;
    player_position: string;
    height: number | null;
    experience: number | null;
    category_id: string;
    profile_image_url?: string;
}

interface QueueItem {
    id: string;
    tournament_id: string;
    player_id: string;
    queue_position: number;
    is_processed: boolean;
    created_at: string;
    updated_at: string;
    players: Player;
}

interface RawQueueItem {
    id: string;
    tournament_id: string;
    player_id: string;
    queue_position: number;
    is_processed: boolean;
    created_at: string;
    updated_at: string;
    players: {
        id: string;
        name: string;
        base_price: number;
        skill_level: string;
        status: string;
        current_team_id: string | null;
        player_position: string;
        height: number | null;
        experience: number | null;
        category_id: string;
        profile_image_url?: string;
    };
}

interface QueueItemResponse {
    id: string;
    tournament_id: string;
    player_id: string;
    queue_position: number;
    is_processed: boolean;
    players: Player;
}

interface FormattedQueueItem {
    id: string;
    playerId: string;
    tournamentId: string;
    position: number;
    isProcessed: boolean;
    player: {
        id: string;
        name: string;
        basePrice: number;
        skillLevel: string;
        status: string;
        profile_image_url?: string;
    };
}

// Get queue items for a tournament
export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const searchParams = request.nextUrl.searchParams;
        const tournamentId = searchParams.get('tournamentId');
        const includeProcessed = searchParams.get('includeProcessed') === 'true';

        if (!tournamentId) {
            return NextResponse.json(
                { error: 'Tournament ID is required' },
                { status: 400 }
            );
        }

        console.log('Fetching queue with params:', {
            tournamentId,
            includeProcessed
        });

        let query = supabase
            .from('auction_queue')
            .select(`
                id,
                tournament_id,
                player_id,
                is_processed,
                created_at,
                updated_at,
                players (
                    id,
                    name,
                    base_price,
                    skill_level,
                    status,
                    current_team_id,
                    player_position,
                    height,
                    experience,
                    category_id,
                    profile_image_url
                )
            `)
            .eq('tournament_id', tournamentId)
            .eq('is_processed', false)
            .not('players.status', 'eq', 'ALLOCATED')
            .order('created_at', { ascending: true });

        const { data: queueItems, error } = await query;

        if (error) {
            console.error('Error fetching queue:', {
                error,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return NextResponse.json(
                { error: 'Failed to fetch queue', details: error.message },
                { status: 500 }
            );
        }

        // Log raw queue items
        const rawQueueItems = (queueItems || []) as unknown as RawQueueItem[];
        console.log('Raw queue items:', {
            count: rawQueueItems.length,
            items: rawQueueItems.map(item => ({
                id: item.id,
                playerId: item.player_id,
                isProcessed: item.is_processed,
                playerDetails: item.players ? {
                    id: item.players.id,
                    name: item.players.name,
                    status: item.players.status,
                    current_team_id: item.players.current_team_id
                } : null
            }))
        });

        // Format response
        const formattedQueue = rawQueueItems
            .filter(item => item.players !== null)
            .map((item) => ({
                id: item.id,
                tournament_id: item.tournament_id,
                player_id: item.player_id,
                queue_position: item.queue_position,
                is_processed: item.is_processed,
                created_at: item.created_at,
                updated_at: item.updated_at,
                player: {
                    id: item.players.id,
                    name: item.players.name,
                    base_price: item.players.base_price,
                    skill_level: item.players.skill_level,
                    status: item.players.status,
                    current_team_id: item.players.current_team_id,
                    player_position: item.players.player_position,
                    height: item.players.height,
                    experience: item.players.experience,
                    category_id: item.players.category_id,
                    profile_image_url: item.players.profile_image_url
                }
            }));

        console.log('Formatted queue:', {
            count: formattedQueue.length,
            items: formattedQueue.map(item => ({
                id: item.id,
                playerId: item.player_id,
                isProcessed: item.is_processed,
                playerName: item.player.name,
                playerStatus: item.player.status
            }))
        });

        return NextResponse.json({ queue: formattedQueue });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

// Add item to queue
export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        
        console.log('Starting POST request to auction queue');

        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            console.error('Authentication error:', authError);
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const sessionUser = session.user as unknown as SessionUser;
        console.log('Session check passed:', {
            userId: sessionUser.id,
            userEmail: sessionUser.email,
            metadata: sessionUser.user_metadata,
            appMetadata: sessionUser.app_metadata,
            rawAppMetadata: sessionUser.raw_app_meta_data
        });

        // Check if user is admin
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('User fetch error:', userError);
            return NextResponse.json(
                { error: 'Failed to verify user role' },
                { status: 500 }
            );
        }

        const typedUser = user as unknown as User;
        console.log('User check:', { 
            email: typedUser.email,
            id: typedUser.id,
            raw_metadata: typedUser.raw_app_meta_data,
            app_metadata: user.app_metadata,
            user_metadata: user.user_metadata,
            full_user: JSON.stringify(user)
        });

        // Check if user has admin role in raw_app_meta_data
        const userRole = typedUser.raw_app_meta_data?.role;
        console.log('User role check:', { 
            userRole,
            raw_metadata: typedUser.raw_app_meta_data,
            hasRole: userRole === 'admin',
            roleMatch: userRole === 'admin' ? 'YES' : 'NO',
            typeofRole: typeof userRole
        });

        if (userRole !== 'admin') {
            console.error('User is not admin:', { 
                email: typedUser.email,
                role: userRole,
                raw_metadata: typedUser.raw_app_meta_data,
                roleCheck: {
                    expectedRole: 'admin',
                    actualRole: userRole,
                    comparison: `${userRole} !== 'admin'`,
                    typeofActualRole: typeof userRole
                }
            });
            return NextResponse.json(
                { error: 'Only admin users can modify the auction queue' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { tournamentId, playerId, position } = body;

        console.log('Adding player to queue:', { tournamentId, playerId, position });

        if (!tournamentId || !playerId || !position) {
            return NextResponse.json(
                { error: 'Tournament ID, player ID, and position are required' },
                { status: 400 }
            );
        }

        // Check if player is already in queue
        const { data: existingItem } = await supabase
            .from('auction_queue')
            .select('id')
            .eq('tournament_id', tournamentId)
            .eq('player_id', playerId)
            .eq('is_processed', false)
            .single();

        if (existingItem) {
            return NextResponse.json(
                { error: 'Player is already in queue' },
                { status: 400 }
            );
        }

        // Get current max position
        const { data: maxPositionData } = await supabase
            .from('auction_queue')
            .select('queue_position')
            .eq('tournament_id', tournamentId)
            .order('queue_position', { ascending: false })
            .limit(1)
            .single();

        const newPosition = maxPositionData ? maxPositionData.queue_position + 1 : 1;

        // Add new queue item
        const { data: newItem, error: insertError } = await supabase
            .from('auction_queue')
            .insert({
                tournament_id: tournamentId,
                player_id: playerId,
                queue_position: newPosition,
                is_processed: false
            })
            .select(`
                id,
                tournament_id,
                player_id,
                queue_position,
                is_processed,
                players (
                    id,
                    name,
                    base_price,
                    skill_level,
                    status,
                    player_position,
                    profile_image_url
                )
            `)
            .single();

        if (insertError) {
            console.error('Error adding queue item:', insertError);
            return NextResponse.json(
                { error: 'Failed to add queue item', details: insertError.message },
                { status: 500 }
            );
        }

        console.log('Successfully added player to queue:', newItem);
        return NextResponse.json({ queueItem: newItem });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 