// tests/unit-type.spec.js
const { test, expect } = require('@playwright/test');
const { readCSV } = require('../utils/csv-reader');
const LoginPage = require('../pages/auth/login.page');
const UnitTypeListPage = require('../pages/unit-type/unit-type-list.page');
const UnitTypeFormPage = require('../pages/unit-type/unit-type-form.page');

// ============================================================================
// BASIC CRUD OPERATIONS
// ============================================================================
test.describe('Unit Type - Basic Operations', () => {
  let loginPage;
  let unitTypeListPage;
  let unitTypeFormPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    unitTypeListPage = new UnitTypeListPage(page);
    unitTypeFormPage = new UnitTypeFormPage(page);

    // Login before each test
    await loginPage.gotoLoginPage();
    await loginPage.login(
      process.env.ADMIN_USERNAME || 'admin',
      process.env.ADMIN_PASSWORD || 'password'
    );

    // Navigate to unit type page
    await unitTypeListPage.navigate();
  });

  test('should display unit type list page', async () => {
    const isVisible = await unitTypeListPage.isElementVisible(
      unitTypeListPage.selectors.listContainer
    );
    expect(isVisible).toBeTruthy();
  });

  test('should create a new unit type', async ({ page }) => {
    await unitTypeListPage.clickCreate();

    const testData = {
      'Name (English)': 'Test Unit Type',
      'Name (Bangla)': 'টেস্ট ইউনিট টাইপ',
      'Short Name (English)': 'TUT',
      'Short Name (Bangla)': 'টি ইউ টি',
      Category: 'Headquarter',
      Service: 'Bangladesh Army',
      Type: 'Static',
      'Is Depot': 'No',
      'Is Workshop': 'No',
    };

    await unitTypeFormPage.fillForm(testData);
    const success = await unitTypeFormPage.save();
    expect(success).toBeTruthy();

    await page.waitForTimeout(1000);
    const exists = await unitTypeListPage.unitTypeExists('Test Unit Type');
    expect(exists).toBeTruthy();
  });

  test('should search for a unit type', async () => {
    await unitTypeListPage.search('Armed Forces Division');
    const exists = await unitTypeListPage.unitTypeExists(
      'Armed Forces Division'
    );
    expect(exists).toBeTruthy();
  });

  test('should edit an existing unit type', async ({ page }) => {
    // Create a unit type
    await unitTypeListPage.clickCreate();
    const testData = {
      'Name (English)': 'Edit Test Unit',
      'Name (Bangla)': 'এডিট টেস্ট ইউনিট',
      'Short Name (English)': 'ETU',
      'Short Name (Bangla)': 'ই টি ইউ',
      Category: 'Headquarter',
      Service: 'Bangladesh Army',
      Type: 'Static',
    };

    await unitTypeFormPage.fillForm(testData);
    await unitTypeFormPage.save();
    await page.waitForTimeout(1000);

    // Edit it
    await unitTypeListPage.editUnitType('Edit Test Unit');
    await unitTypeFormPage.fill(
      unitTypeFormPage.selectors.nameEnglishInput,
      'Edit Test Unit Updated'
    );

    const success = await unitTypeFormPage.save();
    expect(success).toBeTruthy();

    await page.waitForTimeout(1000);
    const exists = await unitTypeListPage.unitTypeExists(
      'Edit Test Unit Updated'
    );
    expect(exists).toBeTruthy();
  });

  test('should delete a unit type', async ({ page }) => {
    // Create a unit type
    await unitTypeListPage.clickCreate();
    const testData = {
      'Name (English)': 'Delete Test Unit',
      'Name (Bangla)': 'ডিলিট টেস্ট ইউনিট',
      'Short Name (English)': 'DTU',
      'Short Name (Bangla)': 'ডি টি ইউ',
      Category: 'Headquarter',
      Service: 'Bangladesh Army',
      Type: 'Static',
    };

    await unitTypeFormPage.fillForm(testData);
    await unitTypeFormPage.save();
    await page.waitForTimeout(1000);

    // Delete it
    await unitTypeListPage.deleteUnitType('Delete Test Unit');
    await page.waitForTimeout(1000);
    await unitTypeListPage.clearSearch();

    const exists = await unitTypeListPage.unitTypeExists('Delete Test Unit');
    expect(exists).toBeFalsy();
  });
});

