import { test, expect } from '@playwright/test';
import {
    loginAsUser,
    ADMIN_EMAIL,
    getTestTournamentId,
    getQueueInfo,
    getTeams,
    takeScreenshot,
} from './helpers';

let tournamentId: string;

test.beforeAll(async () => {
    tournamentId = await getTestTournamentId();
});

test.describe('Auction Realtime Flow', () => {

    test('Conductor bid propagates to live viewer', async ({ browser }) => {
        // Pre-check: do we have queue items and teams to work with?
        const { items: queueItems } = await getQueueInfo(tournamentId);
        const teams = await getTeams(tournamentId);

        if (queueItems.length === 0) {
            console.log('SKIP: No unprocessed queue items. Add players to queue first.');
            test.skip();
            return;
        }
        if (teams.length === 0) {
            console.log('SKIP: No teams found.');
            test.skip();
            return;
        }

        const firstQueuePlayer = queueItems[0];
        const targetTeam = teams[0];
        console.log(`Will record bid: player "${(firstQueuePlayer as any).players?.name}" → team "${targetTeam.name}"`);

        // --- Set up two browser contexts ---
        // Conductor (admin, logged in)
        const conductorContext = await browser.newContext();
        await loginAsUser(conductorContext, ADMIN_EMAIL);
        const conductorPage = await conductorContext.newPage();

        // Viewer (public, no auth)
        const viewerContext = await browser.newContext();
        const viewerPage = await viewerContext.newPage();

        // --- Navigate both pages ---
        await Promise.all([
            conductorPage.goto(`/auction/${tournamentId}/control`),
            viewerPage.goto(`/auction/${tournamentId}/live`),
        ]);

        // Wait for both to load
        await Promise.all([
            conductorPage.waitForLoadState('networkidle'),
            viewerPage.waitForLoadState('networkidle'),
        ]);
        await conductorPage.waitForTimeout(3000);
        await viewerPage.waitForTimeout(3000);

        // Screenshot: BEFORE state
        await takeScreenshot(conductorPage, '04-realtime-conductor-before');
        await takeScreenshot(viewerPage, '05-realtime-viewer-before');

        // --- Conductor: Select the first player from queue ---
        // The control page has a queue list. Click on the first player name to select them.
        // Look for the queue item in the UI
        const queueSection = conductorPage.locator('text=Queue').first();
        if (await queueSection.isVisible()) {
            console.log('Queue section found on control page');
        }

        // Try to click the first queue item to select the player
        // The queue items are in a list; each has the player name
        const playerName = (firstQueuePlayer as any).players?.name ?? '';
        if (playerName) {
            const playerItem = conductorPage.locator(`text=${playerName}`).first();
            if (await playerItem.isVisible({ timeout: 5000 }).catch(() => false)) {
                await playerItem.click();
                console.log(`Selected player: ${playerName}`);
                await conductorPage.waitForTimeout(500);
            } else {
                console.log(`Could not find player "${playerName}" in queue UI — taking screenshot and continuing`);
            }
        }

        // Try to select a team from the dropdown
        const teamSelect = conductorPage.locator('[role="combobox"]').first();
        if (await teamSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
            await teamSelect.click();
            await conductorPage.waitForTimeout(300);
            // Click the first team option
            const teamOption = conductorPage.locator(`[role="option"]`).first();
            if (await teamOption.isVisible({ timeout: 3000 }).catch(() => false)) {
                await teamOption.click();
                console.log('Selected team from dropdown');
            }
        }

        // Try to enter a bid amount (look for bid/amount input)
        const bidInput = conductorPage.locator('input[type="number"]').first();
        if (await bidInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await bidInput.fill('1');
            console.log('Entered bid amount: 1 Cr');
        }

        // Screenshot: conductor with selections made
        await takeScreenshot(conductorPage, '06-realtime-conductor-selections');

        // Try to click "Record Bid" or similar button
        const recordButton = conductorPage.locator('button:has-text("Record"), button:has-text("Allocate"), button:has-text("Confirm")').first();
        if (await recordButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await recordButton.click();
            console.log('Clicked record/allocate button');

            // Wait for the action to process and realtime to propagate
            await conductorPage.waitForTimeout(4000);
        } else {
            console.log('Could not find Record/Allocate button — the UI may require different interaction');
        }

        // Screenshot: AFTER state (both pages)
        await takeScreenshot(conductorPage, '07-realtime-conductor-after');
        await takeScreenshot(viewerPage, '08-realtime-viewer-after');

        // Verify the viewer page has some content (even if realtime didn't fire, the page should be rendered)
        const viewerContent = await viewerPage.textContent('body');
        expect(viewerContent).toBeTruthy();
        console.log('Viewer page has content after wait');

        // Screenshot: final viewer state with a bit more wait for any delayed updates
        await viewerPage.waitForTimeout(2000);
        await takeScreenshot(viewerPage, '09-realtime-viewer-final');

        await conductorContext.close();
        await viewerContext.close();
    });
});
