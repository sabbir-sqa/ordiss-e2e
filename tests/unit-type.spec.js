// tests/unit-type.spec.js
/**
 * Unit Type Individual Tests
 * Each test is independent and can run alone
 */
const { test, expect } = require('@playwright/test');
const UnitTypeListPage = require('../pages/unit-type/unit-type-list.page');
const UnitTypeFormPage = require('../pages/unit-type/unit-type-form.page');

test.describe('Unit Type - Individual Tests', () => {
  let listPage;
  let formPage;

  test.beforeEach(async ({ page }) => {
    listPage = new UnitTypeListPage(page);
    formPage = new UnitTypeFormPage(page);
    await listPage.navigate();
  });

  test('should display unit type list page', async () => {
    await listPage.expectOnPage();
  });

  test('should create a unit type', async () => {
    await listPage.clickCreate();

    await formPage.fillForm({
      'Name (English)': `Test Unit ${Date.now()}`,
      'Name (Bangla)': 'টেস্ট ইউনিট',
      'Short Name (English)': 'TU',
      'Short Name (Bangla)': 'টি ইউ',
      Category: 'Headquarter',
      Service: 'Bangladesh Army',
      Type: 'Static',
    });

    const success = await formPage.save();
    expect(success).toBeTruthy();
  });

  test('should search for existing unit type', async () => {
    await listPage.search('Armed Forces Division');
    const exists = await listPage.unitTypeExists('Armed Forces Division');
    expect(exists).toBeTruthy();
  });

  test('should handle form cancellation', async () => {
    await listPage.clickCreate();
    await formPage.nameEnglishInput.fill('Cancel Test');
    await formPage.cancel();

    // Should be back on list page
    await listPage.expectOnPage();
  });
});
