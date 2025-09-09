import { expect, test } from '@playwright/test';

test.describe('Search Page Flickering Investigation', () => {
  test('should investigate flickering behavior when searching on search page', async ({ page }) => {
    // Enable console logging to catch any errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });

    // Enable request/response logging to see network activity
    page.on('request', request => {
      console.log('Request:', request.method(), request.url());
    });

    page.on('response', response => {
      console.log('Response:', response.status(), response.url());
    });

    // Navigate to homepage (server should already be running)
    await page.goto('http://localhost:5174');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });

    // Perform initial search from dashboard to get to search page
    console.log('Step 1: Searching "Peter Obi" from dashboard...');
    
    // Find and fill the search input in header
    const headerSearchInput = page.locator('input[placeholder*="Search politicians"]').first();
    await headerSearchInput.fill('Peter Obi');
    await headerSearchInput.press('Enter');
    
    // Wait for navigation to search page
    await page.waitForURL('**/search?q=Peter%20Obi');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of search results page
    await page.screenshot({ path: 'test-results/02-search-peter-obi.png', fullPage: true });
    
    console.log('Step 2: Now searching "APC" from search page...');
    
    // Record the flickering behavior
    const startTime = Date.now();
    
    // Clear and type new search term
    await headerSearchInput.fill('');
    await headerSearchInput.fill('APC');
    
    // Take screenshot right before submitting
    await page.screenshot({ path: 'test-results/03-before-apc-search.png', fullPage: true });
    
    // Submit the search and monitor for flickering
    await headerSearchInput.press('Enter');
    
    // Take screenshots at intervals to capture flickering
    setTimeout(async () => {
      await page.screenshot({ path: 'test-results/04-apc-search-100ms.png', fullPage: true });
    }, 100);
    
    setTimeout(async () => {
      await page.screenshot({ path: 'test-results/05-apc-search-500ms.png', fullPage: true });
    }, 500);
    
    setTimeout(async () => {
      await page.screenshot({ path: 'test-results/06-apc-search-1000ms.png', fullPage: true });
    }, 1000);
    
    setTimeout(async () => {
      await page.screenshot({ path: 'test-results/07-apc-search-2000ms.png', fullPage: true });
    }, 2000);
    
    // Wait for the URL to update
    await page.waitForURL('**/search?q=APC', { timeout: 5000 });
    
    // Wait for network to settle
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`Total time for search update: ${totalTime}ms`);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/08-apc-search-final.png', fullPage: true });
    
    // Check if the results actually updated
    const searchTitle = page.locator('h1');
    await expect(searchTitle).toContainText('Search Results for "APC"');
    
    // Check for any loading states that might be causing flickering
    const loadingElements = page.locator('[class*="animate-pulse"], [class*="loading"], .spinner');
    const loadingCount = await loadingElements.count();
    console.log(`Found ${loadingCount} loading elements`);
    
    // Check for any error states
    const errorElements = page.locator('[class*="error"], .error-message');
    const errorCount = await errorElements.count();
    console.log(`Found ${errorCount} error elements`);
    
    // Verify the search input shows the correct value
    const headerInputValue = await headerSearchInput.inputValue();
    console.log(`Header search input value: "${headerInputValue}"`);
    expect(headerInputValue).toBe('APC');
    
    // Check if results are actually showing APC-related politicians
    const politicianCards = page.locator('[data-testid="politician-card"], .politician-card, [class*="politician"]');
    const cardCount = await politicianCards.count();
    console.log(`Found ${cardCount} politician cards`);
    
    if (cardCount > 0) {
      const firstCardText = await politicianCards.first().textContent();
      console.log(`First politician card text: ${firstCardText}`);
    }
  });

  test('should test rapid search changes to identify flickering cause', async ({ page }) => {
    // Navigate to search page with initial query
    await page.goto('http://localhost:5174/search?q=Peter');
    await page.waitForLoadState('networkidle');
    
    const headerSearchInput = page.locator('input[placeholder*="Search politicians"]').first();
    
    // Perform rapid search changes to trigger flickering
    const searches = ['APC', 'PDP', 'Lagos', 'Governor'];
    
    for (let i = 0; i < searches.length; i++) {
      const searchTerm = searches[i];
      console.log(`Rapid search ${i + 1}: ${searchTerm}`);
      
      await headerSearchInput.fill(searchTerm);
      await headerSearchInput.press('Enter');
      
      // Take screenshot immediately after search
      await page.screenshot({ 
        path: `test-results/rapid-search-${i + 1}-${searchTerm}.png`, 
        fullPage: true 
      });
      
      // Wait a bit before next search
      await page.waitForTimeout(1000);
    }
  });

  test('should monitor React state changes and re-renders', async ({ page }) => {
    // Add React DevTools detection script
    await page.addInitScript(() => {
      // Monitor React re-renders
      let renderCount = 0;
      const originalRender = window.React?.createElement;
      if (originalRender) {
        window.React.createElement = function(...args) {
          renderCount++;
          if (renderCount % 10 === 0) {
            console.log(`React renders: ${renderCount}`);
          }
          return originalRender.apply(this, args);
        };
      }
    });

    await page.goto('http://localhost:5174/search?q=Peter');
    await page.waitForLoadState('networkidle');
    
    const headerSearchInput = page.locator('input[placeholder*="Search politicians"]').first();
    
    // Monitor console for render information
    page.on('console', msg => {
      if (msg.text().includes('React renders')) {
        console.log('Render activity:', msg.text());
      }
    });
    
    // Perform search that causes flickering
    await headerSearchInput.fill('APC');
    await headerSearchInput.press('Enter');
    
    await page.waitForTimeout(3000); // Wait for flickering to settle
    
    await page.screenshot({ path: 'test-results/render-monitoring.png', fullPage: true });
  });
});