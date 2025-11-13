// tests/login.spec.js
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/login.page');

test.describe('ORDISS Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.gotoLoginPage();
    await loginPage.login('admin', 'securepassword123'); // ← use env vars later!

    expect(await loginPage.isLoggedIn()).toBeTruthy();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.gotoLoginPage();
    await loginPage.login('wronguser', 'wrongpass');

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Invalid credentials');
  });
});
