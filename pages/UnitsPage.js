const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

/**
 * UnitsPage class handles Units module functionality
 * Manages military/organizational units
 */
class UnitsPage extends BasePage {
  constructor(page) {
    super(page);

    // Page URL
    this.url = '/administration/units';

    // Page element selectors
    this.selectors = {
      // Page header and navigation
      pageTitle: 'h1, .page-title, .mat-toolbar h1',
      breadcrumb: '.breadcrumb, .mat-breadcrumb',

      // Action buttons
      createButton:
        'button:has-text("Create"), button:has-text("Add"), .create-btn',
      importButton: 'button:has-text("Import")',
      exportButton: 'button:has-text("Export")',
      filterButton: 'button:has-text("Filter")',

      // Search and filter
      searchInput: 'input[placeholder*="Search"], input[type="search"]',

      // Form fields (to be discovered during recording)
      nameInput: 'input[formControlName="name"], input[name="name"]',
      codeInput: 'input[formControlName="code"], input[name="code"]',
      unitTypeSelect:
        'mat-select[formControlName="unitType"], select[name="unitType"]',
      parentUnitSelect:
        'mat-select[formControlName="parentUnit"], select[name="parentUnit"]',
      locationInput:
        'input[formControlName="location"], input[name="location"]',

      // Data display
      dataTable: 'table, .mat-table, .data-table',
      tableRows: 'tr, .mat-row',

      // Action buttons in table
      editButton: 'button:has-text("Edit"), .edit-btn',
      deleteButton: 'button:has-text("Delete"), .delete-btn',
      viewButton: 'button:has-text("View"), .view-btn',

      // Form buttons
      saveButton: 'button:has-text("Save"), button[type="submit"]',
      cancelButton: 'button:has-text("Cancel")',

      // Messages
      successMessage:
        '.mat-snack-bar-container, .success-message, .alert-success',
      errorMessage: '.mat-error, .error-message, .alert-danger',
    };
  }

  /**
   * Navigate to Units page
   * @param {string} baseURL - Base URL of the application
   */
  async navigateToUnits(baseURL = 'https://10.10.10.10:700') {
    await this.logAction('Navigation', `Navigating to Units page`);
    await this.goto(`${baseURL}${this.url}`);
    await this.waitForNetworkIdle();
    await this.logAction('Navigation', 'Units page loaded');
  }

  /**
   * Click create button
   */
  async clickCreate() {
    await this.logAction('Action', 'Clicking Create button');
    await this.clickElement(this.selectors.createButton);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Search for unit
   * @param {string} searchTerm - Search term
   */
  async search(searchTerm) {
    await this.logAction('Search', `Searching for: ${searchTerm}`);
    if (await this.isElementVisible(this.selectors.searchInput)) {
      await this.typeText(this.selectors.searchInput, searchTerm);
      await this.page.keyboard.press('Enter');
      await this.waitForNetworkIdle();
    }
  }

  /**
   * Take screenshot of current page state
   * @param {string} name - Screenshot name
   */
  async capturePageState(name) {
    await this.takeScreenshot(`units-${name}`);
  }
}

module.exports = UnitsPage;
