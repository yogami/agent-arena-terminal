import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for running E2E tests against the live production URL.
 * Used by the post-production CI pipeline.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL || 'https://agent-arena-terminal-production.up.railway.app',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer block — we test against the live production deployment
});
