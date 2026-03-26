/**
 * Exercise validation using Python code execution
 * Validates student code by running test cases and comparing outputs
 */

import { runPythonCode } from './pythonRunner';

/**
 * Compare two values with optional tolerance for floating-point numbers
 * @param {*} actual - Actual value from code execution
 * @param {*} expected - Expected value from test case
 * @param {number} tolerance - Tolerance for float comparison
 * @returns {boolean} True if values match within tolerance
 */
function compareValues(actual, expected, tolerance = 1e-5) {
  // Handle null/undefined
  if (actual === null || actual === undefined || expected === null || expected === undefined) {
    return actual === expected;
  }

  // Handle numbers (with tolerance)
  if (typeof expected === 'number' && typeof actual === 'number') {
    if (Number.isNaN(expected) && Number.isNaN(actual)) return true;
    if (Number.isNaN(expected) || Number.isNaN(actual)) return false;
    return Math.abs(actual - expected) < tolerance;
  }

  // Handle arrays
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (actual.length !== expected.length) return false;
    return expected.every((exp, i) => compareValues(actual[i], exp, tolerance));
  }

  // Handle objects
  if (typeof expected === 'object' && typeof actual === 'object') {
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);
    if (expectedKeys.length !== actualKeys.length) return false;
    return expectedKeys.every(key =>
      actualKeys.includes(key) && compareValues(actual[key], expected[key], tolerance)
    );
  }

  // Exact match for other types
  return actual === expected;
}

/**
 * Compare all outputs from a test case
 * @param {Object} actualValues - Actual values from code execution
 * @param {Object} expectedOutputs - Expected outputs from test case
 * @param {number} tolerance - Tolerance for float comparison
 * @returns {Object} Comparison result with details
 */
function compareOutputs(actualValues, expectedOutputs, tolerance = 1e-5) {
  const mismatches = [];

  for (const [varName, expectedValue] of Object.entries(expectedOutputs)) {
    if (!(varName in actualValues)) {
      mismatches.push({
        variable: varName,
        issue: 'missing',
        expected: expectedValue
      });
      continue;
    }

    const actualValue = actualValues[varName];
    if (!compareValues(actualValue, expectedValue, tolerance)) {
      mismatches.push({
        variable: varName,
        issue: 'mismatch',
        actual: actualValue,
        expected: expectedValue
      });
    }
  }

  return {
    passed: mismatches.length === 0,
    mismatches
  };
}

/**
 * Format a value for display
 * @param {*} value - Value to format
 * @returns {string} Formatted string
 */
function formatValue(value) {
  if (value === null || value === undefined) return String(value);
  if (typeof value === 'number') return value.toFixed(4);
  if (Array.isArray(value)) {
    if (value.length > 10) {
      return `[${value.slice(0, 10).map(formatValue).join(', ')}, ... (${value.length} items)]`;
    }
    return `[${value.map(formatValue).join(', ')}]`;
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Format check results for UI display
 * @param {Array} testResults - Results from all test cases
 * @returns {Array} Formatted checks
 */
function formatChecks(testResults) {
  return testResults.map((result, index) => {
    const inputCode = result.postCode || result.setupCode;
    const setupInfo = inputCode ? `\n📋 Test input:\n${inputCode.trim()}` : '';

    if (!result.executed) {
      return {
        label: `Test ${index + 1}: ${result.description}`,
        ok: false,
        details: `❌ Execution failed: ${result.error}${setupInfo}`,
        setupCode: result.setupCode
      };
    }

    if (result.passed) {
      return {
        label: `Test ${index + 1}: ${result.description}`,
        ok: true,
        details: `✓ All outputs correct${setupInfo}`,
        setupCode: result.setupCode
      };
    }

    // Format mismatches
    const mismatchDetails = result.mismatches.map(m => {
      if (m.issue === 'missing') {
        return `  • ${m.variable}: not defined (expected: ${formatValue(m.expected)})`;
      }
      return `  • ${m.variable}: got ${formatValue(m.actual)}, expected ${formatValue(m.expected)}`;
    }).join('\n');

    return {
      label: `Test ${index + 1}: ${result.description}`,
      ok: false,
      details: `✗ Output mismatch:\n${mismatchDetails}${setupInfo}`,
      setupCode: result.setupCode
    };
  });
}

/**
 * Generate summary message
 * @param {Array} testResults - Results from all test cases
 * @returns {string} Summary message
 */
function generateMessage(testResults) {
  const total = testResults.length;
  const passed = testResults.filter(r => r.passed).length;
  const executed = testResults.filter(r => r.executed).length;

  if (executed < total) {
    return `Code execution failed. Check the error message below.`;
  }

  if (passed === total) {
    return `Perfect! All ${total} test cases passed. Your code is correct! 🎉`;
  }

  if (passed === 0) {
    return `None of the ${total} test cases passed. Review the expected outputs below.`;
  }

  return `${passed} of ${total} test cases passed. Check the failing cases below.`;
}

/**
 * Validate student code using test cases
 * @param {string} code - Student's Python code
 * @param {Object} exercise - Exercise configuration with test cases
 * @returns {Promise<Object>} Validation result
 */
export async function validateExercise(code, exercise) {
  const testResults = [];

  // Run each test case
  for (const testCase of exercise.testCases) {
    const result = await runPythonCode(code, testCase);

    if (!result.success) {
      testResults.push({
        description: testCase.description,
        setupCode: testCase.setupCode,
        postCode: testCase.postCode,
        executed: false,
        passed: false,
        error: result.error,
        errorType: result.errorType
      });
      // Stop on first error for better UX
      break;
    }

    const comparison = compareOutputs(
      result.values,
      testCase.expectedOutputs,
      testCase.tolerance || 1e-5
    );

    testResults.push({
      description: testCase.description,
      setupCode: testCase.setupCode,
      postCode: testCase.postCode,
      executed: true,
      passed: comparison.passed,
      mismatches: comparison.mismatches,
      actual: result.values,
      expected: testCase.expectedOutputs
    });
  }

  const allPassed = testResults.every(r => r.passed);

  return {
    pass: allPassed,
    checks: formatChecks(testResults),
    message: generateMessage(testResults),
    testResults // Include raw results for debugging
  };
}
