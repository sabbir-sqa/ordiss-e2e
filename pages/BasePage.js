const { expect } = require('@playwright/test');
const fs = require('fs-extra');
const path = require('path');

/**
 * BasePage class provides common functionality for all page objects
 * This includes navigation, element interactions, waiting strategies, and logging
 */
class BasePage {
  constructor(page) {
    this.page = page;
    this.timeout = 30000;
    this.shortTimeout = 5000;
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - The URL to navigate to
   * @param {object} options - Navigation options
   */
  async goto(url, options = {}) {
    const defaultOptions = {
      waitUntil: 'networkidle',
      timeout: this.timeout,
    };

    try {
      await this.logAction('Navigation', `Navigating to: ${url}`);
      await this.page.goto(url, { ...defaultOptions, ...options });
      await this.waitForLoad();
      await this.logAction('Navigation', `Successfully navigated to: ${url}`);
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to navigate to ${url}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Wait for page to load completely
   */
  async waitForLoad() {
    try {
      await this.page.waitForLoadState('networkidle', {
        timeout: this.timeout,
      });
      await this.page.waitForLoadState('domcontentloaded', {
        timeout: this.timeout,
      });
    } catch (error) {
      await this.logAction('Warning', `Page load timeout: ${error.message}`);
    }
  }

  /**
   * Click on an element with enhanced error handling
   * @param {string} selector - Element selector
   * @param {object} options - Click options
   */
  async clickElement(selector, options = {}) {
    const defaultOptions = {
      timeout: this.timeout,
      force: false,
    };

    try {
      await this.logAction('Interaction', `Clicking element: ${selector}`);
      await this.waitForElement(selector);
      await this.page.click(selector, { ...defaultOptions, ...options });
      await this.logAction('Interaction', `Successfully clicked: ${selector}`);
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to click ${selector}: ${error.message}`
      );
      await this.takeScreenshot(`click-error-${Date.now()}`);
      throw error;
    }
  }

  /**
   * Type text into an input field
   * @param {string} selector - Input field selector
   * @param {string} text - Text to type
   * @param {object} options - Type options
   */
  async typeText(selector, text, options = {}) {
    const defaultOptions = {
      timeout: this.timeout,
      delay: 50,
    };

    try {
      await this.logAction('Interaction', `Typing into ${selector}: ${text}`);
      await this.waitForElement(selector);
      await this.page.fill(selector, ''); // Clear existing text
      await this.page.type(selector, text, { ...defaultOptions, ...options });
      await this.logAction(
        'Interaction',
        `Successfully typed into: ${selector}`
      );
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to type into ${selector}: ${error.message}`
      );
      await this.takeScreenshot(`type-error-${Date.now()}`);
      throw error;
    }
  }

  /**
   * Select an option from a dropdown
   * @param {string} selector - Dropdown selector
   * @param {string|object} value - Value to select
   */
  async selectOption(selector, value) {
    try {
      await this.logAction(
        'Interaction',
        `Selecting option in ${selector}: ${value}`
      );
      await this.waitForElement(selector);
      await this.page.selectOption(selector, value);
      await this.logAction(
        'Interaction',
        `Successfully selected option: ${value}`
      );
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to select option ${value} in ${selector}: ${error.message}`
      );
      await this.takeScreenshot(`select-error-${Date.now()}`);
      throw error;
    }
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Custom timeout
   */
  async waitForElement(selector, timeout = this.timeout) {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: timeout,
      });
    } catch (error) {
      await this.logAction('Error', `Element not found: ${selector}`);
      await this.takeScreenshot(`element-not-found-${Date.now()}`);
      throw new Error(`Element ${selector} not found within ${timeout}ms`);
    }
  }

  /**
   * Wait for text to appear on the page
   * @param {string} text - Text to wait for
   * @param {number} timeout - Custom timeout
   */
  async waitForText(text, timeout = this.timeout) {
    try {
      await this.page.waitForFunction(
        (searchText) => document.body.innerText.includes(searchText),
        text,
        { timeout: timeout }
      );
      await this.logAction('Verification', `Text found: ${text}`);
    } catch (error) {
      await this.logAction('Error', `Text not found: ${text}`);
      await this.takeScreenshot(`text-not-found-${Date.now()}`);
      throw new Error(`Text "${text}" not found within ${timeout}ms`);
    }
  }

  /**
   * Get text content of an element
   * @param {string} selector - Element selector
   * @returns {string} Text content
   */
  async getElementText(selector) {
    try {
      await this.waitForElement(selector);
      const text = await this.page.textContent(selector);
      await this.logAction('Data', `Retrieved text from ${selector}: ${text}`);
      return text;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to get text from ${selector}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Get attribute value of an element
   * @param {string} selector - Element selector
   * @param {string} attribute - Attribute name
   * @returns {string} Attribute value
   */
  async getElementAttribute(selector, attribute) {
    try {
      await this.waitForElement(selector);
      const value = await this.page.getAttribute(selector, attribute);
      await this.logAction(
        'Data',
        `Retrieved ${attribute} from ${selector}: ${value}`
      );
      return value;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to get ${attribute} from ${selector}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {boolean} True if visible
   */
  async isElementVisible(selector) {
    try {
      const element = await this.page.$(selector);
      if (!element) return false;

      const isVisible = await element.isVisible();
      await this.logAction(
        'Verification',
        `Element ${selector} visibility: ${isVisible}`
      );
      return isVisible;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to check visibility of ${selector}: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Check if element is enabled
   * @param {string} selector - Element selector
   * @returns {boolean} True if enabled
   */
  async isElementEnabled(selector) {
    try {
      await this.waitForElement(selector);
      const isEnabled = await this.page.isEnabled(selector);
      await this.logAction(
        'Verification',
        `Element ${selector} enabled: ${isEnabled}`
      );
      return isEnabled;
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to check if ${selector} is enabled: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Scroll element into view
   * @param {string} selector - Element selector
   */
  async scrollToElement(selector) {
    try {
      await this.waitForElement(selector);
      await this.page.locator(selector).scrollIntoViewIfNeeded();
      await this.logAction('Interaction', `Scrolled to element: ${selector}`);
    } catch (error) {
      await this.logAction(
        'Error',
        `Failed to scroll to ${selector}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    try {
      const screenshotDir = path.join(
        process.cwd(),
        'test-results',
        'screenshots'
      );
      await fs.ensureDir(screenshotDir);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}-${timestamp}.png`;
      const filepath = path.join(screenshotDir, filename);

      await this.page.screenshot({
        path: filepath,
        fullPage: true,
      });

      await this.logAction('Screenshot', `Screenshot saved: ${filename}`);
      return filepath;
    } catch (error) {
      console.error(`Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Log actions with timestamp
   * @param {string} type - Log type (Navigation, Interaction, Error, etc.)
   * @param {string} message - Log message
   */
  async logAction(type, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);

    // Also write to log file
    try {
      const logDir = path.join(process.cwd(), 'test-results', 'logs');
      await fs.ensureDir(logDir);

      const logFile = path.join(
        logDir,
        `test-${new Date().toISOString().split('T')[0]}.log`
      );
      await fs.appendFile(logFile, logMessage + '\n');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle() {
    try {
      await this.page.waitForLoadState('networkidle', {
        timeout: this.timeout,
      });
      await this.logAction('Network', 'Network is idle');
    } catch (error) {
      await this.logAction('Warning', `Network idle timeout: ${error.message}`);
    }
  }

  /**
   * Refresh the current page
   */
  async refreshPage() {
    try {
      await this.logAction('Navigation', 'Refreshing page');
      await this.page.reload({ waitUntil: 'networkidle' });
      await this.logAction('Navigation', 'Page refreshed successfully');
    } catch (error) {
      await this.logAction('Error', `Failed to refresh page: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current page URL
   * @returns {string} Current URL
   */
  async getCurrentUrl() {
    const url = this.page.url();
    await this.logAction('Data', `Current URL: ${url}`);
    return url;
  }

  /**
   * Get page title
   * @returns {string} Page title
   */
  async getPageTitle() {
    const title = await this.page.title();
    await this.logAction('Data', `Page title: ${title}`);
    return title;
  }

  /**
   * Close current page
   */
  async closePage() {
    try {
      await this.logAction('Navigation', 'Closing page');
      await this.page.close();
    } catch (error) {
      await this.logAction('Error', `Failed to close page: ${error.message}`);
    }
  }
}

module.exports = BasePage;
