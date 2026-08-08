/**
 * storage.js
 * Secure localStorage wrapper with TTL (time-to-live) expiry.
 *
 * Prevents stale/sensitive data (e.g. code snippets containing secrets)
 * from sitting in localStorage indefinitely.
 *
 * Usage:
 *   import { setItem, getItem, removeItem } from './utils/storage';
 *
 *   // Save with a 7-day TTL (default)
 *   setItem('codex_code_python', code);
 *
 *   // Save with a custom TTL (milliseconds)
 *   setItem('codex_code_python', code, 24 * 60 * 60 * 1000); // 1 day
 *
 *   // Read — returns null if missing or expired
 *   const code = getItem('codex_code_python');
 */

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Store a value in localStorage with an expiry timestamp.
 * @param {string} key
 * @param {*}      value   - Will be JSON-serialised
 * @param {number} [ttl]   - TTL in ms (default 7 days)
 */
export function setItem(key, value, ttl = DEFAULT_TTL_MS) {
  try {
    const record = {
      v: value,
      e: Date.now() + ttl, // expiry unix timestamp
    };
    localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // Storage quota exceeded or private browsing — fail silently
  }
}

/**
 * Retrieve a value from localStorage.
 * Returns null if the key is missing, expired, or malformed.
 * @param {string} key
 * @returns {*}
 */
export function getItem(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;

    // Support plain (non-TTL-wrapped) strings for backwards compatibility
    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      return raw; // plain string value stored previously
    }

    // If the stored value doesn't look like a TTL record, return as-is
    if (typeof record !== 'object' || record === null || !('v' in record)) {
      return record;
    }

    // Check expiry
    if (record.e && Date.now() > record.e) {
      localStorage.removeItem(key);
      return null;
    }

    return record.v;
  } catch {
    return null;
  }
}

/**
 * Remove a key from localStorage.
 * @param {string} key
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Purge all expired CodeX keys from localStorage.
 * Call this once on app startup to keep storage clean.
 */
export function purgeExpiredItems() {
  try {
    const now = Date.now();
    Object.keys(localStorage).forEach((key) => {
      if (!key.startsWith('codex_')) return;
      try {
        const raw = localStorage.getItem(key);
        const record = JSON.parse(raw);
        if (record && typeof record === 'object' && record.e && now > record.e) {
          localStorage.removeItem(key);
        }
      } catch {
        // Not a TTL record — leave it alone
      }
    });
  } catch {
    // ignore
  }
}
