# ORDISS Playwright Testing Framework

A clean, minimal Playwright testing framework for the ORDISS application.

## 📁 Project Structure

```
ordiss-playwright-framework/
├── pages/                          # Page Object Models
│   ├── BasePage.js                 # Common functionality
│   ├── LoginPage.js                # Login page
│   ├── UnitTypesPage.js            # Unit Types module
│   ├── OrganogramPage.js           # Organogram module
│   ├── UnitsPage.js                # Units module
│   ├── PermissionGroupsPage.js     # Permission Groups
│   └── PermissionsPage.js          # Permissions
│
├── tests/                          # Test files
│   ├── login.spec.js               # Login tests
│   ├── unit-types.spec.js          # Unit Types tests
│   ├── organogram.spec.js          # Organogram tests
│   ├── units.spec.js               # Units tests
│   ├── permission-groups.spec.js   # Permission Groups tests
│   └── permissions.spec.js         # Permissions tests
│
├── utils/                          # Utilities
│   ├── utils.js                    # Common utilities
│   ├── excelDataDriver.js          # Excel data handling
│   └── userData.json               # User configuration
│
├── config/                         # Configuration
│   └── test-config.js              # Test configuration
│
├── test-data/                      # Test data (Excel files)
│
└── test-results/                   # Test outputs
    ├── screenshots/
    ├── logs/
    └── videos/
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Run Tests
```bash
# Run all tests
npx playwright test --headed

# Run specific module
npx playwright test tests/login.spec.js --headed
npx playwright test tests/unit-types.spec.js --headed
```

### 3. Record Actions
```bash
npx playwright codegen https://10.10.10.10:700/login --ignore-https-errors
```

## 📝 Available Commands

```bash
# Run tests
npm test                              # Run all tests
npx playwright test --headed          # Run with browser visible
npx playwright test --debug           # Debug mode
npx playwright test --ui              # UI mode

# Run specific tests
npx playwright test tests/login.spec.js --headed
npx playwright test tests/unit-types.spec.js --headed
npx playwright test tests/organogram.spec.js --headed
npx playwright test tests/units.spec.js --headed
npx playwright test tests/permission-groups.spec.js --headed
npx playwright test tests/permissions.spec.js --headed

# View reports
npx playwright show-report            # View HTML report

# Record actions
npx playwright codegen https://10.10.10.10:700/login --ignore-https-errors
```

## 🎯 Test Structure

Each test file includes:
- **@smoke** - Basic page load verification
- **@functional** - Feature testing
- **@data-driven** - Excel data integration
- **@recorded** - Placeholder for codegen actions

## 📊 Excel Data Support

### Your Excel File Structure
Place your `unit-types.xlsx` in `test-data/` folder with these columns:
- **Name (English)** - English name
- **Name (Bangla)** - Bangla name  
- **Short Name (English)** - English short name
- **Short Name (Bangla)** - Bangla short name
- **Category** - Category
- **Service** - Service
- **Type** - Type
- **Is Depot** - Yes/No
- **Is Workshop** - Yes/No
- **Corps Names (English)** - Corps name

### Automatic Features
✅ **Duplicate name handling** - Automatically adds extensions (002, 003, etc.)  
✅ **Data preservation** - Saves test data back to Excel after execution  
✅ **First-time execution** - Use your real data immediately  
✅ **Reusable tests** - Run multiple times with different data

## 🔧 ORDISS System Details

- **URL**: `https://10.10.10.10:700`
- **SuperAdmin**: `main.superadmin` / `Ordiss@SA`

## 📖 Adding Recorded Actions

1. Run codegen: `npx playwright codegen https://10.10.10.10:700/login --ignore-https-errors`
2. Perform your actions in the browser
3. Copy the generated code
4. Paste into the `@recorded` test in the appropriate test file

Example:
```javascript
test('should perform recorded actions @recorded', async ({ page }) => {
  // Paste your recorded code here
  await page.click('button:has-text("Create")');
  await page.fill('input[name="name"]', 'Test Data');
  await page.click('button:has-text("Save")');
});
```

## 🎨 Page Object Pattern

Each page object extends `BasePage` and includes:
- Selectors for page elements
- Navigation methods
- Action methods (create, search, etc.)
- Utility methods (screenshots, logging)

## 🆘 Troubleshooting

### Connection Timeout
Ensure ORDISS system is running at `https://10.10.10.10:700`

### Element Not Found
- Use codegen to get correct selectors
- Wait for page load: `await page.waitForLoadState('networkidle')`

### Excel File Not Found
Framework uses sample data automatically. Add Excel files when ready.

---

**🎉 Your minimal ORDISS Playwright framework is ready!**