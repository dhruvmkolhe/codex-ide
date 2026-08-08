import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { auditLog } from '../utils/auditLogger';

const LOCKOUT_THRESHOLD = 5; // failed attempts before lockout
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function useAuth({ showToast, setShowAuthModal }) {
  const [user, setUser] = useState(() => {
    const savedGuest = localStorage.getItem('codex_guest_user');
    return savedGuest ? JSON.parse(savedGuest) : null;
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authTab, setAuthTab] = useState('signin'); // 'signin' or 'signup'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!supabase) return;

    // Get initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.removeItem('codex_guest_user');
      }
    });

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.removeItem('codex_guest_user');
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const getStoredLockoutUntil = () => {
    const stored = localStorage.getItem('codex_lockout_until');
    return stored ? parseInt(stored, 10) : null;
  };

  const getStoredAttempts = () => {
    const stored = localStorage.getItem('codex_login_attempts');
    return stored ? parseInt(stored, 10) : 0;
  };

  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!authEmail.trim() || !authPassword.trim()) {
      const err = 'Please fill in all fields.';
      setAuthError(err);
      if (showToast) showToast(err, 'error');
      return;
    }

    const lockoutUntil = getStoredLockoutUntil();
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
      const err = `Too many failed attempts. Try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.`;
      setAuthError(err);
      if (showToast) showToast(err, 'error');
      return;
    }

    if (!supabase) {
      const err = 'Supabase is not configured. Enable Guest Mode below to test locally.';
      setAuthError(err);
      if (showToast) showToast(err, 'error');
      return;
    }

    setAuthLoading(true);
    try {
      if (authTab === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (error) {
          const attempts = getStoredAttempts() + 1;
          if (attempts >= LOCKOUT_THRESHOLD) {
            const until = Date.now() + LOCKOUT_DURATION_MS;
            localStorage.setItem('codex_lockout_until', until.toString());
            localStorage.setItem('codex_login_attempts', '0');
            const lockErr = 'Too many failed attempts. Account locked for 15 minutes.';
            setAuthError(lockErr);
            if (showToast) showToast(lockErr, 'error');
          } else {
            localStorage.setItem('codex_login_attempts', attempts.toString());
            setAuthError(error.message);
            if (showToast) showToast(error.message, 'error');
          }
        } else if (data?.user) {
          localStorage.removeItem('codex_login_attempts');
          localStorage.removeItem('codex_lockout_until');
          auditLog('login', data.user.id, { method: 'email' });
          if (showToast) showToast(`Welcome back, ${data.user.email}!`, 'success');
          setAuthEmail('');
          setAuthPassword('');
          setAuthError('');
          if (setShowAuthModal) setShowAuthModal(false);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });

        if (error) {
          setAuthError(error.message);
          if (showToast) showToast(error.message, 'error');
        } else if (data?.user) {
          auditLog('signup', data.user.id, { method: 'email' });
          const msg = data.session
            ? 'Account created and signed in successfully!'
            : 'Registration successful! Check your inbox if email verification is required.';
          if (showToast) showToast(msg, 'success');
          setAuthEmail('');
          setAuthPassword('');
          setAuthError('');
          setAuthTab('signin');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      const msg = 'An unexpected error occurred during authorization.';
      setAuthError(msg);
      if (showToast) showToast(msg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest-' + Math.random().toString(36).substr(2, 9),
      email: 'guest@codex.local',
      role: 'guest',
      user_metadata: { name: 'Demo Guest' },
    };
    setUser(guestUser);
    localStorage.setItem('codex_guest_user', JSON.stringify(guestUser));
    if (showToast) showToast('Logged in as Guest User.', 'success');
    if (setShowAuthModal) setShowAuthModal(false);
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      if (user) auditLog('logout', user.id, {});
      if (supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('codex_guest_user');
      setUser(null);
      if (showToast) showToast('Logged out successfully.', 'success');
      if (setShowAuthModal) setShowAuthModal(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setAuthLoading(true);
    try {
      if (user) auditLog('logout_all_devices', user.id, {});
      if (supabase) {
        await supabase.auth.signOut({ scope: 'global' });
      }
      localStorage.removeItem('codex_guest_user');
      setUser(null);
      if (showToast) showToast('Logged out from all devices.', 'success');
      if (setShowAuthModal) setShowAuthModal(false);
    } catch (err) {
      console.error('Logout all error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    if (!supabase) {
      if (showToast) showToast('Supabase is not configured.', 'error');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (!error) {
        auditLog('oauth_login_initiated', null, { provider });
      } else {
        setAuthError(error.message);
        if (showToast) showToast(`${provider} login failed: ${error.message}`, 'error');
      }
    } catch (err) {
      setAuthError(`Unexpected error during ${provider} authentication.`);
      if (showToast) showToast(`Unexpected error during ${provider} authentication.`, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    user,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authTab,
    setAuthTab,
    authLoading,
    authError,
    setAuthError,
    handleAuthSubmit,
    handleGuestLogin,
    handleLogout,
    handleLogoutAll,
    handleOAuthSignIn,
  };
}
