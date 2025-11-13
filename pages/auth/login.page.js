// pages/auth/login.page.js
require('dotenv').config();
const BasePage = require('../base.page');

/**
 * Login Page Object
 * Handles authentication flow from landing page through login
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.baseUrl = process.env.BASE_URL || 'https://10.10.10.10:700';

    // 🧩 Locators (encapsulated, semantic)
    this.logInButton = this.page
      .getByRole('banner')
      .getByRole('button', { name: 'Log in' });
    this.ordissMainMenuItem = this.page.getByRole('menuitem', {
      name: 'ORDISS Main',
    });
    this.personalLogMenuItem = this.page.getByRole('menuitem', {
      name: 'Personal Log',
    });
    this.usernameInput = this.page.getByRole('textbox', {
      name: 'Enter user ID',
    });
    this.passwordInput = this.page.getByRole('textbox', {
      name: 'Enter password',
    });
    this.loginButton = this.page.getByRole('button', { name: 'Log in' });
    this.errorMessage = this.page
      .locator(
        '.mat-error, .error-message, .alert-danger, .mat-snack-bar-container'
      )
      .first();
  }

  // 🌐 Navigation
  async goto() {
    await this.page.goto(`${this.baseUrl}/landing`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoLoginPage() {
    await this.goto();

    try {
      await this.logInButton.click();
      await this.ordissMainMenuItem.click();
      await this.page.waitForURL('**/login', { timeout: 10000 });
    } catch {
      await this.page.goto(`${this.baseUrl}/login`);
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async expectOnPage() {
    await this.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.loginButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  // 🔐 Core Actions
  async login(username, password) {
    await this.fillCredentials(username, password);
    await this.submit();
  }

  async loginWithOrdissMain(username, password) {
    await this.gotoLoginPage();
    await this.login(username, password);
  }

  async loginWithPersonalLog(username, password) {
    await this.goto();
    await this.logInButton.click();
    await this.personalLogMenuItem.click();
    await this.page.waitForURL('**/login', { timeout: 10000 });
    await this.login(username, password);
  }

  // 🧪 Reusable sub-actions
  async fillCredentials(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.loginButton.click();

    await Promise.race([
      this.page.waitForURL((url) => !url.toString().includes('/login'), {
        timeout: 30000,
      }),
      this.waitForError(),
    ]);
  }

  // ⚠️ Error Handling
  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getErrorMessage() {
    try {
      await this.waitForError();
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  async expectError(expectedMessage) {
    await this.waitForError();
    const actualMessage = await this.errorMessage.textContent();
    if (!actualMessage.includes(expectedMessage)) {
      throw new Error(
        `Expected error "${expectedMessage}" but got "${actualMessage}"`
      );
    }
  }

  // 🔁 Reset / Helpers
  async clearForm() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  // 🧪 Assertion Helpers
  async isLoggedIn() {
    return !this.page.url().includes('/login');
  }

  async validateLoginForm() {
    const hasUsernameField = await this.usernameInput.isVisible();
    const hasPasswordField = await this.passwordInput.isVisible();
    const hasLoginButton = await this.loginButton.isVisible();
    return hasUsernameField && hasPasswordField && hasLoginButton;
  }
}

module.exports = LoginPage;
