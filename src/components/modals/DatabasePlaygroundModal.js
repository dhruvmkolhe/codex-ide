import React, { useState } from 'react';
import './DatabasePlaygroundModal.css';
import { sqliteEngine } from '../../utils/sqliteEngine';

export const SAMPLE_SQL_QUERIES = [
  { label: 'View Projects', query: 'SELECT * FROM user_projects LIMIT 10;' },
  {
    label: 'View Chat Sessions',
    query: 'SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 10;',
  },
  { label: 'View User Preferences', query: 'SELECT * FROM user_preferences;' },
  { label: 'View Snapshots', query: 'SELECT * FROM workspace_snapshots LIMIT 5;' },
];

export function DatabasePlaygroundModal({ isOpen, onClose, showToast }) {
  const [query, setQuery] = useState(SAMPLE_SQL_QUERIES[0].query);
  const [results, setResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleRunQuery = async () => {
    setIsExecuting(true);
    setErrorMessage(null);
    setResults(null);

    try {
      // 1. Execute SQL via client-side SQLite Engine
      const res = sqliteEngine.execute(query);
      setResults(res);
      if (showToast) showToast('SQL query executed successfully.', 'success');
    } catch (err) {
      setErrorMessage(err.message || 'Error executing SQL query.');
    } finally {
      setIsExecuting(false);
    }
  };

  const keys = results && results.length > 0 ? Object.keys(results[0]) : [];

  return (
    <div className="db-playground-overlay" onClick={onClose}>
      <div className="db-playground-card" onClick={(e) => e.stopPropagation()}>
        <div className="db-playground-header">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">database</span>
            <h3>SQL Database Playground & Query Builder</h3>
          </div>
          <button className="db-playground-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="db-playground-body">
          {/* Preset Buttons */}
          <div className="sql-presets-row">
            <span className="presets-title">Sample Queries:</span>
            {SAMPLE_SQL_QUERIES.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                className="sql-preset-btn"
                onClick={() => setQuery(sq.query)}
              >
                {sq.label}
              </button>
            ))}
          </div>

          {/* Editor Area */}
          <div className="sql-editor-container">
            <textarea
              className="sql-textarea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter SQL Query (e.g. SELECT * FROM user_projects;)..."
            />
            <button
              type="button"
              className="sql-run-btn"
              onClick={handleRunQuery}
              disabled={isExecuting}
            >
              {isExecuting ? 'Executing...' : 'Run Query'}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && <div className="sql-error-banner">⚠️ {errorMessage}</div>}

          {/* Results Grid Table */}
          {results && (
            <div className="sql-results-container">
              <div className="results-header">
                <span>Query Results ({results.length} rows)</span>
              </div>
              {results.length === 0 ? (
                <div className="empty-results">No records found in this table.</div>
              ) : (
                <div className="table-scroll-wrapper">
                  <table className="results-table">
                    <thead>
                      <tr>
                        {keys.map((k) => (
                          <th key={k}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {keys.map((k) => (
                            <td key={k}>
                              {typeof row[k] === 'object'
                                ? JSON.stringify(row[k])
                                : String(row[k] ?? 'NULL')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
