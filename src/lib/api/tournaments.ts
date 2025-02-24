import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getCurrentTournament() {
    const supabase = createServerSupabaseClient();
    
    if (!supabase) {
        throw new Error('Database client not available');
    }

    const { data: tournament, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching current tournament:', error);
        throw new Error('Failed to fetch current tournament');
    }

    return tournament;
} 