# 🎯 ORDISS Test Execution Workflow Guide

## 📋 Your Excel File Structure

Your `unit-types.xlsx` should have these columns:
- **Name (English)** - English name of unit type
- **Name (Bangla)** - Bangla name of unit type
- **Short Name (English)** - English short name
- **Short Name (Bangla)** - Bangla short name
- **Category** - Category (e.g., Headquarters, Division)
- **Service** - Service (e.g., Army, Navy)
- **Type** - Type (e.g., Static, Mobile)
- **Is Depot** - Yes/No
- **Is Workshop** - Yes/No
- **Corps Names (English)** - Corps name

## 🚀 First-Time Execution Workflow

### Step 1: Prepare Your Excel File
```bash
# Place your unit-types.xlsx file in test-data/ folder
test-data/
└── unit-types.xlsx
```

### Step 2: Install Dependencies
```bash
npm install
npx playwright install
```

### Step 3: Record Your Actions
```bash
# Start recording from login
npx playwright codegen https://10.10.10.10:700/login --ignore-https-errors
```

**What to record:**
1. Login with `main.superadmin` / `Ordiss@SA`
2. Navigate to Unit Types
3. Click "Create Unit Type" button
4. Fill in the form with sample data
5. Click "Save" button
6. Verify success message

### Step 4: Add Recorded Code to Test

Copy the generated code and paste it into `tests/unit-types.spec.js`:

```javascript
test('should create unit type with Excel data @data-driven', async ({ page }) => {
  // ... existing code ...
  
  // PASTE YOUR RECORDED CODE HERE
  // Replace hardcoded values with testData variables
  
  // Example:
  await page.fill('input[name="nameEnglish"]', testData['Name (English)']);
  await page.fill('input[name="nameBangla"]', testData['Name (Bangla)']);
  await page.fill('input[name="shortNameEnglish"]', testData['Short Name (English)']);
  await page.fill('input[name="shortNameBangla"]', testData['Short Name (Bangla)']);
  
  // For dropdowns, use the data from Excel
  await page.selectOption('select[name="category"]', testData['Category']);
  await page.selectOption('select[name="service"]', testData['Service']);
  await page.selectOption('select[name="type"]', testData['Type']);
  
  // For checkboxes
  if (testData['Is Depot'] === 'Yes') {
    await page.check('input[name="isDepot"]');
  }
  if (testData['Is Workshop'] === 'Yes') {
    await page.check('input[name="isWorkshop"]');
  }
  
  // Save the form
  await page.click('button:has-text("Save")');
  
  // Wait for success
  await page.waitForTimeout(2000);
  
  // Save data to Excel after successful creation
  await executionHelper.saveExecutionData('unit-types', testData, true);
});
```

### Step 5: Run Your Test
```bash
# Run with browser visible
npx playwright test tests/unit-types.spec.js --headed

# Run specific test
npx playwright test tests/unit-types.spec.js --grep @data-driven --headed
```

## 🔄 How It Works

### 1. **First Execution**
- Test reads data from your Excel file
- Checks if name already exists
- If exists, adds extension (e.g., "Unit Name-002")
- Executes test with unique data
- After success, saves data back to Excel

### 2. **Subsequent Executions**
- Test reads data from Excel
- Uses existing data for testing
- Automatically handles duplicate names
- Updates Excel with new test data

## 🎨 Duplicate Name Handling

The framework automatically handles duplicate names:

```javascript
// Original name: "Armed Forces Division"
// If exists, becomes: "Armed Forces Division-002"
// If that exists: "Armed Forces Division-003"
// And so on...
```

This ensures:
- ✅ No duplicate entries in ORDISS
- ✅ All test data is preserved in Excel
- ✅ Tests can run multiple times

## 📊 Excel Data Flow

```
┌─────────────────┐
│  Your Excel     │
│  unit-types.xlsx│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ExcelHelper    │
│  • Read data    │
│  • Check dupes  │
│  • Add extension│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Test Execution │
│  • Use data     │
│  • Fill forms   │
│  • Submit       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to Excel  │
│  • Append data  │
│  • Update file  │
└─────────────────┘
```

## 🔧 Helper Functions Available

