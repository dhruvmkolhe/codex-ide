import React from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import {
  syntaxHighlighting,
  bracketMatching,
  indentOnInput,
  foldGutter,
  foldKeymap,
  indentUnit,
} from '@codemirror/language';
import { classHighlighter } from '@lezer/highlight';
import { search, searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import {
  keymap,
  highlightActiveLine,
  highlightActiveLineGutter,
  lineNumbers,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightSpecialChars,
} from '@codemirror/view';

import {
  UndoIcon,
  RedoIcon,
  FocusIcon,
  FormatIcon,
  ShareIcon,
  MultiplayerIcon,
  PlayIcon,
  XIcon,
  PackageIcon,
  ChevronDownIcon,
  HistoryIcon,
} from '../Icons';

import { LANGUAGE_CATEGORIES, languageConfig } from '../../languagesData';

import { getLanguageIcon } from '../../utils/languageUtils';
import {
  customCompletionSource,
  remoteCursorsField,
  ghostTextField,
  acceptGhostText,
} from '../../utils/editorUtils';
import { useInlineAutocomplete } from '../../hooks/useInlineAutocomplete';
import RemoteCursor from '../collaboration/RemoteCursor';
import { CodeLensOverlay } from './CodeLensOverlay';
import { sastLinterExtension } from '../../utils/sastScanner';

export const EditorSection = React.memo(function EditorSection({
  files,
  activeFileIndex,
  code,
  handleCodeChange,
  handleEditorUpdate,
  handleUndo,
  handleRedo,
  handleFormatCode,
  handleShareCode,
  handleCollaborate,
  handleFreshRun,
  isFocusMode,
  setIsFocusMode,
  collabActive,
  showCollabMenu,
  collabMenuRef,
  handleCopyCollabLink,
  handleStopCollaboration,
  openFileNames,
  handleSwitchTab,
  handleCloseTab,
  isAddingFile,
  setIsAddingFile,
  newFileName,
  setNewFileName,
  handleCreateFile,
  showTabAddMenu,
  setShowTabAddMenu,
  tabAddMenuRef,
  handleAddDependenciesFile,
  selectedLanguage,
  setSelectedLanguage,
  languageSelectorRef,
  showLangSelector,
  setShowLangSelector,
  langSearchQuery,
  setLangSearchQuery,
  handleLanguageSelectChange,
  fontSize,
  tabSize,
  editorViewRef,
  showToast,
  isTerminalCollapsed,
  editorHeightPct,
  extToLang,
  isReadOnly,
  setIsReadOnly,
  collaborators = [],
  setShowCollabMenu,
  remoteCursors = {},
  setIsSnapshotModalOpen,
  handleSaveDraft,
  codeLenses,
  isLensAnalyzing,
  hideHeader = false,
  workspaceMode,
  setIsRefactorOpen,
}) {
  const [cursorCoords, setCursorCoords] = React.useState({});
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!collabActive || !remoteCursors || Object.keys(remoteCursors).length === 0) {
      setCursorCoords((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    let prevJson = '';

    const updateCoords = () => {
      const view = editorViewRef.current?.view;
      const container = containerRef.current;
      if (!view || !container || !collabActive) return;

      const containerRect = container.getBoundingClientRect();
      const newCoords = {};

      Object.entries(remoteCursors).forEach(([id, data]) => {
        if (data.fileIndex !== activeFileIndex) return;

        try {
          const coords = view.coordsAtPos(data.pos);
          if (coords) {
            newCoords[id] = {
              x: coords.left - containerRect.left + container.scrollLeft,
              y: coords.top - containerRect.top + container.scrollTop,
              name: data.name,
              color: data.color,
            };
          }
        } catch (e) {
          // Pos might be out of sync
        }
      });

      const currentJson = JSON.stringify(newCoords);
      if (currentJson !== prevJson) {
        prevJson = currentJson;
        setCursorCoords(newCoords);
      }
    };

    const interval = setInterval(updateCoords, 150);
    updateCoords();

    return () => clearInterval(interval);
  }, [remoteCursors, activeFileIndex, collabActive, editorViewRef]);

  useInlineAutocomplete(
    editorViewRef.current?.view,
    code,
    activeFileIndex,
    selectedLanguage,
    workspaceMode
  );

  const isMultiFile = true;

  return (
    <div
      className="code-area"
      style={
        hideHeader
          ? { flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }
          : {
              flex: 'none',
              height: isTerminalCollapsed ? '100%' : `calc(${editorHeightPct}% - 2px)`,
            }
      }
    >
      {!hideHeader && (
        <>
          <div className="code-header">
            <button className="undo-redo-btn" onClick={handleUndo} title="Undo (Ctrl+Z)">
              <UndoIcon />
            </button>
            <button className="undo-redo-btn" onClick={handleRedo} title="Redo (Ctrl+Y)">
              <RedoIcon />
            </button>
            <button
              className={`focus-mode-toggle-btn ${isFocusMode ? 'active' : ''}`}
              onClick={() => {
                setIsFocusMode(!isFocusMode);
                showToast(isFocusMode ? 'Focus Mode deactivated' : 'Focus Mode activated', 'info');
              }}
              title={isFocusMode ? 'Show AI Panel' : 'Hide AI Panel'}
            >
              <FocusIcon /> {isFocusMode ? 'Exit Focus' : 'Focus'}
            </button>
            <button className="format-btn" onClick={handleFormatCode} title="Format Code">
              <FormatIcon /> Format
            </button>
            <button className="share-btn" onClick={handleShareCode} title="Share Workspace">
              <ShareIcon /> Share
            </button>
            <button
              className="share-btn"
              onClick={handleSaveDraft}
              title="Save to local drafts"
              style={{
                borderLeft: '1px solid var(--border-color)',
                marginLeft: '4px',
                paddingLeft: '12px',
              }}
            >
              <HistoryIcon /> Draft
            </button>
            <button
              className="snapshot-btn"
              onClick={() => setIsSnapshotModalOpen(true)}
              title="Create Code Snapshot"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), #6366f1)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                photo_camera
              </span>
              Snapshot
            </button>

            {workspaceMode === 'beta' && (
              <button
                className="snapshot-btn"
                onClick={() => setIsRefactorOpen && setIsRefactorOpen(true)}
                title="AI Automated Refactoring & Docstring Generator"
                style={{
                  background: 'linear-gradient(135deg, #a371f7, #8957e5)',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginLeft: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  auto_fix_high
                </span>
                AI Refactor
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '9px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    marginLeft: '2px',
                  }}
                >
                  BETA
                </span>
              </button>
            )}

            {isReadOnly && (
              <div className="read-only-badge">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Read Only</span>
                <button
                  className="unlock-edit-btn"
                  onClick={() => {
                    setIsReadOnly(false);
                    showToast('Editor unlocked! You can now edit this code locally.', 'success');
                  }}
                  title="Unlock to edit locally"
                >
                  Edit
                </button>
              </div>
            )}

            <div style={{ position: 'relative' }} ref={collabMenuRef}>
              <div
                className="collab-controls-container"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <button
                  className={`collab-btn ${collabActive ? 'active' : ''}`}
                  onClick={() => {
                    if (collabActive) {
                      setShowCollabMenu(!showCollabMenu);
                    } else {
                      handleCollaborate();
                    }
                  }}
                >
                  <MultiplayerIcon /> {collabActive ? 'Collaborating' : 'Collaborate'}
                </button>

                {collabActive && collaborators.filter((c) => !c.isMe).length > 0 && (
                  <div className="collaborators-mini-list">
                    {collaborators
                      .filter((c) => !c.isMe)
                      .map((c) => (
                        <div
                          key={c.senderId}
                          className="collaborator-dot"
                          title={c.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: c.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            border: '2px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {showCollabMenu && (
                <div className="collab-dropdown">
                  <div className="collab-dropdown-header">
                    {collaborators.length > 1
                      ? `Active Collaborators (${collaborators.length})`
                      : 'Waiting for others to join...'}
                  </div>
                  <div className="collab-user-list">
                    {collaborators.map((c) => (
                      <div key={c.senderId} className="collab-user-item">
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: c.color,
                          }}
                        ></div>
                        <span style={{ fontSize: '13px', fontWeight: c.isMe ? '600' : '400' }}>
                          {c.name} {c.isMe ? '(You)' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="collab-dropdown-item"
                    onClick={handleCopyCollabLink}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      link
                    </span>
                    Copy Invite Link
                  </button>
                  <button
                    type="button"
                    className="collab-dropdown-item disconnect-item"
                    onClick={handleStopCollaboration}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      link_off
                    </span>
                    Stop Collaboration
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="editor-tabs-bar">
            <div className="editor-tabs-scrollable-wrapper">
              {files.map((file, idx) => {
                if (!openFileNames.includes(file.name)) return null;
                const ext = file.name.split('.').pop()?.toLowerCase();
                const langId = extToLang[ext] || 'text';
                return (
                  <div
                    key={file.name + '-' + idx}
                    className={`editor-tab-item ${activeFileIndex === idx ? 'active' : ''}`}
                    onClick={() => handleSwitchTab(idx)}
                  >
                    <span className="tab-lang-icon">{getLanguageIcon(langId, 14)}</span>
                    {file.name}
                    <button
                      className="editor-tab-close-btn"
                      onClick={(e) => handleCloseTab(e, idx)}
                    >
                      <XIcon />
                    </button>
                  </div>
                );
              })}
            </div>

            {isMultiFile &&
              (isAddingFile ? (
                <div className="editor-tab-input-item">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFile();
                      if (e.key === 'Escape') setIsAddingFile(false);
                    }}
                    placeholder="filename.ext"
                    autoFocus
                    onBlur={() => setTimeout(() => setIsAddingFile(false), 2000)}
                  />
                </div>
              ) : (
                <div style={{ position: 'relative' }} ref={tabAddMenuRef}>
                  <button
                    className="editor-tab-add-btn"
                    onClick={() => setShowTabAddMenu((prev) => !prev)}
                  >
                    +
                  </button>
                  {showTabAddMenu && (
                    <div className="tab-add-dropdown">
                      <button
                        type="button"
                        className="tab-add-dropdown-item"
                        onClick={() => {
                          setShowTabAddMenu(false);
                          setIsAddingFile(true);
                          setNewFileName('');
                        }}
                      >
                        New {languageConfig[selectedLanguage]?.label || selectedLanguage} file
                      </button>
                      <button
                        type="button"
                        className="tab-add-dropdown-item"
                        onClick={() => {
                          setShowTabAddMenu(false);
                          handleAddDependenciesFile();
                        }}
                      >
                        <PackageIcon />
                        {languageConfig[selectedLanguage]?.dependencyFile || 'Add Dependencies'}
                      </button>
                    </div>
                  )}
                </div>
              ))}

            <button
              className="tabs-run-btn"
              onClick={() => {
                showToast('Running code...', 'info');
                handleFreshRun();
              }}
              title="Run Code"
            >
              <PlayIcon /> Run
            </button>

            <div className="language-grid-selector-container" ref={languageSelectorRef}>
              <button
                type="button"
                className="language-selector-trigger-btn"
                onClick={() => {
                  setShowLangSelector((prev) => !prev);
                  setLangSearchQuery('');
                }}
              >
                <span className="lang-trigger-icon-container">
                  {getLanguageIcon(selectedLanguage, 18)}
                </span>
                <span className="lang-trigger-label">
                  {languageConfig[selectedLanguage]?.label || selectedLanguage}
                </span>
                <ChevronDownIcon />
              </button>

              {showLangSelector &&
                ReactDOM.createPortal(
                  <div
                    className="language-grid-modal-overlay"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => setShowLangSelector(false)}
                  >
                    <div
                      className="language-grid-dropdown"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="lang-dropdown-header">
                        <input
                          type="text"
                          placeholder="Search 100+ languages..."
                          value={langSearchQuery}
                          onChange={(e) => setLangSearchQuery(e.target.value)}
                          className="lang-search-input"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="lang-dropdown-close-btn"
                          onClick={() => setShowLangSelector(false)}
                        >
                          <XIcon />
                        </button>
                      </div>
                      <div className="lang-grid-scroll-area">
                        {Object.entries(LANGUAGE_CATEGORIES).map(([catKey, category]) => {
                          const catLangs = category.languages.filter(
                            (l) =>
                              l.label.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
                              l.id.toLowerCase().includes(langSearchQuery.toLowerCase())
                          );
                          if (catLangs.length === 0) return null;
                          return (
                            <div key={catKey} className="lang-cat-section">
                              <h4 className="lang-cat-title">{category.label}</h4>
                              <div className="lang-grid">
                                {catLangs.map((lang) => (
                                  <button
                                    key={lang.id}
                                    type="button"
                                    className={`lang-grid-item ${selectedLanguage === lang.id ? 'active' : ''}`}
                                    onClick={() => {
                                      handleLanguageSelectChange(lang.id);
                                      setShowLangSelector(false);
                                    }}
                                  >
                                    <span className="lang-grid-icon-container">
                                      {getLanguageIcon(lang.id, 16)}
                                    </span>
                                    <span className="lang-item-name">{lang.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </div>
        </>
      )}

      <div
        className="code-mirror-editor"
        style={{ flex: 1, height: '100%', fontSize: `${fontSize}px`, position: 'relative' }}
        ref={containerRef}
      >
        <AnimatePresence>
          {Object.entries(cursorCoords).map(([id, data]) => (
            <RemoteCursor key={id} name={data.name} color={data.color} x={data.x} y={data.y} />
          ))}
        </AnimatePresence>
        {codeLenses && codeLenses.length > 0 && (
          <CodeLensOverlay
            lenses={codeLenses}
            isAnalyzing={isLensAnalyzing}
            lineHeight={fontSize * 1.5}
            fontSize={fontSize}
          />
        )}
        <CodeMirror
          ref={editorViewRef}
          value={code}
          height="100%"
          basicSetup={false}
          extensions={[
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            foldGutter(),
            drawSelection(),
            dropCursor(),
            EditorState.allowMultipleSelections.of(true),
            indentUnit.of(' '.repeat(tabSize)),
            EditorState.tabSize.of(tabSize),
            indentOnInput(),
            syntaxHighlighting(classHighlighter),
            bracketMatching(),
            closeBrackets(),
            autocompletion({
              addToOptions: [
                {
                  position: 75,
                  render: (completion) => {
                    if (!completion.type || completion.type === 'text') return null;
                    const el = document.createElement('span');
                    el.className = `cm-completionType cm-completionType-${completion.type}`;
                    el.textContent = completion.type;
                    return el;
                  },
                },
              ],
            }),
            EditorState.languageData.of(() => [
              { autocomplete: customCompletionSource(selectedLanguage) },
            ]),
            rectangularSelection(),
            crosshairCursor(),
            highlightActiveLine(),
            highlightSelectionMatches(),
            search({ top: true }),
            keymap.of([
              { key: 'Tab', run: acceptGhostText },
              ...closeBracketsKeymap,
              ...defaultKeymap,
              ...searchKeymap,
              ...historyKeymap,
              ...foldKeymap,
              ...completionKeymap,
              ...lintKeymap,
            ]),
            remoteCursorsField,
            ghostTextField,
            sastLinterExtension,
            EditorState.readOnly.of(isReadOnly),
            ...(languageConfig[selectedLanguage]?.extension
              ? [languageConfig[selectedLanguage].extension]
              : []),
          ]}
          onChange={handleCodeChange}
          onUpdate={handleEditorUpdate}
        />
      </div>
    </div>
  );
});

export default EditorSection;
