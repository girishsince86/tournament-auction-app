import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        console.log('[DEBUG API] Starting create player');
        
        const supabase = createRouteHandlerClient({ cookies });
        
        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error('[DEBUG API] Authentication error:', authError);
            return NextResponse.json({ error: 'Authentication error', details: authError }, { status: 401 });
        }
        
        if (!session) {
            console.error('[DEBUG API] No session found');
            return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
        }
        
        console.log('[DEBUG API] User authenticated:', session.user.id);

        // Parse request body
        const body = await request.json();
        const { 
            tournamentId, 
            categoryId, 
            name, 
            skillLevel, 
            playerPosition, 
            basePrice, 
            status 
        } = body;
        
        console.log('[DEBUG API] Creating player with data:', {
            tournamentId,
            categoryId,
            name,
            skillLevel,
            playerPosition,
            basePrice,
            status
        });
        
        // Validate required fields
        if (!tournamentId || !name || !status) {
            console.error('[DEBUG API] Missing required fields');
            return NextResponse.json({ 
                error: 'Missing required fields', 
                details: 'tournamentId, name, and status are required' 
            }, { status: 400 });
        }
        
        // Create player
        const { data: player, error: playerError } = await supabase
            .from('players')
            .insert({
                tournament_id: tournamentId,
                category_id: categoryId,
                name,
                skill_level: skillLevel,
                player_position: playerPosition,
                base_price: basePrice,
                status
            })
            .select()
            .single();
            
        if (playerError) {
            console.error('[DEBUG API] Error creating player:', playerError);
            return NextResponse.json({ error: 'Failed to create player', details: playerError }, { status: 500 });
        }
        
        console.log('[DEBUG API] Player created successfully:', player);
        
        return NextResponse.json({ 
            message: 'Player created successfully', 
            player 
        });
    } catch (error) {
        console.error('[DEBUG API] Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', details: error },
            { status: 500 }
        );
    }
} 