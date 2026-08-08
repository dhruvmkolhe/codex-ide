import React, { useState } from 'react';

export function LandingAuthModal({
  showAuthModal,
  setShowAuthModal,
  user,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authTab,
  setAuthTab,
  authLoading,
  authError,
  handleAuthSubmit,
  handleOAuthSignIn,
  handleGuestLogin,
}) {
  const [showPassword, setShowPassword] = useState(false);

  if (!showAuthModal) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) setShowAuthModal(false);
  };

  return (
    <div className={`auth-overlay ${showAuthModal ? 'open' : ''}`} onClick={handleOverlayClick}>
      <div className="auth-card">
        <button className="auth-x" onClick={() => setShowAuthModal(false)}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {!user ? (
          <>
            <div className="auth-heading">
              {authTab === 'signin' ? 'Welcome to CodeX' : 'Join CodeX'}
            </div>

            <div className="auth-tabs-row">
              <button
                className={`auth-tab-btn ${authTab === 'signin' ? 'active' : ''}`}
                onClick={() => setAuthTab('signin')}
              >
                Sign In
              </button>
              <button
                className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthTab('signup')}
              >
                Create Account
              </button>
            </div>

            <button onClick={() => handleOAuthSignIn('google')} className="auth-oauth google">
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5"
                alt="Google"
              />{' '}
              Continue with Google
            </button>
            <button onClick={() => handleOAuthSignIn('github')} className="auth-oauth github">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              Continue with GitHub
            </button>

            <div className="auth-divid">OR CONTINUE WITH EMAIL</div>

            {authError && (
              <div
                style={{
                  background: 'rgba(255, 123, 114, 0.12)',
                  border: '1px solid rgba(255, 123, 114, 0.3)',
                  color: '#ff7b72',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '14px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚠️</span> {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              <div
                className={`auth-name-field ${authTab === 'signup' ? 'show' : ''}`}
                style={{ display: authTab === 'signup' ? 'block' : 'none' }}
              >
                <label className="auth-lbl">Full Name</label>
                <input
                  className="auth-inp"
                  style={{ marginBottom: '14px' }}
                  type="text"
                  placeholder="John Doe"
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="auth-lbl">Email Address</label>
                <input
                  className="auth-inp"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>
              <div className="mb-md">
                <label className="auth-lbl">Password</label>
                <div className="pass-container">
                  <input
                    className="auth-inp"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <button className="auth-btn-main" type="submit" disabled={authLoading}>
                {authLoading
                  ? 'Please wait...'
                  : authTab === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
              </button>
              {handleGuestLogin && (
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    background: '#21262d',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#c9d1d9',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  👤 Continue as Demo Guest (Local Mode)
                </button>
              )}
            </form>

            <p className="auth-foot">
              {authTab === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button className="auth-link" onClick={() => setAuthTab('signup')}>
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button className="auth-link" onClick={() => setAuthTab('signin')}>
                    Sign In
                  </button>
                </>
              )}
            </p>
          </>
        ) : (
          <div className="p-xl text-center">
            <div className="auth-heading">Welcome Back</div>
            <p className="text-on-surface-variant mb-xl text-sm">
              You are logged in as {user.email}
            </p>
            <button onClick={() => (window.location.href = '/ide')} className="auth-btn-main mb-md">
              Open IDE Workspace
            </button>
            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full py-md text-xs font-bold text-on-surface-variant hover:text-on-surface"
            >
              Back to Landing Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
