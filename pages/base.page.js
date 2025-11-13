// pages/base.page.js
class BasePage {
  constructor(page) {
    this.page = page;
    // Get baseURL from Playwright config via page context
    this.baseUrl = page.context()._options.baseURL || 'https://10.10.10.10:700';
  }

  async goto(url) {
    await this.page.goto(url);
  }

  async fill(selector, value) {
    await this.page.fill(selector, value);
  }

  async click(selector) {
    await this.page.click(selector);
  }

  async isVisible(selector) {
    return await this.page.isVisible(selector);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = BasePage;
