const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

/**
 * UnitTypesPage class handles Unit Types administration functionality
 * Extends BasePage to inherit common page operations
 */
class UnitTypesPage extends BasePage {
  constructor(page) {
    super(page);

    // Page elements selectors for Unit Types module
    this.selectors = {
      // Page navigation and header
      pageTitle: 'h1, .page-title, .mat-toolbar h1, .title',
      breadcrumb: '.breadcrumb, .mat-breadcrumb',

      // Create Unit Type button and form
      createButton:
        'button:has-text("Create Unit Type"), .create-btn, button[aria-label*="Create"]',
      addButton: 'button:has-text("Add"), button:has-text("+"), .add-btn',

      // Unit Type form fields
      nameInput: 'input[formControlName="name"], input[name="name"], #name',
      shortNameInput:
        'input[formControlName="shortName"], input[name="shortName"], #shortName',
      categorySelect:
        'mat-select[formControlName="category"], select[name="category"], #category',
      serviceSelect:
        'mat-select[formControlName="service"], select[name="service"], #service',
      typeSelect:
        'mat-select[formControlName="type"], select[name="type"], #type',
      serviceTypeSelect:
        'mat-select[formControlName="serviceType"], select[name="serviceType"], #serviceType',
      corpsSelect:
        'mat-select[formControlName="corps"], select[name="corps"], #corps',
      descriptionInput:
        'textarea[formControlName="description"], textarea[name="description"], #description',

      // Form buttons
      saveButton: 'button:has-text("Save"), button[type="submit"], .save-btn',
      cancelButton: 'button:has-text("Cancel"), .cancel-btn',
      submitButton: 'button:has-text("Submit"), button[type="submit"]',

      // Data table and list
      dataTable: 'table, .mat-table, .data-table',
      tableRows: 'tr, .mat-row, .table-row',
      tableHeaders: 'th, .mat-header-cell, .table-header',

      // Search and filter
      searchInput:
        'input[placeholder*="Search"], .search-input, input[type="search"]',
      filterButton: 'button:has-text("Filter"), .filter-btn',
      clearFilterButton: 'button:has-text("Clear"), .clear-filter-btn',

      // Pagination
      pagination: '.mat-paginator, .pagination',
      nextPageButton: 'button[aria-label*="Next"], .mat-paginator-next-button',
      prevPageButton:
        'button[aria-label*="Previous"], .mat-paginator-previous-button',
      pageSize: '.mat-paginator-page-size-select, .page-size-select',

      // Actions (Edit, Delete, View)
      editButton:
        'button:has-text("Edit"), .edit-btn, button[aria-label*="Edit"]',
      deleteButton:
        'button:has-text("Delete"), .delete-btn, button[aria-label*="Delete"]',
      viewButton:
        'button:has-text("View"), .view-btn, button[aria-label*="View"]',
      actionMenu: '.mat-menu, .action-menu, .dropdown-menu',

      // Confirmation dialogs
      confirmDialog: '.mat-dialog-container, .confirmation-dialog',
      confirmYesButton:
        'button:has-text("Yes"), button:has-text("Confirm"), .confirm-btn',
      confirmNoButton:
        'button:has-text("No"), button:has-text("Cancel"), .cancel-btn',

      // Success/Error messages
      successMessage:
        '.mat-snack-bar-container, .success-message, .alert-success',
      errorMessage: '.mat-error, .error-message, .alert-danger',

      // Loading states
      loadingSpinner: '.mat-spinner, .loading, .spinner',
      progressBar: '.mat-progress-bar, .progress-bar',

      // Export/Import
      exportButton: 'button:has-text("Export"), .export-btn',
      importButton: 'button:has-text("Import"), .import-btn',

      // Bulk actions
      selectAllCheckbox: 'input[type="checkbox"][aria-label*="Select all"]',
      bulkActionButton: 'button:has-text("Bulk"), .bulk-action-btn',

      // Form validation
      requiredFieldError: '.mat-error, .field-error, .validation-error',
      formErrors: '.form-errors, .validation-summary',
    };

    // Expected URLs
    this.urls = {
      unitTypes: '/administration/unit-types',
      createUnitType: '/administration/unit-types/create',
      editUnitType: '/administration/unit-types/edit',
    };

    // Form field mappings for CSV data
    this.fieldMappings = {
      name: 'nameInput',
      shortName: 'shortNameInput',
      category: 'categorySelect',
      service: 'serviceSelect',
      type: 'typeSelect',
      serviceType: 'serviceTypeSelect',
      corps: 'corpsSelect',
      description: 'descriptionInput',
    };
  }

