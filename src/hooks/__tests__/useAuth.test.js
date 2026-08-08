import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { supabase } from '../../supabaseClient';

jest.mock('../../supabaseClient', () => ({
  __esModule: true,
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signUp: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      signInWithOAuth: jest.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

describe('useAuth custom hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    supabase.auth.getSession.mockImplementation(() => Promise.resolve({ data: { session: null } }));
    supabase.auth.onAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    }));
    supabase.auth.signOut.mockImplementation(() => Promise.resolve({ error: null }));
  });

  test('handleGuestLogin should set guest user state and store in localStorage', () => {
    const showToast = jest.fn();
    const setShowAuthModal = jest.fn();

    const { result } = renderHook(() => useAuth({ showToast, setShowAuthModal }));

    act(() => {
      result.current.handleGuestLogin();
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user.email).toBe('guest@codex.local');
    expect(showToast).toHaveBeenCalledWith('Logged in as Guest User.', 'success');
    expect(setShowAuthModal).toHaveBeenCalledWith(false);
  });

  test('handleLogout should clear user state and call supabase signOut', async () => {
    const showToast = jest.fn();
    const { result } = renderHook(() => useAuth({ showToast }));

    act(() => {
      result.current.handleGuestLogin();
    });

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(result.current.user).toBeNull();
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('Logged out successfully.', 'success');
  });
});
