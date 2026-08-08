import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSupabase } from './hooks/useSupabase';
import { supabase } from './supabaseClient';
import { undo, redo } from '@codemirror/commands';
import { AuthModal } from './components/AuthModal';
import { sharedCodeSchema } from './utils/schemas';
import { setRemoteCursorsEffect } from './utils/editorUtils';
import './IdeEditor.css';

// Modular components
import { Header } from './components/layout/Header';
import { ExplorerSidebar } from './components/layout/ExplorerSidebar';
import { SearchSidebar } from './components/layout/SearchSidebar';
import { DraftsSidebar } from './components/layout/DraftsSidebar';
import { StepperSidebar } from './components/layout/StepperSidebar';
import { ActivityBar } from './components/layout/ActivityBar';
import { EditorSection } from './components/editor/EditorSection';
import { ConsoleSection } from './components/terminal/ConsoleSection';
import { ChatSection } from './components/ai/ChatSection';
import { IdeFooter } from './components/layout/IdeFooter';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { SqlGuideModal } from './components/modals/SqlGuideModal';
import { WhiteboardModal } from './components/modals/WhiteboardModal';
import { ToastContainer } from './components/common/ToastContainer';
import SnapshotModal from './components/ui/SnapshotModal';
import CommandPalette from './components/ui/CommandPalette';
import { executeCodeOfflineFallback } from './utils/offlineExecution';
import { getByokHeaders } from './utils/byokProviderService';
import ByokSettingsModal from './components/modals/ByokSettingsModal';

import {
  LANGUAGE_CATEGORIES,
  languageConfig,
  DEFAULT_MULTI_FILES,
  starterTemplates,
  extToLang,
} from './languagesData';

import { getLanguageIcon } from './utils/languageUtils';

// New Custom Hooks for Refactoring
import { useFileManagement } from './hooks/useFileManagement';
import { useCollaboration } from './hooks/useCollaboration';
import { useWorkspacePersistence } from './hooks/useWorkspacePersistence';
import { useAIAnalysis } from './hooks/useAIAnalysis';
import { useTimeTravel } from './hooks/useTimeTravel';
import { useCodeLens } from './hooks/useCodeLens';
import { SnapshotSidebar } from './components/layout/SnapshotSidebar';
import { CodeLensSidebar } from './components/layout/CodeLensSidebar';
import { DependencyGraph } from './components/layout/DependencyGraph';
import { TimeTravelScrubber } from './components/editor/TimeTravelScrubber';
import { ModeSelector } from './components/modals/ModeSelector';
import { DatabasePlaygroundModal } from './components/modals/DatabasePlaygroundModal';
import { RefactorModal } from './components/modals/RefactorModal';

