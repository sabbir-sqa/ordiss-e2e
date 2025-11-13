// pages/auth/login.page.js
const BasePage = require('../base.page');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // ORDISS-specific locators (Angular Material components)
    this.usernameInput = '#mat-input-0';
    this.passwordInput = '#mat-input-1';
    this.loginButton = 'button:has-text("Log in")';
    this.errorMessage = '.mat-error, .error-message, .alert-danger';
    this.pageTitle = 'h1, .page-title';
  }

  async gotoLoginPage() {
    await this.goto('https://10.10.10.10:700/login');
    await this.waitForLoad();
  }

  async login(username, password) {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);

    // Wait for navigation away from login page
    await this.page.waitForFunction(
      () => !window.location.pathname.includes('/login'),
      { timeout: 30000 }
    );
    await this.waitForLoad();
  }

  async isLoggedIn() {
    const currentUrl = this.page.url();
    return !currentUrl.includes('/login');
  }

  async getErrorMessage() {
    try {
      await this.page.waitForSelector(this.errorMessage, { timeout: 5000 });
      return await this.page.textContent(this.errorMessage);
    } catch {
      return null;
    }
  }

  async validateLoginForm() {
    const usernameVisible = await this.isVisible(this.usernameInput);
    const passwordVisible = await this.isVisible(this.passwordInput);
    const buttonVisible = await this.isVisible(this.loginButton);

    return usernameVisible && passwordVisible && buttonVisible;
  }
}

module.exports = LoginPage;