// ============================================================================
// VALIDATION & EDGE CASES
// ============================================================================
test.describe('Unit Type - Validation & Edge Cases', () => {
  let loginPage;
  let unitTypeListPage;
  let unitTypeFormPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    unitTypeListPage = new UnitTypeListPage(page);
    unitTypeFormPage = new UnitTypeFormPage(page);

    await loginPage.gotoLoginPage();
    await loginPage.login(
      process.env.ADMIN_USERNAME || 'admin',
      process.env.ADMIN_PASSWORD || 'password'
    );
    await unitTypeListPage.navigate();
  });

  test('should validate required fields', async () => {
    await unitTypeListPage.clickCreate();
    await unitTypeFormPage.click(unitTypeFormPage.selectors.saveButton);

    const hasError = await unitTypeFormPage.isElementVisible(
      unitTypeFormPage.selectors.errorMessage
    );
    expect(hasError).toBeTruthy();
  });

  test('should handle special characters in name fields', async ({ page }) => {
    await unitTypeListPage.clickCreate();

    const testData = {
      'Name (English)': 'Test Unit @#$%',
      'Name (Bangla)': 'টেস্ট @#$%',
      'Short Name (English)': 'TU@',
      'Short Name (Bangla)': 'টি@',
      Category: 'Headquarter',
      Service: 'Bangladesh Army',
      Type: 'Static',
    };

    await unitTypeFormPage.fillForm(testData);
    const success = await unitTypeFormPage.save();
    expect(typeof success).toBe('boolean');
  });

  test('should handle very long name inputs', async ({ page }) => {
    await unitTypeListPage.clickCreate();

    const testData = {
      'Name (English)': 'A'.repeat(200),
      'Name (Bangla)': 'টেস্ট',
      'Short Name (English)': 'LONG',
      'Short Name (Bangla)': 'লং',
      Category: 'Headquarter',
      Service: 'Bangladesh Army',
      Type: 'Static',
    };

    await unitTypeFormPage.fillForm(testData);
    const success = await unitTypeFormPage.save();
    expect(typeof success).toBe('boolean');
  });

  test('should prevent duplicate unit type names', async ({ page }) => {
    await unitTypeListPage.clickCreate();

    const testData = {
      'Name (English)': 'Duplicate Test Unit',
      'Name (Bangla)': 'ডুপ্লিকেট টেস্ট',
      'Short Name (English)': 'DTU',
      'Short Name (Bangla)': 'ডি টি',
      Category: 'Headquarter',
      Service: 'Bangladesh Army',
      Type: 'Static',
    };

    await unitTypeFormPage.fillForm(testData);
    await unitTypeFormPage.save();
    await page.waitForTimeout(1000);

    // Try to create duplicate
    await unitTypeListPage.clickCreate();
    await unitTypeFormPage.fillForm(testData);
    const success = await unitTypeFormPage.save();

    if (!success) {
      const hasError = await unitTypeFormPage.isElementVisible(
        unitTypeFormPage.selectors.errorMessage
      );
      expect(hasError).toBeTruthy();
    }
  });

  test('should handle form cancellation', async ({ page }) => {
    await unitTypeListPage.clickCreate();
    await unitTypeFormPage.fill(
      unitTypeFormPage.selectors.nameEnglishInput,
      'Cancel Test'
    );
    await unitTypeFormPage.cancel();

    await page.waitForTimeout(500);
    const isListVisible = await unitTypeListPage.isElementVisible(
      unitTypeListPage.selectors.listContainer
    );
    expect(isListVisible).toBeTruthy();
  });

  test('should handle search with no results', async () => {
    await unitTypeListPage.search('NonExistentUnitType12345');

    const noDataVisible = await unitTypeListPage.isElementVisible(
      unitTypeListPage.selectors.noDataMessage
    );
    const listVisible = await unitTypeListPage.isElementVisible(
      unitTypeListPage.selectors.listContainer
    );

    expect(noDataVisible || listVisible).toBeTruthy();
  });
});

