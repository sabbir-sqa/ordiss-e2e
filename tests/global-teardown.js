const TestConfig = require('../config/test-config');
const TestUtils = require('../utils/utils');
const fs = require('fs-extra');
const path = require('path');

/**
 * Global teardown for Playwright test suite
 * Runs once after all tests to clean up the testing environment
 */
async function globalTeardown(config) {
  console.log('🧹 Starting ORDISS Playwright Framework Global Teardown...');

  try {
    const testConfig = TestConfig;
    const startTime = Date.now();

    // Generate test execution summary
    await generateTestSummary();

    // Clean up temporary files if configured
    if (testConfig.get('testData.cleanup', true)) {
      await cleanupTemporaryFiles();
    }

    // Archive logs if in CI environment
    if (testConfig.get('current.isCI', false)) {
      await archiveLogs();
    }

    // Generate final log entry
    await createFinalLogEntry(startTime);

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error.message);
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Generate test execution summary
 */
async function generateTestSummary() {
  console.log('📊 Generating test execution summary...');

  try {
    const resultsDir = path.join(process.cwd(), 'test-results');
    const summaryFile = path.join(resultsDir, 'execution-summary.json');

    // Check if results.json exists
    const resultsFile = path.join(resultsDir, 'results.json');
    let testResults = null;

    if (await fs.pathExists(resultsFile)) {
      testResults = await fs.readJson(resultsFile);
    }

    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      environment: TestConfig.currentEnv,
      baseURL: TestConfig.get('environment.baseURL'),
      configuration: TestConfig.getConfigSummary(),
      execution: {
        startTime: process.env.TEST_START_TIME || new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: process.env.TEST_START_TIME
          ? Date.now() - new Date(process.env.TEST_START_TIME).getTime()
          : 0,
      },
      results: testResults
        ? {
            totalTests: testResults.stats?.total || 0,
            passed: testResults.stats?.passed || 0,
            failed: testResults.stats?.failed || 0,
            skipped: testResults.stats?.skipped || 0,
            flaky: testResults.stats?.flaky || 0,
          }
        : null,
      artifacts: await getArtifactsSummary(),
    };

    // Write summary to file
    await fs.writeJson(summaryFile, summary, { spaces: 2 });
    console.log(`   ✓ Test summary saved to: execution-summary.json`);

    // Log summary to console
    if (summary.results) {
      console.log(`   📈 Test Results:`);
      console.log(`      - Total: ${summary.results.totalTests}`);
      console.log(`      - Passed: ${summary.results.passed}`);
      console.log(`      - Failed: ${summary.results.failed}`);
      console.log(`      - Skipped: ${summary.results.skipped}`);
      if (summary.results.flaky > 0) {
        console.log(`      - Flaky: ${summary.results.flaky}`);
      }
    }

    if (summary.execution.duration > 0) {
      const durationMinutes = Math.round(
        summary.execution.duration / 1000 / 60
      );
      console.log(`   ⏱️  Total execution time: ${durationMinutes} minutes`);
    }
  } catch (error) {
    console.error(`   ❌ Failed to generate test summary: ${error.message}`);
  }
}

/**
 * Get artifacts summary
 */
async function getArtifactsSummary() {
  const artifacts = {
    screenshots: 0,
    videos: 0,
    traces: 0,
    logs: 0,
    reports: 0,
  };

  try {
    const resultsDir = path.join(process.cwd(), 'test-results');

    // Count screenshots
    const screenshotsDir = path.join(resultsDir, 'screenshots');
    if (await fs.pathExists(screenshotsDir)) {
      const screenshots = await fs.readdir(screenshotsDir);
      artifacts.screenshots = screenshots.filter((f) =>
        f.endsWith('.png')
      ).length;
    }

    // Count videos
    const videosDir = path.join(resultsDir, 'videos');
    if (await fs.pathExists(videosDir)) {
      const videos = await fs.readdir(videosDir);
      artifacts.videos = videos.filter((f) => f.endsWith('.webm')).length;
    }

    // Count traces
    const tracesDir = path.join(resultsDir, 'traces');
    if (await fs.pathExists(tracesDir)) {
      const traces = await fs.readdir(tracesDir);
      artifacts.traces = traces.filter((f) => f.endsWith('.zip')).length;
    }

    // Count logs
    const logsDir = path.join(resultsDir, 'logs');
    if (await fs.pathExists(logsDir)) {
      const logs = await fs.readdir(logsDir);
      artifacts.logs = logs.filter((f) => f.endsWith('.log')).length;
    }

    // Check for HTML report
    const reportDir = path.join(process.cwd(), 'playwright-report');
    if (await fs.pathExists(path.join(reportDir, 'index.html'))) {
      artifacts.reports = 1;
    }
  } catch (error) {
    console.error(`   ❌ Failed to count artifacts: ${error.message}`);
  }

  return artifacts;
}

