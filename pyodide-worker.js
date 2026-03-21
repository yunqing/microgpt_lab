/* Web Worker: runs Pyodide off the main thread with streaming stdout */
let pyodide = null;
let stdoutInstalled = false;

async function ensurePyodide() {
  if (pyodide) return pyodide;
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
  });
  return pyodide;
}

function installStdout() {
  if (stdoutInstalled) return;

  pyodide.registerJsModule('_worker_bridge', {
    post_line: (line) => self.postMessage({ type: 'stdout', line }),
  });

  pyodide.runPython(`
import _worker_bridge, sys

class _WorkerStdout:
    def __init__(self):
        self._buf = ''
    def write(self, s):
        self._buf += s
        while '\\n' in self._buf:
            line, self._buf = self._buf.split('\\n', 1)
            _worker_bridge.post_line(line)
    def flush(self):
        if self._buf:
            _worker_bridge.post_line(self._buf)
            self._buf = ''

sys.stdout = _WorkerStdout()
`);

  stdoutInstalled = true;
}

// Start loading immediately when worker spawns
const ready = ensurePyodide();

self.onmessage = async (e) => {
  const { type, code } = e.data;

  if (type === 'run') {
    try {
      await ready;
      self.postMessage({ type: 'ready' });
      installStdout();

      try {
        pyodide.runPython(code);
        pyodide.runPython('sys.stdout.flush()');
        self.postMessage({ type: 'run-done', error: null });
      } catch (pyErr) {
        try { pyodide.runPython('sys.stdout.flush()'); } catch (_) {}
        self.postMessage({ type: 'run-done', error: pyErr.message });
      }
    } catch (err) {
      self.postMessage({ type: 'run-error', error: err.message });
    }
  }
};
