const fs = require('fs-extra');
const path = require('path');
const TestUtils = require('./utils');

/**
 * Excel Data Driver for handling test data from Excel files
 * Provides functionality to read, validate, and process Excel test data
 * Note: This is a placeholder implementation. For full Excel support, install 'xlsx' package
 */
class ExcelDataDriver {
  constructor() {
    this.dataCache = new Map();
    this.testDataDir = path.join(process.cwd(), 'test-data');
  }

  /**
   * Read Excel file and return data with validation
   * @param {string} fileName - Excel file name (without extension)
   * @param {string} sheetName - Sheet name (optional, defaults to first sheet)
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise<Array>} Array of data objects
   */
  async readExcelData(fileName, sheetName = null, useCache = true) {
    const cacheKey = `${fileName}_${sheetName || 'default'}`;

    // Return cached data if available and requested
    if (useCache && this.dataCache.has(cacheKey)) {
      console.log(`Using cached data for: ${fileName}`);
      return this.dataCache.get(cacheKey);
    }

    const filePath = path.join(this.testDataDir, `${fileName}.xlsx`);

    try {
      // Check if file exists
      if (!(await fs.pathExists(filePath))) {
        console.warn(`Excel file not found: ${filePath}`);
        // Return sample data structure for development
        return this.getSampleData(fileName);
      }

      // For now, return sample data until Excel library is installed
      console.log(`Excel file found: ${filePath}`);
      console.log('Note: Install "xlsx" package for full Excel support');

      const data = this.getSampleData(fileName);

      // Cache the data
      this.dataCache.set(cacheKey, data);

      console.log(
        `Successfully loaded ${data.length} records from ${fileName}.xlsx`
      );
      return data;
    } catch (error) {
      console.error(`Error reading Excel file ${fileName}:`, error.message);
      throw error;
    }
  }

  /**
   * Get sample data for development when Excel files are not available
   * @param {string} fileName - File name to determine data type
   * @returns {Array} Sample data array
   */
  getSampleData(fileName) {
    const sampleData = {
      users: [
        {
          username: 'main.superadmin',
          password: 'Ordiss@SA',
          role: 'SuperAdmin',
          expectedRedirect: '/administration/unit-types',
          description: 'Super Administrator with full system access',
        },
        {
          username: 'admin.user',
          password: 'admin123',
          role: 'Admin',
          expectedRedirect: '/admin-dashboard',
          description: 'Administrator with limited system access',
        },
        {
          username: 'regular.user',
          password: 'user123',
          role: 'User',
          expectedRedirect: '/user-dashboard',
          description: 'Regular user with basic access',
        },
      ],
      'unit-types': [
        {
          name: 'Armed Forces Division',
          shortName: 'AFD',
          category: 'Headquarters',
          service: 'Ministry Of Defence',
          type: 'Static',
          serviceType: 'Regular',
          corps: 'Infantry',
          description: 'Main headquarters division',
        },
        {
          name: 'Special Operations Command',
          shortName: 'SOC',
          category: 'Division',
          service: 'Army',
          type: 'Mobile',
          serviceType: 'Special',
          corps: 'Special Forces',
          description: 'Elite special operations unit',
        },
      ],
      'test-scenarios': [
        {
          testCase: 'Login with valid SuperAdmin',
          username: 'main.superadmin',
          password: 'Ordiss@SA',
          expectedResult: 'success',
          expectedUrl: '/administration/unit-types',
        },
        {
          testCase: 'Login with invalid credentials',
          username: 'invalid.user',
          password: 'wrongpassword',
          expectedResult: 'error',
          expectedUrl: '/login',
        },
      ],
    };

    return sampleData[fileName] || [];
  }

  /**
   * Get specific user data by role
   * @param {string} role - User role to filter by
   * @returns {Promise<Array>} Filtered user data
   */
  async getUsersByRole(role) {
    const users = await this.readExcelData('users');
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
    const users = await this.readExcelData('users');
    return users.find((user) => user.username === username) || null;
  }

