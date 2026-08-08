/**
 * CodeX Workspace Session Auto-Recovery System
 *
 * Automatically persists open tabs, active file selection, and editor layout states
 * into localStorage to restore exact workspace configurations across page refreshes.
 */

import { setItem, getItem, removeItem } from './storage';

const SESSION_KEY = 'codex_workspace_session_v1';

export class SessionRecoveryEngine {
  /**
   * Save current workspace layout state
   */
  saveSession(state) {
    if (!state) return;
    const payload = {
      activeFileIndex: state.activeFileIndex || 0,
      openFileNames: state.openFileNames || [],
      selectedLanguage: state.selectedLanguage || 'javascript',
      workspaceMode: state.workspaceMode || 'beta',
      timestamp: Date.now(),
    };
    setItem(SESSION_KEY, payload);
  }

  /**
   * Restore last saved workspace session state
   */
  restoreSession() {
    const data = getItem(SESSION_KEY);
    if (!data || typeof data !== 'object') return null;

    // Check if session is under 24 hours old
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      removeItem(SESSION_KEY);
      return null;
    }

    return data;
  }

  /**
   * Clear saved workspace session
   */
  clearSession() {
    removeItem(SESSION_KEY);
  }
}

export const sessionRecovery = new SessionRecoveryEngine();