### ExcelHelper
```javascript
// Read Excel file
const data = await excelHelper.readExcel('unit-types');

// Write to Excel
await excelHelper.writeExcel('unit-types', data);

// Append to Excel
await excelHelper.appendToExcel('unit-types', [newData]);

// Check if name exists
const exists = excelHelper.nameExists(data, 'Name (English)', 'Test Name');

// Generate unique name
const uniqueName = excelHelper.generateUniqueName(data, 'Name (English)', 'Test Name');
```

### TestExecutionHelper
```javascript
// Prepare data for first-time execution
const preparedData = await executionHelper.prepareFirstTimeData('unit-types', realData);

// Save execution data after test
await executionHelper.saveExecutionData('unit-types', testData, true);

// Print guidance
executionHelper.printGuidance('unit-types');
```

## 📝 Example Test Data

Your Excel file might look like:

| Name (English) | Name (Bangla) | Short Name (English) | Short Name (Bangla) | Category | Service | Type | Is Depot | Is Workshop | Corps Names (English) |
|----------------|---------------|----------------------|---------------------|----------|---------|------|----------|-------------|-----------------------|
| Armed Forces Division | সশস্ত্র বাহিনী বিভাগ | AFD | এএফডি | Headquarters | Ministry Of Defence | Static | No | No | Infantry |
| Special Operations Command | বিশেষ অভিযান কমান্ড | SOC | এসওসি | Division | Army | Mobile | No | No | Special Forces |

## 🎯 Complete Example

Here's a complete example of a test with recorded actions:

```javascript
test('should create unit type with Excel data @data-driven', async ({ page }) => {
  // Read and prepare data
  const unitTypesData = await excelHelper.readExcel('unit-types');
  let testData = unitTypesData[0];
  testData = await executionHelper.prepareFirstTimeData('unit-types', testData);
  
  // Navigate and open form
  await unitTypesPage.clickCreateUnitType();
  await page.waitForTimeout(3000);
  
  // Fill form with Excel data
  await page.fill('#nameEnglish', testData['Name (English)']);
  await page.fill('#nameBangla', testData['Name (Bangla)']);
  await page.fill('#shortNameEnglish', testData['Short Name (English)']);
  await page.fill('#shortNameBangla', testData['Short Name (Bangla)']);
  
  // Select dropdowns
  await page.selectOption('#category', testData['Category']);
  await page.selectOption('#service', testData['Service']);
  await page.selectOption('#type', testData['Type']);
  
  // Handle checkboxes
  if (testData['Is Depot'] === 'Yes') {
    await page.check('#isDepot');
  }
  if (testData['Is Workshop'] === 'Yes') {
    await page.check('#isWorkshop');
  }
  
  // Fill corps
  await page.fill('#corps', testData['Corps Names (English)']);
  
  // Submit form
  await page.click('button:has-text("Save")');
  
  // Wait for success
  await page.waitForTimeout(2000);
  
  // Verify success (adjust selector based on actual page)
  const successMessage = await page.locator('.success-message, .mat-snack-bar-container');
  await expect(successMessage).toBeVisible();
  
  // Save to Excel
  await executionHelper.saveExecutionData('unit-types', testData, true);
  
  console.log('✅ Unit type created and saved to Excel');
});
```

## 🆘 Troubleshooting

### Excel File Not Found
```
📝 Excel file not found: unit-types.xlsx
📍 Expected location: D:\ORDISS\ordiss-e2e\test-data\unit-types.xlsx
💡 Place your Excel file in the test-data folder
```
**Solution**: Place your Excel file in the `test-data/` folder

### Duplicate Name Error
```
⚠️  Name "Armed Forces Division" exists, using "Armed Forces Division-002"
```
**Solution**: This is automatic! The framework handles it for you.

### Form Selectors Not Working
**Solution**: Use codegen to get the correct selectors for your ORDISS form

### Test Fails to Save Data
**Solution**: Check that the test completed successfully before saving

## 🎉 Benefits

✅ **First-time execution** - Use real data from Excel  
✅ **Automatic duplicate handling** - No manual intervention needed  
✅ **Data preservation** - All test data saved to Excel  
✅ **Reusable tests** - Run tests multiple times with different data  
✅ **Easy maintenance** - Update Excel file, not code  

---

**🚀 You're ready to execute tests with real data!**