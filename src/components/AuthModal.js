import React from 'react';

const CloudIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="button-svg-icon"
  >
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

const CloudSaveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="button-svg-icon"
  >
    <path d="M12 13V2l4 4m-4-4L8 6m12 8v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
  </svg>
);

const FolderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="folder-svg-icon"
    style={{ marginRight: '6px', verticalAlign: 'middle', opacity: 0.8 }}
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ marginRight: '6px', verticalAlign: 'middle' }}
  >
    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.102 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.74-.08-1.3-.177-1.859H12.24z" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ marginRight: '6px', verticalAlign: 'middle' }}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="button-svg-icon"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="button-svg-icon"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const SecurityIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// Maps raw Supabase audit action strings → { label, category, risk }
const EVENT_MAP = {
  // Auth events
  login: { label: 'Sign In', category: 'Authentication', risk: 'low' },
  user_signedin: { label: 'Sign In', category: 'Authentication', risk: 'low' },
  user_signed_in: { label: 'Sign In', category: 'Authentication', risk: 'low' },
  signup: { label: 'New Account Created', category: 'Authentication', risk: 'low' },
  user_signedup: { label: 'New Account Created', category: 'Authentication', risk: 'low' },
  logout: { label: 'Sign Out', category: 'Authentication', risk: 'low' },
  user_signedout: { label: 'Sign Out', category: 'Authentication', risk: 'low' },
  token_refreshed: { label: 'Session Token Refreshed', category: 'Session', risk: 'low' },
  token_refresh: { label: 'Session Token Refreshed', category: 'Session', risk: 'low' },
  password_recovery: {
    label: 'Password Reset Requested',
    category: 'Authentication',
    risk: 'medium',
  },
  user_recovery: { label: 'Password Reset Requested', category: 'Authentication', risk: 'medium' },
  user_deleted: { label: 'Account Deleted', category: 'Authentication', risk: 'high' },
  user_modified: { label: 'Account Updated', category: 'Authentication', risk: 'low' },
  mfa_enrolled: { label: 'MFA Enabled', category: 'Security', risk: 'low' },
  mfa_unenrolled: { label: 'MFA Disabled', category: 'Security', risk: 'medium' },
  mfa_challenge_verified: { label: 'MFA Verified', category: 'Security', risk: 'low' },
  // Session-level events
  session_not_after: { label: 'Session Expired', category: 'Session', risk: 'low' },
  // OAuth
  oauth: { label: 'OAuth Sign In', category: 'Authentication', risk: 'low' },
};

const RISK_STYLES = {
  low: { color: '#4caf8d', bg: 'rgba(76,175,141,0.12)', label: 'Low' },
  medium: { color: '#e6a817', bg: 'rgba(230,168,23,0.12)', label: 'Medium' },
  high: { color: '#e05c5c', bg: 'rgba(224,92,92,0.12)', label: 'High' },
};

