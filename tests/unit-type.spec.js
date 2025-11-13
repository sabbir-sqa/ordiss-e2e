// tests/unit-type.spec.js
/**
 * Unit Type Individual Tests
 * Each test is independent and can run alone
 * Starts from landing page → login → unit type testing
 */
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/auth/login.page');
const UnitTypeListPage = require('../pages/unit-type/unit-type-list.page');
const UnitTypeFormPage = require('../pages/unit-type/unit-type-form.page');

// Don't use saved auth - start fresh from landing page each time
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Unit Type - Individual Tests', () => {
  let loginPage;
  let listPage;
  let formPage;

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

  test('should display unit type list page', async () => {
    await listPage.expectOnPage();
  });

  test('should open create unit type form', async () => {
    await listPage.clickCreate();
    await formPage.expectOnPage();

    // Verify form fields are visible
    await expect(formPage.nameEnglishInput).toBeVisible();
    await expect(formPage.categorySelect).toBeVisible();
    await expect(formPage.createButton).toBeVisible();
  });

  test('should search and filter unit types', async () => {
    // Search for a unit type
    await listPage.search('Army');
    await listPage.page.waitForTimeout(2000);

    // Verify search box has the value
    await expect(listPage.searchBox).toHaveValue('Army');
  });

  test('should handle form cancellation', async () => {
    await listPage.clickCreate();
    await formPage.nameEnglishInput.fill('Cancel Test');
    await formPage.cancel();

    // Should be back on list page
    await listPage.expectOnPage();
  });
});
