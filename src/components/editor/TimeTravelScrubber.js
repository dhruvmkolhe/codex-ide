import React from 'react';
import './TimeTravelScrubber.css';

export function TimeTravelScrubber({
  snapshots,
  currentSnapshotIndex,
  onScrub,
  onRestore,
  onClose,
}) {
  if (snapshots.length < 2) return null;

  const handleChange = (e) => {
    const index = parseInt(e.target.value, 10);
    onScrub(snapshots[index]);
  };

  const currentSnapshot = snapshots[currentSnapshotIndex] || snapshots[0];

  return (
    <div className="time-travel-scrubber-container">
      <div className="scrubber-header">
        <div className="scrubber-info">
          <span className="scrubber-label">PREVIEWING HISTORY</span>
          <span className="scrubber-timestamp">
            {new Date(currentSnapshot.created_at).toLocaleString()}
          </span>
        </div>
        <div className="scrubber-actions">
          <button className="scrubber-btn restore" onClick={() => onRestore(currentSnapshot)}>
            Restore This Version
          </button>
          <button className="scrubber-btn exit" onClick={onClose}>
            Exit Preview
          </button>
        </div>
      </div>
      <div className="scrubber-track-wrapper">
        <input
          type="range"
          min="0"
          max={snapshots.length - 1}
          value={currentSnapshotIndex}
          onChange={handleChange}
          className="scrubber-slider"
        />
        <div className="scrubber-ticks">
          {snapshots.map((s, i) => (
            <div
              key={s.id}
              className={`scrubber-tick ${i === currentSnapshotIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
