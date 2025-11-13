# ORDISS E2E Test Automation Framework

Modern test automation framework built with Playwright for ORDISS application testing.

## ✅ Features

- **One-time Authentication**: Login once, reuse authentication across all tests
- **Page Object Model**: Clean, maintainable test structure  
- **Data-Driven Testing**: CSV-based bulk test execution
- **Environment Configuration**: Secure credential management via .env
- **Playwright Best Practices**: Using getByRole, getByLabel, getByText locators
- **SSL Support**: Configured for internal/self-signed certificates

## 📁 Project Structure

```
ordiss-e2e/
├── pages/                          # Page Object Models
│   ├── auth/
│   │   └── login.page.js          # Login page
│   ├── unit-type/
│   │   ├── unit-type-list.page.js # Unit type list/grid
│   │   └── unit-type-form.page.js # Unit type create/edit form
│   ├── unit/                      # Unit management pages
│   ├── organogram/                # Organogram pages
│   ├── role-permission/           # Role & permission pages
│   └── base.page.js               # Base page with common methods
│
├── tests/                         # Test specifications
│   ├── auth.setup.js             # One-time authentication setup
│   ├── login.spec.js             # Login tests
│   └── unit-type.spec.js         # Unit type CRUD tests
│
├── test-data/                    # Test data files
│   └── unit-types.csv           # Unit type test data
│
├── utils/                        # Utility functions
│   └── csv-reader.js            # CSV file reader
│
├── playwright/.auth/             # Saved authentication state
│   └── user.json                # Reusable auth session
│
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
└── playwright.config.js         # Playwright configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update credentials:

```bash
copy .env.example .env
```

Edit `.env` with your credentials:
```env
BASE_URL=https://10.10.10.10:700
SUPERADMIN_USERNAME=your_username
SUPERADMIN_PASSWORD=your_password
```

### 3. Run Tests

```bash
# Run all tests (uses .env)
npm test

# Run on localhost
npm run test:local

# Run on dev server
npm run test:dev

# Run on staging
npm run test:staging

# Run with UI mode
npm run test:ui

# Run in debug mode
npm run test:debug

# View test report
npm run report
```

## 🌍 Environment Configuration

### Purpose

Environment files let you test against different environments (localhost, dev, staging, production) without changing code. This follows the 12-Factor App methodology and industry best practices.

### Available Environment Files

| File | Purpose | Committed? |
|------|---------|------------|
| `.env` | Your personal default config | ❌ No |
| `.env.example` | Template (no real credentials) | ✅ Yes |
| `.env.local` | Local development (localhost) | ❌ No |
| `.env.dev` | Development server | ❌ No |
| `.env.staging` | Staging server | ❌ No |

### Environment Variables

```env
# Application URL (required)
BASE_URL=https://10.10.10.10:700

# Test Credentials (required)
SUPERADMIN_USERNAME=your_username
SUPERADMIN_PASSWORD=your_password
ADMIN_USERNAME=your_admin
ADMIN_PASSWORD=your_password

# Test Configuration (optional - defaults provided)
HEADLESS=false          # Run with browser visible
TIMEOUT=60000           # Test timeout in ms
RETRIES=2               # Number of retries on failure
WORKERS=4               # Parallel test workers

# Reporting (optional)
SCREENSHOT_MODE=only-on-failure
VIDEO_MODE=retain-on-failure
```

### Switching Environments

**Test on localhost:**
```bash
npm run test:local
# Uses .env.local with BASE_URL=http://localhost:4200
```

**Test on dev server:**
```bash
npm run test:dev
# Uses .env.dev with BASE_URL=https://dev.ordiss.com
```

**Test on staging:**
```bash
npm run test:staging
# Uses .env.staging with BASE_URL=https://staging.ordiss.com
```

**Or temporarily change your .env:**
```env
BASE_URL=http://localhost:3000
```

### Best Practices

✅ **DO:**
- Keep `.env` files out of version control (already in `.gitignore`)
- Use `.env.example` as a template for team members
- Update `.env.example` when adding new variables
- Use environment-specific files for different test targets

❌ **DON'T:**
- Commit real credentials to `.env.example`
- Hardcode URLs in page objects
- Share your personal `.env` file

## 📝 Writing Tests

### Example Test

```javascript
const { test, expect } = require('@playwright/test');
const UnitTypeListPage = require('../pages/unit-type/unit-type-list.page');
const UnitTypeFormPage = require('../pages/unit-type/unit-type-form.page');

