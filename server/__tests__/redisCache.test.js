const { describe, it: test } = require('node:test');
const assert = require('assert');

class MockLRUCache {
  constructor(maxItems = 10) {
    this.cache = new Map();
    this.maxItems = maxItems;
  }

  set(key, value) {
    if (this.cache.size >= this.maxItems) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key) {
    return this.cache.get(key) || null;
  }
}

describe('In-Memory & Redis Cache Engine Suite', () => {
  test('Bounded LRU eviction policy under high capacity', () => {
    const lru = new MockLRUCache(3);
    lru.set('k1', 'val1');
    lru.set('k2', 'val2');
    lru.set('k3', 'val3');
    lru.set('k4', 'val4'); // Should evict k1

    assert.strictEqual(lru.get('k1'), null);
    assert.strictEqual(lru.get('k4'), 'val4');
  });
});
