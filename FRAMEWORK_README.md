# ORDISS Playwright Testing Framework

A minimal, focused Playwright testing framework for the ORDISS application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Run Tests
```bash
# Run login tests
npx playwright test tests/login.spec.js --headed

# Run navigation tests  
npx playwright test tests/navigation.spec.js --headed

# Run all tests
npx playwright test --headed
```

### 3. Record New Tests
```bash
# Start recording from login page
npx playwright codegen https://10.10.10.10:700/login --ignore-https-errors
```

## 📁 Framework Structure

```
ordiss-playwright-framework/
├── pages/                     # Page Object Models
│   ├── BasePage.js           # Common page functionality
│   ├── LoginPage.js          # ORDISS login page
│   └── UnitTypesPage.js      # Unit Types administration
├── tests/                    # Test files
│   ├── login.spec.js         # Login functionality tests
│   └── navigation.spec.js    # Navigation and exploration tests
├── utils/                    # Utilities
│   ├── excelDataDriver.js    # Excel data handling
│   └── utils.js              # Common utilities
├── test-data/                # Test data files
│   └── (place Excel files here)
└── test-results/             # Test outputs
    ├── screenshots/
    └── logs/
```

## 🔧 Key Components

### **BasePage Class**
- Common functionality for all pages
- Automatic logging and screenshots
- Element interaction methods
- Error handling

### **LoginPage Class**
- ORDISS-specific login handling
- Angular Material component support
- Form validation
- Success/error verification

### **UnitTypesPage Class**
- Unit Types module functionality
- Create, search, and navigation
- Form handling for CRUD operations

### **ExcelDataDriver**
- Excel file support (install xlsx package)
- Sample data for development
- Data validation and caching

## 📊 Test Data

### Excel Support
Place Excel files in `test-data/` directory:
- `users.xlsx` - User credentials and roles
- `unit-types.xlsx` - Unit type test data
- `test-scenarios.xlsx` - Test scenarios

### Sample Data Structure
The framework includes sample data for development:
```javascript
// Users
{
  username: 'main.superadmin',
  password: 'Ordiss@SA',
  role: 'SuperAdmin',
  expectedRedirect: '/administration/unit-types'
}

// Test Scenarios
{
  testCase: 'Login with valid SuperAdmin',
  username: 'main.superadmin',
  password: 'Ordiss@SA',
  expectedResult: 'success'
}
```

## 🎯 Current Test Coverage

### ✅ Login Tests (`login.spec.js`)
- SuperAdmin login validation
- Form element verification
- Invalid credentials handling
- Excel data-driven testing

### ✅ Navigation Tests (`navigation.spec.js`)
- Unit Types page navigation
- Search functionality
- Navigation exploration
- Placeholder for recorded actions

## 📝 Adding New Tests

### 1. Using Codegen (Recommended)
```bash
# Record actions starting from login
npx playwright codegen https://10.10.10.10:700/login --ignore-https-errors

# Copy generated code to navigation.spec.js "recorded actions" test
```

### 2. Manual Test Creation
```javascript
test('my new test', async ({ page }) => {
  // Login is handled in beforeEach
  
  // Add your test steps
  await page.click('button:has-text("Create")');
  await page.fill('input[name="name"]', 'Test Data');
  
  // Verify results
  expect(await page.textContent('.success')).toContain('Created');
});
```

## 🔍 Debugging

### Screenshots
- Automatic screenshots on test failures
- Manual screenshots: `await page.screenshot({ path: 'debug.png' })`

### Logs
- All actions logged with timestamps
- Check `test-results/logs/` for detailed logs

### Debug Mode
```bash
# Run in debug mode
npx playwright test --debug

# Run with UI mode
npx playwright test --ui
```

## 🌐 ORDISS System Details

- **URL**: `https://10.10.10.10:700`
- **Login**: `/login`
- **SuperAdmin**: `main.superadmin` / `Ordiss@SA`
- **After Login**: Redirects to `/administration/unit-types`
- **Technology**: Angular Material components

## 📈 Next Steps

1. **Record more actions** using codegen
2. **Add Excel test data** files
3. **Extend to other ORDISS modules**
4. **Set up CI/CD** with GitHub Actions
5. **Add more page objects** as needed

## 🆘 Common Issues

### Login Issues
- Ensure ORDISS system is running
- Check credentials in Excel data
- Verify network connectivity

### Element Not Found
- Use codegen to get correct selectors
- Check for Angular Material components
- Wait for page load: `await page.waitForLoadState('networkidle')`

### Excel Data
- Install xlsx package: `npm install xlsx`
- Place Excel files in `test-data/` directory
- Use sample data for development

---

**🎉 Your minimal ORDISS Playwright framework is ready!**