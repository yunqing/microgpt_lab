/**
 * Python code execution using Pyodide (Python in WebAssembly)
 * Provides safe, sandboxed Python execution in the browser
 */

let pyodideInstance = null;
let loadingPromise = null;

/**
 * Load Pyodide from CDN
 * @returns {Promise<Pyodide>} Pyodide loadPyodide function
 */
async function loadPyodideScript() {
  // Check if already loaded
  if (window.loadPyodide) {
    return window.loadPyodide;
  }

  // Load Pyodide script from CDN
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
    script.onload = () => {
      if (window.loadPyodide) {
        resolve(window.loadPyodide);
      } else {
        reject(new Error('Pyodide script loaded but loadPyodide not found'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Pyodide script'));
    document.head.appendChild(script);
  });
}

/**
 * Lazy-load Pyodide (only loads once, then cached)
 * @returns {Promise<Pyodide>} Initialized Pyodide instance
 */
export async function initPyodide() {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  // If already loading, return the same promise
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      const loadPyodide = await loadPyodideScript();
      pyodideInstance = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
      });
      return pyodideInstance;
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}

/**
 * Execute Python code and extract specified variables
 * @param {string} userCode - The Python code to execute
 * @param {Object} testCase - Test case configuration
 * @param {string} testCase.setupCode - Setup code to run before user code
 * @param {string[]} testCase.checkVariables - Variable names to extract
 * @returns {Promise<Object>} Execution result
 */
export async function runPythonCode(userCode, testCase) {
  const pyodide = await initPyodide();

  // Create isolated namespace
  const namespace = pyodide.globals.get('dict')();

  // Build complete code with setup and result extraction
  const fullCode = `
${testCase.setupCode || ''}

${userCode}

# Extract results
_result = {
  ${testCase.checkVariables.map(v => `'${v}': ${v}`).join(',\n  ')}
}
`;

  try {
    // Execute with timeout
    const resultPromise = pyodide.runPythonAsync(fullCode, { globals: namespace });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Code execution timeout (3 seconds)')), 3000)
    );

    await Promise.race([resultPromise, timeoutPromise]);

    // Extract variables
    const result = namespace.get('_result');
    const values = result.toJs({ dict_converter: Object.fromEntries });

    return {
      success: true,
      values
    };
  } catch (error) {
    // Parse Python error for better feedback
    const errorMessage = error.message || String(error);
    let errorType = 'Error';

    if (errorMessage.includes('SyntaxError')) errorType = 'SyntaxError';
    else if (errorMessage.includes('NameError')) errorType = 'NameError';
    else if (errorMessage.includes('TypeError')) errorType = 'TypeError';
    else if (errorMessage.includes('ValueError')) errorType = 'ValueError';
    else if (errorMessage.includes('ZeroDivisionError')) errorType = 'ZeroDivisionError';
    else if (errorMessage.includes('timeout')) errorType = 'Timeout';

    return {
      success: false,
      error: errorMessage,
      errorType
    };
  } finally {
    // Clean up namespace
    namespace.destroy();
  }
}

/**
 * Check if Pyodide is already loaded
 * @returns {boolean} True if Pyodide is loaded
 */
export function isPyodideLoaded() {
  return pyodideInstance !== null;
}
