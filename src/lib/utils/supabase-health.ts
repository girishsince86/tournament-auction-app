import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types/supabase';

/**
 * Checks the health of the Supabase connection
 * @returns {Promise<{ isHealthy: boolean; message: string; details?: any }>} Health status
 */
export async function checkSupabaseHealth(): Promise<{ 
  isHealthy: boolean; 
  message: string; 
  details?: any 
}> {
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check if environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        isHealthy: false,
        message: 'Missing Supabase environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey
        }
      };
    }
    
    // Create a client
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    
    // Try a simple query to check connection
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('player_categories')
      .select('count')
      .limit(1)
      .single();
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        isHealthy: false,
        message: `Database connection error: ${error.message}`,
        details: {
          error,
          responseTime
        }
      };
    }
    
    return {
      isHealthy: true,
      message: 'Supabase connection is healthy',
      details: {
        responseTime,
        data
      }
    };
  } catch (error) {
    return {
      isHealthy: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    };
  }
}

/**
 * Checks if the required Supabase tables exist
 * @returns {Promise<{ isValid: boolean; message: string; missingTables?: string[] }>} Schema validation result
 */
export async function validateSupabaseSchema(): Promise<{
  isValid: boolean;
  message: string;
  missingTables?: string[];
}> {
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check if environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        isValid: false,
        message: 'Missing Supabase environment variables'
      };
    }
    
    // Create a client
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    
    // List of required tables
    const requiredTables = [
      'players',
      'player_categories',
      'tournament_registrations',
      'teams'
    ];
    
    // Check each table
    const missingTables: string[] = [];
    
    for (const table of requiredTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        // If error code indicates table doesn't exist
        if (error.code === '42P01') {
          missingTables.push(table);
        }
      }
    }
    
    if (missingTables.length > 0) {
      return {
        isValid: false,
        message: `Missing required tables: ${missingTables.join(', ')}`,
        missingTables
      };
    }
    
    return {
      isValid: true,
      message: 'Database schema validation passed'
    };
  } catch (error) {
    return {
      isValid: false,
      message: `Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 