import React from 'react';
import {
  ChevronDownIcon,
  SidbarNewFolderIcon,
  SidbarNewFileIcon,
  EditIcon,
  XIcon,
  HideIcon,
  UploadFileIcon,
} from '../Icons';
import { buildFileTree } from '../../utils/fileUtils';

export function ExplorerSidebar({
  files,
  activeFileIndex,
  onSwitchTab,
  onDeleteFile,
  onNewFile,
  onNewFolder,
  isOpen,
  setIsOpen,
  getLanguageIcon,
  width,
  showToast,
  expandedFolders,
  onToggleFolder,
  onRenameFile,
  onNewFileInFolder,
  onMoveFile,
  onUploadFile,
}) {
  const [draggedPath, setDraggedPath] = React.useState(null);
  const [dropTarget, setDropTarget] = React.useState(null);
  const [contextMenu, setContextMenu] = React.useState(null);
  const sidebarFileInputRef = React.useRef(null);

  const fileTree = buildFileTree(files);

  // DnD Handlers
  const handleDragStart = (e, path) => {
    e.stopPropagation();
    setDraggedPath(path);
    e.dataTransfer.setData('text/plain', path);
    e.dataTransfer.effectAllowed = 'move';
    // Add a ghost image or style if needed, but standard is fine
  };

  const handleDragOver = (e, path, type) => {
    e.preventDefault();
    e.stopPropagation();

    // Some browsers don't allow reading dataTransfer.getData in dragOver
    // so we just trust the hit target
    if (type === 'folder') {
      setDropTarget(path);
    } else {
      // Find parent folder for file drop
      const pathParts = path.split('/');
      pathParts.pop();
      const parentPath = pathParts.length > 0 ? pathParts.join('/') : 'PROJECT';
      setDropTarget(parentPath);
    }
  };

  const handleDrop = (e, targetFolderPath) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);

    const draggedFilePath = e.dataTransfer.getData('text/plain');
    if (!draggedFilePath || draggedFilePath === targetFolderPath) return;

    // Don't allowing dropping a folder into itself or its children
    if (targetFolderPath !== 'PROJECT' && targetFolderPath.startsWith(`${draggedFilePath}/`)) {
      showToast('Cannot move a folder into its own subdirectory.', 'error');
      return;
    }

    onMoveFile(draggedFilePath, targetFolderPath);
  };

  // Context Menu Handlers
  const handleContextMenu = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      path: node.path,
      type: node.type,
      index: node.index,
    });
  };

  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const renderTree = (node, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isDragging = draggedPath === node.path;
    const isOver = dropTarget === node.path;

    if (node.type === 'folder') {
      const isRoot = node.path === 'PROJECT';
      return (
        <div
          key={node.path}
          className={`explorer-tree-node ${isOver ? 'drop-target' : ''}`}
          onDragOver={(e) => handleDragOver(e, node.path, 'folder')}
          onDragEnter={(e) => handleDragOver(e, node.path, 'folder')}
          onDrop={(e) => handleDrop(e, node.path)}
          onDragLeave={() => setDropTarget(null)}
        >
          {!isRoot && (
            <div
              className={`explorer-item explorer-folder ${isDragging ? 'dragging' : ''}`}
              style={{ paddingLeft: `${depth * 12 + 12}px` }}
              onClick={() => onToggleFolder(node.path)}
              onContextMenu={(e) => handleContextMenu(e, node)}
              draggable
              onDragStart={(e) => handleDragStart(e, node.path)}
            >
              <span className={`explorer-folder-arrow ${isExpanded ? 'expanded' : ''}`}>
                <ChevronDownIcon />
              </span>
              <span className="explorer-item-icon">
                <SidbarNewFolderIcon />
              </span>
              <span className="explorer-item-name">{node.name}</span>
            </div>
          )}
          {(isRoot || isExpanded) && (
            <div className="explorer-folder-children">
              {Object.values(node.children)
                .sort((a, b) => {
                  if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                  return a.name.localeCompare(b.name);
                })
                .map((child) => renderTree(child, isRoot ? depth : depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const fileIndex = node.index;
    const isActive = activeFileIndex === fileIndex;
    const ext = node.name.split('.').pop()?.toLowerCase();
    const langId = ext === 'js' ? 'javascript' : ext === 'py' ? 'python' : ext || 'text';

    return (
      <div
        key={node.path}
        className={`explorer-item ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 28}px` }}
        onClick={() => onSwitchTab(fileIndex)}
        onContextMenu={(e) => handleContextMenu(e, node)}
        draggable
        onDragStart={(e) => handleDragStart(e, node.path)}
        onDragOver={(e) => handleDragOver(e, node.path, 'file')}
        onDragEnter={(e) => handleDragOver(e, node.path, 'file')}
      >
        <span className="explorer-item-icon">{getLanguageIcon(langId, 16)}</span>
        <span className="explorer-item-name">{node.name}</span>
      </div>
    );
  };

  return (
    <div
      className={`explorer-sidebar ${!isOpen ? 'collapsed' : ''} ${dropTarget === 'PROJECT' ? 'drop-target' : ''}`}
      style={{ width: isOpen ? `${width}px` : '0px' }}
      onDragOver={(e) => handleDragOver(e, 'PROJECT', 'folder')}
      onDragEnter={(e) => handleDragOver(e, 'PROJECT', 'folder')}
      onDrop={(e) => handleDrop(e, 'PROJECT')}
      onDragEnd={() => {
        setDraggedPath(null);
        setDropTarget(null);
      }}
    >
      <div className="explorer-header">
        <span>EXPLORER</span>
        <div className="explorer-header-actions">
          <button className="explorer-header-btn" onClick={onNewFile} title="New File">
            <SidbarNewFileIcon />
          </button>
          <button className="explorer-header-btn" onClick={onNewFolder} title="New Folder">
            <SidbarNewFolderIcon />
          </button>
          <button
            className="explorer-header-btn"
            onClick={() => sidebarFileInputRef.current?.click()}
            title="Upload File"
          >
            <UploadFileIcon />
          </button>
          <button
            className="explorer-header-btn"
            onClick={() => setIsOpen(false)}
            title="Collapse Explorer"
          >
            <HideIcon />
          </button>
        </div>
        <input
          type="file"
          ref={sidebarFileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onUploadFile(e.target.files[0]);
              e.target.value = ''; // reset
            }
          }}
        />
      </div>
      <div className="explorer-content">{renderTree(fileTree)}</div>

      {contextMenu && (
        <div
          className="explorer-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="menu-item"
            onClick={() => {
              onRenameFile(contextMenu.index);
              setContextMenu(null);
            }}
          >
            <EditIcon /> Rename
          </div>
          <div
            className="menu-item delete"
            onClick={() => {
              onDeleteFile({ stopPropagation: () => {} }, contextMenu.index);
              setContextMenu(null);
            }}
          >
            <XIcon /> Delete
          </div>
          {contextMenu.type === 'folder' && (
            <>
              <div className="menu-separator" />
              <div
                className="menu-item"
                onClick={() => {
                  onNewFileInFolder(contextMenu.path);
                  setContextMenu(null);
                }}
              >
                <SidbarNewFileIcon /> New File
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
