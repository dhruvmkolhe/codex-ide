import React from 'react';
import { RestoreIcon, XIcon, TimeIcon, CameraIcon } from '../Icons';
import './SnapshotSidebar.css';

export function SnapshotSidebar({
  snapshots,
  isLoading,
  onRestore,
  onCapture,
  isCapturing,
  isOpen,
  setIsOpen,
  width,
}) {
  return (
    <div
      className={`snapshot-sidebar ${!isOpen ? 'collapsed' : ''}`}
      style={{ width: isOpen ? `${width}px` : '0px' }}
    >
      <div className="snapshot-header">
        <div className="header-title">
          <TimeIcon size={16} />
          <span>TIME TRAVEL</span>
        </div>
        <button
          className="snapshot-header-btn"
          onClick={() => setIsOpen(false)}
          title="Close Sidebar"
        >
          <XIcon size={14} />
        </button>
      </div>

      <div className="snapshot-actions">
        <button className="capture-btn" onClick={() => onCapture('manual')} disabled={isCapturing}>
          <CameraIcon size={14} />
          {isCapturing ? 'Capturing...' : 'Take Snapshot'}
        </button>
      </div>

      <div className="snapshot-content">
        {isLoading ? (
          <div className="snapshot-loading">Loading history...</div>
        ) : snapshots.length === 0 ? (
          <div className="snapshot-empty">
            <p>No snapshots yet.</p>
            <p className="hint">
              Snapshots are automatically created every 5 minutes, or you can take one manually.
            </p>
          </div>
        ) : (
          <div className="snapshot-list">
            {snapshots.map((snapshot) => (
              <div key={snapshot.id} className="snapshot-item">
                <div className="snapshot-info">
                  <div className="snapshot-tag-row">
                    <span className={`snapshot-tag ${snapshot.tag}`}>
                      {snapshot.tag.toUpperCase()}
                    </span>
                    <span className="snapshot-time">
                      {new Date(snapshot.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="snapshot-date">
                    {new Date(snapshot.created_at).toLocaleDateString()}
                  </div>
                  <div className="snapshot-files-count">{snapshot.files?.length || 0} files</div>
                </div>
                <button
                  className="restore-btn"
                  onClick={() => onRestore(snapshot)}
                  title="Restore this version"
                >
                  <RestoreIcon size={14} />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
