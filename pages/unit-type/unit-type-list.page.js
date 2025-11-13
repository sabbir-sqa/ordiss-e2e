// pages/unit-type/unit-type-list.page.js
const BasePage = require('../base.page');

/**
 * Unit Type List Page Object
 * Handles unit type list view with search, CRUD operations
 */
class UnitTypeListPage extends BasePage {
  constructor(page) {
    super(page);

    // 🧩 Locators (encapsulated, semantic)
    this.menuItem = this.page
      .locator('mat-list-item')
      .filter({ hasText: 'Unit Types' });
    this.searchBox = this.page.getByRole('combobox', { name: 'Search' });
    this.createButton = this.page.getByRole('button', {
      name: 'Create Unit Type',
    });
    this.sortNameButton = this.page.getByRole('button', {
      name: 'Name',
      exact: true,
    });
    this.moreOptionsIcon = this.page.getByText('more_horiz');
    this.editButton = this.page.getByRole('button', { name: 'Edit' });
    this.deleteButton = this.page.getByRole('button', { name: 'Delete' });
    this.successMessage = this.page
      .locator('.mat-snack-bar-container, .success-message')
      .first();
    this.errorMessage = this.page.locator('.mat-error, .error-message').first();
  }

  // 🌐 Navigation
  async navigate() {
    const baseUrl = process.env.BASE_URL || 'https://10.10.10.10:700';

    // Check if already on unit-types page
    if (this.page.url().includes('/administration/unit-types')) {
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
      return;
    }

    // Try to find and click menu item
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    const menuVisible = await this.menuItem
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (menuVisible) {
      await this.menuItem.click();
    } else {
      // Navigate directly to unit-types page
      await this.page.goto(`${baseUrl}/administration/unit-types`);
    }

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000); // Wait for Angular to render
  }

  async expectOnPage() {
    console.log('Current URL:', this.page.url());

    // Try to find any element to confirm page loaded
    try {
      await this.searchBox.waitFor({ state: 'visible', timeout: 10000 });
      await this.createButton.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      console.log('Page elements not found. Taking screenshot...');
      await this.page.screenshot({
        path: 'debug-unit-type-page.png',
        fullPage: true,
      });
      throw error;
    }
  }

  // 🔨 Core Actions
  async clickCreate() {
    // Wait for page to be fully loaded
    await this.page.waitForTimeout(2000);
    await this.createButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.createButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async search(searchTerm) {
    await this.searchBox.fill(searchTerm);
    await this.searchBox.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch() {
    await this.searchBox.fill('');
    await this.searchBox.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async editUnitType(name) {
    await this.search(name);
    await this.moreOptionsIcon.first().click();
    await this.editButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async deleteUnitType(name) {
    await this.search(name);
    await this.moreOptionsIcon.first().click();
    await this.deleteButton.click();
    await this.deleteButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async sortByName() {
    await this.sortNameButton.click();
  }

  // 🧪 Verification Helpers
  async unitTypeExists(name) {
    try {
      // Wait for table to load
      await this.page.waitForTimeout(2000);
      const row = this.page.locator('tr').filter({ hasText: name });
      return await row.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  async expectUnitTypeExists(name) {
    const exists = await this.unitTypeExists(name);
    if (!exists) {
      throw new Error(`Unit type "${name}" not found in list`);
    }
  }

  async expectUnitTypeNotExists(name) {
    const exists = await this.unitTypeExists(name);
    if (exists) {
      throw new Error(`Unit type "${name}" should not exist but was found`);
    }
  }

  // ⚠️ Message Handling
  async waitForSuccess() {
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getSuccessMessage() {
    try {
      await this.waitForSuccess();
      return await this.successMessage.textContent();
    } catch {
      return null;
    }
  }

  async getErrorMessage() {
    try {
      await this.waitForError();
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }
}

module.exports = UnitTypeListPage;
