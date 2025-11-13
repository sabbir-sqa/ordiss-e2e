// pages/unit-type/unit-type-form.page.js
const BasePage = require('../base.page');

/**
 * Unit Type Form Page Object
 * Handles unit type creation and editing forms
 */
class UnitTypeFormPage extends BasePage {
  constructor(page) {
    super(page);

    // Form selectors based on ORDISS Angular Material structure
    this.selectors = {
      // Form container
      formContainer: '.unit-type-form, .mat-dialog-content, form',
      formTitle: '.mat-dialog-title, h2, h3',

      // Input fields
      nameEnglishInput:
        'input[formControlName="nameEnglish"], input[name="nameEnglish"], #nameEnglish',
      nameBanglaInput:
        'input[formControlName="nameBangla"], input[name="nameBangla"], #nameBangla',
      shortNameEnglishInput:
        'input[formControlName="shortNameEnglish"], input[name="shortNameEnglish"], #shortNameEnglish',
      shortNameBanglaInput:
        'input[formControlName="shortNameBangla"], input[name="shortNameBangla"], #shortNameBangla',

      // Dropdown selectors (Angular Material)
      categorySelect:
        'mat-select[formControlName="category"], select[name="category"], #category',
      serviceSelect:
        'mat-select[formControlName="service"], select[name="service"], #service',
      typeSelect:
        'mat-select[formControlName="type"], select[name="type"], #type',
      corpsSelect:
        'mat-select[formControlName="corps"], select[name="corps"], #corps',

      // Checkbox selectors
      isDepotCheckbox:
        'input[formControlName="isDepot"], input[name="isDepot"], #isDepot',
      isWorkshopCheckbox:
        'input[formControlName="isWorkshop"], input[name="isWorkshop"], #isWorkshop',

      // Buttons
      saveButton: 'button:has-text("Save"), button[type="submit"], .save-btn',
      cancelButton: 'button:has-text("Cancel"), .cancel-btn',

      // Messages
      successMessage:
        '.mat-snack-bar-container, .success-message, .alert-success',
      errorMessage: '.mat-error, .error-message, .alert-danger',

      // Loading states
      loadingSpinner: '.mat-spinner, .loading, .spinner',

      // Mat-select options
      matOption: 'mat-option, .mat-option',
    };
  }

  /**
   * Wait for form to be ready
   */
  async waitForFormReady() {
    await this.waitForElement(this.selectors.formContainer);
    await this.waitForElement(this.selectors.nameEnglishInput);
  }

  /**
   * Fill the unit type form with data
   * @param {Object} unitTypeData - Unit type data object
   */
  async fillForm(unitTypeData) {
    await this.waitForFormReady();

    // Fill text inputs
    if (unitTypeData['Name (English)']) {
      await this.fill(
        this.selectors.nameEnglishInput,
        unitTypeData['Name (English)']
      );
    }

    if (unitTypeData['Name (Bangla)']) {
      await this.fill(
        this.selectors.nameBanglaInput,
        unitTypeData['Name (Bangla)']
      );
    }

    if (unitTypeData['Short Name (English)']) {
      await this.fill(
        this.selectors.shortNameEnglishInput,
        unitTypeData['Short Name (English)']
      );
    }

    if (unitTypeData['Short Name (Bangla)']) {
      await this.fill(
        this.selectors.shortNameBanglaInput,
        unitTypeData['Short Name (Bangla)']
      );
    }

    // Handle dropdowns (Angular Material)
    if (unitTypeData['Category']) {
      await this.selectMatOption(
        this.selectors.categorySelect,
        unitTypeData['Category']
      );
    }

    if (unitTypeData['Service']) {
      await this.selectMatOption(
        this.selectors.serviceSelect,
        unitTypeData['Service']
      );
    }

    if (unitTypeData['Type']) {
      await this.selectMatOption(
        this.selectors.typeSelect,
        unitTypeData['Type']
      );
    }

    if (unitTypeData['Corps Names (English)']) {
      await this.selectMatOption(
        this.selectors.corpsSelect,
        unitTypeData['Corps Names (English)']
      );
    }

    // Handle checkboxes
    if (unitTypeData['Is Depot'] === 'Yes') {
      await this.check(this.selectors.isDepotCheckbox);
    }

    if (unitTypeData['Is Workshop'] === 'Yes') {
      await this.check(this.selectors.isWorkshopCheckbox);
    }
  }

  /**
   * Select option from Angular Material dropdown
   * @param {string} selectSelector - Selector for mat-select
   * @param {string} optionText - Option text to select
   */
  async selectMatOption(selectSelector, optionText) {
    // Click the mat-select to open dropdown
    await this.click(selectSelector);

    // Wait for options to appear
    await this.page.waitForSelector(this.selectors.matOption, {
      state: 'visible',
    });

    // Click the specific option
    await this.page.click(
      `${this.selectors.matOption}:has-text("${optionText}")`
    );

    // Wait for dropdown to close
    await this.page.waitForTimeout(500);
  }

  /**
   * Check a checkbox
   * @param {string} selector - Checkbox selector
   */
  async check(selector) {
    const checkbox = this.page.locator(selector);
    const isChecked = await checkbox.isChecked().catch(() => false);

    if (!isChecked) {
      await checkbox.check();
    }
  }

  /**
   * Save the unit type form
   * @returns {boolean} Success status
   */
  async save() {
    await this.click(this.selectors.saveButton);

    // Wait for either success message or error
    await Promise.race([
      this.page.waitForSelector(this.selectors.successMessage, {
        timeout: 10000,
      }),
      this.page.waitForSelector(this.selectors.errorMessage, {
        timeout: 10000,
      }),
    ]).catch(() => {});

    // Check if success message appeared
    const isSuccess = await this.isElementVisible(
      this.selectors.successMessage
    );
    return isSuccess;
  }

  /**
   * Cancel form and return to list
   */
  async cancel() {
    await this.click(this.selectors.cancelButton);
  }

  /**
   * Get success message text
   * @returns {string}
   */
  async getSuccessMessage() {
    await this.waitForElement(this.selectors.successMessage);
    return await this.page.locator(this.selectors.successMessage).textContent();
  }

  /**
   * Get error message text
   * @returns {string}
   */
  async getErrorMessage() {
    await this.waitForElement(this.selectors.errorMessage);
    return await this.page.locator(this.selectors.errorMessage).textContent();
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in ms
   */
  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {boolean}
   */
  async isElementVisible(selector) {
    return await this.page
      .locator(selector)
      .isVisible({ timeout: 2000 })
      .catch(() => false);
  }
}

module.exports = UnitTypeFormPage;