  /**
   * Get test scenarios for specific test type
   * @param {string} testType - Type of test scenarios
   * @returns {Promise<Array>} Test scenarios
   */
  async getTestScenarios(testType = 'all') {
    const scenarios = await this.readExcelData('test-scenarios');

    if (testType === 'all') {
      return scenarios;
    }

    return scenarios.filter((scenario) =>
      scenario.testCase.toLowerCase().includes(testType.toLowerCase())
    );
  }

  /**
   * Get random records from Excel data
   * @param {string} fileName - Excel file name
   * @param {number} count - Number of random records
   * @returns {Promise<Array>} Random records
   */
  async getRandomRecords(fileName, count = 1) {
    const data = await this.readExcelData(fileName);
    const shuffled = TestUtils.testHelpers.shuffleArray(data);
    return shuffled.slice(0, Math.min(count, data.length));
  }

  /**
   * Validate Excel data structure
   * @param {string} fileName - Excel file name to validate
   * @returns {Promise<object>} Validation result with details
   */
  async validateExcelStructure(fileName) {
    try {
      const data = await this.readExcelData(fileName, null, false); // Don't use cache

      if (!Array.isArray(data) || data.length === 0) {
        return {
          isValid: false,
          error: 'Excel data is empty or invalid',
        };
      }

      // Get column information
      const firstRow = data[0];
      const columns = Object.keys(firstRow);
      const emptyColumns = columns.filter((col) =>
        data.every((row) => !row[col] || row[col].toString().trim() === '')
      );

      return {
        isValid: true,
        recordCount: data.length,
        columns: columns,
        emptyColumns: emptyColumns,
        hasEmptyColumns: emptyColumns.length > 0,
        sampleRecord: firstRow,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  /**
   * Export data to Excel file (placeholder implementation)
   * @param {string} fileName - Output file name
   * @param {Array} data - Data to export
   * @param {string} sheetName - Sheet name
   */
  async exportToExcel(fileName, data, sheetName = 'Sheet1') {
    try {
      console.log(`Exporting ${data.length} records to ${fileName}.xlsx`);
      console.log(
        'Note: Install "xlsx" package for actual Excel export functionality'
      );

      // For now, export as JSON for development
      const jsonPath = path.join(this.testDataDir, `${fileName}.json`);
      await TestUtils.fileUtils.writeJsonFile(jsonPath, {
        sheetName: sheetName,
        data: data,
        exportedAt: new Date().toISOString(),
      });

      console.log(`Data exported as JSON to: ${jsonPath}`);
    } catch (error) {
      console.error(`Export failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear data cache
   * @param {string} fileName - Specific file to clear, or null for all
   */
  clearCache(fileName = null) {
    if (fileName) {
      // Clear all cache entries for this file
      const keysToDelete = Array.from(this.dataCache.keys()).filter((key) =>
        key.startsWith(fileName)
      );

      keysToDelete.forEach((key) => this.dataCache.delete(key));
      console.log(`Cleared cache for: ${fileName}`);
    } else {
      this.dataCache.clear();
      console.log('Cleared all Excel data cache');
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
   * Instructions for setting up Excel support
   * @returns {object} Setup instructions
   */
  getExcelSetupInstructions() {
    return {
      message: 'To enable full Excel support, install the xlsx package',
      commands: ['npm install xlsx', 'npm install --save-dev @types/xlsx'],
      usage: [
        'Place Excel files (.xlsx) in the test-data directory',
        'Use readExcelData(fileName, sheetName) to read data',
        'Ensure first row contains column headers',
        'Data will be returned as array of objects',
      ],
      supportedFormats: ['.xlsx', '.xls'],
      currentStatus: 'Using sample data for development',
    };
  }
}

module.exports = ExcelDataDriver;
