const { test as setup, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const TestConfig = require('../config/test-config');
const path = require('path');

/**
 * Authentication setup for Playwright tests
 * This file handles authentication state management for test sessions
 */

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as SuperAdmin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const config = TestConfig;
  
  try {
    // Get SuperAdmin credentials
    const superAdminUser = config.getUserCredentials('superadmin');
    
    if (!superAdminUser) {
      throw new Error('SuperAdmin credentials not found in configuration');
    }
    
    console.log('Setting up authentication for SuperAdmin user...');
    
    // Navigate to login page
    await loginPage.navigateToLogin(config.get('environment.baseURL'));
    
    // Perform login
    await loginPage.login(superAdminUser.username, superAdminUser.password);
    
    // Verify successful login
    await loginPage.verifySuccessfulLogin(superAdminUser.expectedRedirect);
    
    // Wait for the page to fully load after login
    await page.waitForLoadState('networkidle');
    
    // Verify we have a valid session by checking we're not on login page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    console.log(`Authentication successful. Current URL: ${currentUrl}`);
    
    // Save authentication state
    await page.context().storageState({ path: authFile });
    
    console.log(`Authentication state saved to: ${authFile}`);
    
    // Log successful authentication setup
    await loginPage.logAction('Setup', `Authentication setup completed for SuperAdmin: ${superAdminUser.username}`);
    
  } catch (error) {
    console.error('Authentication setup failed:', error.message);
    
    // Take screenshot on failure
    await loginPage.takeScreenshot('auth-setup-failure');
    
    // Log the error
    await loginPage.logAction('Error', `Authentication setup failed: ${error.message}`);
    
    throw error;
  }
});

setup('verify authentication state', async ({ page }) => {
  const config = TestConfig;
  
  try {
    console.log('Verifying authentication state...');
    
    // Navigate to a protected page to verify authentication
    const baseURL = config.get('environment.baseURL');
    await page.goto(`${baseURL}/dashboard`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    // If we're redirected to login, authentication failed
    if (currentUrl.includes('/login')) {
      throw new Error('Authentication verification failed - redirected to login page');
    }
    
    console.log(`Authentication verification successful. Current URL: ${currentUrl}`);
    
  } catch (error) {
    console.error('Authentication verification failed:', error.message);
    throw error;
  }
});

// Optional: Setup for different user roles
setup('authenticate as Admin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const config = TestConfig;
  
  try {
    const adminUser = config.getUserCredentials('admin');
    
    if (!adminUser) {
      console.log('Admin user credentials not found, skipping admin authentication setup');
      return;
    }
    
    console.log('Setting up authentication for Admin user...');
    
    await loginPage.navigateToLogin(config.get('environment.baseURL'));
    await loginPage.login(adminUser.username, adminUser.password);
    await loginPage.verifySuccessfulLogin(adminUser.expectedRedirect);
    
    // Save admin authentication state
    const adminAuthFile = path.join(__dirname, '../playwright/.auth/admin.json');
    await page.context().storageState({ path: adminAuthFile });
    
    console.log(`Admin authentication state saved to: ${adminAuthFile}`);
    
  } catch (error) {
    console.error('Admin authentication setup failed:', error.message);
    // Don't throw error for optional setup
  }
});

setup('authenticate as Regular User', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const config = TestConfig;
  
  try {
    const regularUser = config.getUserCredentials('user');
    
    if (!regularUser) {
      console.log('Regular user credentials not found, skipping user authentication setup');
      return;
    }
    
    console.log('Setting up authentication for Regular User...');
    
    await loginPage.navigateToLogin(config.get('environment.baseURL'));
    await loginPage.login(regularUser.username, regularUser.password);
    await loginPage.verifySuccessfulLogin(regularUser.expectedRedirect);
    
    // Save user authentication state
    const userAuthFile = path.join(__dirname, '../playwright/.auth/regular-user.json');
    await page.context().storageState({ path: userAuthFile });
    
    console.log(`Regular user authentication state saved to: ${userAuthFile}`);
    
  } catch (error) {
    console.error('Regular user authentication setup failed:', error.message);
    // Don't throw error for optional setup
  }
});