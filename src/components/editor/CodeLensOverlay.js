import React from 'react';
import './CodeLensOverlay.css';

function getComplexityColor(complexity) {
  if (!complexity) return 'var(--lens-neutral)';
  const c = complexity.toUpperCase();
  if (c === 'O(1)' || c === 'O(LOG N)') return 'var(--lens-green)';
  if (c === 'O(N)' || c === 'O(N LOG N)') return 'var(--lens-blue)';
  if (c.includes('N²') || c.includes('N^2') || c.includes('N2')) return 'var(--lens-orange)';
  return 'var(--lens-red)';
}

function getScoreColor(score) {
  if (score >= 80) return 'var(--lens-green)';
  if (score >= 50) return 'var(--lens-orange)';
  return 'var(--lens-red)';
}

export function CodeLensOverlay({ lenses, isAnalyzing, lineHeight = 20, fontSize = 14 }) {
  if (!lenses || lenses.length === 0) return null;

  return (
    <div className="code-lens-overlay" aria-hidden="true">
      {lenses.map((lens, i) => {
        const topPx = (lens.line - 1) * lineHeight;
        return (
          <div
            key={i}
            className="code-lens-badge-row"
            style={{ top: `${topPx}px`, fontSize: `${Math.max(10, fontSize - 3)}px` }}
          >
            <span
              className="code-lens-badge"
              style={{ '--lens-accent': getComplexityColor(lens.complexity) }}
              title={`Time Complexity: ${lens.complexity}`}
            >
              {lens.complexity}
            </span>

            {lens.score !== undefined && (
              <span
                className="code-lens-badge"
                style={{ '--lens-accent': getScoreColor(lens.score) }}
                title={`Maintainability Score: ${lens.score}/100`}
              >
                ⚡ {lens.score}/100
              </span>
            )}

            {lens.tip && (
              <span className="code-lens-badge tip" title={lens.tip}>
                💡 {lens.tip}
              </span>
            )}
          </div>
        );
      })}

      {isAnalyzing && (
        <div className="code-lens-analyzing">
          <span className="code-lens-pulse" />
          <span>Analyzing...</span>
        </div>
      )}
    </div>
  );
}
