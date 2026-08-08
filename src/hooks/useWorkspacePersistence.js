import { useEffect, useCallback, useRef } from 'react';

export const useWorkspacePersistence = ({
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
  customThemeColors,
  setPrimaryLanguage,
  setSelectedLanguage,
  setActiveFileIndex,
  setActiveCloudFileId,
  setCloudSaveName,
  setFiles,
  setCode,
  showToast,
  isNavigatingFromHistoryRef,
}) => {
  const pendingUpdatesRef = useRef({});
  const timerRef = useRef(null);

  // High-performance debounced batch storage writer (prevents UI jank and main-thread blocking)
  const scheduleStorageUpdate = useCallback((key, value) => {
    pendingUpdatesRef.current[key] = value;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const updates = pendingUpdatesRef.current;
      pendingUpdatesRef.current = {};

      // Execute storage writes during idle browser time or async batch
      const executeWrites = () => {
        for (const [k, v] of Object.entries(updates)) {
          try {
            const stringValue = typeof v === 'object' ? JSON.stringify(v) : String(v);
            localStorage.setItem(k, stringValue);
          } catch (e) {
            console.warn(`[Persistence] Failed to write key ${k} to localStorage:`, e);
          }
        }
      };

      if (window.requestIdleCallback) {
        window.requestIdleCallback(executeWrites, { timeout: 1000 });
      } else {
        setTimeout(executeWrites, 0);
      }
    }, 500); // 500ms debounce buffer
  }, []);

  // Batched state observers
  useEffect(() => {
    scheduleStorageUpdate('codex_code', code);
  }, [code, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_files', files);
  }, [files, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_active_index', activeFileIndex);
  }, [activeFileIndex, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_language', selectedLanguage);
  }, [selectedLanguage, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_primary_language', primaryLanguage);
  }, [primaryLanguage, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_theme', activeTheme);
  }, [activeTheme, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_fontsize', fontSize);
  }, [fontSize, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_model', currentModel);
  }, [currentModel, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_chat_language', chatLanguage);
  }, [chatLanguage, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_console', consoleOutput);
  }, [consoleOutput, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_chatHistory', chatHistory);
  }, [chatHistory, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_stdin_map', stdinMap);
  }, [stdinMap, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_show_landing', showLanding);
  }, [showLanding, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_focus_mode', isFocusMode);
  }, [isFocusMode, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_tab_size', tabSize);
  }, [tabSize, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_left_width', leftPanelWidth);
  }, [leftPanelWidth, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_editor_height', editorHeightPct);
  }, [editorHeightPct, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_chat_height', chatHeightPct);
  }, [chatHeightPct, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_explorer_width', explorerWidth);
  }, [explorerWidth, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_open_files', openFileNames);
  }, [openFileNames, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_isExplorerOpen', isExplorerOpen);
  }, [isExplorerOpen, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_auto_explain', isAutoExplain);
  }, [isAutoExplain, scheduleStorageUpdate]);
  useEffect(() => {
    scheduleStorageUpdate('codex_custom_theme', customThemeColors);
  }, [customThemeColors, scheduleStorageUpdate]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const pushWorkspaceHistory = useCallback(
    (customState = {}) => {
      if (isNavigatingFromHistoryRef.current) return;

      const stateToPush = {
        primaryLanguage:
          customState.primaryLanguage !== undefined ? customState.primaryLanguage : primaryLanguage,
        selectedLanguage:
          customState.selectedLanguage !== undefined
            ? customState.selectedLanguage
            : selectedLanguage,
        activeFileIndex:
          customState.activeFileIndex !== undefined ? customState.activeFileIndex : activeFileIndex,
        activeCloudFileId:
          customState.activeCloudFileId !== undefined
            ? customState.activeCloudFileId
            : activeCloudFileId,
        cloudSaveName:
          customState.cloudSaveName !== undefined ? customState.cloudSaveName : cloudSaveName,
        files: customState.files !== undefined ? customState.files : files,
        code: customState.code !== undefined ? customState.code : code,
        timestamp: Date.now(),
      };

      try {
        const params = new URLSearchParams(window.location.search);
        params.set('lang', stateToPush.primaryLanguage);
        params.set('tab', stateToPush.activeFileIndex.toString());
        if (stateToPush.activeCloudFileId) {
          params.set('cloudId', stateToPush.activeCloudFileId);
        } else {
          params.delete('cloudId');
        }

        const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.pushState(stateToPush, '', newUrl);
      } catch (err) {
        console.error('History push error:', err);
      }
    },
    [
      primaryLanguage,
      selectedLanguage,
      activeFileIndex,
      activeCloudFileId,
      cloudSaveName,
      files,
      code,
      isNavigatingFromHistoryRef,
    ]
  );

  // Initial history state
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
      window.history.replaceState(initialState, '', undefined);
    } catch (e) {
      console.warn('Initial history replaceState failed:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Popstate handler
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
        if (historyState.files) setFiles(historyState.files);
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
  }, [
    showToast,
    setPrimaryLanguage,
    setSelectedLanguage,
    setActiveFileIndex,
    setActiveCloudFileId,
    setCloudSaveName,
    setFiles,
    setCode,
    isNavigatingFromHistoryRef,
  ]);

  return { pushWorkspaceHistory };
};
