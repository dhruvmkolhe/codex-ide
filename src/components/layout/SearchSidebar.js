import React from 'react';
import {
  SearchIcon,
  MatchCaseIcon,
  MatchWholeWordIcon,
  MatchRegexIcon,
  ChevronDownIcon,
} from '../Icons';

export function SearchSidebar({
  isOpen,
  width,
  searchQuery,
  setSearchQuery,
  searchOptions,
  setSearchOptions,
  searchResults,
  onSelectResult,
}) {
  const toggleOption = (option) => {
    setSearchOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div
      className={`explorer-sidebar search-sidebar ${!isOpen ? 'collapsed' : ''}`}
      style={{ width: isOpen ? width || '250px' : '0px' }}
    >
      <div className="explorer-header" style={{ padding: '4px 16px' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>SEARCH</span>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <div className="search-input-wrapper" style={{ position: 'relative', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          <ChevronDownIcon
            style={{ transform: 'rotate(-90deg)', cursor: 'pointer', opacity: 0.5 }}
          />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <span
              title="Match Case"
              onClick={() => toggleOption('matchCase')}
              style={{
                cursor: 'pointer',
                color: searchOptions.matchCase ? 'var(--primary-color)' : 'inherit',
                fontWeight: searchOptions.matchCase ? 'bold' : 'normal',
              }}
            >
              <MatchCaseIcon />
            </span>
            <span
              title="Match Whole Word"
              onClick={() => toggleOption('matchWholeWord')}
              style={{
                cursor: 'pointer',
                color: searchOptions.matchWholeWord ? 'var(--primary-color)' : 'inherit',
              }}
            >
              <MatchWholeWordIcon />
            </span>
            <span
              title="Use Regular Expression"
              onClick={() => toggleOption('isRegex')}
              style={{
                cursor: 'pointer',
                color: searchOptions.isRegex ? 'var(--primary-color)' : 'inherit',
              }}
            >
              <MatchRegexIcon />
            </span>
          </div>
        </div>
      </div>

      <div className="search-results-container" style={{ flex: 1, overflowY: 'auto' }}>
        {searchQuery && searchResults.length > 0 ? (
          <div className="search-results-list">
            <div
              style={{
                padding: '8px 16px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              {searchResults.length} results found
            </div>
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="search-result-item"
                onClick={() => onSelectResult(result.fileId, result.line)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}
                >
                  <span
                    style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}
                  >
                    {result.fileName}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Line {result.line}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontFamily: 'monospace',
                    opacity: 0.8,
                  }}
                >
                  {result.content}
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div
            className="sidebar-empty-state"
            style={{ padding: '40px 20px', color: 'var(--text-muted)', textAlign: 'center' }}
          >
            <div style={{ fontSize: '13px' }}>No results found for "{searchQuery}"</div>
          </div>
        ) : (
          <div
            className="sidebar-empty-state"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: '40px',
            }}
          >
            <div style={{ opacity: 0.3, marginBottom: '16px' }}>
              <SearchIcon style={{ width: '48px', height: '48px' }} />
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Search across all files in this project
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
