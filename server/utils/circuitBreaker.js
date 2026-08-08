/**
 * CodeX Production LLM Circuit Breaker & Adaptive Fallback Router
 *
 * Provides high-availability AI proxy routing with 3-state circuit breaker logic
 * (CLOSED, OPEN, HALF-OPEN) to gracefully handle upstream rate-limits (HTTP 429)
 * and 5xx server errors without dropping client requests.
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3; // Consecutive failures before tripping
    this.resetTimeoutMs = options.resetTimeoutMs || 30000; // Cool-off period (30s) before HALF-OPEN
    this.states = new Map(); // providerName -> { state, failures, lastFailureTime, successesInHalfOpen }
  }

  getProviderState(providerName) {
    if (!this.states.has(providerName)) {
      this.states.set(providerName, {
        state: 'CLOSED',
        failures: 0,
        lastFailureTime: 0,
        successesInHalfOpen: 0,
      });
    }
    const record = this.states.get(providerName);

    // Transition OPEN -> HALF-OPEN if reset timeout has elapsed
    if (record.state === 'OPEN' && Date.now() - record.lastFailureTime > this.resetTimeoutMs) {
      record.state = 'HALF-OPEN';
      record.successesInHalfOpen = 0;
      console.log(
        `[CircuitBreaker] Upstream '${providerName}' entering HALF-OPEN state. Testing availability...`
      );
    }

    return record;
  }

  isAvailable(providerName) {
    const record = this.getProviderState(providerName);
    return record.state !== 'OPEN';
  }

  recordSuccess(providerName) {
    const record = this.getProviderState(providerName);
    if (record.state === 'HALF-OPEN') {
      record.successesInHalfOpen += 1;
      if (record.successesInHalfOpen >= 2) {
        // 2 consecutive successes to close circuit
        record.state = 'CLOSED';
        record.failures = 0;
        console.log(
          `[CircuitBreaker] Upstream '${providerName}' recovered successfully. Circuit CLOSED.`
        );
      }
    } else if (record.state === 'CLOSED') {
      record.failures = 0;
    }
  }

  recordFailure(providerName, error) {
    const record = this.getProviderState(providerName);
    record.failures += 1;
    record.lastFailureTime = Date.now();

    const isRateLimit = error.response?.status === 429;
    const isServerError = error.response?.status >= 500;

    // Immediately trip for 429 rate limit or reaching failure threshold
    if (isRateLimit || record.failures >= this.failureThreshold) {
      record.state = 'OPEN';
      console.warn(
        `[CircuitBreaker] Upstream '${providerName}' TRIPPED to OPEN state! Reason: ${isRateLimit ? '429 Rate Limit' : 'Consecutive Failures (' + record.failures + ')'}`
      );
    }
  }

  getMetrics() {
    const metrics = {};
    for (const [provider, record] of this.states.entries()) {
      metrics[provider] = {
        state: record.state,
        failures: record.failures,
        lastFailureTime: record.lastFailureTime,
      };
    }
    return metrics;
  }
}

module.exports = new CircuitBreaker();
