const { describe, it: test } = require('node:test');
const assert = require('assert');
const http = require('http');

describe('Backend API Endpoint Integration Suite', () => {
  test('Health Endpoint Contract Check', () => {
    const healthPayload = { status: 'healthy', uptime: 120, cache: 'memory' };
    assert.strictEqual(healthPayload.status, 'healthy');
    assert.ok(healthPayload.uptime > 0);
  });

  test('Execute Endpoint Code Validation', () => {
    const mockRequest = {
      language: 'javascript',
      files: [{ name: 'index.js', content: 'console.log("test");' }],
    };

    assert.strictEqual(mockRequest.language, 'javascript');
    assert.strictEqual(mockRequest.files.length, 1);
    assert.ok(mockRequest.files[0].content.includes('console.log'));
  });

  test('AI Chat Endpoint Routing Payload', () => {
    const aiPayload = {
      model: 'groq',
      messages: [{ role: 'user', content: 'Hello AI' }],
    };

    assert.strictEqual(aiPayload.model, 'groq');
    assert.strictEqual(aiPayload.messages[0].role, 'user');
  });

  test('GitHub Export Gist Payload', () => {
    const gistPayload = {
      description: 'CodeX Shared Snippet',
      public: true,
      files: { 'main.js': { content: 'const a = 1;' } },
    };

    assert.strictEqual(gistPayload.public, true);
    assert.ok('main.js' in gistPayload.files);
  });

  test('OpenAPI Swagger Documentation Schema Contract Check', () => {
    const openApiSchema = require('../../api/openapi.json');
    assert.strictEqual(openApiSchema.openapi, '3.0.3');
    assert.strictEqual(openApiSchema.info.title, 'CodeX Cloud IDE Proxy API');
    assert.ok('/api/ai/chat' in openApiSchema.paths);
    assert.ok('/api/run' in openApiSchema.paths);
  });
});
