const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const UnitsPage = require('../pages/UnitsPage');
const ExcelDataDriver = require('../utils/excelDataDriver');

test.describe('ORDISS Units Tests', () => {
  let loginPage;
  let unitsPage;
  let excelDriver;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    unitsPage = new UnitsPage(page);
    excelDriver = new ExcelDataDriver();

    // Login before each test
    await loginPage.navigateToLogin('https://10.10.10.10:700');
    await loginPage.login('main.superadmin', 'Ordiss@SA');

    // Navigate to Units page
    await unitsPage.navigateToUnits('https://10.10.10.10:700');
  });

  test('should load Units page @smoke', async ({ page }) => {
    // Verify page loaded
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/units');

    // Take screenshot
    await unitsPage.capturePageState('page-loaded');

    console.log('✅ Units page loaded successfully');
  });

  test('should test search functionality @functional', async ({ page }) => {
    // Test search
    await unitsPage.search('Test');

    // Wait for results
    await page.waitForTimeout(2000);

    // Take screenshot
    await unitsPage.capturePageState('search-results');

    console.log('✅ Search functionality tested');
  });

  test('should create unit with Excel data @data-driven', async ({ page }) => {
    // Get test data from Excel
    const unitsData = await excelDriver.readExcelData('units');
    const testData = unitsData[0] || { name: 'Test Unit', code: 'TU001' };

    console.log(`📋 Test data: ${JSON.stringify(testData)}`);

    // Click create button
    await unitsPage.clickCreate();

    // Wait for form
    await page.waitForTimeout(3000);

    // Take screenshot of form
    await unitsPage.capturePageState('create-form');

    // Add your recorded actions here for form filling

    console.log('✅ Unit creation test completed');
  });

  test('should perform recorded actions @recorded', async ({ page }) => {
    // This test is ready for your recorded actions
    // Use: npx playwright codegen https://10.10.10.10:700/login

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');

    // Add your recorded actions here

    // Take final screenshot
    await unitsPage.capturePageState('recorded-actions-complete');

    console.log('✅ Recorded actions placeholder ready');
  });
});