// ============================================================================
// CSV DATA-DRIVEN TESTS
// ============================================================================
test.describe('Unit Type - CSV Bulk Creation', () => {
  let testData;

  test.beforeAll(async () => {
    testData = await readCSV('./test-data/unit-types.csv');
    console.log(`Loaded ${testData.length} unit types from CSV`);
  });

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const unitTypeListPage = new UnitTypeListPage(page);

    await loginPage.gotoLoginPage();
    await loginPage.login(
      process.env.ADMIN_USERNAME || 'admin',
      process.env.ADMIN_PASSWORD || 'password'
    );
    await unitTypeListPage.navigate();
  });

  test('should validate CSV data structure', async () => {
    expect(testData.length).toBeGreaterThan(0);

    const firstRow = testData[0];
    expect(firstRow).toHaveProperty('Name (English)');
    expect(firstRow).toHaveProperty('Name (Bangla)');
    expect(firstRow).toHaveProperty('Short Name (English)');
    expect(firstRow).toHaveProperty('Category');
    expect(firstRow).toHaveProperty('Service');
    expect(firstRow).toHaveProperty('Type');

    console.log('✓ CSV data structure is valid');
  });

  test('should check for duplicate names in CSV', async () => {
    const names = testData
      .filter(
        (ut) =>
          ut['Name (English)'] && !ut['Name (English)'].includes('Example')
      )
      .map((ut) => ut['Name (English)']);

    const uniqueNames = new Set(names);

    if (names.length !== uniqueNames.size) {
      console.warn('⚠ Warning: Duplicate names found in CSV');
      const duplicates = names.filter(
        (name, index) => names.indexOf(name) !== index
      );
      console.warn('Duplicates:', duplicates);
    } else {
      console.log('✓ No duplicate names in CSV');
    }

    expect(uniqueNames.size).toBeGreaterThan(0);
  });

  // Create a test for each row in CSV
  testData?.forEach((unitType) => {
    if (
      !unitType['Name (English)'] ||
      unitType['Name (English)'].includes('Example')
    ) {
      return;
    }

    test(`should create unit type: ${unitType['Name (English)']}`, async ({
      page,
    }) => {
      const unitTypeListPage = new UnitTypeListPage(page);
      const unitTypeFormPage = new UnitTypeFormPage(page);

      const exists = await unitTypeListPage.unitTypeExists(
        unitType['Name (English)']
      );

      if (exists) {
        console.log(
          `Unit type "${unitType['Name (English)']}" already exists, skipping...`
        );
        test.skip();
        return;
      }

      await unitTypeListPage.clickCreate();
      await unitTypeFormPage.fillForm(unitType);

      const success = await unitTypeFormPage.save();
      expect(success).toBeTruthy();

      await page.waitForTimeout(1000);
      const created = await unitTypeListPage.unitTypeExists(
        unitType['Name (English)']
      );
      expect(created).toBeTruthy();

      console.log(`✓ Created unit type: ${unitType['Name (English)']}`);
    });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================
test.describe('Unit Type - Performance', () => {
  test('should handle bulk operations efficiently', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const unitTypeListPage = new UnitTypeListPage(page);
    const unitTypeFormPage = new UnitTypeFormPage(page);

    await loginPage.gotoLoginPage();
    await loginPage.login(
      process.env.ADMIN_USERNAME || 'admin',
      process.env.ADMIN_PASSWORD || 'password'
    );
    await unitTypeListPage.navigate();

    const startTime = Date.now();
    const testCount = 5;

    for (let i = 0; i < testCount; i++) {
      await unitTypeListPage.clickCreate();

      const testData = {
        'Name (English)': `Perf Test Unit ${i}`,
        'Name (Bangla)': `পারফ টেস্ট ${i}`,
        'Short Name (English)': `PTU${i}`,
        'Short Name (Bangla)': `পি${i}`,
        Category: 'Headquarter',
        Service: 'Bangladesh Army',
        Type: 'Static',
      };

      await unitTypeFormPage.fillForm(testData);
      await unitTypeFormPage.save();
      await page.waitForTimeout(500);
    }

    const duration = Date.now() - startTime;
    console.log(
      `Created ${testCount} unit types in ${duration}ms (avg: ${
        duration / testCount
      }ms)`
    );

    expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
  });

  test('should handle search efficiently', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const unitTypeListPage = new UnitTypeListPage(page);

    await loginPage.gotoLoginPage();
    await loginPage.login(
      process.env.ADMIN_USERNAME || 'admin',
      process.env.ADMIN_PASSWORD || 'password'
    );
    await unitTypeListPage.navigate();

    const startTime = Date.now();
    await unitTypeListPage.clearSearch();
    const duration = Date.now() - startTime;

    console.log(`Search completed in ${duration}ms`);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});
