import React, { useState } from 'react';
import { TrashIcon, BugIcon, PinIcon, RefreshIcon } from '../Icons';

export function ConsoleSection({
  isTerminalCollapsed,
  editorHeightPct,
  executionTime,
  consoleOutput,
  isRunning,
  stdin,
  setStdin,
  handleClearConsole,
  handleDebug,
  isDebugging,
  showToast,
  errorAnalysis,
  isAnalyzingError,
  jumpToErrorLine,
  files = [],
  activeFileIndex = 0,
  selectedLanguage = 'javascript',
  setIsDbPlaygroundOpen,
  workspaceMode,
}) {
  const [consoleTab, setConsoleTab] = useState('output'); // 'output' | 'terminal'

  return (
    <div
      className={`console-area ${isTerminalCollapsed ? 'collapsed' : ''}`}
      style={
        isTerminalCollapsed
          ? {}
          : {
              flex: 'none',
              height: `calc(${100 - editorHeightPct}% - 2px)`,
            }
      }
    >
      <div className="console-header">
        <div className="flex items-center gap-3">
          <div className="console-tabs-group" style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`console-tab-btn ${consoleTab === 'output' ? 'active' : ''}`}
              onClick={() => setConsoleTab('output')}
              style={{
                background: consoleTab === 'output' ? '#21262d' : 'transparent',
                color: consoleTab === 'output' ? '#58a6ff' : '#8b919b',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Output & STDIN
            </button>

            {workspaceMode === 'beta' && (
              <button
                className="console-tab-btn"
                onClick={() => setIsDbPlaygroundOpen && setIsDbPlaygroundOpen(true)}
                style={{
                  background: 'transparent',
                  color: '#d2a8ff',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  database
                </span>
                SQL Playground
                <span
                  style={{
                    background: 'rgba(210, 168, 255, 0.2)',
                    color: '#d2a8ff',
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
          </div>
          {executionTime !== null && (
            <span className="execution-time-badge">⏱ {executionTime}ms</span>
          )}
        </div>
        <div className="console-actions">
          <button onClick={handleClearConsole} className="clear-button">
            <TrashIcon /> Clear
          </button>
          <button
            onClick={() => {
              showToast('Analyzing code with AI Debugger...', 'info');
              handleDebug();
            }}
            className="debug-button"
            disabled={isDebugging}
          >
            {isDebugging ? <span className="btn-spinner" /> : <BugIcon />}
            {isDebugging ? 'Debugging...' : 'Debug'}
          </button>
        </div>
      </div>
      <div className="console-body">
        <div className="stdin-container">
          <div className="stdin-header-row">
            <span className="stdin-label">STDIN</span>
            <span className="stdin-sublabel">Input for the program ( Optional )</span>
          </div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Input for the program ( Optional )"
            className="stdin-textarea"
          />
        </div>
        <div className="output-container">
          <div className="output-header-row">
            <span className="output-label">Output:</span>
          </div>
          <div className="console-output-box">
            {isRunning ? (
              <div className="output-loading">
                <span className="btn-spinner" />
                <span className="loading-text">Executing code...</span>
              </div>
            ) : (
              <>
                {errorAnalysis && (
                  <div className="error-diagnostic-card">
                    <div
                      className={`diagnostic-glow-effect glow-${errorAnalysis.errorType.toLowerCase().replace(/[^a-z]/g, '')}`}
                    ></div>
                    <div className="diagnostic-header">
                      <div className="diagnostic-badge-row">
                        <span
                          className={`diagnostic-badge badge-${errorAnalysis.errorType.toLowerCase().replace(/[^a-z]/g, '')}`}
                        >
                          {errorAnalysis.errorType}
                        </span>
                        {isAnalyzingError ? (
                          <span
                            className="diagnostic-category pulse-loading-text"
                            style={{ fontStyle: 'italic', fontSize: '11px', opacity: 0.8 }}
                          >
                            <RefreshIcon /> Analyzing compiler logs with AI...
                          </span>
                        ) : (
                          errorAnalysis.category && (
                            <span className="diagnostic-category">{errorAnalysis.category}</span>
                          )
                        )}
                      </div>
                      <div
                        className="diagnostic-actions"
                        style={{ display: 'flex', gap: '8px', flexShrink: 0 }}
                      >
                        <button
                          type="button"
                          className="diagnostic-line-jump-btn"
                          onClick={() => jumpToErrorLine(errorAnalysis.line)}
                          title="Click to highlight line in editor"
                        >
                          <PinIcon /> Go to Line {errorAnalysis.line}
                        </button>
                        <button
                          type="button"
                          className="diagnostic-fix-btn"
                          onClick={() => {
                            showToast('AI is fixing the code...', 'info');
                            handleDebug();
                          }}
                          disabled={isDebugging}
                          title="AI will analyze and fix this error automatically"
                        >
                          {isDebugging ? <span className="btn-spinner" /> : <BugIcon />}
                          {isDebugging
                            ? isAnalyzingError || isDebugging
                              ? 'Fixing...'
                              : 'Fixing...'
                            : 'AI Auto-Fix'}
                        </button>
                      </div>
                    </div>
                    <div className="diagnostic-body">
                      <div className="diagnostic-info-item">
                        <span className="diagnostic-label">Explanation</span>
                        <p className="diagnostic-text">{errorAnalysis.explanation}</p>
                      </div>
                      {errorAnalysis.suggestion && (
                        <div className="diagnostic-info-item suggestion-item">
                          <span className="diagnostic-label">Suggested Fix</span>
                          <p className="diagnostic-text suggestion-text">
                            {errorAnalysis.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {consoleOutput ? (
                  consoleOutput.startsWith('__WEB_PREVIEW__') ? (
                    <iframe
                      title="Live Web Preview"
                      srcDoc={consoleOutput.replace('__WEB_PREVIEW__', '')}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '300px',
                        border: 'none',
                        borderRadius: '6px',
                        background: '#fff',
                      }}
                    />
                  ) : (
                    <pre
                      className={`console-output-pre ${consoleOutput.startsWith('Error:') || consoleOutput.startsWith('Exception:') ? 'console-output-error' : ''}`}
                    >
                      {consoleOutput}
                    </pre>
                  )
                ) : (
                  <span className="console-placeholder-text">
                    click on RUN button to see the output
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
