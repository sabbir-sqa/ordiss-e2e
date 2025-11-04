const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const UnitTypesPage = require('../pages/UnitTypesPage');

test.describe('ORDISS Navigation Tests', () => {
  let loginPage;
  let unitTypesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    unitTypesPage = new UnitTypesPage(page);

    // Login before each test
    await loginPage.navigateToLogin('https://10.10.10.10:700');
    await loginPage.login('main.superadmin', 'Ordiss@SA');
  });

  test('should navigate to Unit Types page @smoke', async ({ page }) => {
    // Verify we're on Unit Types page after login
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/administration/unit-types');

    // Wait for page to load
    await unitTypesPage.waitForUnitTypesPageLoad();

    // Take screenshot
    await unitTypesPage.takeScreenshot('unit-types-page');

    console.log('✅ Unit Types page loaded successfully');
  });

  test('should explore available navigation options @exploration', async ({
    page,
  }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot for manual inspection
    await page.screenshot({
      path: 'test-results/navigation-exploration.png',
      fullPage: true,
    });

    // Log available navigation elements
    const navElements = await page.locator('nav, .nav, .menu, .sidebar').all();
    console.log(`Found ${navElements.length} navigation elements`);

    // Log available links
    const links = await page.locator('a').all();
    console.log(`Found ${links.length} links on the page`);

    // Log first few links for inspection
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const link = links[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      if (text && text.trim() && href) {
        console.log(`Link ${i + 1}: "${text.trim()}" -> ${href}`);
      }
    }

    console.log('✅ Navigation exploration completed');
  });

  test('should test search functionality @functional', async ({ page }) => {
    // Wait for page to load
    await unitTypesPage.waitForUnitTypesPageLoad();

    // Test search functionality
    await unitTypesPage.searchUnitTypes('Test');

    // Wait for search results
    await page.waitForTimeout(2000);

    // Take screenshot of search results
    await unitTypesPage.takeScreenshot('search-results');

    console.log('✅ Search functionality tested');
  });

  // Placeholder test for recorded actions
  test('should perform recorded actions @recorded', async ({ page }) => {
    // This test is ready for you to add recorded actions using:
    // npx playwright codegen https://10.10.10.10:700/login

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Add your recorded actions here
    // Example:
    // await page.click('button:has-text("Create Unit Type")');
    // await page.fill('input[placeholder="Name"]', 'Test Unit');
    // await page.click('button:has-text("Save")');

    // Take screenshot of final state
    await page.screenshot({
      path: 'test-results/recorded-actions-result.png',
      fullPage: true,
    });

    console.log('✅ Recorded actions placeholder - ready for your recordings');
  });
});
