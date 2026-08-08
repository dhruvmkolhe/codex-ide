const { describe, it: test } = require('node:test');
const assert = require('assert');
const circuitBreaker = require('../utils/circuitBreaker');
const telemetry = require('../utils/telemetry');
const semanticCache = require('../utils/semanticCache');
const { encrypt, decrypt, isEncrypted } = require('../utils/encryption');

describe('Server & System Architecture Modules', () => {
  describe('Encryption Utility', () => {
    test('should encrypt and decrypt strings correctly', () => {
      const text = 'my-secret-supabase-token-123';
      const encrypted = encrypt(text);
      assert.strictEqual(isEncrypted(encrypted), true);
      const decrypted = decrypt(encrypted);
      assert.strictEqual(decrypted, text);
    });
  });

  describe('LLM Circuit Breaker', () => {
    test('should start in CLOSED state for providers', () => {
      assert.strictEqual(circuitBreaker.isAvailable('groq'), true);
      const metrics = circuitBreaker.getMetrics();
      assert.strictEqual(metrics.groq.state, 'CLOSED');
    });

    test('should trip to OPEN on 429 rate limits', () => {
      circuitBreaker.recordFailure('groq_test', { response: { status: 429 } });
      assert.strictEqual(circuitBreaker.isAvailable('groq_test'), false);
      const metrics = circuitBreaker.getMetrics();
      assert.strictEqual(metrics.groq_test.state, 'OPEN');
    });
  });

  describe('Prometheus Telemetry', () => {
    test('should render Prometheus metrics text format', () => {
      telemetry.recordCacheMetric(true);
      telemetry.recordAiChatMetric('groq', 'llama3', 200, 150);
      const rendered = telemetry.renderPrometheusMetrics(circuitBreaker.getMetrics());

      assert.ok(rendered.includes('codex_uptime_seconds'));
      assert.ok(rendered.includes('codex_cache_hits_total'));
      assert.ok(rendered.includes('codex_circuit_breaker_state'));
    });
  });

  describe('Semantic Prompt Cache Engine', () => {
    test('should generate deterministic semantic cache key', () => {
      const messages = [{ role: 'user', content: 'const a = 10;' }];
      const key1 = semanticCache.generateKey(messages, 'llama3');
      const key2 = semanticCache.generateKey(messages, 'llama3');
      assert.strictEqual(key1, key2);
      assert.ok(key1.startsWith('semantic_cache:'));
    });
  });
});
