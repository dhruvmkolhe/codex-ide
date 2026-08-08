/**
 * CodeX Web Worker for Isolated Client-Side JavaScript Execution Sandbox
 *
 * Runs user-submitted JavaScript code off the main UI thread in an isolated worker,
 * protecting the main React thread from freezing due to heavy computation or infinite loops.
 */

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = (event) => {
  const { id, code } = event.data || {};

  if (!code || typeof code !== 'string') {
    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
      id,
      success: true,
      output: 'No code provided to execute.',
    });
    return;
  }

  const logs = [];
  const customConsole = {
    log: (...args) =>
      logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
    error: (...args) =>
      logs.push(
        '[ERROR] ' +
          args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
      ),
    warn: (...args) =>
      logs.push(
        '[WARN] ' +
          args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
      ),
    info: (...args) =>
      logs.push(
        '[INFO] ' +
          args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
      ),
  };

  try {
    // eslint-disable-next-line no-new-func
    const runFn = new Function('console', code);
    const result = runFn(customConsole);

    if (result !== undefined) {
      logs.push(`=> ${typeof result === 'object' ? JSON.stringify(result) : String(result)}`);
    }

    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
      id,
      success: true,
      output: logs.join('\n') || 'Program executed successfully with no output.',
    });
  } catch (err) {
    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
      id,
      success: false,
      output: logs.join('\n') + (logs.length ? '\n' : '') + `Runtime Error: ${err.message}`,
    });
  }
};
