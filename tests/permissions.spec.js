const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const PermissionsPage = require('../pages/PermissionsPage');
const ExcelDataDriver = require('../utils/excelDataDriver');

test.describe('ORDISS Permissions Tests', () => {
  let loginPage;
  let permissionsPage;
  let excelDriver;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    permissionsPage = new PermissionsPage(page);
    excelDriver = new ExcelDataDriver();

    // Login before each test
    await loginPage.navigateToLogin('https://10.10.10.10:700');
    await loginPage.login('main.superadmin', 'Ordiss@SA');

    // Navigate to Permissions page
    await permissionsPage.navigateToPermissions('https://10.10.10.10:700');
  });

  test('should load Permissions page @smoke', async ({ page }) => {
    // Verify page loaded
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/permissions');

    // Take screenshot
    await permissionsPage.capturePageState('page-loaded');

    console.log('✅ Permissions page loaded successfully');
  });

  test('should test search functionality @functional', async ({ page }) => {
    // Test search
    await permissionsPage.search('Test');

    // Wait for results
    await page.waitForTimeout(2000);

    // Take screenshot
    await permissionsPage.capturePageState('search-results');

    console.log('✅ Search functionality tested');
  });

  test('should create permission with Excel data @data-driven', async ({
    page,
  }) => {
    // Get test data from Excel
    const permissionsData = await excelDriver.readExcelData('permissions');
    const testData = permissionsData[0] || {
      name: 'Test Permission',
      code: 'TEST_PERM',
    };

    console.log(`📋 Test data: ${JSON.stringify(testData)}`);

    // Click create button
    await permissionsPage.clickCreate();

    // Wait for form
    await page.waitForTimeout(3000);

    // Take screenshot of form
    await permissionsPage.capturePageState('create-form');

    // Add your recorded actions here for form filling

    console.log('✅ Permission creation test completed');
  });

  test('should perform recorded actions @recorded', async ({ page }) => {
    // This test is ready for your recorded actions
    // Use: npx playwright codegen https://10.10.10.10:700/login

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');

    // Add your recorded actions here

    // Take final screenshot
    await permissionsPage.capturePageState('recorded-actions-complete');

    console.log('✅ Recorded actions placeholder ready');
  });
});
