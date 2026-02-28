import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 60_000,
    expect: { timeout: 10_000 },
    fullyParallel: false, // Run sequentially — realtime test depends on DB state
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:3000',
        screenshot: 'off', // We take manual screenshots
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
});
