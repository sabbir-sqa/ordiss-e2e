const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const OrganogramPage = require('../pages/OrganogramPage');
const ExcelDataDriver = require('../utils/excelDataDriver');

test.describe('ORDISS Organogram Tests', () => {
  let loginPage;
  let organogramPage;
  let excelDriver;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    organogramPage = new OrganogramPage(page);
    excelDriver = new ExcelDataDriver();

    // Login before each test
    await loginPage.navigateToLogin('https://10.10.10.10:700');
    await loginPage.login('main.superadmin', 'Ordiss@SA');

    // Navigate to Organogram page
    await organogramPage.navigateToOrganogram('https://10.10.10.10:700');
  });

  test('should load Organogram page @smoke', async ({ page }) => {
    // Verify page loaded
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/organogram');

    // Take screenshot
    await organogramPage.capturePageState('page-loaded');

    console.log('✅ Organogram page loaded successfully');
  });

  test('should test search functionality @functional', async ({ page }) => {
    // Test search
    await organogramPage.search('Test');

    // Wait for results
    await page.waitForTimeout(2000);

    // Take screenshot
    await organogramPage.capturePageState('search-results');

    console.log('✅ Search functionality tested');
  });

  test('should create organogram item with Excel data @data-driven', async ({
    page,
  }) => {
    // Get test data from Excel
    const organogramData = await excelDriver.readExcelData('organogram');
    const testData = organogramData[0] || { name: 'Test Org', code: 'TEST001' };

    console.log(`📋 Test data: ${JSON.stringify(testData)}`);

    // Click create button
    await organogramPage.clickCreate();

    // Wait for form
    await page.waitForTimeout(3000);

    // Take screenshot of form
    await organogramPage.capturePageState('create-form');

    // Add your recorded actions here for form filling

    console.log('✅ Organogram creation test completed');
  });

  test('should perform recorded actions @recorded', async ({ page }) => {
    // This test is ready for your recorded actions
    // Use: npx playwright codegen https://10.10.10.10:700/login

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');

    // Add your recorded actions here

    // Take final screenshot
    await organogramPage.capturePageState('recorded-actions-complete');

    console.log('✅ Recorded actions placeholder ready');
  });
});
