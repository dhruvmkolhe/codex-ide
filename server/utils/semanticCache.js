/**
 * CodeX High-Performance Semantic Prompt Cache Engine
 *
 * Provides prompt normalization and SHA-256 fingerprinting for inline ghost-text
 * autocompletions and repetitive code refactoring queries to reduce latency (<10ms)
 * and prevent redundant external LLM API billing.
 */

const crypto = require('crypto');
const { recordCacheMetric } = require('./telemetry');

class SemanticCacheEngine {
  /**
   * Normalize input prompt messages to produce a deterministic fingerprint
   */
  generateKey(messages, model = '') {
    if (!messages || !Array.isArray(messages)) return null;

    // Extract raw content strings and strip extra whitespace
    const normalizedText = messages
      .map((m) => (m.content || '').trim().replace(/\s+/g, ' '))
      .join('||');

    const hash = crypto.createHash('sha256').update(`${model}:${normalizedText}`).digest('hex');
    return `semantic_cache:${hash.substring(0, 32)}`;
  }

  /**
   * Retrieve cached response from active cache (Redis or local LRU)
   */
  async get(cacheInstance, key) {
    if (!cacheInstance || !key) return null;
    try {
      const raw = await cacheInstance.get(key);
      if (raw) {
        recordCacheMetric(true);
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      }
      recordCacheMetric(false);
      return null;
    } catch (err) {
      recordCacheMetric(false);
      return null;
    }
  }

  /**
   * Store completion response in active cache with TTL (seconds)
   */
  async set(cacheInstance, key, value, ttlSeconds = 600) {
    if (!cacheInstance || !key || !value) return;
    try {
      const payload = typeof value === 'string' ? value : JSON.stringify(value);
      if (typeof cacheInstance.setEx === 'function') {
        await cacheInstance.setEx(key, ttlSeconds, payload);
      } else if (typeof cacheInstance.set === 'function') {
        await cacheInstance.set(key, payload, 'EX', ttlSeconds);
      }
    } catch (err) {
      console.error('[SemanticCache] Error writing to cache:', err.message);
    }
  }
}

module.exports = new SemanticCacheEngine();