  /**
   * Navigate to Unit Types page
   * @param {string} baseURL - Base URL of the application
   */
  async navigateToUnitTypes(baseURL = 'https://10.10.10.10:700') {
    try {
      await this.logAction(
        'Navigation',
        `Navigating to Unit Types page: ${baseURL}${this.urls.unitTypes}`
      );
      await this.goto(`${baseURL}${this.urls.unitTypes}`);
      await this.waitForUnitTypesPageLoad();
      await this.logAction('Navigation', 'Successfully loaded Unit Types page');
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to navigate to Unit Types page: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Wait for Unit Types page to load completely
   */
  async waitForUnitTypesPageLoad() {
    try {
      // Wait for the main content to load
      await this.waitForNetworkIdle();

      // Wait for page title or main content
      await Promise.race([
        this.waitForElement(this.selectors.pageTitle, 10000),
        this.waitForElement(this.selectors.dataTable, 10000),
        this.waitForElement(this.selectors.createButton, 10000),
      ]);

      await this.logAction(
        'Verification',
        'Unit Types page loaded successfully'
      );
    } catch (error) {
      await this.logAction(
        'Error',
        `Unit Types page failed to load: ${error.message}`
      );
      await this.takeScreenshot('unit-types-page-load-error');
      throw error;
    }
  }

  /**
   * Click Create Unit Type button
   */
  async clickCreateUnitType() {
    try {
      await this.logAction('Interaction', 'Clicking Create Unit Type button');

      // Try different possible selectors for create button
      const createSelectors = [
        this.selectors.createButton,
        this.selectors.addButton,
        'button:has-text("Create")',
        'button:has-text("Add")',
        'button:has-text("New")',
      ];

      for (const selector of createSelectors) {
        if (await this.isElementVisible(selector)) {
          await this.clickElement(selector);
          await this.logAction(
            'Interaction',
            `Create button clicked using selector: ${selector}`
          );
          return;
        }
      }

      throw new Error('Create Unit Type button not found');
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to click Create Unit Type button: ${error.message}`
      );
      await this.takeScreenshot('create-button-error');
      throw error;
    }
  }

  /**
   * Fill unit type form with data
   * @param {object} unitTypeData - Unit type data object
   */
  async fillUnitTypeForm(unitTypeData) {
    try {
      await this.logAction(
        'Input',
        `Filling unit type form with data: ${JSON.stringify(unitTypeData)}`
      );

      // Fill text inputs
      if (unitTypeData.name) {
        await this.fillField('name', unitTypeData.name);
      }

      if (unitTypeData.shortName) {
        await this.fillField('shortName', unitTypeData.shortName);
      }

      if (unitTypeData.description) {
        await this.fillField('description', unitTypeData.description);
      }

      // Fill select dropdowns
      if (unitTypeData.category) {
        await this.selectDropdownOption('category', unitTypeData.category);
      }

      if (unitTypeData.service) {
        await this.selectDropdownOption('service', unitTypeData.service);
      }

      if (unitTypeData.type) {
        await this.selectDropdownOption('type', unitTypeData.type);
      }

      if (unitTypeData.serviceType) {
        await this.selectDropdownOption(
          'serviceType',
          unitTypeData.serviceType
        );
      }

      if (unitTypeData.corps) {
        await this.selectDropdownOption('corps', unitTypeData.corps);
      }

      await this.logAction('Input', 'Unit type form filled successfully');
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to fill unit type form: ${error.message}`
      );
      await this.takeScreenshot('form-fill-error');
      throw error;
    }
  }

  /**
   * Fill a specific form field
   * @param {string} fieldName - Field name from fieldMappings
   * @param {string} value - Value to fill
   */
  async fillField(fieldName, value) {
    const selectorKey = this.fieldMappings[fieldName];
    if (!selectorKey) {
      throw new Error(`Unknown field: ${fieldName}`);
    }

    const selector = this.selectors[selectorKey];
    await this.typeText(selector, value);
    await this.logAction('Input', `Filled ${fieldName} with: ${value}`);
  }

  /**
   * Select option from dropdown
   * @param {string} fieldName - Field name from fieldMappings
   * @param {string} optionText - Option text to select
   */
  async selectDropdownOption(fieldName, optionText) {
    try {
      const selectorKey = this.fieldMappings[fieldName];
      if (!selectorKey) {
        throw new Error(`Unknown field: ${fieldName}`);
      }

      const selector = this.selectors[selectorKey];

      // For Angular Material selects
      if (selector.includes('mat-select')) {
        await this.clickElement(selector);
        await this.waitForElement('.mat-option, .mat-select-option');
        await this.clickElement(
          `mat-option:has-text("${optionText}"), .mat-option:has-text("${optionText}")`
        );
      } else {
        // For regular select elements
        await this.selectOption(selector, optionText);
      }

      await this.logAction('Input', `Selected ${fieldName}: ${optionText}`);
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to select ${fieldName}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Save unit type form
   */
  async saveUnitType() {
    try {
      await this.logAction('Interaction', 'Saving unit type');

      const saveSelectors = [
        this.selectors.saveButton,
        this.selectors.submitButton,
        'button:has-text("Save")',
        'button:has-text("Submit")',
      ];

      for (const selector of saveSelectors) {
        if (await this.isElementVisible(selector)) {
          await this.clickElement(selector);
          await this.logAction(
            'Interaction',
            `Save button clicked using selector: ${selector}`
          );
          break;
        }
      }

      // Wait for save operation to complete
      await this.waitForNetworkIdle();
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to save unit type: ${error.message}`
      );
      await this.takeScreenshot('save-error');
      throw error;
    }
  }

  /**
   * Create a new unit type with provided data
   * @param {object} unitTypeData - Unit type data
   */
  async createUnitType(unitTypeData) {
    try {
      await this.logAction(
        'Action',
        `Creating unit type: ${unitTypeData.name}`
      );

      // Click create button
      await this.clickCreateUnitType();

      // Wait for form to load
      await this.page.waitForTimeout(2000);

      // Fill the form
      await this.fillUnitTypeForm(unitTypeData);

      // Save the unit type
      await this.saveUnitType();

      // Wait for success message or redirect
      await this.page.waitForTimeout(3000);

      await this.logAction(
        'Action',
        `Unit type created successfully: ${unitTypeData.name}`
      );
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to create unit type: ${error.message}`
      );
      await this.takeScreenshot('create-unit-type-error');
      throw error;
    }
  }

  /**
   * Search for unit types
   * @param {string} searchTerm - Search term
   */
  async searchUnitTypes(searchTerm) {
    try {
      await this.logAction('Search', `Searching for: ${searchTerm}`);

      if (await this.isElementVisible(this.selectors.searchInput)) {
        await this.typeText(this.selectors.searchInput, searchTerm);
        await this.page.keyboard.press('Enter');
        await this.waitForNetworkIdle();
        await this.logAction('Search', `Search completed for: ${searchTerm}`);
      } else {
        await this.logAction('Warning', 'Search input not found');
      }
    } catch (error) {
      await this.logAction('Error', `Search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get unit types from table
   * @returns {Array} Array of unit type data from table
   */
  async getUnitTypesFromTable() {
    try {
      await this.logAction('Data', 'Retrieving unit types from table');

      if (!(await this.isElementVisible(this.selectors.dataTable))) {
        await this.logAction('Warning', 'Data table not found');
        return [];
      }

      const rows = await this.page.locator(this.selectors.tableRows).all();
      const unitTypes = [];

      for (let i = 1; i < rows.length; i++) {
        // Skip header row
        const row = rows[i];
        const cells = await row.locator('td, .mat-cell').all();

        if (cells.length > 0) {
          const unitType = {};

          // Extract data from cells (adjust based on actual table structure)
          if (cells[0]) unitType.name = await cells[0].textContent();
          if (cells[1]) unitType.shortName = await cells[1].textContent();
          if (cells[2]) unitType.category = await cells[2].textContent();
          if (cells[3]) unitType.service = await cells[3].textContent();

          unitTypes.push(unitType);
        }
      }

      await this.logAction(
        'Data',
        `Retrieved ${unitTypes.length} unit types from table`
      );
      return unitTypes;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to get unit types from table: ${error.message}`
      );
      return [];
    }
  }

  /**
   * Verify unit type exists in table
   * @param {string} unitTypeName - Name of unit type to verify
   * @returns {boolean} True if unit type exists
   */
  async verifyUnitTypeExists(unitTypeName) {
    try {
      await this.logAction(
        'Verification',
        `Verifying unit type exists: ${unitTypeName}`
      );

      const unitTypes = await this.getUnitTypesFromTable();
      const exists = unitTypes.some(
        (ut) => ut.name && ut.name.includes(unitTypeName)
      );

      await this.logAction(
        'Verification',
        `Unit type ${unitTypeName} exists: ${exists}`
      );
      return exists;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to verify unit type: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Get page title
   * @returns {string} Page title
   */
  async getUnitTypesPageTitle() {
    try {
      if (await this.isElementVisible(this.selectors.pageTitle)) {
        const title = await this.getElementText(this.selectors.pageTitle);
        await this.logAction('Data', `Unit Types page title: ${title}`);
        return title;
      }
      return '';
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to get page title: ${error.message}`
      );
      return '';
    }
  }

  /**
   * Check if create button is available
   * @returns {boolean} True if create button is visible
   */
  async canCreateUnitType() {
    try {
      const canCreate =
        (await this.isElementVisible(this.selectors.createButton)) ||
        (await this.isElementVisible(this.selectors.addButton));
      await this.logAction(
        'Verification',
        `Can create unit type: ${canCreate}`
      );
      return canCreate;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to check create permission: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Wait for success message
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForSuccessMessage(timeout = 10000) {
    try {
      await this.waitForElement(this.selectors.successMessage, timeout);
      const message = await this.getElementText(this.selectors.successMessage);
      await this.logAction('Verification', `Success message: ${message}`);
      return message;
    } catch (error) {
      await this.logAction('Warning', 'No success message found');
      return null;
    }
  }

  /**
   * Wait for error message
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForErrorMessage(timeout = 10000) {
    try {
      await this.waitForElement(this.selectors.errorMessage, timeout);
      const message = await this.getElementText(this.selectors.errorMessage);
      await this.logAction('Verification', `Error message: ${message}`);
      return message;
    } catch (error) {
      await this.logAction('Warning', 'No error message found');
      return null;
    }
  }
}

module.exports = UnitTypesPage;
