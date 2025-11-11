const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const PermissionGroupsPage = require('../pages/PermissionGroupsPage');
const ExcelDataDriver = require('../utils/excelDataDriver');

test.describe('ORDISS Permission Groups Tests', () => {
  let loginPage;
  let permissionGroupsPage;
  let excelDriver;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    permissionGroupsPage = new PermissionGroupsPage(page);
    excelDriver = new ExcelDataDriver();

    // Login before each test
    await loginPage.navigateToLogin('https://10.10.10.10:700');
    await loginPage.login('main.superadmin', 'Ordiss@SA');

    // Navigate to Permission Groups page
    await permissionGroupsPage.navigateToPermissionGroups(
      'https://10.10.10.10:700'
    );
  });

  test('should load Permission Groups page @smoke', async ({ page }) => {
    // Verify page loaded
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/permission-groups');

    // Take screenshot
    await permissionGroupsPage.capturePageState('page-loaded');

    console.log('✅ Permission Groups page loaded successfully');
  });

  test('should test search functionality @functional', async ({ page }) => {
    // Test search
    await permissionGroupsPage.search('Test');

    // Wait for results
    await page.waitForTimeout(2000);

    // Take screenshot
    await permissionGroupsPage.capturePageState('search-results');

    console.log('✅ Search functionality tested');
  });

  test('should create permission group with Excel data @data-driven', async ({
    page,
  }) => {
    // Get test data from Excel
    const permissionGroupsData = await excelDriver.readExcelData(
      'permission-groups'
    );
    const testData = permissionGroupsData[0] || {
      name: 'Test Group',
      description: 'Test Description',
    };

    console.log(`📋 Test data: ${JSON.stringify(testData)}`);

    // Click create button
    await permissionGroupsPage.clickCreate();

    // Wait for form
    await page.waitForTimeout(3000);

    // Take screenshot of form
    await permissionGroupsPage.capturePageState('create-form');

    // Add your recorded actions here for form filling

    console.log('✅ Permission group creation test completed');
  });

  test('should perform recorded actions @recorded', async ({ page }) => {
    // This test is ready for your recorded actions
    // Use: npx playwright codegen https://10.10.10.10:700/login

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');

    // Add your recorded actions here

    // Take final screenshot
    await permissionGroupsPage.capturePageState('recorded-actions-complete');

    console.log('✅ Recorded actions placeholder ready');
  });
});
