import React from 'react';
import { XIcon, BrainIcon, SearchIcon, LightbulbIcon } from '../Icons';
import './CodeLensSidebar.css';

function getComplexityClass(c) {
  if (!c) return 'neutral';
  const u = c.toUpperCase();
  if (u === 'O(1)' || u === 'O(LOG N)') return 'green';
  if (u === 'O(N)' || u === 'O(N LOG N)') return 'blue';
  if (u.includes('N²') || u.includes('N^2') || u.includes('N2')) return 'orange';
  return 'red';
}

function getScoreClass(s) {
  if (s >= 80) return 'green';
  if (s >= 50) return 'orange';
  return 'red';
}

export function CodeLensSidebar({
  isOpen,
  setIsOpen,
  width,
  onAnalyze,
  isAnalyzing,
  lenses,
  onClear,
}) {
  return (
    <div
      className={`code-lens-sidebar ${!isOpen ? 'collapsed' : ''}`}
      style={{ width: isOpen ? `${width}px` : '0px' }}
    >
      {/* Header */}
      <div className="cls-header">
        <div className="cls-header-title">
          <BrainIcon size={14} />
          <span>AI CODE LENS</span>
        </div>
        <button className="cls-icon-btn" onClick={() => setIsOpen(false)} title="Close">
          <XIcon size={14} />
        </button>
      </div>

      {/* Intro */}
      <div className="cls-intro">
        <p>Analyze your code for complexity, maintainability, and performance tips.</p>
      </div>

      {/* Action */}
      <div className="cls-actions">
        <button className="cls-analyze-btn" onClick={onAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <span className="cls-spinner" />
              Analyzing...
            </>
          ) : (
            <>
              <SearchIcon size={13} />
              Analyze Current File
            </>
          )}
        </button>
        {lenses && lenses.length > 0 && (
          <button className="cls-clear-btn" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      <div className="cls-results">
        {!isAnalyzing && (!lenses || lenses.length === 0) && (
          <div className="cls-empty">
            <div className="cls-empty-icon">
              <BrainIcon size={32} />
            </div>
            <p>Click "Analyze" to scan your code for intelligence.</p>
          </div>
        )}

        {lenses &&
          lenses.map((lens, i) => (
            <div key={i} className="cls-card">
              <div className="cls-fn-name">{lens.name}()</div>
              <div className="cls-badges">
                <span
                  className={`cls-badge cls-complexity cls-${getComplexityClass(lens.complexity)}`}
                >
                  {lens.complexity}
                </span>
                {lens.score !== undefined && (
                  <span className={`cls-badge cls-score cls-score-${getScoreClass(lens.score)}`}>
                    {lens.score}/100
                  </span>
                )}
              </div>
              {lens.tip && (
                <div className="cls-tip">
                  <LightbulbIcon size={11} />
                  <span>{lens.tip}</span>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
