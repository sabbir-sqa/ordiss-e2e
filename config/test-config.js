const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

/**
 * Test Configuration Manager
 * Handles environment-specific configurations and settings
 */
class TestConfig {
  constructor() {
    this.currentEnv = process.env.NODE_ENV || 'development';
    this.configCache = new Map();
    this.loadConfiguration();
  }

  /**
   * Load configuration based on current environment
   */
  loadConfiguration() {
    try {
      // Load base configuration
      this.baseConfig = this.getBaseConfiguration();

      // Load environment-specific configuration
      this.envConfig = this.getEnvironmentConfiguration(this.currentEnv);

      // Load user data configuration
      this.userData = this.loadUserDataConfiguration();

      // Merge configurations
      this.config = this.mergeConfigurations();

      console.log(`Configuration loaded for environment: ${this.currentEnv}`);
    } catch (error) {
      console.error('Error loading configuration:', error.message);
      throw error;
    }
  }

  /**
   * Get base configuration settings
   * @returns {object} Base configuration
   */
  getBaseConfiguration() {
    return {
      // Application settings
      app: {
        name: 'ORDISS Automation Framework',
        version: '1.0.0',
        description: 'Enterprise Playwright Testing Framework for ORDISS',
      },

      // Default timeouts
      timeouts: {
        default: parseInt(process.env.TIMEOUT) || 30000,
        short: 5000,
        long: 60000,
        navigation: 30000,
        element: 10000,
        api: 15000,
      },

      // Retry settings
      retries: {
        default: parseInt(process.env.RETRIES) || 2,
        flaky: 3,
        critical: 1,
        api: 3,
      },

      // Browser settings
      browser: {
        headless: process.env.HEADLESS === 'true',
        slowMo: parseInt(process.env.SLOW_MO) || 0,
        devtools: process.env.DEVTOOLS === 'true',
        viewport: {
          width: 1920,
          height: 1080,
        },
        ignoreHTTPSErrors: true,
        acceptDownloads: true,
      },

      // Parallel execution
      parallel: {
        workers: parseInt(process.env.WORKERS) || 4,
        fullyParallel: true,
        forbidOnly: process.env.CI === 'true',
      },

      // Reporting settings
      reporting: {
        html: {
          enabled: true,
          outputFolder: process.env.REPORT_PATH || './playwright-report',
          open: process.env.CI === 'true' ? 'never' : 'on-failure',
        },
        json: {
          enabled: true,
          outputFile: './test-results/results.json',
        },
        junit: {
          enabled: true,
          outputFile: './test-results/results.xml',
        },
        screenshots: {
          mode: process.env.SCREENSHOT_MODE || 'only-on-failure',
          fullPage: true,
        },
        videos: {
          mode: process.env.VIDEO_MODE || 'retain-on-failure',
          quality: 'medium',
        },
        trace: {
          mode: 'on-first-retry',
          screenshots: true,
          snapshots: true,
        },
      },

      // Test data settings
      testData: {
        directory: './test-data',
        cacheEnabled: true,
        validation: true,
        cleanup: true,
      },

      // Logging settings
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        directory: './test-results/logs',
        console: true,
        file: true,
        timestamp: true,
      },
    };
  }

  /**
   * Get environment-specific configuration
   * @param {string} environment - Environment name
   * @returns {object} Environment configuration
   */
  getEnvironmentConfiguration(environment) {
    const environments = {
      development: {
        baseURL: process.env.BASE_URL || 'https://10.10.10.10:700',
        name: 'Development Environment',
        database: {
          host: 'localhost',
          port: 5432,
          name: 'ordiss_dev',
        },
        api: {
          baseURL: 'https://10.10.10.10:700/api',
          timeout: 30000,
        },
        features: {
          debugMode: true,
          mockData: true,
          skipCleanup: true,
        },
      },

      staging: {
        baseURL: process.env.STAGING_URL || 'https://staging.ordiss.com',
        name: 'Staging Environment',
        database: {
          host: 'staging-db.ordiss.com',
          port: 5432,
          name: 'ordiss_staging',
        },
        api: {
          baseURL: 'https://staging.ordiss.com/api',
          timeout: 45000,
        },
        features: {
          debugMode: false,
          mockData: false,
          skipCleanup: false,
        },
      },

      production: {
        baseURL: process.env.PROD_URL || 'https://prod.ordiss.com',
        name: 'Production Environment',
        database: {
          host: 'prod-db.ordiss.com',
          port: 5432,
          name: 'ordiss_prod',
        },
        api: {
          baseURL: 'https://prod.ordiss.com/api',
          timeout: 60000,
        },
        features: {
          debugMode: false,
          mockData: false,
          skipCleanup: false,
        },
      },

      ci: {
        baseURL: process.env.CI_BASE_URL || 'https://ci.ordiss.com',
        name: 'CI Environment',
        database: {
          host: 'ci-db.ordiss.com',
          port: 5432,
          name: 'ordiss_ci',
        },
        api: {
          baseURL: 'https://ci.ordiss.com/api',
          timeout: 30000,
        },
        features: {
          debugMode: false,
          mockData: true,
          skipCleanup: true,
        },
      },
    };

    return environments[environment] || environments.development;
  }

  /**
   * Load user data configuration from JSON file
   * @returns {object} User data configuration
   */
  loadUserDataConfiguration() {
    try {
      const userDataPath = path.join(process.cwd(), 'utils', 'userData.json');
      if (fs.existsSync(userDataPath)) {
        const userData = fs.readJsonSync(userDataPath);
        return userData;
      }
      return {};
    } catch (error) {
      console.warn('Could not load user data configuration:', error.message);
      return {};
    }
  }

  /**
   * Merge all configurations into final config
   * @returns {object} Merged configuration
   */
  mergeConfigurations() {
    return {
      ...this.baseConfig,
      environment: this.envConfig,
      userData: this.userData,
      current: {
        environment: this.currentEnv,
        baseURL: this.envConfig.baseURL,
        isCI: process.env.CI === 'true',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Get configuration value by path
   * @param {string} path - Configuration path (e.g., 'timeouts.default')
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Configuration value
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Set configuration value by path
   * @param {string} path - Configuration path
   * @param {*} value - Value to set
   */
  set(path, value) {
    const keys = path.split('.');
    let current = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Get user credentials by role
   * @param {string} role - User role
   * @returns {object|null} User credentials
   */
  getUserCredentials(role = 'superadmin') {
    const users = this.get('userData.users', {});
    return users[role.toLowerCase()] || null;
  }

  /**
   * Get environment URL
   * @param {string} environment - Environment name (optional)
   * @returns {string} Environment URL
   */
  getEnvironmentURL(environment = null) {
    const env = environment || this.currentEnv;
    return (
      this.get(`userData.environments.${env}.baseURL`) ||
      this.get('environment.baseURL')
    );
  }

  /**
   * Get test timeout for specific operation
   * @param {string} operation - Operation type
   * @returns {number} Timeout in milliseconds
   */
  getTimeout(operation = 'default') {
    return this.get(
      `timeouts.${operation}`,
      this.get('timeouts.default', 30000)
    );
  }

  /**
   * Get retry count for specific operation
   * @param {string} operation - Operation type
   * @returns {number} Retry count
   */
  getRetryCount(operation = 'default') {
    return this.get(`retries.${operation}`, this.get('retries.default', 2));
  }

  /**
   * Check if feature is enabled
   * @param {string} feature - Feature name
   * @returns {boolean} Is feature enabled
   */
  isFeatureEnabled(feature) {
    return this.get(`environment.features.${feature}`, false);
  }

  /**
   * Get browser configuration
   * @returns {object} Browser configuration
   */
  getBrowserConfig() {
    return this.get('browser', {});
  }

  /**
   * Get reporting configuration
   * @returns {object} Reporting configuration
   */
  getReportingConfig() {
    return this.get('reporting', {});
  }

  /**
   * Get parallel execution configuration
   * @returns {object} Parallel configuration
   */
  getParallelConfig() {
    return this.get('parallel', {});
  }

  /**
   * Export configuration to JSON file
   * @param {string} filePath - Output file path
   */
  async exportConfig(filePath) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, this.config, { spaces: 2 });
      console.log(`Configuration exported to: ${filePath}`);
    } catch (error) {
      console.error('Error exporting configuration:', error.message);
      throw error;
    }
  }

  /**
   * Validate configuration
   * @returns {object} Validation result
   */
  validateConfig() {
    const errors = [];
    const warnings = [];

    // Validate required settings
    if (!this.get('environment.baseURL')) {
      errors.push('Base URL is not configured');
    }

    if (!this.get('userData.users.superadmin')) {
      errors.push('SuperAdmin user credentials not configured');
    }

    // Validate timeout values
    const timeouts = this.get('timeouts', {});
    Object.entries(timeouts).forEach(([key, value]) => {
      if (typeof value !== 'number' || value <= 0) {
        warnings.push(`Invalid timeout value for ${key}: ${value}`);
      }
    });

    // Validate retry values
    const retries = this.get('retries', {});
    Object.entries(retries).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0) {
        warnings.push(`Invalid retry value for ${key}: ${value}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get configuration summary
   * @returns {object} Configuration summary
   */
  getConfigSummary() {
    return {
      environment: this.currentEnv,
      baseURL: this.get('environment.baseURL'),
      headless: this.get('browser.headless'),
      workers: this.get('parallel.workers'),
      timeout: this.get('timeouts.default'),
      retries: this.get('retries.default'),
      features: this.get('environment.features', {}),
      timestamp: this.get('current.timestamp'),
    };
  }

  /**
   * Reload configuration
   */
  reload() {
    this.configCache.clear();
    this.loadConfiguration();
    console.log('Configuration reloaded');
  }
}

// Export singleton instance
module.exports = new TestConfig();
