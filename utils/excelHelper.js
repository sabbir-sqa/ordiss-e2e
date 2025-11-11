const XLSX = require('xlsx');
const fs = require('fs-extra');
const path = require('path');

/**
 * Excel Helper for reading and writing Excel files
 * Supports both reading test data and updating Excel files after test execution
 */
class ExcelHelper {
  constructor() {
    this.testDataDir = path.join(process.cwd(), 'test-data');
  }

  /**
   * Read Excel file and return data
   * @param {string} fileName - Excel file name (with or without .xlsx)
   * @param {string} sheetName - Sheet name (optional, uses first sheet if not provided)
   * @returns {Array} Array of row objects
   */
  async readExcel(fileName, sheetName = null) {
    try {
      // Add .xlsx extension if not present
      const fullFileName = fileName.endsWith('.xlsx')
        ? fileName
        : `${fileName}.xlsx`;
      const filePath = path.join(this.testDataDir, fullFileName);

      // Check if file exists
      if (!(await fs.pathExists(filePath))) {
        console.log(`📝 Excel file not found: ${fullFileName}`);
        console.log(`📍 Expected location: ${filePath}`);
        console.log(`💡 Place your Excel file in the test-data folder`);
        return [];
      }

      // Read the Excel file
      const workbook = XLSX.readFile(filePath);

      // Get sheet name
      const sheet = sheetName || workbook.SheetNames[0];

      if (!workbook.Sheets[sheet]) {
        console.log(`❌ Sheet "${sheet}" not found in ${fullFileName}`);
        return [];
      }

      // Convert sheet to JSON
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

      console.log(
        `✅ Read ${data.length} rows from ${fullFileName} (Sheet: ${sheet})`
      );
      return data;
    } catch (error) {
      console.error(`❌ Error reading Excel file: ${error.message}`);
      return [];
    }
  }

  /**
   * Write data to Excel file
   * @param {string} fileName - Excel file name
   * @param {Array} data - Array of objects to write
   * @param {string} sheetName - Sheet name (optional, defaults to 'Sheet1')
   */
  async writeExcel(fileName, data, sheetName = 'Sheet1') {
    try {
      const fullFileName = fileName.endsWith('.xlsx')
        ? fileName
        : `${fileName}.xlsx`;
      const filePath = path.join(this.testDataDir, fullFileName);

      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Ensure directory exists
      await fs.ensureDir(this.testDataDir);

      // Write file
      XLSX.writeFile(workbook, filePath);

      console.log(`✅ Wrote ${data.length} rows to ${fullFileName}`);
      return true;
    } catch (error) {
      console.error(`❌ Error writing Excel file: ${error.message}`);
      return false;
    }
  }

  /**
   * Append data to existing Excel file
   * @param {string} fileName - Excel file name
   * @param {Array} newData - Array of objects to append
   * @param {string} sheetName - Sheet name
   */
  async appendToExcel(fileName, newData, sheetName = null) {
    try {
      // Read existing data
      const existingData = await this.readExcel(fileName, sheetName);

      // Combine with new data
      const combinedData = [...existingData, ...newData];

      // Write back
      return await this.writeExcel(
        fileName,
        combinedData,
        sheetName || 'Sheet1'
      );
    } catch (error) {
      console.error(`❌ Error appending to Excel file: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a name already exists in the data
   * @param {Array} data - Existing data
   * @param {string} nameField - Field name to check (e.g., 'Name (English)')
   * @param {string} value - Value to check
   * @returns {boolean} True if exists
   */
  nameExists(data, nameField, value) {
    return data.some((row) => row[nameField] === value);
  }

  /**
   * Generate unique name by adding extension (002, 003, etc.)
   * @param {Array} data - Existing data
   * @param {string} nameField - Field name to check
   * @param {string} baseName - Base name to make unique
   * @returns {string} Unique name with extension
   */
  generateUniqueName(data, nameField, baseName) {
    let counter = 2;
    let uniqueName = baseName;

    while (this.nameExists(data, nameField, uniqueName)) {
      uniqueName = `${baseName}-${String(counter).padStart(3, '0')}`;
      counter++;
    }

    if (uniqueName !== baseName) {
      console.log(`⚠️  Name "${baseName}" exists, using "${uniqueName}"`);
    }

    return uniqueName;
  }

  /**
   * Prepare unit type data with unique names
   * @param {Object} unitTypeData - Unit type data object
   * @param {Array} existingData - Existing data from Excel
   * @returns {Object} Unit type data with unique names
   */
  prepareUnitTypeData(unitTypeData, existingData = []) {
    const prepared = { ...unitTypeData };

    // Check and make English name unique
    if (prepared['Name (English)']) {
      prepared['Name (English)'] = this.generateUniqueName(
        existingData,
        'Name (English)',
        prepared['Name (English)']
      );
    }

    // Check and make Bangla name unique if provided
    if (prepared['Name (Bangla)']) {
      prepared['Name (Bangla)'] = this.generateUniqueName(
        existingData,
        'Name (Bangla)',
        prepared['Name (Bangla)']
      );
    }

    return prepared;
  }

  /**
   * Get column names from Excel file
   * @param {string} fileName - Excel file name
   * @param {string} sheetName - Sheet name
   * @returns {Array} Array of column names
   */
  async getColumns(fileName, sheetName = null) {
    try {
      const data = await this.readExcel(fileName, sheetName);
      if (data.length > 0) {
        return Object.keys(data[0]);
      }
      return [];
    } catch (error) {
      console.error(`❌ Error getting columns: ${error.message}`);
      return [];
    }
  }

  /**
   * Validate data against expected columns
   * @param {Object} data - Data object to validate
   * @param {Array} expectedColumns - Expected column names
   * @returns {Object} Validation result
   */
  validateData(data, expectedColumns) {
    const missingColumns = [];
    const extraColumns = [];
    const dataColumns = Object.keys(data);

    // Check for missing columns
    expectedColumns.forEach((col) => {
      if (!dataColumns.includes(col)) {
        missingColumns.push(col);
      }
    });

    // Check for extra columns
    dataColumns.forEach((col) => {
      if (!expectedColumns.includes(col)) {
        extraColumns.push(col);
      }
    });

    return {
      isValid: missingColumns.length === 0,
      missingColumns,
      extraColumns,
    };
  }

  /**
   * Create sample Excel file with unit type structure
   * @param {string} fileName - File name to create
   */
  async createSampleUnitTypeExcel(fileName = 'unit-types-sample.xlsx') {
    const sampleData = [
      {
        'Name (English)': 'Armed Forces Division',
        'Name (Bangla)': 'সশস্ত্র বাহিনী বিভাগ',
        'Short Name (English)': 'AFD',
        'Short Name (Bangla)': 'এএফডি',
        Category: 'Headquarters',
        Service: 'Ministry Of Defence',
        Type: 'Static',
        'Is Depot': 'No',
        'Is Workshop': 'No',
        'Corps Names (English)': 'Infantry',
      },
      {
        'Name (English)': 'Special Operations Command',
        'Name (Bangla)': 'বিশেষ অভিযান কমান্ড',
        'Short Name (English)': 'SOC',
        'Short Name (Bangla)': 'এসওসি',
        Category: 'Division',
        Service: 'Army',
        Type: 'Mobile',
        'Is Depot': 'No',
        'Is Workshop': 'No',
        'Corps Names (English)': 'Special Forces',
      },
    ];

    return await this.writeExcel(fileName, sampleData, 'Unit Types');
  }
}

module.exports = ExcelHelper;
