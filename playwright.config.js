// config/playwright.config.js
const path = require('path');

module.exports = {
  testDir: './tests',
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL || 'https://10.10.10.10:700/', // ← change as needed
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  reporter: [['html'], ['list']],
  projects: [
    {
      name: 'Chromium',
      use: { browserName: 'chromium' },
    },
    // Uncomment for cross-browser:
    // { name: 'Firefox', use: { browserName: 'firefox' } },
    // { name: 'WebKit', use: { browserName: 'webkit' } },
  ],
  outputDir: './reports/',
};
