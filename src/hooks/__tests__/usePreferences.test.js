import { renderHook, act } from '@testing-library/react';
import { usePreferences } from '../usePreferences';

describe('usePreferences custom hook', () => {
  test('returns preferences state and helper methods when offline/logged out', () => {
    const { result } = renderHook(() => usePreferences({ user: null }));
    expect(result.current.preferences).toEqual({});
    expect(typeof result.current.fetchPreferences).toBe('function');
    expect(typeof result.current.updatePreferences).toBe('function');
  });

  test('updatePreferences safely handles state changes', async () => {
    const { result } = renderHook(() => usePreferences({ user: null }));

    await act(async () => {
      await result.current.updatePreferences({ theme: 'dracula' });
    });

    expect(result.current.preferences).toBeDefined();
  });
});
