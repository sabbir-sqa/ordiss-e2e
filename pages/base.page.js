// pages/base.page.js
class BasePage {
  constructor(page) {
    this.page = page;
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
