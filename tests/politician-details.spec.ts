import { expect, test } from '@playwright/test';

test.describe('Politician Details Page', () => {
  test('should load politician details page without errors', async ({ page }) => {
    // Enable console logging to catch any errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });

    // Enable page error logging
    page.on('pageerror', error => {
      console.log('Page Error:', error.message);
    });

    // Navigate to homepage first
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');

    // Navigate to search page
    await page.goto('http://localhost:5174/search');
    await page.waitForLoadState('networkidle');

    // Find and click on a politician card (assuming there are politicians in the mock data)
    const politicianCard = page.locator('[data-testid="politician-card"]').first();
    await expect(politicianCard).toBeVisible();
    
    // Click on the politician card to go to details page
    await politicianCard.click();
    
    // Wait for navigation to politician details page
    await page.waitForLoadState('networkidle');
    
    // Check that we're on a politician details page
    await expect(page).toHaveURL(/\/politician\//);
    
    // Check for any error messages on the page
    const errorElements = page.locator('[class*="error"], .error-message');
    await expect(errorElements).toHaveCount(0);
    
    // Check that the page title is set correctly
    const title = await page.title();
    expect(title).toContain('Insights Intelligence');
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/politician-details.png', fullPage: true });
  });
});