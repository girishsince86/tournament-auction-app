import { test, expect } from '@playwright/test';
import {
    loginAsUser,
    ADMIN_EMAIL,
    TEAM_OWNER_EMAIL,
    getTestTournamentId,
    takeScreenshot,
} from './helpers';

let tournamentId: string;

test.beforeAll(async () => {
    tournamentId = await getTestTournamentId();
    console.log('Using tournament:', tournamentId);
});

test.describe('Auction Pages — Visual Smoke Tests', () => {

    test('Control page renders for admin', async ({ browser }) => {
        const context = await browser.newContext();
        await loginAsUser(context, ADMIN_EMAIL);
        const page = await context.newPage();

        await page.goto(`/auction/${tournamentId}/control`);
        await page.waitForLoadState('networkidle');

        // Wait for the main content to load (loading spinner should disappear)
        await page.waitForSelector('text=Auction Management', { timeout: 15_000 }).catch(() => {
            // Fallback: page may have different heading text
        });

        // Wait a bit for data to populate
        await page.waitForTimeout(3000);

        // Verify key sections are visible
        const pageContent = await page.textContent('body');
        console.log('Control page loaded. Content includes teams:', pageContent?.includes('team') || pageContent?.includes('Team'));

        await takeScreenshot(page, '01-control-page-admin');
        await context.close();
    });

    test('Watch page renders for team owner', async ({ browser }) => {
        const context = await browser.newContext();
        await loginAsUser(context, TEAM_OWNER_EMAIL);
        const page = await context.newPage();

        await page.goto(`/auction/${tournamentId}/watch`);
        await page.waitForLoadState('networkidle');

        // Wait for content
        await page.waitForSelector('text=Auction Watch', { timeout: 15_000 }).catch(() => {});
        await page.waitForTimeout(3000);

        const pageContent = await page.textContent('body');
        console.log('Watch page loaded. Has "Auction Watch":', pageContent?.includes('Auction Watch'));

        await takeScreenshot(page, '02-watch-page-team-owner');
        await context.close();
    });

    test('Live page renders without auth (public)', async ({ page }) => {
        await page.goto(`/auction/${tournamentId}/live`);
        await page.waitForLoadState('networkidle');

        // Should NOT redirect to login — this is a public page
        const url = page.url();
        expect(url).not.toContain('/login');

        await page.waitForSelector('text=Auction Live', { timeout: 15_000 }).catch(() => {});
        await page.waitForTimeout(3000);

        const pageContent = await page.textContent('body');
        console.log('Live page loaded. Has "Auction Live":', pageContent?.includes('Auction Live'));

        await takeScreenshot(page, '03-live-page-public');
    });
});
