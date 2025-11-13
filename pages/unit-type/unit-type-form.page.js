// pages/unit-type/unit-type-form.page.js
const BasePage = require('../base.page');

/**
 * Unit Type Form Page Object
 * Handles unit type creation and editing forms
 */
class UnitTypeFormPage extends BasePage {
  constructor(page) {
    super(page);

    // 🧩 Locators (encapsulated, semantic)
    this.nameEnglishInput = this.page.getByRole('textbox', {
      name: 'Enter english name',
    });
    this.nameBanglaInput = this.page.getByRole('textbox', {
      name: 'Enter bengali name',
    });
    this.shortNameEnglishInput = this.page.getByRole('textbox', {
      name: 'Enter short english name',
    });
    this.shortNameBanglaInput = this.page.getByRole('textbox', {
      name: 'Enter short bengali name',
    });
    this.categorySelect = this.page.getByRole('combobox', {
      name: 'Select category',
    });
    this.serviceSelect = this.page.getByRole('combobox', {
      name: 'Select service',
    });
    this.corpsSelect = this.page.getByRole('combobox', {
      name: 'Select corps',
    });
    this.staticRadio = this.page.getByRole('radio', { name: 'Static' });
    this.fieldRadio = this.page.getByRole('radio', { name: 'Field' });
    this.workshopCheckbox = this.page.getByRole('checkbox', {
      name: 'Workshop',
    });
    this.depotCheckbox = this.page.getByRole('checkbox', { name: 'Depot' });
    this.createButton = this.page.getByRole('button', { name: 'Create' });
    this.updateButton = this.page.getByRole('button', { name: 'Update' });
    this.cancelButton = this.page.getByRole('button', { name: 'Cancel' });
    this.successMessage = this.page
      .locator('.mat-snack-bar-container, .success-message')
      .first();
    this.errorMessage = this.page.locator('.mat-error, .error-message').first();
  }

  // 🌐 Navigation
  async expectOnPage() {
    await this.nameEnglishInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  // 🔨 Core Actions
  async fillForm(unitTypeData) {
    await this.fillBasicInfo(unitTypeData);
    await this.selectCategory(unitTypeData['Category']);
    await this.selectService(unitTypeData['Service']);
    await this.selectType(unitTypeData['Type']);
    await this.setCheckboxes(unitTypeData);
    await this.selectCorps(unitTypeData['Corps Names (English)']);
  }

  async create() {
    await this.createButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Check if we're back on the list page (success) or still on form (error)
    const isBackOnList =
      this.page.url().includes('/administration/unit-types') &&
      !this.page.url().includes('/create');
    return isBackOnList;
  }

  async update() {
    await this.updateButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Check if we're back on the list page (success) or still on form (error)
    const isBackOnList =
      this.page.url().includes('/administration/unit-types') &&
      !this.page.url().includes('/edit');
    return isBackOnList;
  }

  async save() {
    const isCreateMode = await this.createButton.isVisible().catch(() => false);
    return isCreateMode ? await this.create() : await this.update();
  }

  async cancel() {
    await this.cancelButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // 🧪 Reusable sub-actions
  async fillBasicInfo(data) {
    if (data['Name (English)']) {
      await this.nameEnglishInput.fill(data['Name (English)']);
    }

    if (data['Name (Bangla)']) {
      await this.nameBanglaInput.fill(data['Name (Bangla)']);
    }

    if (data['Short Name (English)']) {
      await this.shortNameEnglishInput.fill(data['Short Name (English)']);
    }

    if (data['Short Name (Bangla)']) {
      await this.shortNameBanglaInput.fill(data['Short Name (Bangla)']);
    }
  }

  async selectCategory(category) {
    if (category) {
      await this.categorySelect.click();
      await this.page.getByRole('option', { name: category }).click();
    }
  }

  async selectService(service) {
    if (service) {
      await this.serviceSelect.click();
      await this.page.getByRole('option', { name: service }).click();
    }
  }

  async selectType(type) {
    if (type === 'Static') {
      await this.staticRadio.check();
    } else if (type === 'Field') {
      await this.fieldRadio.check();
    }
  }

  async setCheckboxes(data) {
    if (data['Is Workshop'] === 'Yes') {
      await this.workshopCheckbox.check();
    }

    if (data['Is Depot'] === 'Yes') {
      await this.depotCheckbox.check();
    }
  }

  async selectCorps(corps) {
    if (corps) {
      await this.corpsSelect.click();
      await this.corpsSelect.fill(corps.substring(0, 3));
      await this.page.getByRole('option', { name: corps }).click();
    }
  }

  // 🔁 Reset / Helpers
  async clearForm() {
    await this.nameEnglishInput.clear();
    await this.nameBanglaInput.clear();
    await this.shortNameEnglishInput.clear();
    await this.shortNameBanglaInput.clear();
  }

  // ⚠️ Message Handling
  async waitForSuccess() {
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isSuccess() {
    try {
      await this.waitForSuccess();
      return true;
    } catch {
      return false;
    }
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

  async expectSuccess() {
    const success = await this.isSuccess();
    if (!success) {
      const error = await this.getErrorMessage();
      throw new Error(`Expected success but got error: ${error}`);
    }
  }
}

module.exports = UnitTypeFormPage;
