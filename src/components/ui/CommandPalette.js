import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileIcon,
  PaletteIcon,
  SparklesIcon,
  PlayIcon,
  FormatIcon,
  FocusIcon,
  ShareIcon,
  PhotoIcon,
} from '../Icons';
import { IDE_THEMES as THEMES } from '../../utils/ideConstants';

const CommandPalette = ({
  isOpen,
  onClose,
  files,
  activeTheme,
  onSwitchFile,
  onSwitchTheme,
  onRunCode,
  onFormatCode,
  onToggleFocus,
  onExplainCode,
  onShareWorkspace,
  onSnapshot,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const ACTIONS = [
    { id: 'run', label: 'Run Code', icon: <PlayIcon />, action: onRunCode },
    { id: 'format', label: 'Format Code', icon: <FormatIcon />, action: onFormatCode },
    { id: 'focus', label: 'Toggle Focus Mode', icon: <FocusIcon />, action: onToggleFocus },
    { id: 'explain', label: 'AI Explain Code', icon: <SparklesIcon />, action: onExplainCode },
    { id: 'share', label: 'Share Workspace', icon: <ShareIcon />, action: onShareWorkspace },
    { id: 'snapshot', label: 'Create Snapshot', icon: <PhotoIcon />, action: onSnapshot },
  ];

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase();
    const results = [];

    // Add Actions
    ACTIONS.forEach((a) => {
      if (a.label.toLowerCase().includes(q)) {
        results.push({ ...a, type: 'action' });
      }
    });

    // Add Themes
    THEMES.forEach((t) => {
      if (t.label.toLowerCase().includes(q) || 'theme'.includes(q)) {
        results.push({ ...t, type: 'theme' });
      }
    });

    // Add Files
    files.forEach((f, index) => {
      if (f.name.toLowerCase().includes(q)) {
        results.push({ id: `file-${index}`, label: f.name, type: 'file', index });
      }
    });

    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, files]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeItem(filteredItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const executeItem = (item) => {
    if (!item) return;
    if (item.type === 'file') {
      onSwitchFile(item.index);
    } else if (item.type === 'theme') {
      onSwitchTheme(item.id);
    } else if (item.type === 'action') {
      item.action();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="modal-overlay command-palette-overlay"
        onClick={onClose}
        style={{ alignItems: 'flex-start', paddingTop: '15vh' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="command-palette"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          <div className="command-palette-input-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search files, actions or themes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="command-palette-input"
            />
            <div className="command-palette-hint">
              <kbd>ESC</kbd> to close
            </div>
          </div>

          <div className="command-palette-results">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`command-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="item-icon">
                    {item.type === 'file' && <FileIcon />}
                    {item.type === 'theme' && <PaletteIcon />}
                    {item.type === 'action' && item.icon}
                  </span>
                  <span className="item-label">{item.label}</span>
                  {item.type === 'theme' && item.id === activeTheme && (
                    <span className="item-badge">Active</span>
                  )}
                  <span className="item-type">{item.type}</span>
                </div>
              ))
            ) : (
              <div className="command-palette-no-results">No matching commands found.</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
