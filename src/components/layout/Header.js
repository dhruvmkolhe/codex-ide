import React from 'react';
import AnimatedLogo from '../AnimatedLogo';
import {
  FileMenuIcon,
  ChevronDownIcon,
  ExplorerMenuIcon,
  NewFileIcon,
  OpenFileIcon,
  DownloadIcon,
  CloudIcon,
  TerminalMenuIcon,
  RunIcon,
  ShowIcon,
  HideIcon,
  ConsoleMenuIcon,
  ClearIcon,
  CopyIcon,
  SettingsMenuIcon,
  ThemeIcon,
  FontIcon,
  WhiteboardIcon,
} from '../Icons';
import { IDE_THEMES } from '../../utils/ideConstants';

export const Header = React.memo(function Header({
  activeMenu,
  setActiveMenu,
  isExplorerOpen,
  setIsExplorerOpen,
  handleNewFile,
  handleImportFileClick,
  handleDownloadFile,
  handleRestoreLocalBackup,
  hasLocalBackup,
  handleFreshRun,
  isTerminalCollapsed,
  toggleTerminalCollapse,
  handleClearConsole,
  handleCopyConsole,
  activeTheme,
  setActiveTheme,
  customThemeColors,
  setCustomThemeColors,
  fontSize,
  handleDecreaseFont,
  handleIncreaseFont,
  showToast,
  lastSavedTime,
  user,
  setShowAuthModal,
  onOpenByokSettings,
  fileInputRef,
  handleFileUpload,
  workspaceMode,
  onOpenModeSelector,
  onOpenWhiteboard,
}) {
  return (
    <div className="top-navbar">
      <div className="left-nav">
        <div
          className="brand-logo"
          onClick={() => (window.location.href = '/homepage')}
          style={{ cursor: 'pointer' }}
        >
          <AnimatedLogo size="md" />
        </div>

        <div className="mobile-nav-scroll">
          {/* File Menu */}
          <div className={`nav-item-container ${activeMenu === 'file' ? 'active' : ''}`}>
            <span onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}>
              <FileMenuIcon /> File <ChevronDownIcon />
            </span>
            {activeMenu === 'file' && (
              <div className="menu-dropdown">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setIsExplorerOpen(!isExplorerOpen);
                    setActiveMenu(null);
                  }}
                >
                  <span className="dropdown-item-label">
                    <ExplorerMenuIcon /> Explorer
                  </span>
                  <span className="dropdown-shortcut">{isExplorerOpen ? 'Hide' : 'Show'}</span>
                </div>
                <div className="dropdown-divider"></div>
                <div
                  className="dropdown-item"
                  onClick={() => {
                    onOpenWhiteboard();
                    setActiveMenu(null);
                  }}
                >
                  <span className="dropdown-item-label">
                    <WhiteboardIcon /> Whiteboard (tldraw)
                  </span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={handleNewFile}>
                  <span className="dropdown-item-label">
                    <NewFileIcon /> New File
                  </span>
                  <span className="dropdown-shortcut">Ctrl+N</span>
                </div>
                <div className="dropdown-item" onClick={handleImportFileClick}>
                  <span className="dropdown-item-label">
                    <OpenFileIcon /> Upload File...
                  </span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={handleDownloadFile}>
                  <span className="dropdown-item-label">
                    <DownloadIcon /> Download Code
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Menu */}
          <div className={`nav-item-container ${activeMenu === 'terminal' ? 'active' : ''}`}>
            <span onClick={() => setActiveMenu(activeMenu === 'terminal' ? null : 'terminal')}>
              <TerminalMenuIcon /> Terminal <ChevronDownIcon />
            </span>
            {activeMenu === 'terminal' && (
              <div className="menu-dropdown">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    handleFreshRun();
                    setActiveMenu(null);
                  }}
                >
                  <span className="dropdown-item-label">
                    <RunIcon /> Run File
                  </span>
                  <span className="dropdown-shortcut">F5</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={toggleTerminalCollapse}>
                  <span className="dropdown-item-label">
                    {isTerminalCollapsed ? (
                      <>
                        <ShowIcon /> Show Terminal
                      </>
                    ) : (
                      <>
                        <HideIcon /> Hide Terminal
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Console Menu */}
          <div className={`nav-item-container ${activeMenu === 'console' ? 'active' : ''}`}>
            <span onClick={() => setActiveMenu(activeMenu === 'console' ? null : 'console')}>
              <ConsoleMenuIcon /> Console <ChevronDownIcon />
            </span>
            {activeMenu === 'console' && (
              <div className="menu-dropdown">
                <div className="dropdown-item" onClick={handleClearConsole}>
                  <span className="dropdown-item-label">
                    <ClearIcon /> Clear Output
                  </span>
                </div>
                <div className="dropdown-item" onClick={handleCopyConsole}>
                  <span className="dropdown-item-label">
                    <CopyIcon /> Copy Output
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Setting Menu */}
          <div className={`nav-item-container ${activeMenu === 'setting' ? 'active' : ''}`}>
            <span onClick={() => setActiveMenu(activeMenu === 'setting' ? null : 'setting')}>
              <SettingsMenuIcon /> Setting <ChevronDownIcon />
            </span>
            {activeMenu === 'setting' && (
              <div className="menu-dropdown">
                <div className="dropdown-settings-group">
                  <div className="dropdown-settings-title">
                    <ThemeIcon /> Theme
                  </div>
                  <div className="theme-options-grid">
                    {IDE_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        className={`theme-btn ${activeTheme === theme.id ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTheme(theme.id);
                          showToast(`Theme: ${theme.label}`, 'info');
                        }}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="dropdown-settings-group">
                  <div className="dropdown-settings-title">
                    <FontIcon /> Font Size
                  </div>
                  <div className="font-size-control">
                    <button className="font-btn" onClick={handleDecreaseFont}>
                      -
                    </button>
                    <span className="font-val">{fontSize}px</span>
                    <button className="font-btn" onClick={handleIncreaseFont}>
                      +
                    </button>
                  </div>
                </div>
                {onOpenByokSettings && (
                  <div className="dropdown-settings-group">
                    <button
                      className="byok-header-trigger-btn"
                      style={{
                        width: '100%',
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#60a5fa',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        gap: '0.4rem',
                      }}
                      onClick={() => {
                        setActiveMenu(null);
                        onOpenByokSettings();
                      }}
                    >
                      🔑 API Keys & BYOK Settings
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept=".js,.py,.java,.cpp,.c,.ts,.go,.rs,.php,.rb,.cs,.kt,.html,.css,.md,.sql,.txt"
      />

      <div className="navbar-right">
        {lastSavedTime && (
          <span className="autosave-indicator">
            ✓ Saved{' '}
            {(() => {
              const secs = Math.floor((Date.now() - lastSavedTime.getTime()) / 1000);
              if (secs < 10) return 'just now';
              if (secs < 60) return `${secs}s ago`;
              return `${Math.floor(secs / 60)}m ago`;
            })()}
          </span>
        )}

        <button
          className={`navbar-mode-pill ${workspaceMode === 'beta' ? 'beta' : 'stable'}`}
          onClick={onOpenModeSelector}
          title="Switch Workspace Mode"
        >
          {workspaceMode === 'beta' ? 'Beta Mode' : 'Stable Mode'}
        </button>

        <span className="navbar-theme-pill">
          {IDE_THEMES.find((t) => t.id === activeTheme)?.label || activeTheme.replace('-', ' ')}
        </span>

        <button
          className={`navbar-cloud-btn ${user ? 'active' : ''}`}
          onClick={() => setShowAuthModal(true)}
          title={user ? `Connected: ${user.email}` : 'Click to connect Supabase'}
        >
          <CloudIcon />
          <span className="navbar-cloud-btn-text">
            {user ? user.email.split('@')[0] : 'Sign In / Create Account'}
          </span>
          <span
            className={`navbar-cloud-btn-status ${user ? 'status-green' : 'status-red'}`}
          ></span>
        </button>
      </div>
    </div>
  );
});

export default Header;
