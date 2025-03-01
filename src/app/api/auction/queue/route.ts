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
    email?: string;
    registration_data?: any;
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
        email?: string;
        registration_data?: any;
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

interface RegistrationData {
    height?: number;
    last_played_date?: string;
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

        // First, fetch the auction queue with player data
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
                    profile_image_url,
                    registration_data
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

        // For each player, fetch the corresponding tournament_registration data using player_id
        // We'll use a batch approach to get all registrations at once
        const playerIds = rawQueueItems
            .filter(item => item.players)
            .map(item => item.player_id);
        
        console.log('Fetching registration data for player IDs:', playerIds);
        
        // Get all tournament registrations that match our player IDs
        // We'll use the id field which should match the player ID
        const { data: registrationsData, error: registrationsError } = await supabase
            .from('tournament_registrations')
            .select('id, height, last_played_date, registration_category')
            .in('id', playerIds)
            .eq('is_verified', true);
            
        if (registrationsError) {
            console.error('Error fetching registration data:', registrationsError);
        }
        
        // Create a map for quick lookup
        const registrationsByPlayerId = new Map();
        if (registrationsData) {
            registrationsData.forEach(reg => {
                if (reg.id) {
                    registrationsByPlayerId.set(reg.id, reg);
                }
            });
        }
        
        console.log('Found registration data for players:', 
            Array.from(registrationsByPlayerId.keys()),
            `(${registrationsData?.length || 0} registrations for ${playerIds.length} players)`);

        // Enhance queue items with registration data
        const enhancedQueueItems = rawQueueItems.map(item => {
            if (!item.players) return item;
            
            // Look up registration data by player ID
            const registrationData = registrationsByPlayerId.get(item.player_id);
            
            if (registrationData) {
                console.log(`Registration data for ${item.players.name}:`, {
                    height: registrationData.height,
                    last_played_date: registrationData.last_played_date,
                    category: registrationData.registration_category
                });
                
                // Create an enhanced player object with the most up-to-date data
                const enhancedPlayer = {
                    ...item.players,
                    // Use registration data height if available, otherwise fall back to player data
                    height: registrationData.height || item.players.height,
                    // Update registration_data to include the last_played_date from tournament_registrations
                    registration_data: {
                        ...(typeof item.players.registration_data === 'object' ? item.players.registration_data : {}),
                        last_played_date: registrationData.last_played_date || 
                            (item.players.registration_data?.last_played_date)
                    }
                };
                
                return {
                    ...item,
                    players: enhancedPlayer
                };
            } else {
                console.log(`No registration data found for player ${item.player_id} (${item.players.name})`);
                return item;
            }
        });

        // Format response
        const formattedQueue = enhancedQueueItems
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
                    profile_image_url: item.players.profile_image_url,
                    registration_data: item.players.registration_data
                }
            }));

        console.log('Formatted queue with enhanced data:', {
            count: formattedQueue.length,
            items: formattedQueue.map(item => ({
                id: item.id,
                playerId: item.player_id,
                isProcessed: item.is_processed,
                playerName: item.player.name,
                playerStatus: item.player.status,
                playerHeight: item.player.height,
                playerLastPlayed: item.player.registration_data?.last_played_date
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

        // Define allowed emails that can modify the queue
        const allowedEmails = [
            'gk@pbel.in',
            'admin@pbel.in',
            'amit@pbel.in',
            'vasu@pbel.in',
            'conductor@pbel.in',
            'team@pbel.in',
            'auction@pbel.in'
        ];
        
        // Check if user's email is in the allowed list
        const isAllowedEmail = sessionUser.email ? allowedEmails.includes(sessionUser.email) : false;
        
        // Skip the additional user role check that was causing the permission error
        // Just use the session data we already have
        console.log('User role check:', { 
            email: sessionUser.email,
            isAllowedEmail
        });

        if (!isAllowedEmail) {
            console.error('User is not authorized:', { 
                email: sessionUser.email
            });
            return NextResponse.json(
                { error: 'Only authorized users can modify the auction queue' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { tournamentId, playerId } = body;
        // Position is now optional in the request
        const requestedPosition = body.position;

        console.log('Adding player to queue:', { tournamentId, playerId, requestedPosition });

        if (!tournamentId || !playerId) {
            return NextResponse.json(
                { error: 'Tournament ID and player ID are required' },
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

        // Implement a retry mechanism for handling concurrent additions
        let retries = 5;
        let newItem = null;
        let insertError = null;

        while (retries > 0 && !newItem) {
            // Always get the current max position to avoid conflicts
            const { data: maxPositionData } = await supabase
                .from('auction_queue')
                .select('queue_position')
                .eq('tournament_id', tournamentId)
                .order('queue_position', { ascending: false })
                .limit(1);

            // Calculate the next available position
            const currentMaxPosition = maxPositionData && maxPositionData.length > 0 
                ? maxPositionData[0].queue_position 
                : 0;
            const nextPosition = currentMaxPosition + 1;
            
            console.log('Calculated next position:', { 
                requestedPosition, 
                calculatedPosition: nextPosition,
                currentMaxPosition
            });

            // Add new queue item with the calculated position
            const result = await supabase
                .from('auction_queue')
                .insert({
                    tournament_id: tournamentId,
                    player_id: playerId,
                    queue_position: nextPosition,
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

            if (result.error) {
                insertError = result.error;
                // If it's a unique constraint violation, retry
                if (result.error.code === '23505' && result.error.message.includes('auction_queue_tournament_id_queue_position_key')) {
                    console.log(`Position conflict detected, retrying (${retries} attempts left)`);
                    retries--;
                    // Add a larger delay before retrying to reduce contention
                    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)); // Random delay between 200-500ms
                } else {
                    // For other errors, break out of the loop
                    break;
                }
            } else {
                newItem = result.data;
                break;
            }
        }

        if (!newItem) {
            console.error('Error adding queue item:', insertError);
            return NextResponse.json(
                { error: 'Failed to add queue item', details: insertError?.message || 'Maximum retries exceeded' },
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