import { NextRequest, NextResponse } from 'next/server';
import { checkSupabaseHealth, validateSupabaseSchema } from '@/lib/utils/supabase-health';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('Running Supabase diagnostics...');
    
    // Check Supabase connection health
    const healthCheck = await checkSupabaseHealth();
    
    // Check schema if connection is healthy
    let schemaCheck = { isValid: false, message: 'Schema check skipped due to connection issues' };
    if (healthCheck.isHealthy) {
      schemaCheck = await validateSupabaseSchema();
    }
    
    // Get environment variable status (without exposing actual values)
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    
    // Create response with diagnostic information
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabaseConnection: healthCheck,
      databaseSchema: schemaCheck,
      environmentVariables: envStatus
    };
    
    // Create response with no-cache headers
    const response = NextResponse.json(diagnosticInfo);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error in diagnostics endpoint:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Create error response with no-cache headers
    const errorResponse = NextResponse.json({
      error: 'Diagnostics failed',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
    errorResponse.headers.set('Cache-Control', 'no-store, max-age=0');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    
    return errorResponse;
  }
} 