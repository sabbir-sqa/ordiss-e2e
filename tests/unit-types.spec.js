const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const UnitTypesPage = require('../pages/UnitTypesPage');
const ExcelHelper = require('../utils/excelHelper');
const TestExecutionHelper = require('../utils/testExecutionHelper');

test.describe('ORDISS Unit Types Tests', () => {
  let loginPage;
  let unitTypesPage;
  let excelHelper;
  let executionHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    unitTypesPage = new UnitTypesPage(page);
    excelHelper = new ExcelHelper();
    executionHelper = new TestExecutionHelper();

    // Login before each test
    await loginPage.navigateToLogin('https://10.10.10.10:700');
    await loginPage.login('main.superadmin', 'Ordiss@SA');

    // Navigate to Unit Types page
    await unitTypesPage.navigateToUnitTypes('https://10.10.10.10:700');
  });

  test('should load Unit Types page @smoke', async ({ page }) => {
    // Verify page loaded
    const currentUrl = await page.url();
    expect(currentUrl).toContain('/unit-types');

    // Take screenshot
    await unitTypesPage.capturePageState('page-loaded');

    console.log('✅ Unit Types page loaded successfully');
  });

  test('should test search functionality @functional', async ({ page }) => {
    // Test search
    await unitTypesPage.searchUnitTypes('Test');

    // Wait for results
    await page.waitForTimeout(2000);

    // Take screenshot
    await unitTypesPage.capturePageState('search-results');

    console.log('✅ Search functionality tested');
  });

  test('should create unit type with Excel data @data-driven', async ({
    page,
  }) => {
    // Print guidance for first-time execution
    executionHelper.printGuidance('unit-types');

    // Read data from Excel
    const unitTypesData = await excelHelper.readExcel('unit-types');

    if (unitTypesData.length === 0) {
      console.log(
        '⚠️  No Excel data found. Using sample data for demonstration.'
      );
      console.log('💡 Place your unit-types.xlsx file in test-data/ folder');

      // Create sample Excel file
      await excelHelper.createSampleUnitTypeExcel('unit-types.xlsx');
      console.log('✅ Created sample unit-types.xlsx file');

      // Skip test
      test.skip();
      return;
    }

    // Get first row of data
    let testData = unitTypesData[0];
    console.log(`📋 Original data: ${JSON.stringify(testData, null, 2)}`);

    // Prepare data with unique names
    testData = await executionHelper.prepareFirstTimeData(
      'unit-types',
      testData
    );
    console.log(`📋 Prepared data: ${JSON.stringify(testData, null, 2)}`);

    // Click create button
    await unitTypesPage.clickCreateUnitType();

    // Wait for form
    await page.waitForTimeout(3000);

    // Take screenshot of form
    await unitTypesPage.capturePageState('create-form');

    console.log('📝 Form loaded. Ready for data entry.');
    console.log('💡 Add your recorded actions here to fill the form with:');
    console.log(JSON.stringify(testData, null, 2));

    // TODO: Add your recorded actions here to fill the form
    // Example:
    // await page.fill('input[name="nameEnglish"]', testData['Name (English)']);
    // await page.fill('input[name="nameBangla"]', testData['Name (Bangla)']);
    // await page.fill('input[name="shortNameEnglish"]', testData['Short Name (English)']);
    // await page.fill('input[name="shortNameBangla"]', testData['Short Name (Bangla)']);
    // await page.selectOption('select[name="category"]', testData['Category']);
    // await page.selectOption('select[name="service"]', testData['Service']);
    // await page.selectOption('select[name="type"]', testData['Type']);
    // await page.click('button:has-text("Save")');

    // After successful creation, save data to Excel
    // await executionHelper.saveExecutionData('unit-types', testData, true);

    console.log('✅ Unit type creation test completed');
  });

  test('should perform recorded actions @recorded', async ({ page }) => {
    // This test is ready for your recorded actions
    // Use: npx playwright codegen https://10.10.10.10:700/login --ignore-https-errors

    console.log('🎬 Starting recorded actions test');

    // Read data from Excel for the test
    const unitTypesData = await excelHelper.readExcel('unit-types');

    if (unitTypesData.length > 0) {
      const testData = unitTypesData[0];
      console.log(`📋 Using data: ${testData['Name (English)']}`);

      // Prepare unique data
      const preparedData = await executionHelper.prepareFirstTimeData(
        'unit-types',
        testData
      );

      // Wait for page to be ready
      await page.waitForLoadState('networkidle');

      // TODO: Add your recorded actions here
      // Use the preparedData object for form filling

      console.log('💡 Add your recorded actions here');
      console.log('📋 Available data:', JSON.stringify(preparedData, null, 2));
    } else {
      console.log('⚠️  No Excel data found');
      console.log('💡 Place your unit-types.xlsx file in test-data/ folder');
    }

    // Take final screenshot
    await unitTypesPage.capturePageState('recorded-actions-complete');

    console.log('✅ Recorded actions placeholder ready');
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Log test result
    if (testInfo.status === 'passed') {
      console.log(`✅ Test passed: ${testInfo.title}`);
    } else if (testInfo.status === 'failed') {
      console.log(`❌ Test failed: ${testInfo.title}`);
      await unitTypesPage.capturePageState(
        `failed-${testInfo.title.replace(/\s+/g, '-')}`
      );
    }
  });
});
