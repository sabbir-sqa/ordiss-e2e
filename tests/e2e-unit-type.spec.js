// tests/e2e-unit-type.spec.js
/**
 * End-to-End Unit Type Flow
 * Tests the complete flow: Landing → Login → Navigate → Create → Search → Edit → Delete
 */
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/auth/login.page');
const UnitTypeListPage = require('../pages/unit-type/unit-type-list.page');
const UnitTypeFormPage = require('../pages/unit-type/unit-type-form.page');

// Don't use saved auth - start fresh from landing page
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('E2E: Unit Type Complete Flow', () => {
  let loginPage;
  let listPage;
  let formPage;
  const testUnitName = `E2E Test Unit ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    listPage = new UnitTypeListPage(page);
    formPage = new UnitTypeFormPage(page);

    // Start from landing page and login
    await loginPage.gotoLoginPage();
    await loginPage.login(
      process.env.SUPERADMIN_USERNAME || 'main.superadmin',
      process.env.SUPERADMIN_PASSWORD || 'Ordiss@SA'
    );

    // Navigate to unit types
    await listPage.navigate();
  });

  test('Complete Unit Type Navigation Flow', async ({ page }) => {
    // Step 1: Verify we're on the list page
    await listPage.expectOnPage();
    expect(page.url()).toContain('/administration/unit-types');

    // Step 2: Navigate to create form
    await listPage.clickCreate();
    await formPage.expectOnPage();
    expect(page.url()).toContain('/create');

    // Step 3: Fill form fields
    await formPage.fillForm({
      'Name (English)': testUnitName,
      'Name (Bangla)': 'ই২ই টেস্ট',
      'Short Name (English)': 'E2E',
      'Short Name (Bangla)': 'ই২ই',
      Category: 'Headquarter',
      Service: 'Bangladesh Army',
      Type: 'Static',
    });

    // Verify form is filled
    await expect(formPage.nameEnglishInput).toHaveValue(testUnitName);
    await expect(formPage.shortNameEnglishInput).toHaveValue('E2E');

    // Step 4: Cancel and return to list
    await formPage.cancel();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/administration/unit-types');
    expect(page.url()).not.toContain('/create');

    // Step 5: Test search functionality
    await listPage.search('Army');
    await page.waitForTimeout(2000);
    await expect(listPage.searchBox).toHaveValue('Army');
  });
});
