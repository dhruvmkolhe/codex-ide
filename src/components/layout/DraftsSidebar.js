import React from 'react';
import { RefreshIcon, TrashIcon, UndoIcon } from '../Icons';

export function DraftsSidebar({ isOpen, width, drafts, onDeleteDraft, onRestoreDraft }) {
  return (
    <div
      className={`explorer-sidebar drafts-sidebar ${!isOpen ? 'collapsed' : ''}`}
      style={{ width: isOpen ? width || '250px' : '0px' }}
    >
      <div className="explorer-header" style={{ padding: '4px 16px' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>DRAFTS</span>
        <div className="explorer-header-actions">
          <button
            className="explorer-header-btn"
            title="Refresh Drafts"
            onClick={() => window.location.reload()}
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      <div className="drafts-list-container" style={{ flex: 1, overflowY: 'auto' }}>
        {drafts && drafts.length > 0 ? (
          <div className="drafts-list">
            <div
              style={{
                padding: '8px 16px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              {drafts.length} drafts stored locally
            </div>
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="draft-item"
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}
                  >
                    {draft.fileName}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onRestoreDraft(draft)}
                      title="Restore as New File"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary-color)',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <UndoIcon />
                    </button>
                    <button
                      onClick={() => onDeleteDraft(draft.id)}
                      title="Delete Draft"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-red)',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(draft.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="sidebar-empty-state"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: '40px',
            }}
          >
            <div style={{ fontSize: '13px', lineHeight: '1.5', maxWidth: '200px' }}>
              No drafts yet. Start editing and we'll keep your work here for 7 days.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