const CATEGORY_ICONS = {
  Authentication: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Session: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Security: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Workspace: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
  Other: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

function classifyLog(log) {
  // Normalize: lowercase the action, strip whitespace
  const raw = (log.action || '').toLowerCase().replace(/\s+/g, '_').trim();

  // Direct map hit
  if (EVENT_MAP[raw]) return EVENT_MAP[raw];

  // Partial matches for compound strings (e.g. "user_signedin_via_oauth")
  for (const [key, val] of Object.entries(EVENT_MAP)) {
    if (raw.includes(key)) return val;
  }

  // Filter out noisy internal DB operations — don't show them
  const isDbNoise =
    /^(insert|update|delete|select)\s/.test(raw) ||
    /chat_sessions|user_projects|user_preferences|audit_log/i.test(raw);
  if (isDbNoise) return null;

  return {
    label: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    category: 'Other',
    risk: 'low',
  };
}

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

function SecurityActivityFeed({ logs, loading }) {
  if (loading) {
    return <div className="audit-log-loading">Loading activity...</div>;
  }

  const meaningful = (logs || [])
    .map((log) => ({ log, meta: classifyLog(log) }))
    .filter((x) => x.meta !== null);

  if (meaningful.length === 0) {
    return (
      <div className="audit-log-empty">
        No security events recorded. Activity from sign-ins, MFA changes, and session events will
        appear here.
      </div>
    );
  }

  const highCount = meaningful.filter((x) => x.meta.risk === 'high').length;
  const medCount = meaningful.filter((x) => x.meta.risk === 'medium').length;

  return (
    <div className="security-feed">
      {(highCount > 0 || medCount > 0) && (
        <div className="security-feed-summary">
          {highCount > 0 && (
            <span className="feed-summary-pill high">
              {highCount} high-risk event{highCount > 1 ? 's' : ''}
            </span>
          )}
          {medCount > 0 && (
            <span className="feed-summary-pill medium">
              {medCount} medium-risk event{medCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
      <div className="security-feed-table">
        <div className="security-feed-head">
          <span>Event</span>
          <span>Category</span>
          <span>Time</span>
          <span>Risk</span>
        </div>
        {meaningful.map(({ log, meta }) => {
          const risk = RISK_STYLES[meta.risk] || RISK_STYLES.low;
          const icon = CATEGORY_ICONS[meta.category] || CATEGORY_ICONS.Other;
          return (
            <div key={log.id} className="security-feed-row">
              <span className="feed-event-label">{meta.label}</span>
              <span className="feed-category">
                <span className="feed-cat-icon" style={{ color: risk.color }}>
                  {icon}
                </span>
                {meta.category}
              </span>
              <span className="feed-time" title={new Date(log.created_at).toLocaleString()}>
                {timeAgo(log.created_at)}
              </span>
              <span className="feed-risk-badge" style={{ color: risk.color, background: risk.bg }}>
                {risk.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AuthModal({
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
  handleGuestLogin,
  cloudFiles,
  cloudLoading,
  activeCloudFileId,
  setActiveCloudFileId,
  cloudSaveName,
  setCloudSaveName,
  handleAuthSubmit,
  handleLogout,
  handleSaveToCloud,
  handleLoadCloudFile,
  handleDeleteCloudFile,
  handleOAuthSignIn,
  handleLogoutAll,
  handleMfaEnroll,
  handleMfaVerify,
  handleMfaUnenroll,
  handleExportData,
  mfaData,
  mfaLoading,
  isMfaEnrolled,
  auditLogs,
  auditLogsLoading,
  setMfaData,
  fetchAuditLogs,
}) {
  const [fileToDelete, setFileToDelete] = React.useState(null);
  const [mfaCode, setMfaCode] = React.useState('');
  const [showSecurityTab, setShowSecurityTab] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (showSecurityTab && fetchAuditLogs) {
      fetchAuditLogs();
    }
  }, [showSecurityTab, fetchAuditLogs]);

  if (!showAuthModal) return null;

  return (
    <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>
            <CloudIcon />
            {user ? 'Cloud Workspace Dashboard' : 'Connect Supabase Cloud'}
          </h2>
          <button className="auth-modal-close" onClick={() => setShowAuthModal(false)}>
            <XIcon />
          </button>
        </div>

        <div className="auth-modal-body">
          {!user ? (
            /* 1. Auth Form Mode */
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab-btn ${authTab === 'signin' ? 'active' : ''}`}
                  onClick={() => setAuthTab('signin')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                  onClick={() => setAuthTab('signup')}
                >
                  Create Account
                </button>
              </div>

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

              <div className="auth-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  required
                />
              </div>

              <div className="auth-form-group">
                <label>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#8b919b',
                      cursor: 'pointer',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                {authLoading ? <span className="btn-spinner" /> : null}
                {authLoading ? ' Connecting...' : authTab === 'signin' ? 'Log In' : 'Sign Up'}
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
                    padding: '8px',
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

              <div className="auth-oauth-section">
                <div className="auth-oauth-divider">
                  <span>OR CONNECT VIA</span>
                </div>
                <div className="auth-oauth-buttons">
                  <button
                    type="button"
                    className="auth-oauth-btn google-btn"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={authLoading}
                  >
                    <GoogleIcon /> GOOGLE
                  </button>
                  <button
                    type="button"
                    className="auth-oauth-btn github-btn"
                    onClick={() => handleOAuthSignIn('github')}
                    disabled={authLoading}
                  >
                    <GitHubIcon /> GITHUB
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* 2. Logged-in Dashboard & Cloud File Explorer */
            <div className="cloud-dashboard">
              <div className="cloud-profile-banner">
                <div className="cloud-profile-details">
                  <span className="profile-active-badge"></span>
                  <span className="profile-user-email">{user.email}</span>
                </div>
                <div className="cloud-logout-row">
                  <button
                    className="cloud-logout-btn"
                    onClick={handleLogout}
                    disabled={authLoading}
                  >
                    Logout
                  </button>
                  <button
                    className="cloud-logout-all-btn"
                    onClick={handleLogoutAll}
                    disabled={authLoading}
                    title="Sign out from all active sessions on all devices"
                  >
                    Logout All Devices
                  </button>
                </div>
              </div>

              {/* Cloud File Saver Section */}
              <form className="cloud-save-form" onSubmit={handleSaveToCloud}>
                <h3>Save Current File to Cloud</h3>
                <div className="cloud-save-input-row">
                  <input
                    type="text"
                    value={cloudSaveName}
                    onChange={(e) => setCloudSaveName(e.target.value)}
                    placeholder="e.g. main.py or server.js"
                    required
                  />
                  <button type="submit" className="cloud-save-submit-btn" disabled={cloudLoading}>
                    {cloudLoading ? <span className="btn-spinner" /> : <CloudSaveIcon />}
                    {activeCloudFileId ? ' Update Cloud' : ' Save to Cloud'}
                  </button>
                </div>
                {activeCloudFileId && (
                  <div className="active-file-indicator">
                    Currently editing cloud ID: <code>{activeCloudFileId}</code> (updating will
                    overwrite).
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCloudFileId(null);
                        setCloudSaveName('');
                      }}
                      className="new-cloud-file-btn"
                    >
                      Save as new file
                    </button>
                  </div>
                )}
              </form>

              {/* Cloud Files Listing */}
              <div className="cloud-files-section">
                <h3>Saved Projects ({cloudFiles.length})</h3>
                {cloudLoading && cloudFiles.length === 0 ? (
                  <div className="cloud-explorer-loading">
                    <span className="btn-spinner" /> Fetching projects...
                  </div>
                ) : cloudFiles.length === 0 ? (
                  <div className="cloud-explorer-empty">
                    You don't have any saved cloud files yet. Name and save your code above!
                  </div>
                ) : (
                  <div className="cloud-files-list">
                    {cloudFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`cloud-file-item ${activeCloudFileId === file.id ? 'active' : ''}`}
                        onClick={() => handleLoadCloudFile(file)}
                      >
                        <div className="cloud-file-item-left">
                          <FolderIcon />
                          <div className="cloud-file-meta">
                            <span className="cloud-file-name">{file.name}</span>
                            <span className="cloud-file-date">
                              Last updated: {new Date(file.updated_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="cloud-file-item-actions">
                          {fileToDelete === file.id ? (
                            <div className="cloud-file-delete-confirm">
                              <span className="cloud-file-delete-confirm-text">Delete?</span>
                              <button
                                className="cloud-file-confirm-btn danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCloudFile(file.id);
                                  setFileToDelete(null);
                                }}
                              >
                                Yes
                              </button>
                              <button
                                className="cloud-file-confirm-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFileToDelete(null);
                                }}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              className="cloud-file-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFileToDelete(file.id);
                              }}
                              title="Delete file"
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Security & Data Section (Audit Finding H-04, Compliance) */}
              <div className="cloud-security-section">
                <div
                  className="security-section-header"
                  onClick={() => setShowSecurityTab(!showSecurityTab)}
                >
                  <h3>
                    <SecurityIcon /> Security & Privacy
                    <span className={`chevron ${showSecurityTab ? 'open' : ''}`}>▼</span>
                  </h3>
                </div>

                {showSecurityTab && (
                  <div className="security-section-content">
                    {/* MFA Management */}
                    <div className="security-mfa-card">
                      <h4>Two-Factor Authentication (TOTP)</h4>
                      <p className="security-hint">
                        Secure your account using an authenticator app (Google Authenticator, Authy,
                        etc.).
                      </p>

                      {isMfaEnrolled ? (
                        <div className="mfa-status-active">
                          <span className="status-badge green">Active</span>
                          <p>MFA is protecting your account.</p>
                          <button
                            onClick={handleMfaUnenroll}
                            className="mfa-disable-btn"
                            disabled={mfaLoading}
                          >
                            Disable MFA
                          </button>
                        </div>
                      ) : mfaData ? (
                        <div className="mfa-enroll-flow">
                          <p>1. Scan this QR code with your app:</p>
                          <div className="mfa-qr-container">
                            <img src={mfaData.qrCode} alt="TOTP QR Code" />
                          </div>
                          <p>2. Enter the 6-digit code from your app:</p>
                          <div className="mfa-verify-row">
                            <input
                              type="text"
                              maxLength="6"
                              placeholder="000000"
                              value={mfaCode}
                              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                            />
                            <button
                              onClick={() => handleMfaVerify(mfaCode)}
                              className="mfa-verify-btn"
                              disabled={mfaLoading || mfaCode.length !== 6}
                            >
                              {mfaLoading ? 'Verifying...' : 'Verify & Enable'}
                            </button>
                          </div>
                          <button onClick={() => setMfaData(null)} className="mfa-cancel-link">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleMfaEnroll}
                          className="mfa-enroll-btn"
                          disabled={mfaLoading}
                        >
                          {mfaLoading ? 'Initialising...' : 'Set up Authenticator App'}
                        </button>
                      )}
                    </div>

                    {/* Data Export (GDPR) */}
                    <div className="security-privacy-card">
                      <h4>Data Privacy & Portability</h4>
                      <p className="security-hint">
                        Download a copy of all your cloud-saved projects and chat history.
                      </p>
                      <button onClick={handleExportData} className="data-export-btn">
                        <DownloadIcon /> Export My Data (JSON)
                      </button>
                    </div>

                    {/* Audit Logs (Recent Security Activity) */}
                    <div className="security-activity-card">
                      <div className="security-activity-header">
                        <h4>Recent Security Activity</h4>
                        <button
                          className="audit-refresh-btn"
                          onClick={() => fetchAuditLogs()}
                          disabled={auditLogsLoading}
                          title="Refresh activity logs"
                        >
                          <RefreshIcon />
                        </button>
                      </div>
                      <SecurityActivityFeed logs={auditLogs} loading={auditLogsLoading} />
                    </div>

                    {/* Legal / Policy */}
                    <div className="security-policy-link">
                      <a
                        href="https://codex-ide.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy & Data Policy
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
