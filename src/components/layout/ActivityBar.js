import React from 'react';
import {
  CopyIcon,
  SearchIcon,
  HistoryIcon,
  TimeIcon,
  BrainIcon,
  GraphIcon,
  WhiteboardIcon,
  CpuIcon,
} from '../Icons';

export const ActivityBar = React.memo(function ActivityBar({
  isExplorerOpen,
  setIsExplorerOpen,
  sidebarTab,
  setSidebarTab,
  workspaceMode,
  onOpenWhiteboard,
}) {
  const handleTabClick = (tab) => {
    if (sidebarTab === tab) {
      setIsExplorerOpen(!isExplorerOpen);
    } else {
      setSidebarTab(tab);
      setIsExplorerOpen(true);
    }
  };

  return (
    <div className="activity-bar">
      <div className="activity-bar-top">
        <div
          className={`activity-item ${isExplorerOpen && sidebarTab === 'explorer' ? 'active' : ''}`}
          onClick={() => handleTabClick('explorer')}
          title="Explorer (Ctrl+Shift+E)"
        >
          <CopyIcon />
        </div>
        <div
          className={`activity-item ${isExplorerOpen && sidebarTab === 'search' ? 'active' : ''}`}
          onClick={() => handleTabClick('search')}
          title="Search (Ctrl+Shift+F)"
        >
          <SearchIcon />
        </div>
        <div
          className={`activity-item ${isExplorerOpen && sidebarTab === 'drafts' ? 'active' : ''}`}
          onClick={() => handleTabClick('drafts')}
          title="Drafts"
        >
          <HistoryIcon />
        </div>
        <div className="activity-item" onClick={onOpenWhiteboard} title="Open Whiteboard (tldraw)">
          <WhiteboardIcon />
        </div>
        <div
          className={`activity-item ${isExplorerOpen && sidebarTab === 'stepper' ? 'active' : ''}`}
          onClick={() => handleTabClick('stepper')}
          title="Visual Execution Stepper"
        >
          <CpuIcon />
        </div>
        {workspaceMode === 'beta' && (
          <div
            className={`activity-item ${isExplorerOpen && sidebarTab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabClick('history')}
            title="Time Travel (History)"
          >
            <TimeIcon />
          </div>
        )}
        {workspaceMode === 'beta' && (
          <div
            className={`activity-item ${isExplorerOpen && sidebarTab === 'lens' ? 'active' : ''}`}
            onClick={() => handleTabClick('lens')}
            title="AI Code Lens (Beta)"
          >
            <BrainIcon />
          </div>
        )}
        {workspaceMode === 'beta' && (
          <div
            className={`activity-item ${isExplorerOpen && sidebarTab === 'graph' ? 'active' : ''}`}
            onClick={() => handleTabClick('graph')}
            title="Dependency Graph (Beta)"
          >
            <GraphIcon />
          </div>
        )}
      </div>
      <div className="activity-bar-bottom">{/* Removed LabIcon and Settings as requested */}</div>
    </div>
  );
});

export default ActivityBar;
