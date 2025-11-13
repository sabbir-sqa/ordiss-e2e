// playwright.config.js
require('dotenv').config();

module.exports = {
  testDir: './tests',
  timeout: 60000,

  // Global setup - runs once before all tests
  globalSetup: require.resolve('./tests/global-setup.js'),

  use: {
    baseURL: process.env.BASE_URL || 'https://10.10.10.10:700',
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    // Use saved auth state for all tests
    storageState: 'playwright/.auth/user.json',
  },

  reporter: [['html', { outputFolder: 'reports/html' }], ['list']],

  outputDir: './reports/test-results',
};