export default function IdeEditor(props) {
  const [sidebarTab, setSidebarTab] = useState('explorer');
  const [isDbPlaygroundOpen, setIsDbPlaygroundOpen] = useState(false);
  const [isRefactorOpen, setIsRefactorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState({
    matchCase: false,
    matchWholeWord: false,
    isRegex: false,
  });
  const [searchResults, setSearchResults] = useState([]);
  const [drafts, setDrafts] = useState(() => {
    const saved = localStorage.getItem('codex_drafts');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentModel, setCurrentModel] = useState(() => {
    const stored = localStorage.getItem('codex_model');
    const validModels = [
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp',
      'qwen/qwen-2.5-72b-instruct',
      'gemma-2-27b-it',
      'gemma-2-9b-it',
    ];
    if (stored && validModels.includes(stored)) {
      return stored;
    }
    localStorage.setItem('codex_model', 'llama-3.1-8b-instant');
    return 'llama-3.1-8b-instant';
  });
  const [isByokOpen, setIsByokOpen] = useState(false);
  const mainContentRef = useRef(null);
  const leftSectionRef = useRef(null);
  const rightSectionRef = useRef(null);
  const lastStdoutRef = useRef('');
  const tabAddMenuRef = useRef(null);
  const editorViewRef = useRef(null);
  const codeExplanationTimeoutRef = useRef(null);
  const latestStateRef = useRef({});
  const isNavigatingFromHistoryRef = useRef(false);
  const isProgrammaticChangeRef = useRef(false);
  const chatEndRef = useRef(null);
  const languageSelectorRef = useRef(null);
  const fileInputRef = useRef(null);
  const isRemoteChangeRef = useRef(false);
  const collabMenuRef = useRef(null);
  const lastLocalChangeRef = useRef({});

  // Parse shared code from hash on load if present
  const sharedData = useMemo(() => {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#code/')) {
        const raw = hash.substring(6);
        // Guard against maliciously large payloads (DoS via huge share URLs)
        if (raw.length > 100000) {
          console.error('Shared code payload exceeds size limit (100KB base64). Ignoring.');
          return null;
        }
        const payloadStr = decodeURIComponent(escape(atob(raw)));
        const rawPayload = JSON.parse(payloadStr);

        // Zod validation
        const result = sharedCodeSchema.safeParse(rawPayload);
        if (result.success) {
          return result.data;
        } else {
          console.error('Shared code validation failed:', result.error);
        }
      }
    } catch (e) {
      console.error('Failed to parse shared code from hash:', e);
    }
    return null;
  }, []);

  // Centralized languageConfig imported from `./languagesData`

  const [lastSavedTime, setLastSavedTime] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(
    () => props?.initialWhiteboardOpen || window.location.pathname.startsWith('/whiteboard')
  );
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState('');

  const [mobileActiveTab, setMobileActiveTab] = useState('editor');
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeTheme, setActiveTheme] = useState(
    () => localStorage.getItem('codex_theme') || 'vscode-dark'
  );
  const [fontSize, setFontSize] = useState(
    () => parseInt(localStorage.getItem('codex_fontsize'), 10) || 14
  );
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);

  const [leftPanelWidth, setLeftPanelWidth] = useState(
    () => parseFloat(localStorage.getItem('codex_left_width')) || 60
  );
  const [editorHeightPct, setEditorHeightPct] = useState(
    () => parseFloat(localStorage.getItem('codex_editor_height')) || 65
  );
  const [chatHeightPct, setChatHeightPct] = useState(
    () => parseFloat(localStorage.getItem('codex_chat_height')) || 60
  );
  const [explorerWidth, setExplorerWidth] = useState(
    () => parseFloat(localStorage.getItem('codex_explorer_width')) || 240
  );
  const [isExplorerOpen, setIsExplorerOpen] = useState(() => {
    const saved = localStorage.getItem('codex_isExplorerOpen');
    return saved !== null ? saved === 'true' : true;
  });
  const [isPrefsLoaded, setIsPrefsLoaded] = useState(false);
  const [isAutoExplain, setIsAutoExplain] = useState(() => {
    const saved = localStorage.getItem('codex_auto_explain');
    return saved !== null ? saved === 'true' : true;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [customThemeColors, setCustomThemeColors] = useState(() => {
    const saved = localStorage.getItem('codex_custom_theme');
    return saved
      ? JSON.parse(saved)
      : {
          '--primary-color': '#0e639c',
          '--bg-app': '#1e1e1e',
          '--bg-editor': '#1e1e1e',
          '--bg-navbar': '#333333',
          '--bg-header': '#252526',
          '--bg-panel': '#252526',
          '--bg-console': '#0d0e11',
          '--border-color': '#3c3c3c',
          '--text-primary': '#ffffff',
          '--text-secondary': '#cccccc',
        };
  });
  const [toasts, setToasts] = useState([]);

  // Main functional state
  const [code, setCode] = useState(
    () => localStorage.getItem('codex_code') || '// Write your code here'
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => localStorage.getItem('codex_language') || 'javascript'
  );

  const { lang: urlLang, roomId: urlRoomId } = useParams();

  // Sync language from URL parameter only when urlLang changes
  useEffect(() => {
    if (urlLang) {
      const normalized = urlLang.toLowerCase();
      if (languageConfig[normalized]) {
        setSelectedLanguage(normalized);
        setPrimaryLanguage(normalized);
      }
    }
  }, [urlLang]);

  useEffect(() => {
    if (selectedLanguage) {
      const currentPath = window.location.pathname;
      const targetPath = `/ide/${selectedLanguage}`;
      if (currentPath.startsWith('/ide') && currentPath !== targetPath) {
        window.history.replaceState(null, '', targetPath);
      }
    }
  }, [selectedLanguage]);

  const [primaryLanguage, setPrimaryLanguage] = useState(
    () => localStorage.getItem('codex_primary_language') || 'javascript'
  );
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('codex_chatHistory');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((m) => m && typeof m === 'object' && typeof m.content === 'string');
    } catch (e) {
      return [];
    }
  });
  const [chatLanguage, setChatLanguage] = useState(
    () => localStorage.getItem('codex_chat_language') || 'English'
  );
  const [consoleOutput, setConsoleOutput] = useState(
    () => localStorage.getItem('codex_console') || ''
  );
  const [stdin, setStdin] = useState('');
  const [stdinMap] = useState(() => {
    try {
      const saved = localStorage.getItem('codex_stdin_map');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [aiMode, setAiMode] = useState('chat');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showLanding, setShowLanding] = useState(
    () => localStorage.getItem('codex_show_landing') === 'true'
  );
  const [isFocusMode, setIsFocusMode] = useState(
    () => localStorage.getItem('codex_focus_mode') === 'true'
  );
  const [tabSize, setTabSize] = useState(
    () => parseInt(localStorage.getItem('codex_tab_size'), 10) || 2
  );
  const [showTabAddMenu, setShowTabAddMenu] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState(
    () => localStorage.getItem('codex_workspace_mode') || null
  );
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [uiLayout, setUiLayout] = useState(
    () => localStorage.getItem('codex_ui_layout') || 'classic'
  );

  // Collaboration State
  const [roomId, setRoomId] = useState('');
  const [myCollaboratorId] = useState(() =>
    crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)
  );
  const [myColor] = useState(() => `hsl(${Math.random() * 360}, 70%, 60%)`);
  const [myName, setMyName] = useState('Guest');

  // Handle URL Room Join on mount or route change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room') || urlRoomId;
    if (room) {
      const joinSession = async () => {
        let name = myName;
        if (!user || myName === 'Guest') {
          const input = window.prompt(
            'Someone invited you to collaborate! Enter your nickname:',
            'Guest'
          );
          if (input !== null && input.trim()) {
            name = input.trim();
            setMyName(name);
          } else if (!user) {
            showToast('A nickname is required to join the session.', 'warning');
            return;
          }
        }
        setRoomId(room);
        setCollabActive(true);
        if (window.location.pathname !== `/codex/${room}`) {
          window.history.replaceState(null, '', `/codex/${room}`);
        }
      };
      joinSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlRoomId]);

  const [hasLocalBackup, setHasLocalBackup] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Initialize Hooks
  const {
    files,
    setFiles,
    openFileNames,
    setOpenFileNames,
    activeFileIndex,
    setActiveFileIndex,
    isAddingFile,
    setIsAddingFile,
    newFileName,
    setNewFileName,
    expandedFolders,
    handleSwitchTab,
    handleCreateFile,
    handleDeleteFile,
    handleRenameFile,
    handleNewFileInFolder,
    handleCloseTab,
    handleToggleFolder,
    handleNewFolder,
    handleMoveFile,
    handleUploadFile,
  } = useFileManagement({
    selectedLanguage,
    setSelectedLanguage,
    primaryLanguage,
    code,
    setCode,
    showToast,
    broadcastFileOperation: (...args) => broadcastFileOperation(...args),
    pushWorkspaceHistory: (...args) => pushWorkspaceHistory(...args),
    extToLang,
    sharedData,
  });

  const {
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
    showSqlGuide,
    setShowSqlGuide,
    handleAuthSubmit,
    handleLogout,
    handleSaveToCloud,
    handleDeleteCloudFile,
    handleOAuthSignIn,
    chatSessions,
    chatSessionsLoading,
    saveChatSession,
    deleteChatSession,
    handleMfaEnroll,
    handleMfaVerify,
    handleMfaUnenroll,
    handleExportData,
    handleLogoutAll,
    mfaData,
    mfaLoading,
    isMfaEnrolled,
    auditLogs,
    auditLogsLoading,
    preferences,
    updatePreferences,
    fetchAuditLogs,
    setMfaData,
    currentSessionId,
    setCurrentSessionId,
  } = useSupabase({
    files,
    setCode,
    selectedLanguage,
    setSelectedLanguage,
    primaryLanguage,
    showToast,
    showAuthModal,
    setShowAuthModal,
  });

  const { pushWorkspaceHistory } = useWorkspacePersistence({
    code,
    files,
    activeFileIndex,
    selectedLanguage,
    primaryLanguage,
    activeTheme,
    fontSize,
    currentModel,
    chatLanguage,
    consoleOutput,
    customThemeColors,
    chatHistory,
    stdinMap,
    showLanding,
    isFocusMode,
    tabSize,
    leftPanelWidth,
    editorHeightPct,
    chatHeightPct,
    explorerWidth,
    openFileNames,
    isExplorerOpen,
    isAutoExplain,
    activeCloudFileId,
    cloudSaveName,
    uiLayout, // Add to persistence
    setPrimaryLanguage,
    setSelectedLanguage,
    setActiveFileIndex,
    setActiveCloudFileId,
    setCloudSaveName,
    setFiles,
    setCode,
    showToast,
    isNavigatingFromHistoryRef,
  });

  const {
    collabActive,
    setCollabActive,
    showCollabMenu,
    setShowCollabMenu,
    remoteCursors,
    collaborators,
    broadcastFileOperation,
    broadcastCodeChange,
    handleEditorUpdate,
  } = useCollaboration({
    roomId,
    activeFileIndex,
    setCode,
    setFiles,
    setSelectedLanguage,
    setPrimaryLanguage,
    setActiveFileIndex,
    showToast,
    myCollaboratorId,
    myColor,
    myName,
    latestStateRef,
    isRemoteChangeRef,
  });

  const {
    isAnalyzingError,
    errorAnalysis,
    setErrorAnalysis,
    codeExplanation,
    setCodeExplanation,
    handleAnalyzeError,
    jumpToErrorLine,
    getCodeExplanation,
    callAiApi,
    setIsAnalyzingError,
  } = useAIAnalysis({
    code,
    selectedLanguage,
    currentModel,
    showToast,
    setShowAuthModal,
    editorViewRef,
    setMobileActiveTab,
  });

  const {
    snapshots,
    isCapturing,
    isLoadingSnapshots,
    setPreviewMode,
    captureSnapshot,
    restoreSnapshot,
  } = useTimeTravel({
    user,
    files,
    setFiles,
    activeFileIndex,
    setActiveFileIndex,
    setCode,
    showToast,
  });

  const {
    lenses: codeLenses,
    isAnalyzing: isLensAnalyzing,
    analyze: analyzeLens,
    clearLenses,
  } = useCodeLens({
    selectedLanguage,
    currentModel,
    enabled: workspaceMode === 'beta',
  });

  const [previewSnapshot, setPreviewSnapshot] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const handleScrub = (snapshot) => {
    setPreviewSnapshot(snapshot);
    const idx = snapshots.findIndex((s) => s.id === snapshot.id);
    setPreviewIndex(idx);

    // Temporarily update editor code for preview
    if (snapshot.files?.[activeFileIndex]) {
      setCode(snapshot.files[activeFileIndex].content);
    }
  };

  const handleClosePreview = () => {
    setPreviewSnapshot(null);
    setPreviewMode(false);
    // Revert to current actual code
    if (files[activeFileIndex]) {
      setCode(files[activeFileIndex].content);
    }
  };

  const handleApplyRestore = (snapshot) => {
    restoreSnapshot(snapshot);
    setPreviewSnapshot(null);
  };

  const handleSelectMode = (mode) => {
    setWorkspaceMode(mode);
    localStorage.setItem('codex_workspace_mode', mode);
    setShowModeSelector(false);

    let modeName = 'Standard Workspace';
    if (mode === 'beta') modeName = 'Beta Lab';
    showToast(`Switched to ${modeName}`, 'success');
  };

  // Persistence Effects
  // Persistence effects now in useWorkspacePersistence hook

  // Force explorer visibility on mount (IDE Entry)
  useEffect(() => {
    setIsExplorerOpen(true);
  }, []);

  // Recalculate layout constraints on window resize with debounce
  useEffect(() => {
    const handleWindowResize = () => {
      setExplorerWidth((prev) => {
        const minW = 150;
        const maxW = Math.max(minW, window.innerWidth * 0.4);
        return Math.min(Math.max(prev, minW), maxW);
      });
    };

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleWindowResize, 100);
    };

    window.addEventListener('resize', onResize);
    handleWindowResize(); // Initial check
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!lastSavedTime) return;
    // Ticker logic removed as it was only for UI display time ago which is now handled by IdeFooter or similar
  }, [lastSavedTime]);

  useEffect(() => {
    if (chatEndRef.current?.scrollIntoView)
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  // Debounced Chat Auto-Save
  useEffect(() => {
    if (!user || chatHistory.length === 0) return;

    const timeout = setTimeout(() => {
      saveChatSession(chatHistory);
    }, 3000); // 3-second debounce

    return () => clearTimeout(timeout);
  }, [chatHistory, user, saveChatSession]);

  useEffect(() => {
    if (codeExplanationTimeoutRef.current) clearTimeout(codeExplanationTimeoutRef.current);
    setCodeExplanation('Start writing code to see the explanation...');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage]);

  // Sync Cloud Preferences to Local State
  useEffect(() => {
    if (Object.keys(preferences).length > 0) {
      const now = Date.now();
      const isRecentlyChanged = (key) =>
        lastLocalChangeRef.current[key] && now - lastLocalChangeRef.current[key] < 2000;

      if (preferences.isExplorerOpen !== undefined && !isRecentlyChanged('isExplorerOpen'))
        setIsExplorerOpen(preferences.isExplorerOpen);
      if (preferences.activeTheme !== undefined && !isRecentlyChanged('activeTheme'))
        setActiveTheme(preferences.activeTheme);
      if (preferences.fontSize !== undefined && !isRecentlyChanged('fontSize'))
        setFontSize(preferences.fontSize);
      if (preferences.tabSize !== undefined && !isRecentlyChanged('tabSize'))
        setTabSize(preferences.tabSize);
      if (preferences.focusMode !== undefined && !isRecentlyChanged('focusMode'))
        setIsFocusMode(preferences.focusMode);
      if (preferences.leftPanelWidth !== undefined && !isRecentlyChanged('leftPanelWidth'))
        setLeftPanelWidth(preferences.leftPanelWidth);
      if (preferences.editorHeightPct !== undefined && !isRecentlyChanged('editorHeightPct'))
        setEditorHeightPct(preferences.editorHeightPct);
      if (preferences.explorerWidth !== undefined && !isRecentlyChanged('explorerWidth'))
        setExplorerWidth(preferences.explorerWidth);
      if (
        !isPrefsLoaded &&
        preferences.selectedLanguage !== undefined &&
        !isRecentlyChanged('selectedLanguage')
      ) {
        handleLanguageSelectChange(preferences.selectedLanguage);
      }
      if (preferences.primaryLanguage !== undefined && !isRecentlyChanged('primaryLanguage'))
        setPrimaryLanguage(preferences.primaryLanguage);
      if (preferences.currentModel !== undefined && !isRecentlyChanged('currentModel'))
        setCurrentModel(preferences.currentModel);
      if (preferences.chatLanguage !== undefined && !isRecentlyChanged('chatLanguage'))
        setChatLanguage(preferences.chatLanguage);
      if (
        preferences.chatHistory !== undefined &&
        Array.isArray(preferences.chatHistory) &&
        !isRecentlyChanged('chatHistory')
      )
        setChatHistory(preferences.chatHistory);
      setIsPrefsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences]);

  // Sync Local State to Cloud (Debounced or on change)
  // To avoid circular loops, we only sync if the value actually changed from the cloud value
  useEffect(() => {
    if (!user || !isPrefsLoaded) return;
    const itemsToSync = {};
    if (preferences.isExplorerOpen !== isExplorerOpen) itemsToSync.isExplorerOpen = isExplorerOpen;
    if (preferences.activeTheme !== activeTheme) itemsToSync.activeTheme = activeTheme;
    if (preferences.fontSize !== fontSize) itemsToSync.fontSize = fontSize;
    if (preferences.tabSize !== tabSize) itemsToSync.tabSize = tabSize;
    if (preferences.focusMode !== isFocusMode) itemsToSync.focusMode = isFocusMode;
    if (preferences.leftPanelWidth !== leftPanelWidth) itemsToSync.leftPanelWidth = leftPanelWidth;
    if (preferences.editorHeightPct !== editorHeightPct)
      itemsToSync.editorHeightPct = editorHeightPct;
    if (preferences.explorerWidth !== explorerWidth) itemsToSync.explorerWidth = explorerWidth;
    if (preferences.selectedLanguage !== selectedLanguage)
      itemsToSync.selectedLanguage = selectedLanguage;
    if (preferences.primaryLanguage !== primaryLanguage)
      itemsToSync.primaryLanguage = primaryLanguage;
    if (preferences.currentModel !== currentModel) itemsToSync.currentModel = currentModel;
    if (preferences.chatLanguage !== chatLanguage) itemsToSync.chatLanguage = chatLanguage;
    if (JSON.stringify(preferences.chatHistory) !== JSON.stringify(chatHistory))
      itemsToSync.chatHistory = chatHistory;

    if (Object.keys(itemsToSync).length > 0) {
      // Mark these fields as locally changed to prevent stale reverts
      const now = Date.now();
      Object.keys(itemsToSync).forEach((key) => {
        lastLocalChangeRef.current[key] = now;
      });

      const timeout = setTimeout(() => {
        updatePreferences(itemsToSync);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [
    isExplorerOpen,
    activeTheme,
    fontSize,
    tabSize,
    isFocusMode,
    leftPanelWidth,
    editorHeightPct,
    explorerWidth,
    user,
    preferences,
    updatePreferences,
    selectedLanguage,
    primaryLanguage,
    currentModel,
    chatLanguage,
    chatHistory,
    isPrefsLoaded,
  ]);

  const startResize = (type) => (e) => {
    e.preventDefault();
    setIsResizing(true);
    let animationFrameId = null;

    const onMouseMove = (ev) => {
      if (animationFrameId) return;

      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;
        if (!mainContentRef.current) return;
        const rect = mainContentRef.current.getBoundingClientRect();
        if (type === 'horizontal')
          setLeftPanelWidth(
            Math.min(Math.max(((ev.clientX - rect.left) / rect.width) * 100, 20), 80)
          );
        else if (type === 'explorer') {
          const minW = 150;
          const maxW = Math.max(minW, window.innerWidth * 0.4);
          setExplorerWidth(Math.min(Math.max(ev.clientX - rect.left, minW), maxW));
        } else if (type === 'vertical-left') {
          if (!leftSectionRef.current) return;
          const lRect = leftSectionRef.current.getBoundingClientRect();
          setEditorHeightPct(
            Math.min(Math.max(((ev.clientY - lRect.top) / lRect.height) * 100, 15), 85)
          );
        } else if (type === 'vertical-right') {
          if (!rightSectionRef.current) return;
          const rRect = rightSectionRef.current.getBoundingClientRect();
          setChatHeightPct(
            Math.min(Math.max(((ev.clientY - rRect.top) / rRect.height) * 100, 20), 80)
          );
        }
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor =
      type === 'horizontal' || type === 'explorer' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Synchronize dynamic user profile name
  useEffect(() => {
    if (user && user.email) {
      setMyName(user.email.split('@')[0]);
    } else {
      setIsPrefsLoaded(false);
    }
  }, [user]);

  // Sync remote cursors inside CodeMirror when state changes
  useEffect(() => {
    const view = editorViewRef.current?.view;
    if (view) {
      const activeCursors = Object.entries(remoteCursors)
        .filter(([id, data]) => data.fileIndex === activeFileIndex && id !== myCollaboratorId)
        .map(([_, data]) => ({ pos: data.pos, name: data.name, color: data.color }));

      view.dispatch({
        effects: setRemoteCursorsEffect.of(activeCursors),
      });
    }
  }, [remoteCursors, activeFileIndex, myCollaboratorId]);

  // AI API and Error Analysis logic removed as they are now in useAIAnalysis hook

  latestStateRef.current = {
    primaryLanguage,
    selectedLanguage,
    activeFileIndex,
    activeCloudFileId,
    cloudSaveName,
    files,
    code,
  };

  // Set up popstate event listener for browser Back/Forward arrows
  useEffect(() => {
    const handlePopState = (e) => {
      const historyState = e.state;
      if (!historyState) return;

      isNavigatingFromHistoryRef.current = true;
      try {
        if (historyState.primaryLanguage) setPrimaryLanguage(historyState.primaryLanguage);
        if (historyState.selectedLanguage) setSelectedLanguage(historyState.selectedLanguage);
        if (historyState.activeFileIndex !== undefined)
          setActiveFileIndex(historyState.activeFileIndex);
        if (historyState.activeCloudFileId !== undefined)
          setActiveCloudFileId(historyState.activeCloudFileId);
        if (historyState.cloudSaveName !== undefined) setCloudSaveName(historyState.cloudSaveName);
        if (historyState.files) {
          setFiles(historyState.files);
          if (setOpenFileNames) setOpenFileNames(historyState.files.map((f) => f.name));
        }
        if (historyState.code !== undefined) setCode(historyState.code);

        showToast(`Restored: ${historyState.primaryLanguage} workspace`, 'info');
      } catch (err) {
        console.error('History popstate restore error:', err);
      } finally {
        setTimeout(() => {
          isNavigatingFromHistoryRef.current = false;
        }, 50);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  // Push initial history state on mount
  useEffect(() => {
    const initialState = {
      primaryLanguage,
      selectedLanguage,
      activeFileIndex,
      activeCloudFileId,
      cloudSaveName,
      files,
      code,
      timestamp: Date.now(),
    };
    try {
      // Pass undefined as the 3rd argument to replaceState to avoid clearing hash/params
      window.history.replaceState(initialState, '', undefined);
    } catch (e) {
      console.warn('Initial history replaceState failed:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backupCurrentWorkspace = useCallback(() => {
    localStorage.setItem('codex_files_backup', JSON.stringify(files));
    localStorage.setItem('codex_active_index_backup', activeFileIndex.toString());
    setHasLocalBackup(true);
  }, [files, activeFileIndex]);

  // backupCurrentWorkspace was here, but we will use the one at L653

  const handleRestoreLocalBackup = useCallback(() => {
    const backupFilesStr = localStorage.getItem('codex_local_backup_files');
    if (!backupFilesStr) {
      showToast('No local backup draft found.', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(backupFilesStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const tempFiles = [...files];
        const tempCode = code;
        const tempIndex = activeFileIndex;
        const tempLang = selectedLanguage;
        const tempPrimaryLang = primaryLanguage;
        const tempCloudId = activeCloudFileId;
        const tempCloudName = cloudSaveName;
        const tempConsole = consoleOutput;

        setFiles(parsed);
        if (setOpenFileNames) setOpenFileNames(parsed.map((f) => f.name));
        const backupIndex =
          parseInt(localStorage.getItem('codex_local_backup_active_index'), 10) || 0;
        setActiveFileIndex(backupIndex);

        const backupCode = localStorage.getItem('codex_local_backup_code') || parsed[0].content;
        setCode(backupCode);

        const backupLang = localStorage.getItem('codex_local_backup_language') || 'javascript';
        const backupPrimaryLang =
          localStorage.getItem('codex_local_backup_primary_language') || backupLang;
        setSelectedLanguage(backupLang);
        setPrimaryLanguage(backupPrimaryLang);

        const backupCloudId = localStorage.getItem('codex_local_backup_cloud_file_id');
        const finalBackupCloudId = backupCloudId ? backupCloudId : null;
        setActiveCloudFileId(finalBackupCloudId);

        const backupCloudName = localStorage.getItem('codex_local_backup_cloud_save_name') || '';
        setCloudSaveName(backupCloudName);

        const backupConsole = localStorage.getItem('codex_local_backup_console') || '';
        setConsoleOutput(backupConsole);
        lastStdoutRef.current = backupConsole;

        localStorage.setItem('codex_local_backup_files', JSON.stringify(tempFiles));
        localStorage.setItem('codex_local_backup_code', tempCode);
        localStorage.setItem('codex_local_backup_active_index', tempIndex.toString());
        localStorage.setItem('codex_local_backup_language', tempLang);
        localStorage.setItem('codex_local_backup_primary_language', tempPrimaryLang);
        localStorage.setItem('codex_local_backup_cloud_file_id', tempCloudId ? tempCloudId : '');
        localStorage.setItem('codex_local_backup_cloud_save_name', tempCloudName || '');
        localStorage.setItem('codex_local_backup_console', tempConsole);

        // Synchronize browser history stack after state commits
        setTimeout(() => {
          pushWorkspaceHistory();
        }, 0);

        showToast(
          tempCloudId
            ? 'Restored local draft workspace! (Cloud file saved in backup)'
            : 'Restored cloud workspace! (Local draft saved in backup)',
          'success'
        );
        setActiveMenu(null);
      }
    } catch (e) {
      showToast('Error restoring draft.', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    files,
    code,
    activeFileIndex,
    selectedLanguage,
    primaryLanguage,
    activeCloudFileId,
    cloudSaveName,
    consoleOutput,
    showToast,
    pushWorkspaceHistory,
  ]);

  // localErrorClassifier removed

  // jumpToErrorLine removed

  // handleAnalyzeError removed as it is now in useAIAnalysis

  const handleUndo = useCallback(() => {
    const view = editorViewRef.current?.view;
    if (view) undo(view);
  }, []);

  const handleRedo = useCallback(() => {
    const view = editorViewRef.current?.view;
    if (view) redo(view);
  }, []);

  const handleLoadCloudFile = useCallback(
    (file) => {
      backupCurrentWorkspace();
      try {
        const parsed = JSON.parse(file.content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
          setFiles(parsed);
          if (setOpenFileNames) setOpenFileNames(parsed.map((f) => f.name));
          setActiveFileIndex(0);
          setCode(parsed[0].content);
          const ext = parsed[0].name.split('.').pop()?.toLowerCase();
          const matchedLang = extToLang[ext] || file.language;
          setSelectedLanguage(matchedLang);
          setPrimaryLanguage(matchedLang);
          setActiveCloudFileId(file.id);
          setCloudSaveName(file.name);
          setShowAuthModal(false);
          showToast(`Loaded cloud project: ${file.name}`, 'success');
          return;
        }
      } catch (e) {
        /* fallback to single file */
      }

      const ext = file.name.split('.').pop()?.toLowerCase();
      const matchedLang = extToLang[ext] || file.language;
      setFiles([{ name: file.name, content: file.content }]);
      if (setOpenFileNames) setOpenFileNames([file.name]);
      setActiveFileIndex(0);
      setCode(file.content);
      setSelectedLanguage(matchedLang);
      setPrimaryLanguage(matchedLang);
      setActiveCloudFileId(file.id);
      setCloudSaveName(file.name);
      setShowAuthModal(false);
      showToast(`Loaded cloud file: ${file.name}`, 'success');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      extToLang,
      setCode,
      setSelectedLanguage,
      setPrimaryLanguage,
      setActiveCloudFileId,
      setCloudSaveName,
      setShowAuthModal,
      showToast,
      backupCurrentWorkspace,
      setFiles,
      setActiveFileIndex,
    ]
  );

  const handleLogoutWrapper = useCallback(async () => {
    await handleLogout();
    setShowLanding(true);
  }, [handleLogout]);

  const handleClearConsole = useCallback(() => {
    setConsoleOutput('');
    lastStdoutRef.current = '';
    showToast('Console cleared.', 'info');
  }, [showToast]);

  const handleLanguageSelectChange = useCallback(
    (newLang) => {
      if (!newLang) return;
      const prevLang = selectedLanguage;

      // 1. Validation: Only save to prevLang's slot if the current files actually match prevLang
      const firstFileName = files[0]?.name || '';
      const firstFileExt = firstFileName.split('.').pop()?.toLowerCase();
      const detectedLang = extToLang[firstFileExt];

      if (detectedLang === prevLang) {
        localStorage.setItem(`codex_files_${prevLang}`, JSON.stringify(files));
        localStorage.setItem(`codex_active_index_${prevLang}`, activeFileIndex.toString());
      }

      // Always update state, ref timestamps, and localStorage keys
      setSelectedLanguage(newLang);
      setPrimaryLanguage(newLang);
      if (lastLocalChangeRef.current) {
        lastLocalChangeRef.current['selectedLanguage'] = Date.now();
        lastLocalChangeRef.current['primaryLanguage'] = Date.now();
      }
      localStorage.setItem('codex_language', newLang);
      localStorage.setItem('codex_primary_language', newLang);

      // Check for existing files for the new language
      const langSavedFiles = localStorage.getItem(`codex_files_${newLang}`);
      if (langSavedFiles) {
        try {
          const parsed = JSON.parse(langSavedFiles);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const savedName = parsed[0]?.name || '';
            const savedExt = savedName.split('.').pop()?.toLowerCase();
            const savedDetected = extToLang[savedExt];
            // Only use saved files if they actually match the target language
            if (!savedDetected || savedDetected === newLang) {
              setFiles(parsed);
              if (setOpenFileNames) setOpenFileNames(parsed.map((f) => f.name));
              const savedIdx =
                parseInt(localStorage.getItem(`codex_active_index_${newLang}`), 10) || 0;
              const safeIdx = Math.min(savedIdx, parsed.length - 1);
              setActiveFileIndex(safeIdx);
              setCode(parsed[safeIdx]?.content || '');
              pushWorkspaceHistory({
                files: parsed,
                activeFileIndex: safeIdx,
                selectedLanguage: newLang,
              });
              return;
            }
          }
        } catch (e) {
          /* fallback */
        }
      }

      // Default template if no saved files or corrupted saved files
      const template = starterTemplates[newLang] || `// ${newLang} code\n`;
      const ext = languageConfig[newLang]?.ext || 'txt';
      const mainFile = { name: `main.${ext}`, content: template };
      setFiles([mainFile]);
      if (setOpenFileNames) setOpenFileNames([mainFile.name]);
      setActiveFileIndex(0);
      setCode(template);
      localStorage.setItem(`codex_files_${newLang}`, JSON.stringify([mainFile]));
      localStorage.setItem(`codex_active_index_${newLang}`, '0');
      pushWorkspaceHistory({ files: [mainFile], activeFileIndex: 0, selectedLanguage: newLang });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLanguage, files, activeFileIndex, setFiles, setCode, pushWorkspaceHistory, extToLang]
  );

  const handleCollaborate = async () => {
    let name = myName;
    if (!user || myName === 'Guest') {
      const input = window.prompt('Enter your nickname for this session:', myName);
      if (input !== null && input.trim()) {
        name = input.trim();
        setMyName(name);
      } else if (!user) {
        showToast('A nickname is required to collaborate as a guest.', 'warning');
        return;
      }
    }

    const id = window.prompt('Enter Room ID to join (or leave empty to create one):');
    if (id === null) return;
    const finalRoomId = id.trim() || `room-${Math.random().toString(36).substring(2, 9)}`;
    setRoomId(finalRoomId);
    window.history.replaceState(null, '', `/codex/${finalRoomId}`);
    setCollabActive(true);
    showToast(`Joining room: ${finalRoomId}`, 'success');
  };

  const handleCopyCollabLink = () => {
    const url = `${window.location.origin}/codex/${roomId}`;
    navigator.clipboard.writeText(url);
    showToast('Collaboration link copied!', 'success');
  };

  const handleStopCollaboration = () => {
    setCollabActive(false);
    setRoomId('');
    setShowCollabMenu(false);
    showToast('Collaboration session ended.', 'info');
    const lang = selectedLanguage || 'javascript';
    window.history.replaceState(null, '', `/ide/${lang}`);
  };

  const handleCodeChange = useCallback(
    (newCode) => {
      if (isProgrammaticChangeRef.current) {
        isProgrammaticChangeRef.current = false;
        return;
      }
      if (isRemoteChangeRef.current) {
        isRemoteChangeRef.current = false;
        return;
      }
      setCode(newCode);
      setLastSavedTime(new Date());

      setFiles((prev) => {
        const updated = [...prev];
        if (updated[activeFileIndex]) {
          updated[activeFileIndex] = { ...updated[activeFileIndex], content: newCode };
        }
        return updated;
      });

      broadcastCodeChange(newCode);

      if (codeExplanationTimeoutRef.current) {
        clearTimeout(codeExplanationTimeoutRef.current);
      }

      if (isAutoExplain) {
        codeExplanationTimeoutRef.current = setTimeout(() => {
          getCodeExplanation(newCode);
        }, 800);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getCodeExplanation, activeFileIndex, broadcastCodeChange, isAutoExplain]
  );

  const handleRun = async (overrideStdin = null, isFresh = false) => {
    // Execute based on current active tab file extension or selected language
    const activeFile = files[activeFileIndex] || files[0];
    const activeExt = activeFile?.name ? activeFile.name.split('.').pop()?.toLowerCase() : null;
    const execLanguage =
      (activeExt && extToLang[activeExt]) || selectedLanguage || primaryLanguage || 'javascript';
    const isWebLang = LANGUAGE_CATEGORIES.web.languages.some((l) => l.id === execLanguage);
    const isText = execLanguage === 'text';

    setExecutionTime(null);
    const startTime = performance.now();

    if (isText) {
      // Display text content directly as output
      const textContent = files.map((f) => f.content).join('\n');
      setConsoleOutput(textContent || '(empty file)');
      showToast('Text content displayed.', 'success');
      setMobileActiveTab('output');
      setExecutionTime(Math.round(performance.now() - startTime));
      return;
    }

    // Web languages: render live HTML preview in the output panel
    if (isWebLang) {
      setErrorAnalysis(null);
      setIsRunning(true);
      setConsoleOutput('Rendering preview...');
      setMobileActiveTab('output');
      setTimeout(() => {
        try {
          // Gather all file contents
          const htmlFile = files.find((f) => f.name.endsWith('.html')) || files[0];
          const cssFiles = files.filter((f) => f.name.endsWith('.css'));
          const jsFiles = files.filter((f) => f.name.endsWith('.js'));

          let htmlContent = htmlFile?.content || '';

          // Inline CSS files that are linked via <link> tags
          cssFiles.forEach((cssFile) => {
            const linkRegex = new RegExp(`<link[^>]*href=["']${cssFile.name}["'][^>]*>`, 'gi');
            if (linkRegex.test(htmlContent)) {
              htmlContent = htmlContent.replace(linkRegex, `<style>\n${cssFile.content}\n</style>`);
            } else {
              htmlContent = htmlContent.replace(
                '</head>',
                `<style>\n${cssFile.content}\n</style>\n</head>`
              );
            }
          });

          // Inline JS files that are loaded via <script src=>
          jsFiles.forEach((jsFile) => {
            const scriptRegex = new RegExp(
              `<script[^>]*src=["']${jsFile.name}["'][^>]*><\\/script>`,
              'gi'
            );
            if (scriptRegex.test(htmlContent)) {
              htmlContent = htmlContent.replace(
                scriptRegex,
                `<script>\n${jsFile.content}\n</script>`
              );
            } else {
              htmlContent = htmlContent.replace(
                '</body>',
                `<script>\n${jsFile.content}\n</script>\n</body>`
              );
            }
          });

          setConsoleOutput(`__WEB_PREVIEW__${htmlContent}`);
          showToast('Live preview rendered!', 'success');
          setExecutionTime(Math.round(performance.now() - startTime));
        } catch (err) {
          setConsoleOutput(`Error rendering preview:\n${err.message}`);
          showToast('Preview failed.', 'error');
          setExecutionTime(Math.round(performance.now() - startTime));
        } finally {
          setIsRunning(false);
        }
      }, 100);
      return;
    }

    setErrorAnalysis(null);
    setIsAnalyzingError(false);
    setIsRunning(true);
    setConsoleOutput('Executing code...');
    setMobileActiveTab('output');
    lastStdoutRef.current = '';

    const languageInfo = languageConfig[execLanguage] || languageConfig.javascript;
    const targetStdin = overrideStdin !== null ? overrideStdin : stdin;

    const payload = {
      language: languageInfo.apiLang,
      stdin: targetStdin,
      files: files.map((f) => ({ name: f.name, content: f.content })),
    };

    // Check for offline status or offline execution fallback
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      showToast('Offline mode detected. Running in local browser sandbox...', 'info');
      try {
        const activeFile = files[activeFileIndex] || files[0];
        const offlineResult = await executeCodeOfflineFallback(
          activeFile?.content || '',
          execLanguage
        );
        setConsoleOutput(`[OFFLINE FALLBACK RUNTIME]\n${offlineResult.output}`);
        lastStdoutRef.current = offlineResult.output;
        showToast(
          offlineResult.success ? 'Offline execution complete.' : 'Offline execution error.',
          offlineResult.success ? 'success' : 'warning'
        );
      } catch (offErr) {
        setConsoleOutput(`Offline Execution Error: ${offErr.message}`);
      } finally {
        setIsRunning(false);
        setExecutionTime(Math.round(performance.now() - startTime));
      }
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showToast('You must be logged in to run code.', 'error');
        setShowAuthModal(true);
        setIsRunning(false);
        return;
      }

      const response = await axios.post('/api/run', payload, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          ...getByokHeaders(),
        },
      });
      let outputText = '';
      let hasError = false;

      if (response.data.stdout) {
        outputText += response.data.stdout;
      }

      if (response.data.stderr) {
        if (outputText) outputText += '\n\n';
        outputText += `Error:\n${response.data.stderr}`;
        hasError = true;
      }

      if (response.data.exception) {
        if (outputText) outputText += '\n\n';
        outputText += `Exception:\n${response.data.exception}`;
        hasError = true;
      }

      if (!outputText) {
        outputText = 'No output received.';
      }

      let finalOutput = '';
      if (targetStdin && targetStdin.trim()) {
        finalOutput += `${targetStdin}\n`;
      }
      finalOutput += outputText;

      setConsoleOutput(finalOutput);
      lastStdoutRef.current = finalOutput;

      if (hasError) {
        showToast('Execution finished with errors.', 'error');
        handleAnalyzeError(outputText, execLanguage);
      } else {
        showToast('Code ran successfully.', 'success');
      }
    } catch (error) {
      console.error('Compilation Error:', error.response?.data || error.message);
      // Attempt local fallback execution on network error
      if (!error.response || error.code === 'ERR_NETWORK') {
        showToast('Network error. Falling back to local offline runtime...', 'info');
        const activeFile = files[activeFileIndex] || files[0];
        const offlineResult = await executeCodeOfflineFallback(
          activeFile?.content || '',
          execLanguage
        );
        setConsoleOutput(`[OFFLINE FALLBACK RUNTIME]\n${offlineResult.output}`);
        return;
      }
      const errorMessage =
        error.response?.data?.stderr || error.response?.data?.message || error.message;
      const errorText = `Error executing code:\n${errorMessage}`;
      setConsoleOutput(errorText);
      lastStdoutRef.current = errorText;
      showToast('Failed to execute code.', 'error');
      handleAnalyzeError(errorText, execLanguage);
    } finally {
      setIsRunning(false);
      setExecutionTime(Math.round(performance.now() - startTime));
    }
  };

  const handleFreshRun = () => {
    handleRun(stdin, true);
  };

  const handleFormatCode = async () => {
    try {
      showToast('Formatting code...', 'info');
      let formattedCode = code;
      const lang = selectedLanguage;

      if (['javascript', 'typescript', 'nodejs', 'react'].includes(lang)) {
        const prettier = await import('prettier/standalone');
        const parserBabel = await import('prettier/plugins/babel');
        const parserEstree = await import('prettier/plugins/estree');
        formattedCode = await prettier.format(code, {
          parser: 'babel',
          plugins: [parserBabel.default || parserBabel, parserEstree.default || parserEstree],
          singleQuote: true,
          trailingComma: 'es5',
        });
      } else if (['css', 'tailwindcss'].includes(lang)) {
        const prettier = await import('prettier/standalone');
        const parserPostcss = await import('prettier/plugins/postcss');
        formattedCode = await prettier.format(code, {
          parser: 'css',
          plugins: [parserPostcss.default || parserPostcss],
        });
      } else if (lang === 'html') {
        const prettier = await import('prettier/standalone');
        const parserHtml = await import('prettier/plugins/html');
        formattedCode = await prettier.format(code, {
          parser: 'html',
          plugins: [parserHtml.default || parserHtml],
        });
      } else if (lang === 'markdown') {
        const prettier = await import('prettier/standalone');
        const parserMarkdown = await import('prettier/plugins/markdown');
        formattedCode = await prettier.format(code, {
          parser: 'markdown',
          plugins: [parserMarkdown.default || parserMarkdown],
        });
      } else if (lang === 'json') {
        const prettier = await import('prettier/standalone');
        const parserBabel = await import('prettier/plugins/babel');
        const parserEstree = await import('prettier/plugins/estree');
        formattedCode = await prettier.format(code, {
          parser: 'json',
          plugins: [parserBabel.default || parserBabel, parserEstree.default || parserEstree],
        });
      } else if (
        ['python', 'tkinter', 'matplotlib', 'pygame', 'seaborn', 'turtle'].includes(lang)
      ) {
        formattedCode = code
          .split('\n')
          .map((line) => line.trimEnd())
          .join('\n')
          .replace(/\n{3,}/g, '\n\n');
      } else {
        formattedCode = fallbackBeautifier(code);
      }

      setCode(formattedCode);
      setFiles((prev) => {
        const updated = [...prev];
        if (updated[activeFileIndex]) {
          updated[activeFileIndex] = { ...updated[activeFileIndex], content: formattedCode };
        }
        return updated;
      });

      showToast('Formatted successfully!', 'success');
    } catch (error) {
      console.error('Format error:', error);
      showToast('Failed to format: ' + error.message, 'error');
    }
  };

  const fallbackBeautifier = (codeStr) => {
    const lines = codeStr.split('\n');
    let indentLevel = 0;
    const indentString = '  ';
    const formattedLines = lines.map((line) => {
      let trimmed = line.trim();
      if (!trimmed) return '';

      const openBraces = (trimmed.match(/\{/g) || []).length;
      const closeBraces = (trimmed.match(/\}/g) || []).length;
      const openBrackets = (trimmed.match(/\[/g) || []).length;
      const closeBrackets = (trimmed.match(/\]/g) || []).length;

      const diff = openBraces - closeBraces + (openBrackets - closeBrackets);
      const startsWithClose = /^[\]}]/.test(trimmed);

      let currentIndent = indentLevel;
      if (startsWithClose) {
        currentIndent = Math.max(0, currentIndent - 1);
      }

      indentLevel = Math.max(0, indentLevel + diff);
      return indentString.repeat(currentIndent) + trimmed;
    });

    return formattedLines.join('\n');
  };

  useEffect(() => {
    if (sharedData) {
      showToast(
        `Shared ${languageConfig[sharedData.selectedLanguage]?.label || sharedData.selectedLanguage} workspace loaded! 🚀`,
        'success'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedData]);

  // Handle asynchronous loading of #share/ shortlinks
  useEffect(() => {
    const handleInitialShareLoad = async () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#share/')) {
        const shareId = hash.substring(7);
        try {
          if (!supabase) return;
          const { data, error } = await supabase
            .from('shared_workspaces')
            .select('payload')
            .eq('id', shareId)
            .single();

          if (error) throw error;
          if (data && data.payload) {
            const result = sharedCodeSchema.safeParse(data.payload);
            if (result.success) {
              const payload = result.data;
              setFiles(payload.files);
              if (payload.files[0]) setCode(payload.files[0].content);
              setSelectedLanguage(payload.selectedLanguage);
              showToast(`Shared workspace "${shareId}" loaded! 🚀`, 'success');
            }
          }
        } catch (e) {
          console.error('Failed to load shared workspace:', e);
          showToast(`Failed to load shared workspace: ${shareId}`, 'error');
        }
      }
    };
    handleInitialShareLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast, setCode]);

  const handleShareCode = async () => {
    try {
      if (!supabase) {
        showToast('Supabase is not configured. Sharing is disabled.', 'error');
        return;
      }
      const customNameRaw = window.prompt(
        'Enter a name for this shareable code link (e.g., project-alpha):',
        'shared-code'
      );
      if (!customNameRaw) return;
      const customName = customNameRaw.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
      const secureId = crypto.randomUUID
        ? crypto.randomUUID().split('-')[0]
        : Math.random().toString(36).substring(2, 10);
      const customId = `${customName}-${secureId}`;

      const payload = {
        files: files,
        selectedLanguage: selectedLanguage,
      };

      const { error } = await supabase
        .from('shared_workspaces')
        .insert([{ id: customId, payload: payload }]);

      if (error) throw error;

      const shareUrl = `${window.location.origin}${window.location.pathname}#share/${customId}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl);
        showToast(`Share link copied! 🚀 (${customId})`, 'success');
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Share link copied! 🚀 (${customId})`, 'success');
      }
    } catch (error) {
      console.error('Share error:', error);
      showToast('Failed to generate share link: ' + error.message, 'error');
    }
  };

  // handleCollaborate removed as it is now defined at L693

  // handleStopCollaboration removed as it is now defined at L713

  // handleCopyCollabLink removed as it is now defined at L707

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-item-container')) {
        setActiveMenu(null);
      }
      if (tabAddMenuRef.current && !tabAddMenuRef.current.contains(event.target)) {
        setShowTabAddMenu(false);
      }
      if (
        languageSelectorRef.current &&
        !languageSelectorRef.current.contains(event.target) &&
        !event.target.closest('.language-grid-modal-overlay') &&
        !event.target.closest('.language-grid-dropdown')
      ) {
        setShowLangSelector(false);
      }
      if (collabMenuRef.current && !collabMenuRef.current.contains(event.target)) {
        setShowCollabMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global templates are loaded directly from the starterTemplates constant

  // File Menu Actions
  const handleNewFile = () => {
    if (
      !window.confirm(
        'Are you sure you want to create a new workspace? This will replace your current files (but a restore checkpoint will be saved).'
      )
    ) {
      setActiveMenu(null);
      return;
    }

    backupCurrentWorkspace();

    const isMultiFile = [
      'javascript',
      'python',
      'java',
      'cpp',
      'c',
      'typescript',
      'html',
      'css',
      'markdown',
    ].includes(selectedLanguage);

    if (isMultiFile && DEFAULT_MULTI_FILES[selectedLanguage]) {
      const defaultSet = DEFAULT_MULTI_FILES[selectedLanguage].map((f) => ({ ...f }));
      setFiles(defaultSet);
      setActiveFileIndex(0);
      setCode(defaultSet[0].content);
    } else {
      const template = starterTemplates[selectedLanguage] || '// Write your code here\n';
      const languageInfo = languageConfig[selectedLanguage] || languageConfig.javascript;
      const newMainFile = { name: `main.${languageInfo.ext}`, content: template };
      setFiles([newMainFile]);
      setActiveFileIndex(0);
      setCode(template);
    }
    setActiveMenu(null);
    showToast(
      `Created new file from starter template (${languageConfig[selectedLanguage]?.label || selectedLanguage})`,
      'success'
    );
  };

  // handleLanguageSelectChange removed as it is now defined at L659

  const handleAddDependenciesFile = useCallback(() => {
    // Dependency file config for every supported language
    const depConfig = {
      javascript: {
        name: 'package.json',
        content:
          '{\n  "name": "codex-project",\n  "version": "1.0.0",\n  "main": "index.js",\n  "dependencies": {}\n}',
      },
      typescript: {
        name: 'package.json',
        content:
          '{\n  "name": "codex-project",\n  "version": "1.0.0",\n  "dependencies": {},\n  "devDependencies": {\n    "typescript": "^5.0.0"\n  }\n}',
      },
      python: {
        name: 'requirements.txt',
        content: '# Add pip packages, one per line\n# requests\n# numpy\n# pandas\n',
      },
      java: {
        name: 'pom.xml',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>\n<project xmlns="http://maven.apache.org/POM/4.0.0"\n         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>com.example</groupId>\n  <artifactId>codex-project</artifactId>\n  <version>1.0-SNAPSHOT</version>\n  <dependencies>\n    <!-- Add Maven dependencies here -->\n    <!-- Example:\n    <dependency>\n      <groupId>com.google.code.gson</groupId>\n      <artifactId>gson</artifactId>\n      <version>2.10.1</version>\n    </dependency>\n    -->\n  </dependencies>\n</project>',
      },
      cpp: {
        name: 'CMakeLists.txt',
        content:
          'cmake_minimum_required(VERSION 3.16)\nproject(CodexProject)\nset(CMAKE_CXX_STANDARD 17)\n\nadd_executable(main main.cpp)\n\n# Link libraries below\n# target_link_libraries(main PRIVATE some_library)\n',
      },
      c: {
        name: 'Makefile',
        content:
          '# Makefile for C project\nCC=gcc\nCFLAGS=-Wall -Wextra -std=c11\nTARGET=main\nSRCS=$(wildcard *.c)\n\n$(TARGET): $(SRCS)\n\t$(CC) $(CFLAGS) -o $(TARGET) $(SRCS)\n\nclean:\n\trm -f $(TARGET)\n',
      },
      go: {
        name: 'go.mod',
        content:
          'module codex-project\n\ngo 1.21\n\n// Add dependencies below using: go get <package>\n// require (\n//   github.com/some/package v1.0.0\n// )\n',
      },
      rust: {
        name: 'Cargo.toml',
        content:
          '[package]\nname = "codex-project"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\n# Add crates here, e.g.:\n# serde = { version = "1", features = ["derive"] }\n',
      },
      php: {
        name: 'composer.json',
        content:
          '{\n  "name": "codex/project",\n  "require": {\n    "php": ">=8.1"\n  },\n  "autoload": {\n    "psr-4": {\n      "App\\\\": "src/"\n    }\n  }\n}',
      },
      ruby: {
        name: 'Gemfile',
        content:
          'source "https://rubygems.org"\n\nruby "3.2.0"\n\n# Add gems below\n# gem "rails", "~> 7.0"\n# gem "sinatra"\n',
      },
      csharp: {
        name: 'codex-project.csproj',
        content:
          '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net8.0</TargetFramework>\n    <Nullable>enable</Nullable>\n    <ImplicitUsings>enable</ImplicitUsings>\n  </PropertyGroup>\n  <ItemGroup>\n    <!-- Add NuGet packages here -->\n    <!-- <PackageReference Include="Newtonsoft.Json" Version="13.0.3" /> -->\n  </ItemGroup>\n</Project>',
      },
      kotlin: {
        name: 'build.gradle.kts',
        content:
          'plugins {\n  kotlin("jvm") version "1.9.0"\n  application\n}\n\nrepositories {\n  mavenCentral()\n}\n\ndependencies {\n  // Add dependencies here\n  // implementation("com.google.code.gson:gson:2.10.1")\n}\n\napplication {\n  mainClass.set("MainKt")\n}\n',
      },
      html: {
        name: 'package.json',
        content:
          '{\n  "name": "codex-html-project",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "live-server"\n  },\n  "devDependencies": {\n    "live-server": "^1.2.2"\n  }\n}',
      },
    };

    const cfg = depConfig[selectedLanguage];
    if (!cfg) {
      showToast('No dependency file template for this language.', 'info');
      return;
    }

    const existingIndex = files.findIndex((f) => f.name.toLowerCase() === cfg.name.toLowerCase());
    if (existingIndex !== -1) {
      setActiveFileIndex(existingIndex);
      setCode(files[existingIndex].content);
      showToast(`Switched to existing ${cfg.name}`, 'info');
      return;
    }

    setFiles((prev) => {
      const updated = [...prev, { name: cfg.name, content: cfg.content }];
      setActiveFileIndex(updated.length - 1);
      setCode(cfg.content);
      return updated;
    });
    showToast(`Added ${cfg.name} — edit to manage dependencies`, 'success');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, selectedLanguage, showToast]);

  const handleDownloadFile = () => {
    const languageInfo = languageConfig[selectedLanguage] || languageConfig.javascript;
    const fileName = `main.${languageInfo.ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActiveMenu(null);
    showToast(`Code downloaded as ${fileName}`, 'success');
  };

  const handleImportFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setActiveMenu(null);
  };

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const { matchCase, matchWholeWord, isRegex } = searchOptions;
    const results = [];

    let regex;
    try {
      if (isRegex) {
        regex = new RegExp(searchQuery, matchCase ? 'g' : 'gi');
      } else {
        const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = matchWholeWord ? `\\b${escaped}\\b` : escaped;
        regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
      }
    } catch (e) {
      return;
    }

    files.forEach((file) => {
      if (!file.content) return;
      const lines = file.content.split('\n');
      lines.forEach((lineText, idx) => {
        const matches = lineText.matchAll(regex);
        for (const match of matches) {
          results.push({
            id: `${file.name}-${idx}-${match.index}`,
            fileId: file.name,
            fileName: file.name,
            line: idx + 1,
            content: lineText.trim(),
            matchIndex: match.index,
          });
        }
      });
    });

    setSearchResults(results);
  }, [searchQuery, searchOptions, files]);

  // Drafts Logic
  const handleSaveDraft = useCallback(() => {
    const activeFile = files[activeFileIndex];
    if (!activeFile) return;

    const newDraft = {
      id: Date.now(),
      fileName: activeFile.name,
      code: activeFile.content,
      timestamp: new Date().toISOString(),
    };

    const updatedDrafts = [newDraft, ...drafts].slice(0, 50); // Keep last 50
    setDrafts(updatedDrafts);
    localStorage.setItem('codex_drafts', JSON.stringify(updatedDrafts));
    showToast('Draft saved locally!', 'info');
  }, [files, activeFileIndex, drafts, showToast]);

  const handleDeleteDraft = (id) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('codex_drafts', JSON.stringify(updated));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleUploadFile(file);
    e.target.value = null; // reset input
  };

  // Terminal Menu Actions
  const toggleTerminalCollapse = () => {
    setIsTerminalCollapsed((prev) => {
      showToast(prev ? 'Terminal pane expanded' : 'Terminal pane collapsed', 'info');
      return !prev;
    });
    setActiveMenu(null);
  };

  // Console Menu Actions
  // handleClearConsole removed as it is now defined at L647

  const handleCopyConsole = async () => {
    try {
      const textToCopy = consoleOutput || 'No output to copy.';
      await navigator.clipboard.writeText(textToCopy);
      setActiveMenu(null);
      showToast('Console logs copied to clipboard', 'success');
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy console logs', 'error');
    }
  };

  // Settings Actions
  const handleIncreaseFont = () =>
    setFontSize((prev) => {
      const next = Math.min(prev + 1, 24);
      showToast(`Font scaled to ${next}px`, 'info');
      return next;
    });
  const handleDecreaseFont = () =>
    setFontSize((prev) => {
      const next = Math.max(prev - 1, 10);
      showToast(`Font scaled to ${next}px`, 'info');
      return next;
    });

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F5 to Run
      if (e.key === 'F5') {
        e.preventDefault();
        showToast('Running code (F5)...', 'info');
        handleFreshRun();
      }

      // Ctrl+N for New File
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewFile();
      }

      // Ctrl+O for Open File
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleImportFileClick();
      }

      // Ctrl+S for Save/Download File
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleDownloadFile();
      }

      // Ctrl+` for Toggle Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsTerminalCollapsed((prev) => {
          showToast(prev ? 'Terminal pane expanded' : 'Terminal pane collapsed', 'info');
          return !prev;
        });
      }

      // Ctrl+L for Clear Console
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        handleClearConsole();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, selectedLanguage, stdin]);

  const handleToggleTabSize = useCallback(() => {
    setTabSize((prev) => (prev === 2 ? 4 : 2));
    showToast(`Tab size set to ${tabSize === 2 ? 4 : 2}`, 'info');
  }, [tabSize, showToast]);

  const handleDebug = async () => {
    if (!code.trim() || code === '// Write your code here') {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'The editor is empty. Please write some code to debug.' },
      ]);
      return;
    }
    setIsDebugging(true);
    setChatHistory((prev) => [...prev, { role: 'user', content: '🐛 Debug my code' }]);
    setMobileActiveTab('chat');
    try {
      const response = await callAiApi(currentModel, [
        {
          role: 'user',
          content: `You are an expert programmer. Here's ${selectedLanguage} code with an issue:\n\`\`\`\n${code}\n\`\`\`\nConsole Output/Error:\n\`\`\`\n${consoleOutput}\n\`\`\`\nProvide the corrected code in a \`\`\` block without language identifiers, followed by a concise explanation of what was fixed. Format your response as:\n\`\`\`\n<corrected code>\n\`\`\`\nExplanation: <what was changed>`,
        },
      ]);
      const aiResponse = response.data?.choices?.[0]?.message?.content || 'No correction provided.';
      const codeMatch = aiResponse.match(/```[\s\S]*?```/);
      const explanationMatch = aiResponse.match(/Explanation:[\s\S]*/);
      const correctedCode = codeMatch ? codeMatch[0].replace(/```/g, '').trim() : aiResponse;
      const explanation = explanationMatch
        ? explanationMatch[0].trim()
        : 'No explanation provided.';
      setCode(correctedCode);
      setFiles((prev) => {
        const updated = [...prev];
        if (updated[activeFileIndex]) {
          updated[activeFileIndex] = { ...updated[activeFileIndex], content: correctedCode };
        }
        return updated;
      });
      setChatHistory((prev) => [...prev, { role: 'assistant', content: explanation }]);
      getCodeExplanation(correctedCode);
    } catch (error) {
      console.error('Debug API Error:', error.response?.data || error.message);
      const errorMsg =
        error.response?.data?.error?.message ||
        error.message ||
        'Something went wrong while debugging. Please try again.';
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: `Something went wrong while debugging: ${errorMsg}` },
      ]);
    } finally {
      setIsDebugging(false);
    }
  };

  const handleSendMessage = async (event) => {
    if (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (!chatMessage.trim()) return;
        if (aiMode === 'chat') {
          sendChatMessage();
        } else {
          handleGenerateCode();
        }
      }
    } else {
      if (!chatMessage.trim()) return;
      if (aiMode === 'chat') {
        sendChatMessage();
      } else {
        handleGenerateCode();
      }
    }
  };

  const sendChatMessage = async () => {
    const userMsg = chatMessage.trim();
    if (!userMsg) return;
    setChatMessage('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    const messageLower = userMsg.toLowerCase();
    const isCodeRequest = /write|create|generate|give/.test(messageLower);

    // Build conversation context for API (last 10 turns for context window)
    const systemMsg = {
      role: 'system',
      content: `You are an expert programmer helping with ${selectedLanguage} code. Current code in editor:\n\`\`\`\n${code}\n\`\`\`\nConsole output:\n\`\`\`\n${consoleOutput}\n\`\`\`\nRespond in ${chatLanguage}.`,
    };
    const historyForApi = chatHistory.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    historyForApi.push({ role: 'user', content: userMsg });

    try {
      if (isCodeRequest) {
        const response = await callAiApi(currentModel, [
          systemMsg,
          {
            role: 'user',
            content: `Based on the request: "${userMsg}", generate ${selectedLanguage} code to accomplish the task. Provide only the code within a \`\`\` block, no language identifiers, no extra explanations.`,
          },
        ]);
        const aiResponse = response.data?.choices?.[0]?.message?.content || 'No code generated.';
        const codeMatch = aiResponse.match(/```[\s\S]*?```/);
        const generatedCode = codeMatch ? codeMatch[0].replace(/```/g, '').trim() : aiResponse;
        setCode(generatedCode);
        setFiles((prev) => {
          const updated = [...prev];
          if (updated[activeFileIndex]) {
            updated[activeFileIndex] = { ...updated[activeFileIndex], content: generatedCode };
          }
          return updated;
        });
        const reply = `Code generated in ${selectedLanguage} and placed in the editor!`;
        setChatHistory((prev) => {
          const next = [...prev, { role: 'assistant', content: reply }];
          saveChatSession(next);
          return next;
        });
        getCodeExplanation(generatedCode);
      } else {
        const response = await callAiApi(currentModel, [systemMsg, ...historyForApi]);
        const aiResponse = response.data?.choices?.[0]?.message?.content || 'No response from AI.';
        setChatHistory((prev) => {
          const next = [...prev, { role: 'assistant', content: aiResponse }];
          saveChatSession(next);
          return next;
        });
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      const errorMsg =
        error.response?.data?.error?.message ||
        error.message ||
        'Something went wrong. Please try again.';
      setChatHistory((prev) => [...prev, { role: 'assistant', content: `API Error: ${errorMsg}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleResetCache = useCallback(() => {
    try {
      localStorage.removeItem('codex_chatHistory');
      localStorage.removeItem('codex_chat_sessions');
      setChatHistory([]);
      showToast('AI Chat cache reset successfully!', 'success');
    } catch (e) {
      showToast('Cache reset completed.', 'info');
    }
  }, [showToast]);

  const handleGenerateCode = useCallback(async () => {
    const prompt = chatMessage.trim();
    if (!prompt) return;

    setIsGeneratingCode(true);
    showToast('Generating code with AI...', 'info');

    try {
      const response = await callAiApi(currentModel, [
        {
          role: 'system',
          content: `You are an expert programmer.
Based on the prompt, generate complete, production-ready, clean code in "${selectedLanguage}".
Do NOT include any introduction, explanations, or markdown text.
Provide ONLY the raw code itself. If you output markdown block, format it inside \`\`\` (without language tags).`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const aiResponse = response.data?.choices?.[0]?.message?.content || '';
      // Clean up markdown block if returned
      const cleanCode = aiResponse
        .replace(/```[\s\S]*?```/g, (match) => {
          return match.replace(/```/g, '').trim();
        })
        .trim();

      if (cleanCode) {
        setCode(cleanCode);
        setFiles((prev) => {
          const updated = [...prev];
          if (updated[activeFileIndex]) {
            updated[activeFileIndex] = { ...updated[activeFileIndex], content: cleanCode };
          }
          return updated;
        });

        // Broadcast code change if collab session is active
        broadcastCodeChange(cleanCode);

        // Explanations logic
        getCodeExplanation(cleanCode);

        showToast('Code generated and placed in editor! 🚀', 'success');
        setChatMessage('');
      } else {
        showToast('No code was generated by the model.', 'error');
      }
    } catch (error) {
      console.error('Code generation error:', error);
      showToast('Code generation failed: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setIsGeneratingCode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chatMessage,
    currentModel,
    selectedLanguage,
    activeFileIndex,
    files,
    showToast,
    callAiApi,
    setCode,
    getCodeExplanation,
    broadcastCodeChange,
  ]);

  return (
    <div
      className={`ide-container theme-${activeTheme} ui-layout-${uiLayout} mode-${workspaceMode} ${isResizing ? 'resizing' : ''}`}
      style={activeTheme === 'custom' ? customThemeColors : {}}
    >
      <Header
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isExplorerOpen={isExplorerOpen}
        setIsExplorerOpen={setIsExplorerOpen}
        handleNewFile={handleNewFile}
        handleImportFileClick={handleImportFileClick}
        handleDownloadFile={handleDownloadFile}
        handleRestoreLocalBackup={handleRestoreLocalBackup}
        hasLocalBackup={hasLocalBackup}
        handleFreshRun={handleFreshRun}
        isTerminalCollapsed={isTerminalCollapsed}
        toggleTerminalCollapse={toggleTerminalCollapse}
        handleClearConsole={handleClearConsole}
        handleCopyConsole={handleCopyConsole}
        activeTheme={activeTheme}
        setActiveTheme={setActiveTheme}
        customThemeColors={customThemeColors}
        setCustomThemeColors={setCustomThemeColors}
        fontSize={fontSize}
        handleDecreaseFont={handleDecreaseFont}
        handleIncreaseFont={handleIncreaseFont}
        showToast={showToast}
        lastSavedTime={lastSavedTime}
        user={user}
        setShowAuthModal={setShowAuthModal}
        fileInputRef={fileInputRef}
        handleFileUpload={handleFileUpload}
        workspaceMode={workspaceMode}
        onOpenModeSelector={() => setShowModeSelector(true)}
        uiLayout={uiLayout}
        setUiLayout={(l) => {
          setUiLayout(l);
          localStorage.setItem('codex_ui_layout', l);
          showToast(`UI Style: ${l.charAt(0).toUpperCase() + l.slice(1)}`, 'info');
        }}
        onOpenWhiteboard={() => setIsWhiteboardOpen(true)}
        onOpenByokSettings={() => setIsByokOpen(true)}
      />

      <div className={`main-content mobile-tab-${mobileActiveTab}`} ref={mainContentRef}>
        <ActivityBar
          isExplorerOpen={isExplorerOpen}
          setIsExplorerOpen={setIsExplorerOpen}
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          workspaceMode={workspaceMode}
          onOpenWhiteboard={() => setIsWhiteboardOpen(true)}
        />
        {isExplorerOpen && (
          <div className="sidebar-overlay" onClick={() => setIsExplorerOpen(false)} />
        )}
        {isExplorerOpen && sidebarTab === 'explorer' && (
          <ExplorerSidebar
            files={files}
            activeFileIndex={activeFileIndex}
            onSwitchTab={handleSwitchTab}
            onDeleteFile={handleDeleteFile}
            onNewFile={() => {
              setIsAddingFile(true);
              setNewFileName('');
            }}
            isOpen={isExplorerOpen}
            setIsOpen={setIsExplorerOpen}
            getLanguageIcon={getLanguageIcon}
            width={explorerWidth}
            showToast={showToast}
            expandedFolders={expandedFolders}
            onToggleFolder={handleToggleFolder}
            onNewFolder={handleNewFolder}
            onRenameFile={handleRenameFile}
            onNewFileInFolder={handleNewFileInFolder}
            onMoveFile={handleMoveFile}
            onUploadFile={handleUploadFile}
          />
        )}

        {isExplorerOpen && sidebarTab === 'search' && (
          <SearchSidebar
            isOpen={isExplorerOpen}
            width={explorerWidth}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchOptions={searchOptions}
            setSearchOptions={setSearchOptions}
            searchResults={searchResults}
            onSelectResult={(fileName, line) => {
              const fileIdx = files.findIndex((f) => f.name === fileName);
              if (fileIdx !== -1) {
                handleSwitchTab(fileIdx);
                // Future: scroll to line in editor
              }
            }}
          />
        )}

        {isExplorerOpen && sidebarTab === 'drafts' && (
          <DraftsSidebar
            isOpen={isExplorerOpen}
            width={explorerWidth}
            drafts={drafts}
            onDeleteDraft={handleDeleteDraft}
            onRestoreDraft={(draft) => {
              const newFile = { name: `${draft.fileName} (Draft)`, content: draft.code };
              setFiles((prev) => [...prev, newFile]);
              setActiveFileIndex(files.length);
              setCode(draft.code);
              showToast(`Restored draft: ${draft.fileName}`, 'success');
            }}
          />
        )}

        {isExplorerOpen && sidebarTab === 'stepper' && (
          <StepperSidebar
            isOpen={isExplorerOpen}
            width={explorerWidth}
            code={code}
            selectedLanguage={selectedLanguage}
            callAiApi={callAiApi}
            showToast={showToast}
          />
        )}

        {isExplorerOpen && sidebarTab === 'history' && workspaceMode === 'beta' && (
          <SnapshotSidebar
            snapshots={snapshots}
            isLoading={isLoadingSnapshots}
            onRestore={handleApplyRestore}
            onCapture={captureSnapshot}
            isCapturing={isCapturing}
            isOpen={isExplorerOpen}
            setIsOpen={setIsExplorerOpen}
            width={explorerWidth}
          />
        )}

        {isExplorerOpen && sidebarTab === 'lens' && workspaceMode === 'beta' && (
          <CodeLensSidebar
            isOpen={isExplorerOpen}
            setIsOpen={setIsExplorerOpen}
            width={explorerWidth}
            onAnalyze={() => analyzeLens(code)}
            isAnalyzing={isLensAnalyzing}
            lenses={codeLenses}
            onClear={clearLenses}
          />
        )}

        {isExplorerOpen && (
          <div
            className="resize-divider resize-divider--vertical explorer-resizer"
            onMouseDown={startResize('explorer')}
            title="Drag to resize explorer"
          />
        )}

        <div
          className="left-section"
          ref={leftSectionRef}
          style={{
            flex: isFocusMode ? '1 1 100%' : `${leftPanelWidth} ${leftPanelWidth} 0`,
            minWidth: '0',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {workspaceMode === 'beta' && sidebarTab === 'graph' && isExplorerOpen ? (
            <DependencyGraph
              files={files}
              activeFileIndex={activeFileIndex}
              activeTheme={activeTheme}
              onClose={() => {
                setSidebarTab('explorer');
              }}
              onSwitchFile={(idx) => {
                handleSwitchTab(idx);
                setSidebarTab('explorer');
              }}
            />
          ) : (
            <EditorSection
              files={files}
              activeFileIndex={activeFileIndex}
              code={code}
              handleCodeChange={handleCodeChange}
              handleEditorUpdate={handleEditorUpdate}
              handleUndo={handleUndo}
              handleRedo={handleRedo}
              handleFormatCode={handleFormatCode}
              handleShareCode={handleShareCode}
              handleCollaborate={handleCollaborate}
              isReadOnly={isReadOnly}
              setIsReadOnly={setIsReadOnly}
              handleFreshRun={handleFreshRun}
              isFocusMode={isFocusMode}
              setIsFocusMode={setIsFocusMode}
              collabActive={collabActive}
              showCollabMenu={showCollabMenu}
              setShowCollabMenu={setShowCollabMenu}
              collabMenuRef={collabMenuRef}
              handleCopyCollabLink={handleCopyCollabLink}
              handleStopCollaboration={handleStopCollaboration}
              openFileNames={openFileNames}
              handleSwitchTab={handleSwitchTab}
              handleCloseTab={handleCloseTab}
              isAddingFile={isAddingFile}
              setIsAddingFile={setIsAddingFile}
              newFileName={newFileName}
              setNewFileName={setNewFileName}
              handleCreateFile={handleCreateFile}
              showTabAddMenu={showTabAddMenu}
              setShowTabAddMenu={setShowTabAddMenu}
              tabAddMenuRef={tabAddMenuRef}
              handleAddDependenciesFile={handleAddDependenciesFile}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              languageSelectorRef={languageSelectorRef}
              showLangSelector={showLangSelector}
              setShowLangSelector={setShowLangSelector}
              langSearchQuery={langSearchQuery}
              setLangSearchQuery={setLangSearchQuery}
              handleLanguageSelectChange={handleLanguageSelectChange}
              fontSize={fontSize}
              tabSize={tabSize}
              editorViewRef={editorViewRef}
              showToast={showToast}
              isTerminalCollapsed={isTerminalCollapsed}
              editorHeightPct={editorHeightPct}
              extToLang={extToLang}
              collaborators={collaborators}
              remoteCursors={remoteCursors}
              setIsSnapshotModalOpen={setIsSnapshotModalOpen}
              handleSaveDraft={handleSaveDraft}
              codeLenses={codeLenses}
              isLensAnalyzing={isLensAnalyzing}
              workspaceMode={workspaceMode}
              setIsRefactorOpen={setIsRefactorOpen}
            />
          )}

          {previewSnapshot && workspaceMode === 'beta' && (
            <TimeTravelScrubber
              snapshots={snapshots}
              currentSnapshotIndex={previewIndex}
              onScrub={handleScrub}
              onRestore={handleApplyRestore}
              onClose={handleClosePreview}
            />
          )}

          {!isTerminalCollapsed && (
            <div
              className="resize-divider resize-divider--horizontal"
              onMouseDown={startResize('vertical-left')}
              title="Drag to resize"
            />
          )}

          <ConsoleSection
            isTerminalCollapsed={isTerminalCollapsed}
            editorHeightPct={editorHeightPct}
            executionTime={executionTime}
            consoleOutput={consoleOutput}
            isRunning={isRunning}
            stdin={stdin}
            setStdin={setStdin}
            handleClearConsole={handleClearConsole}
            handleDebug={handleDebug}
            isDebugging={isDebugging}
            showToast={showToast}
            errorAnalysis={errorAnalysis}
            isAnalyzingError={isAnalyzingError}
            jumpToErrorLine={jumpToErrorLine}
            files={files}
            activeFileIndex={activeFileIndex}
            selectedLanguage={selectedLanguage}
            setIsDbPlaygroundOpen={setIsDbPlaygroundOpen}
            workspaceMode={workspaceMode}
          />
        </div>

        {!isFocusMode && (
          <div
            className="resize-divider resize-divider--vertical"
            onMouseDown={startResize('horizontal')}
            title="Drag to resize"
          />
        )}

        <ChatSection
          rightSectionRef={rightSectionRef}
          isFocusMode={isFocusMode}
          leftPanelWidth={leftPanelWidth}
          chatHeightPct={chatHeightPct}
          user={user}
          showChatHistory={showChatHistory}
          setShowChatHistory={setShowChatHistory}
          chatLanguage={chatLanguage}
          setChatLanguage={setChatLanguage}
          chatHistory={chatHistory}
          saveChatSession={saveChatSession}
          setChatHistory={setChatHistory}
          deleteChatSession={deleteChatSession}
          chatSessionsLoading={chatSessionsLoading}
          chatSessions={chatSessions}
          isChatLoading={isChatLoading}
          chatEndRef={chatEndRef}
          aiMode={aiMode}
          setAiMode={setAiMode}
          currentModel={currentModel}
          setCurrentModel={setCurrentModel}
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          handleSendMessage={handleSendMessage}
          handleResetCache={handleResetCache}
          isGeneratingCode={isGeneratingCode}
          codeExplanation={codeExplanation}
          isAutoExplain={isAutoExplain}
          setIsAutoExplain={setIsAutoExplain}
          triggerExplanation={() => getCodeExplanation(code)}
          showToast={showToast}
          currentSessionId={currentSessionId}
          setCurrentSessionId={setCurrentSessionId}
        />
      </div>

      <AuthModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        user={user}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authTab={authTab}
        setAuthTab={setAuthTab}
        authLoading={authLoading}
        authError={authError}
        handleGuestLogin={handleGuestLogin}
        cloudFiles={cloudFiles}
        cloudLoading={cloudLoading}
        activeCloudFileId={activeCloudFileId}
        setActiveCloudFileId={setActiveCloudFileId}
        cloudSaveName={cloudSaveName}
        setCloudSaveName={setCloudSaveName}
        handleAuthSubmit={handleAuthSubmit}
        handleLogout={handleLogoutWrapper}
        handleLogoutAll={handleLogoutAll}
        handleSaveToCloud={handleSaveToCloud}
        handleLoadCloudFile={handleLoadCloudFile}
        handleDeleteCloudFile={handleDeleteCloudFile}
        handleOAuthSignIn={handleOAuthSignIn}
        handleMfaEnroll={handleMfaEnroll}
        handleMfaVerify={handleMfaVerify}
        handleMfaUnenroll={handleMfaUnenroll}
        handleExportData={handleExportData}
        mfaData={mfaData}
        mfaLoading={mfaLoading}
        isMfaEnrolled={isMfaEnrolled}
        auditLogs={auditLogs}
        auditLogsLoading={auditLogsLoading}
        fetchAuditLogs={fetchAuditLogs}
        setMfaData={setMfaData}
      />

      <WhiteboardModal
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        showToast={showToast}
        user={user}
      />

      <SqlGuideModal showSqlGuide={showSqlGuide} setShowSqlGuide={setShowSqlGuide} />

      <SnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        code={code}
        fileName={files[activeFileIndex]?.name || 'untitled'}
        language={selectedLanguage}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={files}
        activeTheme={activeTheme}
        onSwitchFile={handleSwitchTab}
        onSwitchTheme={setActiveTheme}
        onRunCode={handleFreshRun}
        onFormatCode={handleFormatCode}
        onToggleFocus={() => setIsFocusMode((prev) => !prev)}
        onExplainCode={() => getCodeExplanation(code)}
        onShareWorkspace={handleShareCode}
        onSnapshot={() => setIsSnapshotModalOpen(true)}
      />

      <DatabasePlaygroundModal
        isOpen={isDbPlaygroundOpen}
        onClose={() => setIsDbPlaygroundOpen(false)}
        showToast={showToast}
      />

      <RefactorModal
        isOpen={isRefactorOpen}
        onClose={() => setIsRefactorOpen(false)}
        activeCode={code}
        selectedLanguage={selectedLanguage}
        onApplyRefactoredCode={(newCode) => handleCodeChange(newCode)}
        showToast={showToast}
      />

      <ByokSettingsModal
        isOpen={isByokOpen}
        onClose={() => setIsByokOpen(false)}
        onShowToast={showToast}
      />

      <ToastContainer toasts={toasts} />

      {((user && !workspaceMode) || showModeSelector) && (
        <ModeSelector onSelect={handleSelectMode} onClose={() => setShowModeSelector(false)} />
      )}

      <MobileTabBar mobileActiveTab={mobileActiveTab} setMobileActiveTab={setMobileActiveTab} />

      <IdeFooter
        isRunning={isRunning}
        errorAnalysis={errorAnalysis}
        jumpToErrorLine={jumpToErrorLine}
        handleToggleTabSize={handleToggleTabSize}
        tabSize={tabSize}
        selectedLanguage={selectedLanguage}
      />
    </div>
  );
}
