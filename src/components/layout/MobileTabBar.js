import React from 'react';
import { CodeIcon, ConsoleMenuIcon, SparklesIcon } from '../Icons';

export function MobileTabBar({ mobileActiveTab, setMobileActiveTab }) {
  return (
    <div className="mobile-tab-bar">
      <button
        type="button"
        className={`mobile-tab-btn ${mobileActiveTab === 'editor' ? 'active' : ''}`}
        onClick={() => setMobileActiveTab('editor')}
      >
        <CodeIcon />
        <span>Editor</span>
      </button>
      <button
        type="button"
        className={`mobile-tab-btn ${mobileActiveTab === 'output' ? 'active' : ''}`}
        onClick={() => setMobileActiveTab('output')}
      >
        <ConsoleMenuIcon />
        <span>Output</span>
      </button>
      <button
        type="button"
        className={`mobile-tab-btn ${mobileActiveTab === 'chat' ? 'active' : ''}`}
        onClick={() => setMobileActiveTab('chat')}
      >
        <SparklesIcon />
        <span>AI Chat</span>
      </button>
    </div>
  );
}
