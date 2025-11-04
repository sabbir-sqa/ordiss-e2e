const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');
const TestUtils = require('./utils');

/**
 * CSV Data Driver for handling test data from CSV files
 * Provides functionality to read, validate, and process CSV test data
 */
class CSVDataDriver {
  constructor() {
    this.dataCache = new Map();
    this.testDataDir = path.join(process.cwd(), 'test-data');
  }

  /**
   * Read CSV file and return data with validation
   * @param {string} fileName - CSV file name (without extension)
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise<Array>} Array of data objects
   */
  async readCSVData(fileName, useCache = true) {
    const cacheKey = fileName;

    // Return cached data if available and requested
    if (useCache && this.dataCache.has(cacheKey)) {
      console.log(`Using cached data for: ${fileName}`);
      return this.dataCache.get(cacheKey);
    }

    const filePath = path.join(this.testDataDir, `${fileName}.csv`);

    try {
      const data = await this.parseCSVFile(filePath);

      // Validate data integrity
      const validation = this.validateCSVData(data, fileName);
      if (!validation.isValid) {
        throw new Error(
          `CSV validation failed for ${fileName}: ${validation.error}`
        );
      }

      // Cache the data
      this.dataCache.set(cacheKey, data);

      console.log(
        `Successfully loaded ${data.length} records from ${fileName}.csv`
      );
      return data;
    } catch (error) {
      console.error(`Error reading CSV file ${fileName}:`, error.message);
      throw error;
    }
  }

