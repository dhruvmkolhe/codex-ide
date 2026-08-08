import { setItem, getItem, removeItem, purgeExpiredItems } from '../storage';

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('setItem and getItem should store and retrieve data with TTL wrapper', () => {
    setItem('codex_test_key', { data: 'sample' });
    const val = getItem('codex_test_key');
    expect(val).toEqual({ data: 'sample' });
  });

  test('getItem should return null for expired key', () => {
    // Save with negative TTL (already expired)
    setItem('codex_expired_key', 'value', -1000);
    const val = getItem('codex_expired_key');
    expect(val).toBeNull();
  });

  test('removeItem should remove key from storage', () => {
    setItem('codex_remove_key', 'value');
    removeItem('codex_remove_key');
    expect(getItem('codex_remove_key')).toBeNull();
  });

  test('purgeExpiredItems should delete expired items starting with codex_', () => {
    setItem('codex_valid', 'ok', 10000);
    setItem('codex_old', 'expired', -5000);
    purgeExpiredItems();

    expect(getItem('codex_valid')).toBe('ok');
    expect(getItem('codex_old')).toBeNull();
  });
});
