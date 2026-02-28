import { type BrowserContext, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Local Supabase config (from .env.local.local)
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const TEST_PASSWORD = 'pbel2026';

export const ADMIN_EMAIL = 'gk@pbel.in';
export const TEAM_OWNER_EMAIL = 'bhupinder@pbel.in'; // First team owner from middleware list

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Log in by navigating to the login page and filling in the form.
 * This ensures cookies are set correctly by the app's own Supabase client.
 */
export async function loginAsUser(context: BrowserContext, email: string): Promise<void> {
    const page = await context.newPage();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill in the login form
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In")');

    // Wait for navigation away from login page (redirect to dashboard or other page)
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Close the page — cookies are now set on the context
    await page.close();
}

/**
 * Fetch a valid tournament ID from the local database.
 */
export async function getTestTournamentId(): Promise<string> {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();

    if (error || !data) {
        throw new Error(`No active tournament found: ${error?.message}`);
    }

    return data.id;
}

/**
 * Get the team ID for a team owner email.
 */
export async function getTeamIdForOwner(email: string): Promise<string | null> {
    // First get the auth user ID
    const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
    const user = userData?.users?.find(u => u.email === email);
    if (!user) return null;

    const { data } = await supabaseAdmin
        .from('team_owners')
        .select('team_id')
        .eq('auth_user_id', user.id)
        .limit(1)
        .maybeSingle();

    return data?.team_id ?? null;
}

/**
 * Get queue items for a tournament to check if there's data to work with.
 */
export async function getQueueInfo(tournamentId: string, sportCategory = 'VOLLEYBALL_OPEN_MEN') {
    const { data, error } = await supabaseAdmin
        .from('auction_queue')
        .select('id, player_id, queue_position, is_processed, players(name)')
        .eq('tournament_id', tournamentId)
        .eq('is_processed', false)
        .eq('sport_category', sportCategory)
        .order('queue_position', { ascending: true })
        .limit(5);

    return { items: data ?? [], error };
}

/**
 * Get teams for a tournament.
 */
export async function getTeams(tournamentId: string, sportCategory = 'VOLLEYBALL_OPEN_MEN') {
    const { data } = await supabaseAdmin
        .from('teams')
        .select('id, name, remaining_budget')
        .eq('tournament_id', tournamentId)
        .eq('sport_category', sportCategory)
        .order('name');

    return data ?? [];
}

export const SCREENSHOT_DIR = 'tests/screenshots';

export async function takeScreenshot(page: Page, name: string) {
    await page.screenshot({
        path: `${SCREENSHOT_DIR}/${name}.png`,
        fullPage: true,
    });
}