  /**
   * Parse CSV file using csv-parser
   * @param {string} filePath - Full path to CSV file
   * @returns {Promise<Array>} Parsed CSV data
   */
  async parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];

      if (!fs.existsSync(filePath)) {
        reject(new Error(`CSV file not found: ${filePath}`));
        return;
      }

      fs.createReadStream(filePath)
        .pipe(
          csv({
            skipEmptyLines: true,
            trim: true,
          })
        )
        .on('data', (data) => {
          // Clean and process each row
          const cleanedData = this.cleanRowData(data);
          if (this.isValidRow(cleanedData)) {
            results.push(cleanedData);
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(new Error(`Error parsing CSV: ${error.message}`));
        });
    });
  }

  /**
   * Clean and normalize row data
   * @param {object} rowData - Raw row data from CSV
   * @returns {object} Cleaned row data
   */
  cleanRowData(rowData) {
    const cleaned = {};

    Object.keys(rowData).forEach((key) => {
      const cleanKey = key.trim();
      const cleanValue = rowData[key] ? rowData[key].toString().trim() : '';
      cleaned[cleanKey] = cleanValue;
    });

    return cleaned;
  }

  /**
   * Check if row has valid data
   * @param {object} rowData - Row data to validate
   * @returns {boolean} Is row valid
   */
  isValidRow(rowData) {
    // Check if row has at least one non-empty value
    return Object.values(rowData).some((value) => value && value.length > 0);
  }

  /**
   * Validate CSV data based on file type
   * @param {Array} data - CSV data array
   * @param {string} fileName - File name for context
   * @returns {object} Validation result
   */
  validateCSVData(data, fileName) {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        isValid: false,
        error: 'CSV data is empty or invalid',
      };
    }

    // Define required columns for different file types
    const requiredColumns = {
      users: ['username', 'password', 'role'],
      'unit-types': ['name', 'shortName', 'category', 'service'],
      'invalid-credentials': ['username', 'password', 'expectedError'],
    };

    const required = requiredColumns[fileName];
    if (required) {
      return TestUtils.validators.validateDataIntegrity(data, required);
    }

    // Generic validation for unknown file types
    return { isValid: true };
  }

  /**
   * Get specific user data by role
   * @param {string} role - User role to filter by
   * @returns {Promise<Array>} Filtered user data
   */
  async getUsersByRole(role) {
    const users = await this.readCSVData('users');
    return users.filter(
      (user) => user.role.toLowerCase() === role.toLowerCase()
    );
  }

  /**
   * Get specific user by username
   * @param {string} username - Username to find
   * @returns {Promise<object|null>} User data or null
   */
  async getUserByUsername(username) {
    const users = await this.readCSVData('users');
    return users.find((user) => user.username === username) || null;
  }

  /**
   * Get unit types by category
   * @param {string} category - Category to filter by
   * @returns {Promise<Array>} Filtered unit types
   */
  async getUnitTypesByCategory(category) {
    const unitTypes = await this.readCSVData('unit-types');
    return unitTypes.filter(
      (unit) => unit.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get unit types by service
   * @param {string} service - Service to filter by
   * @returns {Promise<Array>} Filtered unit types
   */
  async getUnitTypesByService(service) {
    const unitTypes = await this.readCSVData('unit-types');
    return unitTypes.filter(
      (unit) => unit.service.toLowerCase() === service.toLowerCase()
    );
  }

  /**
   * Get random records from CSV data
   * @param {string} fileName - CSV file name
   * @param {number} count - Number of random records
   * @returns {Promise<Array>} Random records
   */
  async getRandomRecords(fileName, count = 1) {
    const data = await this.readCSVData(fileName);
    const shuffled = TestUtils.testHelpers.shuffleArray(data);
    return shuffled.slice(0, Math.min(count, data.length));
  }

  /**
   * Get paginated data from CSV
   * @param {string} fileName - CSV file name
   * @param {number} page - Page number (1-based)
   * @param {number} pageSize - Records per page
   * @returns {Promise<object>} Paginated data with metadata
   */
  async getPaginatedData(fileName, page = 1, pageSize = 10) {
    const data = await this.readCSVData(fileName);
    const totalRecords = data.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);

    return {
      data: data.slice(startIndex, endIndex),
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalRecords: totalRecords,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Search records by field value
   * @param {string} fileName - CSV file name
   * @param {string} field - Field to search in
   * @param {string} value - Value to search for
   * @param {boolean} exactMatch - Whether to use exact match
   * @returns {Promise<Array>} Matching records
   */
  async searchRecords(fileName, field, value, exactMatch = false) {
    const data = await this.readCSVData(fileName);

    return data.filter((record) => {
      const fieldValue = record[field];
      if (!fieldValue) return false;

      if (exactMatch) {
        return fieldValue.toLowerCase() === value.toLowerCase();
      } else {
        return fieldValue.toLowerCase().includes(value.toLowerCase());
      }
    });
  }

  /**
   * Create test data combinations for parameterized tests
   * @param {Array} dataSets - Array of data set names
   * @returns {Promise<Array>} Combined test data
   */
  async createTestCombinations(dataSets) {
    const combinations = [];
    const dataPromises = dataSets.map((dataSet) => this.readCSVData(dataSet));
    const allData = await Promise.all(dataPromises);

    // Create cartesian product of all data sets
    const cartesian = (...arrays) =>
      arrays.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

    return cartesian(...allData);
  }

  /**
   * Export data to CSV file
   * @param {string} fileName - Output file name
   * @param {Array} data - Data to export
   * @param {Array} headers - CSV headers
   */
  async exportToCSV(fileName, data, headers) {
    const filePath = path.join(this.testDataDir, `${fileName}.csv`);
    await TestUtils.fileUtils.writeCsvFile(filePath, data, headers);
  }

  /**
   * Clear data cache
   * @param {string} fileName - Specific file to clear, or null for all
   */
  clearCache(fileName = null) {
    if (fileName) {
      this.dataCache.delete(fileName);
      console.log(`Cleared cache for: ${fileName}`);
    } else {
      this.dataCache.clear();
      console.log('Cleared all CSV data cache');
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getCacheStats() {
    return {
      cachedFiles: Array.from(this.dataCache.keys()),
      cacheSize: this.dataCache.size,
      totalRecords: Array.from(this.dataCache.values()).reduce(
        (total, data) => total + data.length,
        0
      ),
    };
  }

  /**
   * Validate CSV file structure
   * @param {string} fileName - CSV file name to validate
   * @returns {Promise<object>} Validation result with details
   */
  async validateCSVStructure(fileName) {
    try {
      const data = await this.readCSVData(fileName, false); // Don't use cache
      const validation = this.validateCSVData(data, fileName);

      if (!validation.isValid) {
        return validation;
      }

      // Additional structure validation
      const firstRow = data[0];
      const columns = Object.keys(firstRow);
      const emptyColumns = columns.filter((col) =>
        data.every((row) => !row[col] || row[col].trim() === '')
      );

      return {
        isValid: true,
        recordCount: data.length,
        columns: columns,
        emptyColumns: emptyColumns,
        hasEmptyColumns: emptyColumns.length > 0,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }
}

module.exports = CSVDataDriver;
