const { chromium } = require('@playwright/test');
const TestConfig = require('../config/test-config');
const CSVDataDriver = require('../utils/csvDataDriver');
const TestUtils = require('../utils/utils');
const fs = require('fs-extra');
const path = require('path');

/**
 * Global setup for Playwright test suite
 * Runs once before all tests to prepare the testing environment
 */
async function globalSetup(config) {
  console.log('🚀 Starting ORDISS Playwright Framework Global Setup...');

  try {
    // Initialize configuration
    const testConfig = TestConfig;
    console.log(
      `📋 Configuration loaded for environment: ${testConfig.currentEnv}`
    );

    // Validate configuration
    const configValidation = testConfig.validateConfig();
    if (!configValidation.isValid) {
      console.error('❌ Configuration validation failed:');
      configValidation.errors.forEach((error) =>
        console.error(`   - ${error}`)
      );
      throw new Error('Invalid configuration');
    }

    if (configValidation.warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      configValidation.warnings.forEach((warning) =>
        console.warn(`   - ${warning}`)
      );
    }

    // Create necessary directories
    await createDirectories();

    // Validate test data
    await validateTestData();

    // Setup browser for initial checks
    await setupBrowserEnvironment(testConfig);

    // Log setup completion
    console.log('✅ Global setup completed successfully');
    console.log(`📊 Setup Summary:`);
    console.log(`   - Environment: ${testConfig.currentEnv}`);
    console.log(`   - Base URL: ${testConfig.get('environment.baseURL')}`);
    console.log(`   - Headless: ${testConfig.get('browser.headless')}`);
    console.log(`   - Workers: ${testConfig.get('parallel.workers')}`);
    console.log(`   - Timeout: ${testConfig.get('timeouts.default')}ms`);

    return testConfig.getConfigSummary();
  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  }
}

/**
 * Create necessary directories for test execution
 */
async function createDirectories() {
  console.log('📁 Creating necessary directories...');

  const directories = [
    'test-results',
    'test-results/screenshots',
    'test-results/logs',
    'test-results/videos',
    'test-results/traces',
    'playwright-report',
    'playwright/.auth',
  ];

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    await fs.ensureDir(dirPath);
    console.log(`   ✓ Created/verified directory: ${dir}`);
  }
}

/**
 * Validate test data files
 */
async function validateTestData() {
  console.log('📋 Validating test data files...');

  const csvDriver = new CSVDataDriver();
  const testDataFiles = ['users', 'unit-types', 'invalid-credentials'];

  for (const fileName of testDataFiles) {
    try {
      const validation = await csvDriver.validateCSVStructure(fileName);

      if (validation.isValid) {
        console.log(
          `   ✓ ${fileName}.csv: ${validation.recordCount} records, ${validation.columns.length} columns`
        );

        if (validation.hasEmptyColumns) {
          console.warn(
            `   ⚠️  ${fileName}.csv has empty columns: ${validation.emptyColumns.join(
              ', '
            )}`
          );
        }
      } else {
        console.error(
          `   ❌ ${fileName}.csv validation failed: ${validation.error}`
        );
        throw new Error(`Test data validation failed for ${fileName}.csv`);
      }
    } catch (error) {
      console.error(`   ❌ Error validating ${fileName}.csv: ${error.message}`);
      throw error;
    }
  }

  // Validate specific user data
  await validateUserCredentials(csvDriver);
}

/**
 * Validate user credentials in test data
 */
async function validateUserCredentials(csvDriver) {
  console.log('👤 Validating user credentials...');

  try {
    const users = await csvDriver.readCSVData('users');
    const testConfig = TestConfig;

    // Check if SuperAdmin user exists
    const superAdminUser = testConfig.getUserCredentials('superadmin');
    if (!superAdminUser) {
      throw new Error('SuperAdmin user not found in configuration');
    }

    // Verify SuperAdmin exists in CSV data
    const superAdminInCSV = users.find(
      (user) => user.username === superAdminUser.username
    );
    if (!superAdminInCSV) {
      console.warn(
        `   ⚠️  SuperAdmin user ${superAdminUser.username} not found in users.csv`
      );
    } else {
      console.log(`   ✓ SuperAdmin user verified: ${superAdminUser.username}`);
    }

    // Validate required fields for all users
    const requiredFields = ['username', 'password', 'role', 'expectedRedirect'];
    for (const user of users) {
      const validation = TestUtils.validators.validateRequiredFields(
        user,
        requiredFields
      );
      if (!validation.isValid) {
        console.warn(
          `   ⚠️  User ${
            user.username
          } missing fields: ${validation.missing.join(', ')}`
        );
      }
    }

    console.log(`   ✓ Validated ${users.length} user records`);
  } catch (error) {
    console.error(`   ❌ User credentials validation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Setup browser environment and verify connectivity
 */
async function setupBrowserEnvironment(testConfig) {
  console.log('🌐 Setting up browser environment...');

  let browser;
  try {
    // Launch browser for connectivity check
    browser = await chromium.launch({
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
    });

    const page = await context.newPage();

    // Test connectivity to ORDISS application
    const baseURL = testConfig.get('environment.baseURL');
    console.log(`   🔗 Testing connectivity to: ${baseURL}`);

    try {
      const response = await page.goto(baseURL, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      if (response.ok()) {
        console.log(`   ✓ Successfully connected to ORDISS application`);
        console.log(`   📊 Response status: ${response.status()}`);
      } else {
        console.warn(`   ⚠️  Received non-OK response: ${response.status()}`);
      }

      // Check if login page is accessible
      await page.goto(`${baseURL}/login`, {
        waitUntil: 'networkidle',
        timeout: 15000,
      });
      console.log(`   ✓ Login page is accessible`);
    } catch (error) {
      console.error(`   ❌ Connectivity test failed: ${error.message}`);
      console.warn(
        `   ⚠️  This may cause test failures. Please verify ORDISS application is running.`
      );
    }

    await context.close();
  } catch (error) {
    console.error(`   ❌ Browser setup failed: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Log environment information
 */
function logEnvironmentInfo() {
  console.log('🔧 Environment Information:');
  console.log(`   - Node.js: ${process.version}`);
  console.log(`   - Platform: ${process.platform}`);
  console.log(`   - Architecture: ${process.arch}`);
  console.log(`   - Working Directory: ${process.cwd()}`);
  console.log(
    `   - CI Environment: ${process.env.CI === 'true' ? 'Yes' : 'No'}`
  );

  // Log memory usage
  const memUsage = process.memoryUsage();
  console.log(
    `   - Memory Usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
  );
}

/**
 * Create initial log entry
 */
async function createInitialLogEntry() {
  const logDir = path.join(process.cwd(), 'test-results', 'logs');
  const logFile = path.join(
    logDir,
    `setup-${new Date().toISOString().split('T')[0]}.log`
  );

  const logEntry = [
    `[${new Date().toISOString()}] ORDISS Playwright Framework - Global Setup Started`,
    `Environment: ${process.env.NODE_ENV || 'development'}`,
    `Base URL: ${process.env.BASE_URL || 'https://10.10.10.10:700'}`,
    `Headless: ${process.env.HEADLESS || 'false'}`,
    `Workers: ${process.env.WORKERS || '4'}`,
    `CI: ${process.env.CI || 'false'}`,
    '--- Setup Log ---',
  ].join('\n');

  await fs.appendFile(logFile, logEntry + '\n');
}

// Main setup function
module.exports = async function (config) {
  // Log environment info
  logEnvironmentInfo();

  // Create initial log entry
  await createInitialLogEntry();

  // Run global setup
  return await globalSetup(config);
};
