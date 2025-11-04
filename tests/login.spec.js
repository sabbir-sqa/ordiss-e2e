const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const ExcelDataDriver = require('../utils/excelDataDriver');

test.describe('ORDISS Login Tests', () => {
  let loginPage;
  let excelDriver;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    excelDriver = new ExcelDataDriver();

    // Navigate to ORDISS login page
    await loginPage.navigateToLogin('https://10.10.10.10:700');
  });

  test('should login successfully with SuperAdmin @smoke', async () => {
    // Get SuperAdmin user from Excel data
    const superAdmin = await excelDriver.getUserByUsername('main.superadmin');

    // Perform login
    await loginPage.login(superAdmin.username, superAdmin.password);

    // Verify successful login - should redirect to administration area
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('/login');
    expect(currentUrl).toContain('/administration');

    // Take screenshot of successful login
    await loginPage.takeScreenshot('successful-login');

    console.log('✅ SuperAdmin login successful');
  });

  test('should validate login form elements @smoke', async () => {
    // Validate all required form elements are present
    const validation = await loginPage.validateLoginForm();

    expect(validation.isValid).toBe(true);
    expect(validation.elements.usernameInput).toBe(true);
    expect(validation.elements.passwordInput).toBe(true);
    expect(validation.elements.loginButton).toBe(true);

    console.log('✅ Login form validation passed');
  });

  test('should handle invalid credentials @regression', async () => {
    // Test with invalid credentials
    await loginPage.login('invalid.user', 'wrongpassword', {
      waitForRedirect: false,
    });

    // Wait for any error messages
    await loginPage.page.waitForTimeout(2000);

    // Verify we're still on login page
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('/login');

    console.log('✅ Invalid credentials handled correctly');
  });

  test('should test with Excel data @regression', async () => {
    // Get test scenarios from Excel
    const testScenarios = await excelDriver.getTestScenarios('login');

    for (const scenario of testScenarios) {
      await test.step(scenario.testCase, async () => {
        // Clear any existing session
        await loginPage.page.context().clearCookies();
        await loginPage.navigateToLogin('https://10.10.10.10:700');

        // Perform login based on scenario
        await loginPage.login(scenario.username, scenario.password, {
          waitForRedirect: scenario.expectedResult === 'success',
        });

        // Verify result
        const currentUrl = await loginPage.getCurrentUrl();

        if (scenario.expectedResult === 'success') {
          expect(currentUrl).toContain(scenario.expectedUrl);
        } else {
          expect(currentUrl).toContain('/login');
        }

        console.log(
          `✅ ${scenario.testCase} - Result: ${scenario.expectedResult}`
        );
      });
    }
  });
});