test.describe('Unit Type Tests', () => {
  test('should create unit type', async ({ page }) => {
    // Authentication is already handled by auth.setup.js
    const listPage = new UnitTypeListPage(page);
    const formPage = new UnitTypeFormPage(page);

    await listPage.navigate();
    await listPage.clickCreate();
    
    await formPage.fillForm({
      'Name (English)': 'Test Unit',
      'Name (Bangla)': 'টেস্ট ইউনিট',
      'Category': 'Headquarter',
      'Service': 'Bangladesh Army',
      'Type': 'Static'
    });
    
    const success = await formPage.save();
    expect(success).toBeTruthy();
  });
});
```

## 🔐 Authentication

The framework uses a simple approach:

1. **Login tests** (`tests/login.spec.js`) - Test login functionality independently
2. **Other tests** - Login in `beforeEach` hook for isolation
3. **E2E flow test** (`tests/e2e-flow.spec.js`) - Complete flow from login to feature

Each test is independent and can run alone or as part of a suite.

## 📊 Data-Driven Testing

### CSV Test Data

Place test data in `test-data/unit-types.csv`:

```csv
Name (English),Name (Bangla),Category,Service,Type
Test Unit 1,টেস্ট ১,Headquarter,Bangladesh Army,Static
Test Unit 2,টেস্ট ২,Service,Bangladesh Navy,Mobile
```

### Using CSV Data

```javascript
const { readCSV } = require('../utils/csv-reader');

test.beforeAll(async () => {
  testData = await readCSV('./test-data/unit-types.csv');
});

testData.forEach((unitType) => {
  test(`create ${unitType['Name (English)']}`, async ({ page }) => {
    // Test implementation
  });
});
```

## 🎯 Page Objects

### Creating a Page Object

```javascript
const BasePage = require('../base.page');

class MyPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async navigate() {
    await this.page.goto('/my-page');
  }

  async fillForm(data) {
    await this.page.getByLabel('Name').fill(data.name);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}

module.exports = MyPage;
```

### Best Practices

- Use Playwright's built-in locators: `getByRole`, `getByLabel`, `getByText`
- Avoid fragile selectors like IDs or generated classes
- Keep page objects focused on one page/component
- Return meaningful values from methods

## 🛠️ Recording New Selectors

To record interactions and get selectors:

```bash
npx playwright codegen https://10.10.10.10:700 --ignore-https-errors
```

This opens:
1. Browser with your application
2. Inspector showing generated code
3. Record your actions
4. Copy the selectors

## 📋 Available Scripts

| Command | Environment | Description |
|---------|-------------|-------------|
| `npm test` | Default (.env) | Run all tests |
| `npm run test:local` | Localhost | Test on local dev server |
| `npm run test:local:ui` | Localhost + UI | Local testing with UI mode |
| `npm run test:dev` | Dev server | Test on development server |
| `npm run test:staging` | Staging | Test on staging server |
| `npm run test:ui` | Default + UI | Interactive test mode |
| `npm run test:headed` | Default | Run with visible browser |
| `npm run test:debug` | Default + Debug | Step-by-step debugging |
| `npm run report` | - | View last test report |

### Running Specific Tests

```bash
# Run specific test file
npm test tests/unit-type.spec.js

# Run with specific environment
npm run test:local tests/login.spec.js

# Run tests matching pattern
npm test --grep "create"
```

## 🔧 Configuration

### Playwright Config (`playwright.config.js`)

```javascript
module.exports = {
  testDir: './tests',
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL,
    ignoreHTTPSErrors: true,  // For self-signed certs
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,  // Run auth setup first
    },
    {
      name: 'Chromium',
      use: { 
        storageState: 'playwright/.auth/user.json',  // Reuse auth
      },
      dependencies: ['setup'],
    },
  ],
};
```

## 🐛 Debugging

### Debug a specific test

```bash
npx playwright test tests/unit-type.spec.js --debug
```

### View test traces

```bash
npx playwright show-trace trace.zip
```

### Screenshots and videos

Failed tests automatically capture:
- Screenshots: `reports/test-name/test-failed-1.png`
- Videos: `reports/test-name/video.webm`

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)

## 🤝 Contributing

1. Create page objects for new pages
2. Write tests using page objects
3. Use meaningful test names
4. Add test data to CSV files
5. Follow existing patterns

## 📄 License

Internal use only - ORDISS Project
