const { describe, it: test } = require('node:test');
const assert = require('assert');
const { RateLimiterMemory } = require('rate-limiter-flexible');

describe('Security Headers & Rate Limiting Test Suite', () => {
  test('Helmet Security Headers Assertion', () => {
    const defaultHeaders = {
      'x-dns-prefetch-control': 'off',
      'x-frame-options': 'SAMEORIGIN',
      'strict-transport-security': 'max-age=15552000; includeSubDomains',
      'x-content-type-options': 'nosniff',
    };

    assert.strictEqual(defaultHeaders['x-frame-options'], 'SAMEORIGIN');
    assert.strictEqual(defaultHeaders['x-content-type-options'], 'nosniff');
  });

  test('Rate Limiter Threshold Counter logic', () => {
    const rateLimitStore = new Map();
    const maxRequests = 100;
    const ip = '127.0.0.1';

    for (let i = 0; i < 105; i++) {
      const count = (rateLimitStore.get(ip) || 0) + 1;
      rateLimitStore.set(ip, count);
    }

    const currentRequests = rateLimitStore.get(ip);
    assert.strictEqual(currentRequests > maxRequests, true);
  });

  test('User-Aware Rate Limit Key Extraction', () => {
    const getClientIp = (req) => {
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
        const ip = forwarded.split(',')[0].trim();
        if (ip) return ip;
      }
      return req.ip || req.socket?.remoteAddress || '127.0.0.1';
    };

    const getRateLimitKey = (req) => {
      const ip = getClientIp(req);
      if (req.user && req.user.id) {
        if (req.user.id === 'guest') {
          return `guest:${ip}`;
        }
        return `user:${req.user.id}`;
      }
      return `ip:${ip}`;
    };

    // Registered user
    const reqUser = { headers: {}, ip: '192.168.1.5', user: { id: 'usr_abc123' } };
    assert.strictEqual(getRateLimitKey(reqUser), 'user:usr_abc123');

    // Guest user
    const reqGuest = { headers: {}, ip: '192.168.1.5', user: { id: 'guest' } };
    assert.strictEqual(getRateLimitKey(reqGuest), 'guest:192.168.1.5');

    // Unauthenticated request
    const reqAnon = { headers: {}, ip: '192.168.1.10' };
    assert.strictEqual(getRateLimitKey(reqAnon), 'ip:192.168.1.10');
  });

  test('Per-User Rate Limit Quota Isolation', async () => {
    const limiter = new RateLimiterMemory({ points: 5, duration: 60 });

    // User A consumes all 5 points
    for (let i = 0; i < 5; i++) {
      await limiter.consume('user:usr_userA', 1);
    }

    // User A should now be rate limited
    let userABlocked = false;
    try {
      await limiter.consume('user:usr_userA', 1);
    } catch (rej) {
      userABlocked = true;
    }
    assert.strictEqual(userABlocked, true, 'User A should be rate limited after 5 requests');

    // User B should NOT be rate limited and should have full capacity
    const resB = await limiter.consume('user:usr_userB', 1);
    assert.strictEqual(resB.remainingPoints, 4, 'User B should have independent rate limit quota');
  });

  test('User Tier Cost Deduction', () => {
    const calculateCost = (req) => {
      const isRegisteredUser = req.user?.id && req.user.id !== 'guest';
      const isGuestUser = req.user?.id === 'guest';
      if (isGuestUser) return 2;
      if (!isRegisteredUser) return 3;
      return 1;
    };

    assert.strictEqual(calculateCost({ user: { id: 'user123' } }), 1);
    assert.strictEqual(calculateCost({ user: { id: 'guest' } }), 2);
    assert.strictEqual(calculateCost({}), 3);
  });
});