/**
 * Clean up temporary files
 */
async function cleanupTemporaryFiles() {
  console.log('🗑️  Cleaning up temporary files...');

  try {
    const tempDirs = ['tmp', 'temp', '.temp'];

    for (const dir of tempDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (await fs.pathExists(dirPath)) {
        await fs.remove(dirPath);
        console.log(`   ✓ Removed temporary directory: ${dir}`);
      }
    }

    // Clean up old log files (keep last 7 days)
    await cleanupOldLogs();
  } catch (error) {
    console.error(`   ❌ Cleanup failed: ${error.message}`);
  }
}

/**
 * Clean up old log files
 */
async function cleanupOldLogs() {
  try {
    const logsDir = path.join(process.cwd(), 'test-results', 'logs');

    if (await fs.pathExists(logsDir)) {
      const files = await fs.readdir(logsDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep last 7 days

      let cleanedCount = 0;

      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.remove(filePath);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`   ✓ Cleaned up ${cleanedCount} old log files`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Failed to cleanup old logs: ${error.message}`);
  }
}

/**
 * Archive logs for CI environment
 */
async function archiveLogs() {
  console.log('📦 Archiving logs for CI environment...');

  try {
    const logsDir = path.join(process.cwd(), 'test-results', 'logs');
    const archiveDir = path.join(
      process.cwd(),
      'test-results',
      'archived-logs'
    );

    if (await fs.pathExists(logsDir)) {
      await fs.ensureDir(archiveDir);

      const timestamp = new Date().toISOString().split('T')[0];
      const archiveName = `logs-${timestamp}-${Date.now()}`;
      const archivePath = path.join(archiveDir, archiveName);

      await fs.copy(logsDir, archivePath);
      console.log(`   ✓ Logs archived to: ${archiveName}`);
    }
  } catch (error) {
    console.error(`   ❌ Log archiving failed: ${error.message}`);
  }
}

/**
 * Create final log entry
 */
async function createFinalLogEntry(startTime) {
  try {
    const logDir = path.join(process.cwd(), 'test-results', 'logs');
    const logFile = path.join(
      logDir,
      `teardown-${new Date().toISOString().split('T')[0]}.log`
    );

    const duration = Date.now() - startTime;

    const logEntry = [
      `[${new Date().toISOString()}] ORDISS Playwright Framework - Global Teardown Completed`,
      `Teardown Duration: ${duration}ms`,
      `Environment: ${TestConfig.currentEnv}`,
      `Cleanup Completed: ${TestConfig.get('testData.cleanup', true)}`,
      `CI Environment: ${TestConfig.get('current.isCI', false)}`,
      '--- Teardown Complete ---',
    ].join('\n');

    await fs.appendFile(logFile, logEntry + '\n');
  } catch (error) {
    console.error(`Failed to create final log entry: ${error.message}`);
  }
}

/**
 * Log performance metrics
 */
function logPerformanceMetrics() {
  console.log('📊 Performance Metrics:');

  const memUsage = process.memoryUsage();
  console.log(
    `   - Memory Usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
  );
  console.log(
    `   - Peak Memory: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  );

  if (process.cpuUsage) {
    const cpuUsage = process.cpuUsage();
    console.log(`   - CPU User Time: ${Math.round(cpuUsage.user / 1000)}ms`);
    console.log(
      `   - CPU System Time: ${Math.round(cpuUsage.system / 1000)}ms`
    );
  }
}

// Main teardown function
module.exports = async function (config) {
  // Log performance metrics
  logPerformanceMetrics();

  // Run global teardown
  return await globalTeardown(config);
};
