import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { RobotIcon, HistoryIcon, TrashIcon, XIcon, SendIcon } from '../Icons';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { voiceAssistant } from '../../utils/voiceAssistant';

const MODEL_CATEGORIES = {
  gemini: {
    label: '🔷 Gemini (Direct API)',
    models: [
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', params: 'Latest', provider: 'Google' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', params: 'Thinking', provider: 'Google' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', params: 'Fast', provider: 'Google' },
    ],
  },
  groq: {
    label: '⚡ Groq (Ultra Fast)',
    models: [
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', params: '8B', provider: 'Meta' },
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', params: '70B', provider: 'Meta' },
      { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', params: '120B', provider: 'OpenAI' },
      { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', params: '20B', provider: 'OpenAI' },
      { id: 'groq/compound', name: 'Compound', params: 'Agentic', provider: 'Groq' },
      { id: 'groq/compound-mini', name: 'Compound Mini', params: 'Agentic', provider: 'Groq' },
    ],
  },
  openrouter: {
    label: '🌐 OpenRouter (Free)',
    models: [
      { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder', params: '480B', provider: 'Qwen' },
      {
        id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
        name: 'Nemotron 3 Ultra',
        params: '550B',
        provider: 'NVIDIA',
      },
      {
        id: 'nousresearch/hermes-3-llama-3.1-405b:free',
        name: 'Hermes 3 405B',
        params: '405B',
        provider: 'Nous',
      },
      { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B', params: '31B', provider: 'Google' },
      {
        id: 'google/gemma-4-26b-a4b-it:free',
        name: 'Gemma 4 26B A4B',
        params: '26B',
        provider: 'Google',
      },
      {
        id: 'cohere/north-mini-code:free',
        name: 'North Mini Code',
        params: 'Code',
        provider: 'Cohere',
      },
      { id: 'poolside/laguna-xs.2:free', name: 'Laguna XS.2', params: 'XS', provider: 'Poolside' },
      { id: 'poolside/laguna-m.1:free', name: 'Laguna M.1', params: 'M', provider: 'Poolside' },
      {
        id: 'nvidia/nemotron-nano-9b-v2:free',
        name: 'Nemotron Nano 9B',
        params: '9B',
        provider: 'NVIDIA',
      },
      {
        id: 'nvidia/nemotron-3-nano-30b-a3b:free',
        name: 'Nemotron 3 Nano',
        params: '30B',
        provider: 'NVIDIA',
      },
      { id: 'openrouter/auto', name: 'Auto Selection', params: 'Auto', provider: 'Router' },
    ],
  },
};

function getModelDisplayName(modelId) {
  for (const cat of Object.values(MODEL_CATEGORIES)) {
    const found = cat.models.find((m) => m.id === modelId);
    if (found) return found.name;
  }
  return modelId;
}

export function ChatSection({
  rightSectionRef,
  isFocusMode,
  leftPanelWidth,
  chatHeightPct,
  user,
  showChatHistory,
  setShowChatHistory,
  chatLanguage,
  setChatLanguage,
  chatHistory,
  saveChatSession,
  setChatHistory,
  deleteChatSession,
  clearAllChatSessions,
  chatSessionsLoading,
  chatSessions,
  isChatLoading,
  chatEndRef,
  aiMode,
  setAiMode,
  currentModel,
  setCurrentModel,
  chatMessage,
  setChatMessage,
  handleSendMessage,
  handleResetCache,
  isGeneratingCode,
  codeExplanation,
  showToast,
  isAutoExplain,
  setIsAutoExplain,
  triggerExplanation,
  currentSessionId,
  setCurrentSessionId,
}) {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [expandedRecent, setExpandedRecent] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  const toggleVoiceListening = async () => {
    if (isListeningVoice) {
      voiceAssistant.stopListening();
      setIsListeningVoice(false);
    } else {
      setIsListeningVoice(true);
      const started = await voiceAssistant.startListening(
        (transcript) => {
          setChatMessage(transcript);
        },
        (err) => {
          setIsListeningVoice(false);
          if (showToast) showToast(err || 'Voice error', 'error');
        },
        () => setIsListeningVoice(false)
      );
      if (!started) {
        setIsListeningVoice(false);
      }
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (isNaN(date.getTime())) return 'Recent';
    if (diffMins < 60) return `${Math.max(1, diffMins)} mins ago`;
    if (diffHours < 24) return `${diffHours} hrs ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isFocusMode) return null;

  const safeChatHistory = Array.isArray(chatHistory) ? chatHistory : [];

  return (
    <div
      className="right-section"
      ref={rightSectionRef}
      style={{
        flex: `${100 - leftPanelWidth} ${100 - leftPanelWidth} 0`,
        minWidth: '0',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <div
        className="chat-section"
        style={{ flex: 'none', height: `calc(${chatHeightPct}% - 2px)` }}
      >
        <div className="chat-header">
          <h3>
            <RobotIcon /> AI Chat
          </h3>
          <div className="chat-header-controls">
            <button
              className="clear-chat-btn"
              onClick={() => setShowChatHistory((prev) => !prev)}
              style={{
                background: showChatHistory ? 'var(--accent, #7c6af7)' : '',
                color: showChatHistory ? '#fff' : '',
              }}
            >
              <HistoryIcon /> History
            </button>
            <select
              value={chatLanguage}
              onChange={(e) => setChatLanguage(e.target.value)}
              className="chat-language-select"
            >
              {[
                'English',
                'Hindi',
                'Assamese',
                'Bengali',
                'Gujarati',
                'German',
                'Spanish',
                'French',
              ].map((l) => (
                <option key={l} value={l.toLowerCase()}>
                  {l}
                </option>
              ))}
            </select>
            <button
              className="clear-chat-btn"
              onClick={() => {
                if (safeChatHistory.length > 0 && saveChatSession) saveChatSession(safeChatHistory);
                setChatHistory([]);
                if (setCurrentSessionId) setCurrentSessionId(null);
              }}
            >
              <TrashIcon /> Clear
            </button>
            {handleResetCache && (
              <button
                className="clear-chat-btn"
                onClick={handleResetCache}
                title="Reset local cache & UI state"
                style={{ borderColor: 'rgba(255,100,100,0.4)' }}
              >
                Reset Cache
              </button>
            )}
          </div>
        </div>

        <div className="chat-response">
          {showChatHistory &&
            ReactDOM.createPortal(
              <div className="past-conv-modal-overlay" onClick={() => setShowChatHistory(false)}>
                <div className="past-conv-modal-window" onClick={(e) => e.stopPropagation()}>
                  <div className="past-conv-search-header">
                    <input
                      type="text"
                      placeholder="Select a conversation"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      className="past-conv-search-input"
                      autoFocus
                    />
                    {clearAllChatSessions && chatSessions.length > 0 && (
                      <button
                        className="clear-chat-btn"
                        onClick={() => {
                          if (
                            window.confirm('Are you sure you want to clear all past chat history?')
                          ) {
                            clearAllChatSessions();
                            setChatHistory([]);
                            if (setCurrentSessionId) setCurrentSessionId(null);
                            if (showToast) showToast('All chat history cleared.', 'info');
                          }
                        }}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          flexShrink: 0,
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                        }}
                        title="Clear all stored chat history"
                      >
                        Clear All History
                      </button>
                    )}
                    <button
                      className="past-conv-close-btn"
                      onClick={() => setShowChatHistory(false)}
                    >
                      <XIcon />
                    </button>
                  </div>

                  <div className="past-conv-scroll-area">
                    {chatSessionsLoading ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: '#8b949e' }}>
                        <span className="btn-spinner" /> Loading conversations...
                      </div>
                    ) : chatSessions.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: '#8b949e' }}>
                        No past conversations yet.
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const filteredSessions = chatSessions.filter((s) => {
                            let parsed = [];
                            try {
                              parsed =
                                typeof s.messages === 'string'
                                  ? JSON.parse(s.messages)
                                  : s.messages || [];
                            } catch (e) {
                              parsed = [];
                            }
                            const title =
                              s.title && s.title.trim()
                                ? s.title
                                : Array.isArray(parsed) &&
                                    parsed.find((m) => m.role === 'user')?.content
                                  ? parsed.find((m) => m.role === 'user').content.slice(0, 55) +
                                    '...'
                                  : 'Chat Conversation';
                            return title.toLowerCase().includes(historySearchQuery.toLowerCase());
                          });

                          const recentSessions = filteredSessions.slice(0, 3);
                          const otherSessions = filteredSessions.slice(3);

                          return (
                            <>
                              {/* Section 1: Recent in impact */}
                              <div className="past-conv-group-section">
                                <div className="past-conv-group-title">Recent in impact</div>
                                <div className="past-conv-list">
                                  {(expandedRecent ? filteredSessions : recentSessions).map(
                                    (session) => {
                                      let parsedMessages = [];
                                      try {
                                        parsedMessages =
                                          typeof session.messages === 'string'
                                            ? JSON.parse(session.messages)
                                            : session.messages || [];
                                      } catch (e) {
                                        parsedMessages = [];
                                      }

                                      const displayTitle =
                                        session.title && session.title.trim()
                                          ? session.title
                                          : Array.isArray(parsedMessages) &&
                                              parsedMessages.find((m) => m.role === 'user')?.content
                                            ? parsedMessages
                                                .find((m) => m.role === 'user')
                                                .content.slice(0, 55) + '...'
                                            : 'Chat Conversation';
                                      const isActive = currentSessionId === session.id;

                                      return (
                                        <div
                                          key={session.id}
                                          className={`past-conv-item-card ${isActive ? 'active' : ''}`}
                                          onClick={() => {
                                            if (parsedMessages && parsedMessages.length > 0) {
                                              if (safeChatHistory.length > 0 && saveChatSession)
                                                saveChatSession(safeChatHistory);
                                              setChatHistory(parsedMessages);
                                              if (setCurrentSessionId)
                                                setCurrentSessionId(session.id);
                                              setShowChatHistory(false);
                                              if (showToast)
                                                showToast('Conversation restored!', 'success');
                                            } else {
                                              if (showToast)
                                                showToast('Session is empty.', 'error');
                                            }
                                          }}
                                        >
                                          <div className="past-conv-item-left">
                                            <span className="past-conv-item-title">
                                              {displayTitle}
                                            </span>
                                          </div>
                                          <div className="past-conv-item-right">
                                            <span className="past-conv-item-time">
                                              {formatRelativeTime(session.created_at)}
                                            </span>
                                            <button
                                              className="past-conv-delete-btn"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteChatSession(session.id);
                                              }}
                                              title="Delete conversation"
                                            >
                                              <TrashIcon />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                  {!expandedRecent && filteredSessions.length > 3 && (
                                    <button
                                      className="past-conv-show-more"
                                      onClick={() => setExpandedRecent(true)}
                                    >
                                      Show {filteredSessions.length - 3} more...
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Section 2: Other Conversations */}
                              {!expandedRecent && otherSessions.length > 0 && (
                                <div
                                  className="past-conv-group-section"
                                  style={{ marginTop: '12px' }}
                                >
                                  <div className="past-conv-group-title">Other Conversations</div>
                                  <div className="past-conv-list">
                                    {otherSessions.map((session) => {
                                      let parsedMessages = [];
                                      try {
                                        parsedMessages =
                                          typeof session.messages === 'string'
                                            ? JSON.parse(session.messages)
                                            : session.messages || [];
                                      } catch (e) {
                                        parsedMessages = [];
                                      }

                                      const displayTitle =
                                        session.title && session.title.trim()
                                          ? session.title
                                          : Array.isArray(parsedMessages) &&
                                              parsedMessages.find((m) => m.role === 'user')?.content
                                            ? parsedMessages
                                                .find((m) => m.role === 'user')
                                                .content.slice(0, 55) + '...'
                                            : 'Chat Conversation';
                                      const isActive = currentSessionId === session.id;

                                      return (
                                        <div
                                          key={session.id}
                                          className={`past-conv-item-card ${isActive ? 'active' : ''}`}
                                          onClick={() => {
                                            if (parsedMessages && parsedMessages.length > 0) {
                                              if (safeChatHistory.length > 0 && saveChatSession)
                                                saveChatSession(safeChatHistory);
                                              setChatHistory(parsedMessages);
                                              if (setCurrentSessionId)
                                                setCurrentSessionId(session.id);
                                              setShowChatHistory(false);
                                              if (showToast)
                                                showToast('Conversation restored!', 'success');
                                            } else {
                                              if (showToast)
                                                showToast('Session is empty.', 'error');
                                            }
                                          }}
                                        >
                                          <div className="past-conv-item-left">
                                            <span className="past-conv-item-title">
                                              {displayTitle}
                                            </span>
                                            {session.language && (
                                              <span className="past-conv-item-badge">
                                                {session.language.toUpperCase()}
                                              </span>
                                            )}
                                          </div>
                                          <div className="past-conv-item-right">
                                            <span className="past-conv-item-time">
                                              {formatRelativeTime(session.created_at)}
                                            </span>
                                            <button
                                              className="past-conv-delete-btn"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteChatSession(session.id);
                                              }}
                                              title="Delete conversation"
                                            >
                                              <TrashIcon />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              </div>,
              document.body
            )}
          {safeChatHistory.map((msg, i) => {
            if (!msg || typeof msg !== 'object') return null;
            return (
              <div key={i} className={`chat-message ${msg.role || 'assistant'}`}>
                <MarkdownRenderer text={msg.content || ''} content={msg.content || ''} />
              </div>
            );
          })}
          {isChatLoading && (
            <div className="chat-message assistant">
              <div className="typing-indicator">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input">
          <div
            className="chat-input-row"
            style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}
          >
            <textarea
              style={{ flex: 1, height: '100%', minHeight: '100%', resize: 'none' }}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={handleSendMessage}
              placeholder="Ask about your code..."
              disabled={isChatLoading || isGeneratingCode}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <button
                type="button"
                className="model-selector-trigger-btn"
                onClick={() => {
                  setShowModelSelector(true);
                  setModelSearchQuery('');
                }}
              >
                <span className="model-trigger-icon">🤖</span>
                <span className="model-trigger-label">{getModelDisplayName(currentModel)}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path
                    d="M2 4l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {showModelSelector &&
                ReactDOM.createPortal(
                  <div
                    className="model-grid-modal-overlay"
                    onClick={() => setShowModelSelector(false)}
                  >
                    <div className="model-grid-dropdown" onClick={(e) => e.stopPropagation()}>
                      <div className="model-dropdown-header">
                        <input
                          type="text"
                          placeholder="Search 19+ AI models..."
                          value={modelSearchQuery}
                          onChange={(e) => setModelSearchQuery(e.target.value)}
                          className="model-search-input"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="model-dropdown-close-btn"
                          onClick={() => setShowModelSelector(false)}
                        >
                          <XIcon />
                        </button>
                      </div>
                      <div className="model-grid-scroll-area">
                        {Object.entries(MODEL_CATEGORIES).map(([catKey, category]) => {
                          const filtered = category.models.filter(
                            (m) =>
                              m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                              m.id.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                              m.provider.toLowerCase().includes(modelSearchQuery.toLowerCase())
                          );
                          if (filtered.length === 0) return null;
                          return (
                            <div key={catKey} className="model-cat-section">
                              <h4 className="model-cat-title">{category.label}</h4>
                              <div className="model-grid">
                                {filtered.map((m) => (
                                  <button
                                    key={m.id}
                                    className={`model-grid-item ${currentModel === m.id ? 'active' : ''}`}
                                    onClick={() => {
                                      setCurrentModel(m.id);
                                      setShowModelSelector(false);
                                    }}
                                  >
                                    <span className="model-item-name">{m.name}</span>
                                    <span className="model-item-badge">{m.params}</span>
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

              <button
                type="button"
                onClick={toggleVoiceListening}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: isListeningVoice
                    ? '1px solid #ef4444'
                    : '1px solid rgba(255,255,255,0.15)',
                  background: isListeningVoice
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(255,255,255,0.05)',
                  color: isListeningVoice ? '#ef4444' : '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                }}
                title="Voice-to-Code Prompt Assistant"
              >
                🎙️ {isListeningVoice ? 'Listening...' : 'Voice'}
              </button>

              <button
                style={{ flex: 1 }}
                onClick={() => handleSendMessage()}
                disabled={isChatLoading || isGeneratingCode}
              >
                {isChatLoading || isGeneratingCode ? (
                  <span className="btn-spinner" />
                ) : (
                  <SendIcon />
                )}
                {isChatLoading || isGeneratingCode ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="explanation-section"
        style={{
          flex: 'none',
          height: `calc(${100 - chatHeightPct}% - 2px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="explanation-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 15px',
            borderBottom: '1px solid var(--border, #30363d)',
          }}
        >
          <h3 style={{ margin: 0 }}>Live Code Explanation</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                cursor: 'pointer',
                color: 'var(--text-secondary, #8b949e)',
              }}
            >
              <input
                type="checkbox"
                checked={isAutoExplain}
                onChange={(e) => setIsAutoExplain(e.target.checked)}
              />
              Auto
            </label>
            <button
              className="manual-explain-btn"
              onClick={triggerExplanation}
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'var(--bg-secondary, #21262d)',
                border: '1px solid var(--border, #30363d)',
                cursor: 'pointer',
              }}
            >
              Explain Now
            </button>
          </div>
        </div>
        <div
          className="explanation-content"
          style={{ flex: 1, overflowY: 'auto', padding: '12px 15px' }}
        >
          {codeExplanation ? (
            <MarkdownRenderer text={codeExplanation} content={codeExplanation} />
          ) : (
            <p style={{ color: 'var(--text-secondary, #8b949e)', fontSize: '13px' }}>
              Write some code and click "Explain Now" or enable Auto to see explanations here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
