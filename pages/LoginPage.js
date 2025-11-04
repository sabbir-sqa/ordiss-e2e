const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

/**
 * LoginPage class handles all login-related functionality
 * Extends BasePage to inherit common page operations
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Page elements selectors
    this.selectors = {
      // Login form elements
      usernameInput:
        '#mat-input-0, input[placeholder*="User ID"], input[type="text"]',
      passwordInput:
        '#mat-input-1, input[placeholder*="Password"], input[type="password"]',
      loginButton:
        'button:has-text("Log in"), button[type="submit"], input[type="submit"]',

      // Error and success messages
      errorMessage:
        '.alert-danger, .error-message, .invalid-feedback, [class*="error"]',
      successMessage: '.alert-success, .success-message, [class*="success"]',

      // Form validation
      usernameError:
        'input[name="username"] + .invalid-feedback, .username-error',
      passwordError:
        'input[name="password"] + .invalid-feedback, .password-error',

      // Page elements
      loginForm: 'form, .login-form, .auth-form',
      pageTitle: 'h1, .page-title, .login-title',
      logo: '.logo, .brand, img[alt*="logo"]',

      // Loading states
      loadingSpinner: '.spinner, .loading, [class*="loading"]',

      // Remember me and forgot password
      rememberMeCheckbox: 'input[type="checkbox"][name*="remember"]',
      forgotPasswordLink: 'a[href*="forgot"], a:has-text("Forgot Password")',

      // Language/locale selector
      languageSelector: '.language-selector, select[name="language"]',

      // Footer and additional elements
      footer: '.footer, .login-footer',
      copyrightText: '.copyright, .footer-text',
    };

    // Expected URLs and redirects
    this.urls = {
      login: '/login',
      loginUser: '/loginuser',
      dashboard: '/dashboard',
      adminDashboard: '/admin-dashboard',
      userDashboard: '/user-dashboard',
    };

    // Common error messages
    this.errorMessages = {
      invalidCredentials: 'Invalid username or password',
      emptyUsername: 'Username is required',
      emptyPassword: 'Password is required',
      emptyBoth: 'Username and password are required',
      accountLocked: 'Account is locked',
      sessionExpired: 'Session has expired',
    };
  }

  /**
   * Navigate to login page
   * @param {string} baseURL - Base URL of the application
   */
  async navigateToLogin(baseURL = 'https://10.10.10.10:700') {
    try {
      await this.logAction(
        'Navigation',
        `Navigating to login page: ${baseURL}/login`
      );
      await this.goto(`${baseURL}/login`);
      await this.waitForLoginPageLoad();
      await this.logAction('Navigation', 'Successfully loaded login page');
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to navigate to login page: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Wait for login page to load completely
   */
  async waitForLoginPageLoad() {
    try {
      // Wait for the login form to be visible
      await this.waitForElement(this.selectors.loginForm, 15000);

      // Wait for username and password inputs
      await this.waitForElement(this.selectors.usernameInput, 10000);
      await this.waitForElement(this.selectors.passwordInput, 10000);
      await this.waitForElement(this.selectors.loginButton, 10000);

      // Wait for network to be idle
      await this.waitForNetworkIdle();

      await this.logAction('Verification', 'Login page loaded successfully');
    } catch (error) {
      await this.logAction(
        'Error',
        `Login page failed to load: ${error.message}`
      );
      await this.takeScreenshot('login-page-load-error');
      throw error;
    }
  }

  /**
   * Perform login with credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {object} options - Login options
   */
  async login(username, password, options = {}) {
    const defaultOptions = {
      waitForRedirect: true,
      clearFields: true,
      takeScreenshot: false,
      timeout: 30000,
    };

    const loginOptions = { ...defaultOptions, ...options };

    try {
      await this.logAction(
        'Authentication',
        `Attempting login with username: ${username}`
      );

      // Clear fields if requested
      if (loginOptions.clearFields) {
        await this.clearLoginFields();
      }

      // Enter credentials
      await this.enterUsername(username);
      await this.enterPassword(password);

      // Take screenshot before login if requested
      if (loginOptions.takeScreenshot) {
        await this.takeScreenshot('before-login');
      }

      // Click login button
      await this.clickLoginButton();

      // Wait for login to complete
      if (loginOptions.waitForRedirect) {
        await this.waitForLoginResult(loginOptions.timeout);
      }

      await this.logAction(
        'Authentication',
        `Login attempt completed for: ${username}`
      );
    } catch (error) {
      await this.logAction(
        'Error',
        `Login failed for ${username}: ${error.message}`
      );
      await this.takeScreenshot('login-error');
      throw error;
    }
  }

  /**
   * Enter username in the username field
   * @param {string} username - Username to enter
   */
  async enterUsername(username) {
    try {
      await this.logAction('Input', `Entering username: ${username}`);
      await this.waitForElement(this.selectors.usernameInput);
      await this.typeText(this.selectors.usernameInput, username);
      await this.logAction('Input', 'Username entered successfully');
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to enter username: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Enter password in the password field
   * @param {string} password - Password to enter
   */
  async enterPassword(password) {
    try {
      await this.logAction('Input', 'Entering password');
      await this.waitForElement(this.selectors.passwordInput);
      await this.typeText(this.selectors.passwordInput, password);
      await this.logAction('Input', 'Password entered successfully');
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to enter password: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Click the login button
   */
  async clickLoginButton() {
    try {
      await this.logAction('Interaction', 'Clicking login button');
      await this.waitForElement(this.selectors.loginButton);
      await this.clickElement(this.selectors.loginButton);
      await this.logAction('Interaction', 'Login button clicked');
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to click login button: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Clear login form fields
   */
  async clearLoginFields() {
    try {
      await this.logAction('Input', 'Clearing login fields');

      // Clear username field
      await this.waitForElement(this.selectors.usernameInput);
      await this.page.fill(this.selectors.usernameInput, '');

      // Clear password field
      await this.waitForElement(this.selectors.passwordInput);
      await this.page.fill(this.selectors.passwordInput, '');

      await this.logAction('Input', 'Login fields cleared');
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to clear login fields: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Wait for login result (success or error)
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForLoginResult(timeout = 30000) {
    try {
      await this.logAction('Verification', 'Waiting for login result');

      // Wait for either redirect or error message
      await Promise.race([
        this.waitForSuccessfulLogin(timeout),
        this.waitForLoginError(timeout),
      ]);
    } catch (error) {
      await this.logAction('Error', `Login result timeout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for successful login (URL change)
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForSuccessfulLogin(timeout = 30000) {
    try {
      // Wait for URL to change from login page
      await this.page.waitForFunction(
        () => !window.location.pathname.includes('/login'),
        { timeout: timeout }
      );

      await this.logAction(
        'Verification',
        'Successful login detected - URL changed'
      );
      return true;
    } catch (error) {
      // This is expected if login fails
      return false;
    }
  }

  /**
   * Wait for login error message
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForLoginError(timeout = 10000) {
    try {
      await this.waitForElement(this.selectors.errorMessage, timeout);
      const errorText = await this.getElementText(this.selectors.errorMessage);
      await this.logAction(
        'Verification',
        `Login error detected: ${errorText}`
      );
      return errorText;
    } catch (error) {
      // This is expected if login succeeds
      return null;
    }
  }

  /**
   * Verify successful login
   * @param {string} expectedRedirect - Expected redirect URL pattern
   */
  async verifySuccessfulLogin(expectedRedirect = '/dashboard') {
    try {
      await this.logAction(
        'Verification',
        `Verifying successful login with redirect: ${expectedRedirect}`
      );

      // Wait for page to load after redirect
      await this.waitForLoad();

      // Get current URL
      const currentUrl = await this.getCurrentUrl();

      // Verify URL contains expected redirect
      if (!currentUrl.includes(expectedRedirect)) {
        throw new Error(
          `Expected redirect to ${expectedRedirect}, but got ${currentUrl}`
        );
      }

      // Verify we're not on login page
      if (currentUrl.includes('/login')) {
        throw new Error('Still on login page after successful login');
      }

      await this.logAction(
        'Verification',
        `Login verification successful - redirected to: ${currentUrl}`
      );
      return true;
    } catch (error) {
      await this.logAction(
        'Error',
        `Login verification failed: ${error.message}`
      );
      await this.takeScreenshot('login-verification-error');
      throw error;
    }
  }

  /**
   * Verify login error message
   * @param {string} expectedError - Expected error message
   */
  async verifyLoginError(expectedError) {
    try {
      await this.logAction(
        'Verification',
        `Verifying login error: ${expectedError}`
      );

      // Wait for error message to appear
      const errorMessage = await this.waitForLoginError(10000);

      if (!errorMessage) {
        throw new Error('No error message found');
      }

      // Verify error message contains expected text
      if (!errorMessage.toLowerCase().includes(expectedError.toLowerCase())) {
        throw new Error(
          `Expected error "${expectedError}", but got "${errorMessage}"`
        );
      }

      await this.logAction(
        'Verification',
        `Login error verification successful: ${errorMessage}`
      );
      return true;
    } catch (error) {
      await this.logAction(
        'Error',
        `Login error verification failed: ${error.message}`
      );
      await this.takeScreenshot('login-error-verification-failed');
      throw error;
    }
  }

  /**
   * Check if login form is visible
   * @returns {boolean} True if login form is visible
   */
  async isLoginFormVisible() {
    try {
      const isVisible = await this.isElementVisible(this.selectors.loginForm);
      await this.logAction(
        'Verification',
        `Login form visibility: ${isVisible}`
      );
      return isVisible;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to check login form visibility: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Check if login button is enabled
   * @returns {boolean} True if login button is enabled
   */
  async isLoginButtonEnabled() {
    try {
      const isEnabled = await this.isElementEnabled(this.selectors.loginButton);
      await this.logAction(
        'Verification',
        `Login button enabled: ${isEnabled}`
      );
      return isEnabled;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to check login button state: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Get current page title
   * @returns {string} Page title
   */
  async getLoginPageTitle() {
    try {
      const title = await this.getPageTitle();
      await this.logAction('Data', `Login page title: ${title}`);
      return title;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to get page title: ${error.message}`
      );
      return '';
    }
  }

  /**
   * Check if remember me checkbox exists and is visible
   * @returns {boolean} True if remember me checkbox is visible
   */
  async hasRememberMeOption() {
    try {
      const hasRememberMe = await this.isElementVisible(
        this.selectors.rememberMeCheckbox
      );
      await this.logAction(
        'Verification',
        `Remember me option available: ${hasRememberMe}`
      );
      return hasRememberMe;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to check remember me option: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Check if forgot password link exists
   * @returns {boolean} True if forgot password link is visible
   */
  async hasForgotPasswordLink() {
    try {
      const hasForgotPassword = await this.isElementVisible(
        this.selectors.forgotPasswordLink
      );
      await this.logAction(
        'Verification',
        `Forgot password link available: ${hasForgotPassword}`
      );
      return hasForgotPassword;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to check forgot password link: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Perform logout (if logout functionality exists)
   */
  async logout() {
    try {
      await this.logAction('Authentication', 'Attempting to logout');

      // Common logout selectors
      const logoutSelectors = [
        'a[href*="logout"]',
        'button:has-text("Logout")',
        'button:has-text("Sign Out")',
        '.logout-btn',
        '.sign-out-btn',
      ];

      for (const selector of logoutSelectors) {
        if (await this.isElementVisible(selector)) {
          await this.clickElement(selector);
          await this.waitForLoad();
          await this.logAction('Authentication', 'Logout successful');
          return true;
        }
      }

      await this.logAction('Warning', 'No logout button found');
      return false;
    } catch (error) {
      await this.logAction('Error', `Logout failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate login form elements
   * @returns {object} Validation result
   */
  async validateLoginForm() {
    const validation = {
      isValid: true,
      errors: [],
      elements: {},
    };

    try {
      await this.logAction('Verification', 'Validating login form elements');

      // Check username input
      validation.elements.usernameInput = await this.isElementVisible(
        this.selectors.usernameInput
      );
      if (!validation.elements.usernameInput) {
        validation.errors.push('Username input not found');
        validation.isValid = false;
      }

      // Check password input
      validation.elements.passwordInput = await this.isElementVisible(
        this.selectors.passwordInput
      );
      if (!validation.elements.passwordInput) {
        validation.errors.push('Password input not found');
        validation.isValid = false;
      }

      // Check login button
      validation.elements.loginButton = await this.isElementVisible(
        this.selectors.loginButton
      );
      if (!validation.elements.loginButton) {
        validation.errors.push('Login button not found');
        validation.isValid = false;
      }

      // Check if login button is enabled
      if (validation.elements.loginButton) {
        validation.elements.loginButtonEnabled =
          await this.isLoginButtonEnabled();
      }

      await this.logAction(
        'Verification',
        `Login form validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`
      );

      if (validation.errors.length > 0) {
        await this.logAction(
          'Error',
          `Validation errors: ${validation.errors.join(', ')}`
        );
      }

      return validation;
    } catch (error) {
      await this.logAction(
        'Error',
        `Login form validation failed: ${error.message}`
      );
      validation.isValid = false;
      validation.errors.push(error.message);
      return validation;
    }
  }
}
module.exports = LoginPage;
