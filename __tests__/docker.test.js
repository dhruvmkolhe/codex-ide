const { describe, it: test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Docker Infrastructure & Service Setup Validation Suite', () => {
  const rootDir = path.resolve(__dirname, '..');

  test('Dockerfile syntax and multi-stage build structure', () => {
    const dockerfileContent = fs.readFileSync(path.join(rootDir, 'Dockerfile'), 'utf-8');
    assert.ok(dockerfileContent.includes('FROM node:20-alpine AS build'));
    assert.ok(dockerfileContent.includes('FROM nginx:alpine'));
    assert.ok(dockerfileContent.includes('EXPOSE 80'));
    assert.ok(dockerfileContent.includes('USER appuser'));
  });

  test('docker-compose.yml service definitions and environment bindings', () => {
    const composeContent = fs.readFileSync(path.join(rootDir, 'docker-compose.yml'), 'utf-8');
    assert.ok(composeContent.includes('services:'));
    assert.ok(composeContent.includes('redis:'));
    assert.ok(composeContent.includes('backend:'));
    assert.ok(composeContent.includes('app:'));
    assert.ok(composeContent.includes('REDIS_URL'));
    assert.ok(composeContent.includes('5001:5001'));
  });

  test('nginx.conf routing and reverse proxy configuration', () => {
    const nginxContent = fs.readFileSync(path.join(rootDir, 'nginx.conf'), 'utf-8');
    assert.ok(nginxContent.includes('server {'));
    assert.ok(nginxContent.includes('location / {'));
    assert.ok(nginxContent.includes('location /api/ {'));
    assert.ok(nginxContent.includes('proxy_pass http://backend:5001/api/;'));
  });

  test('.dockerignore presence and required exclusions', () => {
    const ignoreContent = fs.readFileSync(path.join(rootDir, '.dockerignore'), 'utf-8');
    assert.ok(ignoreContent.includes('node_modules'));
  });
});
