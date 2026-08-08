import React, { useState } from 'react';
import './RefactorModal.css';
import axios from 'axios';
import { supabase } from '../../supabaseClient';

export const REFACTOR_MODES = [
  {
    id: 'docstring',
    label: 'Generate JSDoc / Docstrings',
    desc: 'Add clean function parameters and type docstrings above functions',
    prompt:
      'Add comprehensive JSDoc (for JS/TS) or Docstring (for Python/other) documentation above every single function, method, class, and exported type. Keep all underlying code intact.',
  },
  {
    id: 'py2js',
    label: 'Convert Python ↔ JavaScript',
    desc: 'Translate Python code to ES6 JavaScript or vice versa',
    prompt:
      'Convert the code cleanly: if it is written in Python, translate it to modern ES6+ JavaScript. If it is written in JavaScript, translate it to clean Python 3. Preserve all underlying functionality, variables, and logic.',
  },
  {
    id: 'rest2graphql',
    label: 'Convert REST ↔ GraphQL',
    desc: 'Refactor REST fetch/axios calls to GraphQL queries & mutations',
    prompt:
      'Refactor all REST API fetch/axios endpoints and HTTP request calls in this code into structured GraphQL queries and mutations using Apollo or graphql-request.',
  },
  {
    id: 'clean_arch',
    label: 'Clean & Simplify Code',
    desc: 'Remove redundancy, improve naming, and optimize performance',
    prompt:
      'Refactor this code to follow modern clean code standards, eliminate duplicate logic, optimize performance, and improve variable naming.',
  },
];

export function RefactorModal({
  isOpen,
  onClose,
  activeCode = '',
  selectedLanguage = 'javascript',
  onApplyRefactoredCode,
  showToast,
}) {
  const [selectedMode, setSelectedMode] = useState('docstring');
  const [refactoredCode, setRefactoredCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!activeCode || !activeCode.trim()) {
      if (showToast) showToast('Active editor is empty. Add code first to refactor.', 'error');
      return;
    }

    setIsProcessing(true);
    setRefactoredCode('');

    const targetMode = REFACTOR_MODES.find((m) => m.id === selectedMode);

    try {
      // Get auth token if available, else send 'guest'
      let token = 'guest';
      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          token = session.access_token;
        }
      }

      const response = await axios.post(
        '/api/ai/chat',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an expert AI software architect and code transformation engine.
The current code language is: ${selectedLanguage}.
Action Required: ${targetMode?.prompt}
CRITICAL REQUIREMENT: Output ONLY the complete transformed source code inside a markdown code block (\`\`\`${selectedLanguage} ... \`\`\`). Do NOT include any conversational preamble or explanations before or after the code block.`,
            },
            {
              role: 'user',
              content: activeCode,
            },
          ],
          temperature: 0.15,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content || '';

      // Extract raw code inside ``` code block if present
      let extractedCode = reply;
      const codeBlockRegex = /```(?:[a-z]*)\n([\s\S]*?)```/i;
      const match = reply.match(codeBlockRegex);

      if (match && match[1]) {
        extractedCode = match[1].trim();
      } else {
        extractedCode = reply
          .replace(/^```[a-z]*\n?/gi, '')
          .replace(/```$/g, '')
          .trim();
      }

      setRefactoredCode(extractedCode || reply);
      if (showToast) showToast(`${targetMode?.label} generated successfully!`, 'success');
    } catch (err) {
      console.error('Refactoring error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Refactoring failed.';
      if (showToast) showToast(`Refactoring error: ${errMsg}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!refactoredCode) return;
    onApplyRefactoredCode(refactoredCode);
    if (showToast) showToast('Refactored code applied to active editor!', 'success');
    onClose();
  };

  return (
    <div className="refactor-modal-overlay" onClick={onClose}>
      <div className="refactor-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="refactor-modal-header">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">auto_fix_high</span>
            <h3>AI Automated Refactoring & Docstring Generator</h3>
          </div>
          <button className="refactor-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="refactor-modal-body">
          {/* Action Modes */}
          <div className="refactor-modes-grid">
            {REFACTOR_MODES.map((mode) => (
              <div
                key={mode.id}
                className={`refactor-mode-card ${selectedMode === mode.id ? 'active' : ''}`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <div className="refactor-mode-title">{mode.label}</div>
                <div className="refactor-mode-desc">{mode.desc}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="refactor-generate-btn"
            onClick={handleGenerate}
            disabled={isProcessing}
          >
            {isProcessing ? '⚡ AI Refactoring Code...' : '⚡ Generate AI Refactor'}
          </button>

          {/* Code Preview Diff */}
          {refactoredCode && (
            <div className="refactor-result-box">
              <div className="refactor-result-header">
                <span>Refactored Code Preview</span>
                <button type="button" className="refactor-apply-btn" onClick={handleApply}>
                  Apply to Editor
                </button>
              </div>
              <pre className="refactor-code-pre">{refactoredCode}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
