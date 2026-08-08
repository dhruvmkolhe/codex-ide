/**
 * CodeX Web Worker for Off-Thread SAST & Security Pattern Scanning
 *
 * Executes heavy regex regex scans off the main React UI thread,
 * preventing UI thread lag or frame drops during rapid code entry.
 */

import { scanCodeForSecrets } from '../utils/sastScanner';

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = (event) => {
  const { id, code } = event.data || {};
  if (!code) {
    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({ id, diagnostics: [] });
    return;
  }

  const diagnostics = scanCodeForSecrets(code);
  /* eslint-disable-next-line no-restricted-globals */
  self.postMessage({ id, diagnostics });
};
