/**
 * CodeX OpenTelemetry & Prometheus Metrics Telemetry Suite
 *
 * Provides HTTP request correlation tracing (X-Correlation-ID) and exports
 * Prometheus-formatted metrics for API latency (p50/p95/p99), AI completions,
 * cache hit/miss rates, and circuit breaker status.
 */

const crypto = require('crypto');

// In-memory Prometheus metric accumulators
const metrics = {
  httpRequestsTotal: new Map(), // key: 'method|route|status' => count
  httpRequestDurationMs: [], // Array of recorded request durations in ms
  aiChatRequestsTotal: new Map(), // key: 'model|provider|status' => count
  aiChatDurationMs: [],
  cacheHitsTotal: 0,
  cacheMissesTotal: 0,
  startTime: Date.now(),
};

/**
 * Middleware attaching unique X-Correlation-ID to incoming HTTP requests
 */
const correlationIdMiddleware = (req, res, next) => {
  const correlationId =
    req.headers['x-correlation-id'] || req.headers['x-request-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  next();
};

/**
 * Middleware tracking HTTP request metrics and duration
 */
const telemetryMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    const key = `${req.method}|${route}|${res.statusCode}`;

    // Accumulate count
    const currentCount = metrics.httpRequestsTotal.get(key) || 0;
    metrics.httpRequestsTotal.set(key, currentCount + 1);

    // Track duration (keep last 5000 samples for percentile calculation)
    metrics.httpRequestDurationMs.push(duration);
    if (metrics.httpRequestDurationMs.length > 5000) {
      metrics.httpRequestDurationMs.shift();
    }
  });

  next();
};

/**
 * Helper to record AI chat completion metrics
 */
const recordAiChatMetric = (provider, model, status, durationMs) => {
  const key = `${provider}|${model}|${status}`;
  const currentCount = metrics.aiChatRequestsTotal.get(key) || 0;
  metrics.aiChatRequestsTotal.set(key, currentCount + 1);

  metrics.aiChatDurationMs.push(durationMs);
  if (metrics.aiChatDurationMs.length > 2000) {
    metrics.aiChatDurationMs.shift();
  }
};

/**
 * Helper to record Cache hit/miss
 */
const recordCacheMetric = (isHit) => {
  if (isHit) metrics.cacheHitsTotal += 1;
  else metrics.cacheMissesTotal += 1;
};

/**
 * Calculate percentile from array of numbers
 */
const calculatePercentile = (arr, p) => {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
};

/**
 * Generate Prometheus Text Format exporter response
 */
const renderPrometheusMetrics = (circuitBreakerMetrics = {}) => {
  const uptimeSeconds = Math.floor((Date.now() - metrics.startTime) / 1000);
  const lines = [
    '# HELP codex_uptime_seconds Total server uptime in seconds.',
    '# TYPE codex_uptime_seconds gauge',
    `codex_uptime_seconds ${uptimeSeconds}`,
    '',
    '# HELP codex_http_requests_total Total number of HTTP requests processed.',
    '# TYPE codex_http_requests_total counter',
  ];

  for (const [key, count] of metrics.httpRequestsTotal.entries()) {
    const [method, route, status] = key.split('|');
    lines.push(
      `codex_http_requests_total{method="${method}",route="${route}",status="${status}"} ${count}`
    );
  }

  // Duration Percentiles
  const p50 = calculatePercentile(metrics.httpRequestDurationMs, 50);
  const p95 = calculatePercentile(metrics.httpRequestDurationMs, 95);
  const p99 = calculatePercentile(metrics.httpRequestDurationMs, 99);

  lines.push('');
  lines.push('# HELP codex_http_request_duration_ms HTTP request latency percentiles in ms.');
  lines.push('# TYPE codex_http_request_duration_ms gauge');
  lines.push(`codex_http_request_duration_ms{quantile="0.5"} ${p50}`);
  lines.push(`codex_http_request_duration_ms{quantile="0.95"} ${p95}`);
  lines.push(`codex_http_request_duration_ms{quantile="0.99"} ${p99}`);

  // AI Completion Metrics
  lines.push('');
  lines.push(
    '# HELP codex_ai_chat_requests_total Total AI completion requests by provider and status.'
  );
  lines.push('# TYPE codex_ai_chat_requests_total counter');
  for (const [key, count] of metrics.aiChatRequestsTotal.entries()) {
    const [provider, model, status] = key.split('|');
    lines.push(
      `codex_ai_chat_requests_total{provider="${provider}",model="${model}",status="${status}"} ${count}`
    );
  }

  // Cache Metrics
  lines.push('');
  lines.push('# HELP codex_cache_hits_total Total proxy cache hits.');
  lines.push('# TYPE codex_cache_hits_total counter');
  lines.push(`codex_cache_hits_total ${metrics.cacheHitsTotal}`);
  lines.push('# HELP codex_cache_misses_total Total proxy cache misses.');
  lines.push('# TYPE codex_cache_misses_total counter');
  lines.push(`codex_cache_misses_total ${metrics.cacheMissesTotal}`);

  // Circuit Breaker Metrics
  lines.push('');
  lines.push(
    '# HELP codex_circuit_breaker_state Current state of upstream AI circuit breakers (0=CLOSED, 1=HALF-OPEN, 2=OPEN).'
  );
  lines.push('# TYPE codex_circuit_breaker_state gauge');
  for (const [provider, record] of Object.entries(circuitBreakerMetrics)) {
    const stateVal = record.state === 'CLOSED' ? 0 : record.state === 'HALF-OPEN' ? 1 : 2;
    lines.push(`codex_circuit_breaker_state{provider="${provider}"} ${stateVal}`);
  }

  return lines.join('\n') + '\n';
};

module.exports = {
  correlationIdMiddleware,
  telemetryMiddleware,
  recordAiChatMetric,
  recordCacheMetric,
  renderPrometheusMetrics,
};
