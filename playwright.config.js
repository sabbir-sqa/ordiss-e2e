// playwright.config.js
require('dotenv').config();

module.exports = {
  testDir: './tests',
  timeout: parseInt(process.env.TIMEOUT) || 60000,
  retries: parseInt(process.env.RETRIES) || 2,
  workers: parseInt(process.env.WORKERS) || 4,

  // Global setup - runs once before all tests
  globalSetup: require.resolve('./tests/global-setup.js'),

  use: {
    baseURL: process.env.BASE_URL || 'https://10.10.10.10:700',
    headless: process.env.HEADLESS === 'true',
    screenshot: process.env.SCREENSHOT_MODE || 'only-on-failure',
    video: process.env.VIDEO_MODE || 'retain-on-failure',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    // Use saved auth state for all tests
    storageState: 'playwright/.auth/user.json',
  },

  reporter: [
    ['html', { outputFolder: process.env.REPORT_PATH || 'reports/html' }],
    ['list'],
  ],

  outputDir: './reports/test-results',
};
