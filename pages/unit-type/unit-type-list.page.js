// pages/unit-type/unit-type-list.page.js
const BasePage = require('../base.page');

/**
 * Unit Type List Page Object
 * Handles the unit types list view with search, filter, and CRUD operations
 */
class UnitTypeListPage extends BasePage {
  constructor(page) {
    super(page);

    // Selectors for unit type list page
    this.selectors = {
      // Navigation
      unitTypeMenu: 'a:has-text("Unit Type"), [href*="unit-type"]',

      // List view
      listContainer: '.unit-type-list, .mat-table, table',
      tableRows: 'tr.mat-row, tbody tr',
      tableHeaders: 'th, .mat-header-cell',

      // Search and filter
      searchInput: 'input[placeholder*="Search"], input[name="search"]',
      searchButton: 'button:has-text("Search"), .search-btn',
      filterButton: 'button:has-text("Filter"), .filter-btn',
      clearButton: 'button:has-text("Clear"), .clear-btn',

      // Actions
      createButton:
        'button:has-text("Create"), button:has-text("Add"), .create-btn',
      editButton: 'button:has-text("Edit"), .edit-btn',
      deleteButton: 'button:has-text("Delete"), .delete-btn',
      viewButton: 'button:has-text("View"), .view-btn',

      // Table columns
      nameColumn: 'td:nth-child(1), .name-column',
      shortNameColumn: 'td:nth-child(2), .short-name-column',
      categoryColumn: 'td:nth-child(3), .category-column',
      serviceColumn: 'td:nth-child(4), .service-column',
      actionsColumn: 'td:last-child, .actions-column',

      // Messages
      successMessage:
        '.mat-snack-bar-container, .success-message, .alert-success',
      errorMessage: '.mat-error, .error-message, .alert-danger',
      noDataMessage: '.no-data, .empty-state',

      // Pagination
      pagination: '.mat-paginator, .pagination',
      nextPageButton: 'button[aria-label="Next page"]',
      previousPageButton: 'button[aria-label="Previous page"]',

      // Loading
      loadingSpinner: '.mat-spinner, .loading, .spinner',
    };
  }

  /**
   * Navigate to unit type list page
   */
  async navigate() {
    await this.click(this.selectors.unitTypeMenu);
    await this.waitForLoad();
    await this.waitForElement(this.selectors.listContainer);
  }

  /**
   * Click create button to open form
   */
  async clickCreate() {
    await this.click(this.selectors.createButton);
    await this.waitForLoad();
  }

  /**
   * Search for a unit type by name
   * @param {string} searchTerm - Search term
   */
  async search(searchTerm) {
    await this.fill(this.selectors.searchInput, searchTerm);

    // Try to click search button if exists, otherwise press Enter
    const searchButtonExists = await this.isElementVisible(
      this.selectors.searchButton
    );
    if (searchButtonExists) {
      await this.click(this.selectors.searchButton);
    } else {
      await this.page.keyboard.press('Enter');
    }

    await this.waitForLoad();
  }

  /**
   * Find a unit type row by name
   * @param {string} name - Unit type name
   * @returns {Locator} Row locator
   */
  async findRowByName(name) {
    const row = this.page
      .locator(`${this.selectors.tableRows}:has-text("${name}")`)
      .first();
    return row;
  }

  /**
   * Check if unit type exists in the list
   * @param {string} name - Unit type name
   * @returns {boolean}
   */
  async unitTypeExists(name) {
    await this.search(name);
    const row = await this.findRowByName(name);
    return await row.isVisible().catch(() => false);
  }

  /**
   * Edit a unit type by name
   * @param {string} name - Unit type name
   */
  async editUnitType(name) {
    const row = await this.findRowByName(name);
    const editButton = row.locator(this.selectors.editButton);
    await editButton.click();
    await this.waitForLoad();
  }

  /**
   * Delete a unit type by name
   * @param {string} name - Unit type name
   */
  async deleteUnitType(name) {
    const row = await this.findRowByName(name);
    const deleteButton = row.locator(this.selectors.deleteButton);
    await deleteButton.click();

    // Handle confirmation dialog if exists
    await this.handleDeleteConfirmation();
  }

  /**
   * Handle delete confirmation dialog
   */
  async handleDeleteConfirmation() {
    // Wait for confirmation dialog
    const confirmButton = this.page.locator(
      'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")'
    );
    const isVisible = await confirmButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isVisible) {
      await confirmButton.click();
      await this.waitForLoad();
    }
  }

  /**
   * Get all unit type names from current page
   * @returns {Array<string>}
   */
  async getAllUnitTypeNames() {
    const rows = await this.page.locator(this.selectors.tableRows).all();
    const names = [];

    for (const row of rows) {
      const nameCell = row.locator(this.selectors.nameColumn);
      const name = await nameCell.textContent();
      if (name && name.trim()) {
        names.push(name.trim());
      }
    }

    return names;
  }

  /**
   * Get unit type details by name
   * @param {string} name - Unit type name
   * @returns {Object} Unit type details
   */
  async getUnitTypeDetails(name) {
    const row = await this.findRowByName(name);

    const details = {
      name: await row.locator(this.selectors.nameColumn).textContent(),
      shortName: await row
        .locator(this.selectors.shortNameColumn)
        .textContent(),
      category: await row.locator(this.selectors.categoryColumn).textContent(),
      service: await row.locator(this.selectors.serviceColumn).textContent(),
    };

    return details;
  }

  /**
   * Wait for success message
   * @returns {string} Success message text
   */
  async getSuccessMessage() {
    await this.waitForElement(this.selectors.successMessage);
    return await this.page.locator(this.selectors.successMessage).textContent();
  }

  /**
   * Wait for error message
   * @returns {string} Error message text
   */
  async getErrorMessage() {
    await this.waitForElement(this.selectors.errorMessage);
    return await this.page.locator(this.selectors.errorMessage).textContent();
  }

  /**
   * Clear search/filters
   */
  async clearSearch() {
    const clearButtonExists = await this.isElementVisible(
      this.selectors.clearButton
    );
    if (clearButtonExists) {
      await this.click(this.selectors.clearButton);
    } else {
      await this.fill(this.selectors.searchInput, '');
      await this.page.keyboard.press('Enter');
    }
    await this.waitForLoad();
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

module.exports = UnitTypeListPage;
