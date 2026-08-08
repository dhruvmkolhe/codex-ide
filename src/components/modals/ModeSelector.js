import {
  HistoryIcon,
  LightningIcon,
  FocusIcon,
  RestoreIcon,
  BrainIcon,
  CameraIcon,
} from '../Icons';
import './ModeSelector.css';

export function ModeSelector({ onSelect, onClose }) {
  return (
    <div className="mode-selector-overlay">
      <button className="mode-close-btn" onClick={onClose} title="Close">
        &times;
      </button>
      <div className="mode-selector-container">
        <h1 className="mode-title">Choose Your Environment</h1>
        <p className="mode-subtitle">Select how you want to experience CodeX today.</p>

        <div className="mode-cards">
          <div className="mode-card stable" onClick={() => onSelect('stable')}>
            <div className="card-header">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mode-icon"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div className="status-badge stable">Recommended</div>
            </div>
            <div className="card-body">
              <h3>Foundry</h3>
              <p>
                A steady, performance-first environment for your daily code. Everything you need,
                nothing you don't – with local persistence and a calm, distraction-free layout that
                lets you focus on what matters.
              </p>
              <ul className="feature-list">
                <li>
                  <LightningIcon size={14} /> Fast and Stable
                </li>
                <li>
                  <FocusIcon size={14} /> Minimal UI distractions
                </li>
                <li>
                  <RestoreIcon size={14} /> Local Persistence
                </li>
              </ul>
            </div>
            <button className="select-btn">Enter Foundry</button>
          </div>

          <div className="mode-card beta" onClick={() => onSelect('beta')}>
            <div className="card-header">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mode-icon"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <div className="status-badge beta">Experimental</div>
            </div>
            <div className="card-body">
              <h3>Workshop</h3>
              <p>
                Get a sneak peek at tomorrow's features. Experiment boldly, but with built-in
                time-travel, AI-powered insights, and workspace snapshots – so you can explore
                without fear. We learn together.
              </p>
              <ul className="feature-list">
                <li>
                  <HistoryIcon size={14} /> Time Travel History
                </li>
                <li>
                  <BrainIcon size={14} /> AI Code Analysis
                </li>
                <li>
                  <CameraIcon size={14} /> Workspace Snapshots
                </li>
              </ul>
            </div>
            <button className="select-btn">Enter Workshop</button>
          </div>
        </div>

        <p className="mode-footer">You can switch modes anytime from the settings menu.</p>
      </div>
    </div>
  );
}
