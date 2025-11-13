// tests/e2e-unit-type.spec.js
/**
 * End-to-End Unit Type Flow
 * Tests the complete flow: Navigate → Create → Search → Edit → Delete
 */
const { test, expect } = require('@playwright/test');
const UnitTypeListPage = require('../pages/unit-type/unit-type-list.page');
const UnitTypeFormPage = require('../pages/unit-type/unit-type-form.page');

test.describe('E2E: Unit Type Complete Flow', () => {
  let listPage;
  let formPage;
  const testUnitName = `E2E Test Unit ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    listPage = new UnitTypeListPage(page);
    formPage = new UnitTypeFormPage(page);
    await listPage.navigate();
  });

  test('Complete Unit Type Lifecycle', async ({ page }) => {
    // Step 1: Create
    await listPage.clickCreate();

    await formPage.fillForm({
      'Name (English)': testUnitName,
      'Name (Bangla)': 'ই২ই টেস্ট',
      'Short Name (English)': 'E2E',
      'Short Name (Bangla)': 'ই২ই',
      Category: 'Headquarter',
      Service: 'Bangladesh Army',
      Type: 'Static',
    });

    const created = await formPage.save();
    expect(created).toBeTruthy();
    await page.waitForTimeout(2000);

    // Step 2: Search & Verify
    const exists = await listPage.unitTypeExists(testUnitName);
    expect(exists).toBeTruthy();

    // Step 3: Edit
    await listPage.editUnitType(testUnitName);
    await formPage.nameEnglishInput.fill(`${testUnitName} Updated`);
    const updated = await formPage.update();
    expect(updated).toBeTruthy();
    await page.waitForTimeout(2000);

    // Step 4: Delete
    await listPage.deleteUnitType(`${testUnitName} Updated`);
    await page.waitForTimeout(2000);

    await listPage.clearSearch();
    const deleted = await listPage.unitTypeExists(`${testUnitName} Updated`);
    expect(deleted).toBeFalsy();
  });
});
