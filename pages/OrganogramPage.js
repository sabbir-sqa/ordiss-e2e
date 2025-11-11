const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

/**
 * OrganogramPage class handles Organogram module functionality
 * Manages organizational structure and hierarchy
 */
class OrganogramPage extends BasePage {
  constructor(page) {
    super(page);

    // Page URL
    this.url = '/administration/organogram';

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
      parentSelect:
        'mat-select[formControlName="parent"], select[name="parent"]',
      typeSelect: 'mat-select[formControlName="type"], select[name="type"]',

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
   * Navigate to Organogram page
   * @param {string} baseURL - Base URL of the application
   */
  async navigateToOrganogram(baseURL = 'https://10.10.10.10:700') {
    await this.logAction('Navigation', `Navigating to Organogram page`);
    await this.goto(`${baseURL}${this.url}`);
    await this.waitForNetworkIdle();
    await this.logAction('Navigation', 'Organogram page loaded');
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
   * Search for organogram item
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
    await this.takeScreenshot(`organogram-${name}`);
  }
}

module.exports = OrganogramPage;
