import { test, expect } from '@playwright/test';

test.describe('Agent Arena Dashboard', () => {
  test('should display the leaderboard and render the top agent with VERA badge', async ({
    page,
  }) => {
    // Intercept API calls to mock backend response from our Specmatic contract
    await page.route('**/api/leaderboard', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'agent_0x123', volume: 15.5, hasVeraBadge: true },
          { id: 'agent_0x456', volume: 10.0, hasVeraBadge: false },
        ]),
      });
    });

    await page.goto('/');

    // Verify the page title
    await expect(page).toHaveTitle(/Cyberpunk War Room/);

    // Verify the first agent is rendered with the correct volume
    const topAgent = page.locator('[data-testid="agent-row-agent_0x123"]');
    await expect(topAgent).toBeVisible();
    await expect(topAgent).toContainText('15.5');

    // Verify VERA hardware badge is present for the top agent
    const veraBadge = topAgent.locator('[data-testid="vera-badge"]');
    await expect(veraBadge).toBeVisible();
  });
});
