const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');
const faker = require('faker');

/**
 * Utility functions for the Playwright testing framework
 * Provides common functionality for string manipulation, file operations,
 * data generation, and test helpers
 */
class TestUtils {
  /**
   * String manipulation utilities
   */
  static stringUtils = {
    /**
     * Generate random string of specified length
     * @param {number} length - Length of string
     * @param {boolean} includeNumbers - Include numbers
     * @returns {string} Random string
     */
    generateRandomString(length = 10, includeNumbers = true) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const chars = includeNumbers ? letters + numbers : letters;

      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },

    /**
     * Capitalize first letter of string
     * @param {string} str - Input string
     * @returns {string} Capitalized string
     */
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Convert string to kebab-case
     * @param {string} str - Input string
     * @returns {string} Kebab-case string
     */
    toKebabCase(str) {
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
    },

    /**
     * Remove special characters from string
     * @param {string} str - Input string
     * @returns {string} Cleaned string
     */
    removeSpecialChars(str) {
      return str.replace(/[^a-zA-Z0-9\s]/g, '');
    },

    /**
     * Truncate string to specified length
     * @param {string} str - Input string
     * @param {number} length - Max length
     * @returns {string} Truncated string
     */
    truncate(str, length = 50) {
      return str.length > length ? str.substring(0, length) + '...' : str;
    },
  };

  /**
   * Date and time utilities
   */
  static dateUtils = {
    /**
     * Get current timestamp
     * @returns {string} ISO timestamp
     */
    getCurrentTimestamp() {
      return new Date().toISOString();
    },

    /**
     * Format date to readable string
     * @param {Date} date - Date object
     * @param {string} format - Format string
     * @returns {string} Formatted date
     */
    formatDate(date = new Date(), format = 'YYYY-MM-DD') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    },

    /**
     * Add days to date
     * @param {Date} date - Base date
     * @param {number} days - Days to add
     * @returns {Date} New date
     */
    addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },

    /**
     * Get date range
     * @param {number} days - Number of days
     * @returns {object} Date range
     */
    getDateRange(days = 30) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return {
        start: this.formatDate(startDate),
        end: this.formatDate(endDate),
      };
    },
  };

  /**
   * File operation utilities
   */
  static fileUtils = {
    /**
     * Read CSV file and return data
     * @param {string} filePath - Path to CSV file
     * @returns {Promise<Array>} CSV data as array of objects
     */
    async readCsvFile(filePath) {
      return new Promise((resolve, reject) => {
        const results = [];
        const fullPath = path.resolve(filePath);

        if (!fs.existsSync(fullPath)) {
          reject(new Error(`CSV file not found: ${fullPath}`));
          return;
        }

        fs.createReadStream(fullPath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            console.log(
              `Successfully read ${results.length} rows from ${filePath}`
            );
            resolve(results);
          })
          .on('error', (error) => {
            reject(new Error(`Error reading CSV file: ${error.message}`));
          });
      });
    },

    /**
     * Write data to CSV file
     * @param {string} filePath - Output file path
     * @param {Array} data - Data to write
     * @param {Array} headers - CSV headers
     */
    async writeCsvFile(filePath, data, headers) {
      try {
        await fs.ensureDir(path.dirname(filePath));

        let csvContent = headers.join(',') + '\n';
        data.forEach((row) => {
          const values = headers.map((header) => row[header] || '');
          csvContent += values.join(',') + '\n';
        });

        await fs.writeFile(filePath, csvContent);
        console.log(`Successfully wrote ${data.length} rows to ${filePath}`);
      } catch (error) {
        throw new Error(`Error writing CSV file: ${error.message}`);
      }
    },

    /**
     * Read JSON file
     * @param {string} filePath - Path to JSON file
     * @returns {Promise<object>} JSON data
     */
    async readJsonFile(filePath) {
      try {
        const fullPath = path.resolve(filePath);
        const data = await fs.readFile(fullPath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        throw new Error(`Error reading JSON file: ${error.message}`);
      }
    },

    /**
     * Write JSON file
     * @param {string} filePath - Output file path
     * @param {object} data - Data to write
     */
    async writeJsonFile(filePath, data) {
      try {
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`Successfully wrote JSON data to ${filePath}`);
      } catch (error) {
        throw new Error(`Error writing JSON file: ${error.message}`);
      }
    },

    /**
     * Ensure directory exists
     * @param {string} dirPath - Directory path
     */
    async ensureDirectory(dirPath) {
      await fs.ensureDir(dirPath);
    },

    /**
     * Delete file if exists
     * @param {string} filePath - File path
     */
    async deleteFile(filePath) {
      try {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error deleting file: ${error.message}`);
      }
    },
  };

  /**
   * Data generation utilities using Faker.js
   */
  static dataGenerator = {
    /**
     * Generate random user data
     * @returns {object} User data
     */
    generateUserData() {
      return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(12),
        phone: faker.phone.phoneNumber(),
        address: faker.address.streetAddress(),
        city: faker.address.city(),
        country: faker.address.country(),
        zipCode: faker.address.zipCode(),
      };
    },

    /**
     * Generate random unit type data
     * @returns {object} Unit type data
     */
    generateUnitTypeData() {
      const categories = [
        'Headquarters',
        'Division',
        'Brigade',
        'Battalion',
        'Company',
      ];
      const services = ['Army', 'Navy', 'Air Force', 'Marines'];
      const types = ['Static', 'Mobile', 'Reserve'];

      return {
        name: faker.company.companyName() + ' Unit',
        shortName: faker.random.alphaNumeric(3).toUpperCase(),
        category: faker.random.arrayElement(categories),
        service: faker.random.arrayElement(services),
        type: faker.random.arrayElement(types),
        serviceType: faker.random.arrayElement([
          'Regular',
          'Special',
          'Support',
        ]),
        corps: faker.random.arrayElement([
          'Infantry',
          'Artillery',
          'Engineers',
          'Signals',
        ]),
      };
    },

    /**
     * Generate random organization data
     * @returns {object} Organization data
     */
    generateOrganizationData() {
      return {
        name: faker.company.companyName(),
        code: faker.random.alphaNumeric(6).toUpperCase(),
        description: faker.lorem.sentence(),
        established: faker.date.past(10).toISOString().split('T')[0],
        location: faker.address.city(),
        strength: faker.random.number({ min: 50, max: 5000 }),
      };
    },

    /**
     * Generate test data set
     * @param {Function} generator - Data generator function
     * @param {number} count - Number of records
     * @returns {Array} Generated data array
     */
    generateDataSet(generator, count = 10) {
      const data = [];
      for (let i = 0; i < count; i++) {
        data.push(generator());
      }
      return data;
    },
  };

  /**
   * Validation utilities
   */
  static validators = {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    /**
     * Validate phone number format
     * @param {string} phone - Phone to validate
     * @returns {boolean} Is valid phone
     */
    isValidPhone(phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    },

    /**
     * Validate required fields
     * @param {object} data - Data object
     * @param {Array} requiredFields - Required field names
     * @returns {object} Validation result
     */
    validateRequiredFields(data, requiredFields) {
      const missing = [];
      const invalid = [];

      requiredFields.forEach((field) => {
        if (!data[field] || data[field].toString().trim() === '') {
          missing.push(field);
        }
      });

      return {
        isValid: missing.length === 0 && invalid.length === 0,
        missing,
        invalid,
      };
    },

    /**
     * Validate data integrity
     * @param {Array} data - Data array
     * @param {Array} requiredColumns - Required columns
     * @returns {object} Validation result
     */
    validateDataIntegrity(data, requiredColumns) {
      if (!Array.isArray(data) || data.length === 0) {
        return { isValid: false, error: 'Data is empty or not an array' };
      }

      const missingColumns = [];
      const firstRow = data[0];

      requiredColumns.forEach((column) => {
        if (!(column in firstRow)) {
          missingColumns.push(column);
        }
      });

      if (missingColumns.length > 0) {
        return {
          isValid: false,
          error: `Missing required columns: ${missingColumns.join(', ')}`,
        };
      }

      return { isValid: true };
    },
  };

  /**
   * Test helper utilities
   */
  static testHelpers = {
    /**
     * Wait for specified time
     * @param {number} ms - Milliseconds to wait
     */
    async wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    /**
     * Retry function with exponential backoff
     * @param {Function} fn - Function to retry
     * @param {number} maxRetries - Maximum retry attempts
     * @param {number} delay - Initial delay in ms
     * @returns {Promise} Function result
     */
    async retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
      let lastError;

      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          if (i < maxRetries - 1) {
            await this.wait(delay * Math.pow(2, i));
          }
        }
      }

      throw lastError;
    },

    /**
     * Generate unique test ID
     * @returns {string} Unique test ID
     */
    generateTestId() {
      return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Clean up test data
     * @param {Array} cleanupTasks - Array of cleanup functions
     */
    async cleanupTestData(cleanupTasks) {
      for (const task of cleanupTasks) {
        try {
          await task();
        } catch (error) {
          console.error(`Cleanup task failed: ${error.message}`);
        }
      }
    },

    /**
     * Compare objects for equality
     * @param {object} obj1 - First object
     * @param {object} obj2 - Second object
     * @returns {boolean} Are objects equal
     */
    deepEqual(obj1, obj2) {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    },

    /**
     * Get random element from array
     * @param {Array} array - Input array
     * @returns {*} Random element
     */
    getRandomElement(array) {
      return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Shuffle array
     * @param {Array} array - Input array
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
  };

  /**
   * Environment utilities
   */
  static envUtils = {
    /**
     * Get environment variable with default
     * @param {string} key - Environment variable key
     * @param {string} defaultValue - Default value
     * @returns {string} Environment variable value
     */
    getEnvVar(key, defaultValue = '') {
      return process.env[key] || defaultValue;
    },

    /**
     * Check if running in CI environment
     * @returns {boolean} Is CI environment
     */
    isCI() {
      return process.env.CI === 'true' || process.env.CI === true;
    },

    /**
     * Get current environment
     * @returns {string} Environment name
     */
    getCurrentEnvironment() {
      return process.env.NODE_ENV || 'development';
    },

    /**
     * Load environment configuration
     * @param {string} env - Environment name
     * @returns {object} Environment configuration
     */
    loadEnvironmentConfig(env = 'development') {
      const configs = {
        development: {
          baseURL: 'https://10.10.10.10:700',
          timeout: 30000,
          retries: 1,
          headless: false,
        },
        staging: {
          baseURL: 'https://staging.ordiss.com',
          timeout: 45000,
          retries: 2,
          headless: true,
        },
        production: {
          baseURL: 'https://prod.ordiss.com',
          timeout: 60000,
          retries: 3,
          headless: true,
        },
      };

      return configs[env] || configs.development;
    },
  };
}

module.exports = TestUtils;
