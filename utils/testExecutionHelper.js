const ExcelHelper = require('./excelHelper');

/**
 * Test Execution Helper
 * Helps with first-time test execution and data management
 */
class TestExecutionHelper {
  constructor() {
    this.excelHelper = new ExcelHelper();
    this.executionLog = [];
  }

  /**
   * Log execution step
   * @param {string} step - Step description
   * @param {Object} data - Step data
   */
  logStep(step, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      step,
      data,
    };
    this.executionLog.push(logEntry);
    console.log(`📝 ${step}`);
    if (Object.keys(data).length > 0) {
      console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
    }
  }

  /**
   * Prepare test data for first-time execution
   * @param {string} moduleName - Module name (e.g., 'unit-types')
   * @param {Object} realData - Real data from user
   * @returns {Object} Prepared data
   */
  async prepareFirstTimeData(moduleName, realData) {
    this.logStep(`Preparing first-time data for ${moduleName}`, { realData });

    // Read existing data from Excel
    const existingData = await this.excelHelper.readExcel(moduleName);

    // Prepare data based on module
    let preparedData;
    switch (moduleName) {
      case 'unit-types':
        preparedData = this.excelHelper.prepareUnitTypeData(
          realData,
          existingData
        );
        break;
      default:
        preparedData = realData;
    }

    this.logStep('Data prepared', { preparedData });
    return preparedData;
  }

  /**
   * Save execution data to Excel after successful test
   * @param {string} moduleName - Module name
   * @param {Object} executedData - Data that was used in test
   * @param {boolean} success - Whether test was successful
   */
  async saveExecutionData(moduleName, executedData, success = true) {
    if (!success) {
      this.logStep('Test failed, not saving data');
      return false;
    }

    this.logStep(`Saving execution data to ${moduleName}.xlsx`);

    try {
      // Read existing data
      const existingData = await this.excelHelper.readExcel(moduleName);

      // Check if this data already exists
      const nameField = this.getNameField(moduleName);
      const exists = this.excelHelper.nameExists(
        existingData,
        nameField,
        executedData[nameField]
      );

      if (exists) {
        this.logStep('Data already exists in Excel, skipping save');
        return true;
      }

      // Append to Excel
      const result = await this.excelHelper.appendToExcel(moduleName, [
        executedData,
      ]);

      if (result) {
        this.logStep('✅ Data saved to Excel successfully');
      }

      return result;
    } catch (error) {
      console.error(`❌ Error saving execution data: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the primary name field for a module
   * @param {string} moduleName - Module name
   * @returns {string} Name field
   */
  getNameField(moduleName) {
    const nameFields = {
      'unit-types': 'Name (English)',
      organogram: 'name',
      units: 'name',
      'permission-groups': 'name',
      permissions: 'name',
    };

    return nameFields[moduleName] || 'name';
  }

  /**
   * Create execution summary
   * @returns {Object} Execution summary
   */
  getExecutionSummary() {
    return {
      totalSteps: this.executionLog.length,
      steps: this.executionLog,
      startTime: this.executionLog[0]?.timestamp,
      endTime: this.executionLog[this.executionLog.length - 1]?.timestamp,
    };
  }

  /**
   * Guide user through first-time execution
   * @param {string} moduleName - Module name
   * @returns {Object} Guidance information
   */
  getFirstTimeGuidance(moduleName) {
    const guidance = {
      'unit-types': {
        message: '🎯 First-time Unit Types execution',
        steps: [
          '1. Place your unit-types.xlsx file in test-data/ folder',
          '2. Excel should have columns: Name (English), Name (Bangla), Short Name (English), Short Name (Bangla), Category, Service, Type, Is Depot, Is Workshop, Corps Names (English)',
          '3. Run the test with --headed flag to see the execution',
          '4. After successful execution, data will be saved to Excel',
          '5. Next time, test will use data from Excel automatically',
        ],
        exampleData: {
          'Name (English)': 'Test Unit Type',
          'Name (Bangla)': 'পরীক্ষা ইউনিট টাইপ',
          'Short Name (English)': 'TUT',
          'Short Name (Bangla)': 'টিইউটি',
          Category: 'Headquarters',
          Service: 'Army',
          Type: 'Static',
          'Is Depot': 'No',
          'Is Workshop': 'No',
          'Corps Names (English)': 'Infantry',
        },
      },
      organogram: {
        message: '🎯 First-time Organogram execution',
        steps: [
          '1. Place your organogram.xlsx file in test-data/ folder',
          '2. Run the test with real data',
          '3. Data will be saved to Excel after execution',
        ],
      },
      units: {
        message: '🎯 First-time Units execution',
        steps: [
          '1. Place your units.xlsx file in test-data/ folder',
          '2. Run the test with real data',
          '3. Data will be saved to Excel after execution',
        ],
      },
    };

    return (
      guidance[moduleName] || {
        message: `🎯 First-time ${moduleName} execution`,
        steps: [
          '1. Prepare your Excel file',
          '2. Run the test',
          '3. Data will be saved',
        ],
      }
    );
  }

  /**
   * Print guidance to console
   * @param {string} moduleName - Module name
   */
  printGuidance(moduleName) {
    const guidance = this.getFirstTimeGuidance(moduleName);

    console.log('\n' + '='.repeat(60));
    console.log(guidance.message);
    console.log('='.repeat(60));

    guidance.steps.forEach((step) => {
      console.log(step);
    });

    if (guidance.exampleData) {
      console.log('\n📋 Example Data Structure:');
      console.log(JSON.stringify(guidance.exampleData, null, 2));
    }

    console.log('='.repeat(60) + '\n');
  }
}

module.exports = TestExecutionHelper;
