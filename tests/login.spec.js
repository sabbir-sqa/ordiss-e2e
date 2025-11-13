// tests/login.spec.js
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/auth/login.page');

// Override to NOT use saved auth for login tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Tests', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('should login successfully with valid credentials', async () => {
    await loginPage.gotoLoginPage();
    await loginPage.login(
      process.env.SUPERADMIN_USERNAME || 'main.superadmin',
      process.env.SUPERADMIN_PASSWORD || 'Ordiss@SA'
    );

    expect(await loginPage.isLoggedIn()).toBeTruthy();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await loginPage.gotoLoginPage();

    // Fill credentials manually without waiting for navigation
    await page
      .getByRole('textbox', { name: 'Enter user ID' })
      .fill('wronguser');
    await page
      .getByRole('textbox', { name: 'Enter password' })
      .fill('wrongpass');
    await page.getByRole('button', { name: 'Log in' }).click();

    await page.waitForTimeout(2000);
    expect(await loginPage.isLoggedIn()).toBeFalsy();
  });

  test('should validate login form elements', async () => {
    await loginPage.gotoLoginPage();
    expect(await loginPage.validateLoginForm()).toBeTruthy();
  });

  test('should handle empty credentials', async ({ page }) => {
    await loginPage.gotoLoginPage();

    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForTimeout(1000);

    expect(await loginPage.isLoggedIn()).toBeFalsy();
  });
});
