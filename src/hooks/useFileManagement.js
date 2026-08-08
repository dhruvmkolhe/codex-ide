import { useState, useCallback, useEffect } from 'react';
import { filesSchema } from '../utils/schemas';
import { DEFAULT_MULTI_FILES, starterTemplates } from '../languagesData';

export const useFileManagement = ({
  selectedLanguage,
  setSelectedLanguage,
  primaryLanguage,
  code,
  setCode,
  showToast,
  broadcastFileOperation,
  pushWorkspaceHistory,
  extToLang,
  sharedData,
}) => {
  const [files, setFiles] = useState(() => {
    if (sharedData && sharedData.files) {
      return sharedData.files;
    }
    const initialLang =
      localStorage.getItem('codex_primary_language') ||
      localStorage.getItem('codex_language') ||
      'javascript';
    const langSavedFiles = localStorage.getItem(`codex_files_${initialLang}`);
    if (langSavedFiles) {
      try {
        const rawParsed = JSON.parse(langSavedFiles);
        const result = filesSchema.safeParse(rawParsed);
        if (result.success) {
          const parsed = result.data;
          const validExtsForLang = {
            javascript: ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'md', 'txt'],
            typescript: ['ts', 'tsx', 'js', 'jsx', 'json', 'html', 'css', 'md', 'txt'],
            python: ['py', 'pyw', 'txt', 'md', 'json', 'toml', 'cfg', 'ini'],
            java: ['java', 'class', 'jar', 'xml', 'properties', 'gradle', 'md', 'txt'],
            cpp: ['cpp', 'cc', 'cxx', 'h', 'hpp', 'hxx', 'c', 'txt', 'md', 'cmake'],
            c: ['c', 'h', 'txt', 'md'],
            go: ['go', 'mod', 'sum', 'txt', 'md'],
            rust: ['rs', 'toml', 'txt', 'md'],
            php: ['php', 'phtml', 'html', 'css', 'js', 'json', 'txt', 'md'],
            ruby: ['rb', 'erb', 'gemspec', 'txt', 'md', 'yml', 'yaml'],
            csharp: ['cs', 'csx', 'sln', 'csproj', 'xaml', 'txt', 'md', 'json'],
            kotlin: ['kt', 'kts', 'java', 'xml', 'gradle', 'txt', 'md'],
            html: ['html', 'htm', 'css', 'js', 'jsx', 'ts', 'json', 'svg', 'txt', 'md'],
            css: ['css', 'scss', 'sass', 'less', 'html', 'txt', 'md'],
            markdown: ['md', 'mdx', 'txt', 'html'],
          };
          const allowedExts = validExtsForLang[initialLang] || null;

          const isCorrupted =
            allowedExts !== null &&
            parsed.some((f) => {
              const nameParts = f.name.split('.');
              if (nameParts.length < 2 || (nameParts.length === 2 && nameParts[0] === ''))
                return false;
              const ext = nameParts.pop()?.toLowerCase();
              return ext && !allowedExts.includes(ext);
            });

          if (!isCorrupted) return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved files', e);
      }
    }
    const savedFiles = localStorage.getItem('codex_files');
    if (savedFiles) {
      try {
        const parsed = JSON.parse(savedFiles);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        /* ignore */
      }
    }
    if (DEFAULT_MULTI_FILES[initialLang]) {
      return DEFAULT_MULTI_FILES[initialLang].map((f) => ({ ...f }));
    }
    return starterTemplates[initialLang]
      ? [
          {
            name: `main.${initialLang === 'javascript' ? 'js' : initialLang}`,
            content: starterTemplates[initialLang],
          },
        ]
      : [{ name: 'index.js', content: '// Write your code here' }];
  });

  const [openFileNames, setOpenFileNames] = useState(() => {
    const saved = localStorage.getItem('codex_open_files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load open files', e);
      }
    }
    return files.map((f) => f.name); // Default to all files open
  });

  const [activeFileIndex, setActiveFileIndex] = useState(() => {
    const initialLang =
      localStorage.getItem('codex_primary_language') ||
      localStorage.getItem('codex_language') ||
      'javascript';
    const langSavedIndex = parseInt(localStorage.getItem(`codex_active_index_${initialLang}`), 10);
    if (!isNaN(langSavedIndex)) return langSavedIndex;
    const savedIndex = parseInt(localStorage.getItem('codex_active_index'), 10);
    return isNaN(savedIndex) ? 0 : savedIndex;
  });

  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set(['PROJECT']));

  useEffect(() => {
    if (openFileNames.length === 0) {
      setCode('');
    }
  }, [openFileNames, setCode]);

  const handleSwitchTab = useCallback(
    (index) => {
      const targetFile = files[index];
      if (!targetFile) return;

      setActiveFileIndex(index);
      setCode(targetFile.content);

      const ext = targetFile.name.split('.').pop()?.toLowerCase();
      const matchedLang = extToLang[ext];
      if (matchedLang && setSelectedLanguage) {
        setSelectedLanguage(matchedLang);
      }

      setOpenFileNames((prev) => {
        if (prev.includes(targetFile.name)) return prev;
        return [...prev, targetFile.name];
      });

      pushWorkspaceHistory({
        activeFileIndex: index,
        code: targetFile.content,
        selectedLanguage: matchedLang || selectedLanguage,
      });
    },
    [files, extToLang, selectedLanguage, setSelectedLanguage, pushWorkspaceHistory, setCode]
  );

  const handleCreateFile = useCallback(() => {
    const isMultiFile = [
      'javascript',
      'python',
      'java',
      'cpp',
      'c',
      'typescript',
      'html',
      'css',
      'markdown',
    ].includes(selectedLanguage);
    if (!isMultiFile) {
      showToast('This language does not support multiple files.', 'error');
      setIsAddingFile(false);
      return;
    }

    const name = newFileName.trim();
    if (!name) {
      setIsAddingFile(false);
      return;
    }

    if (files.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      showToast('A file with this name already exists.', 'error');
      return;
    }

    const validExtsForLang = {
      javascript: ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'md', 'txt'],
      typescript: ['ts', 'tsx', 'js', 'jsx', 'json', 'html', 'css', 'md', 'txt'],
      python: ['py', 'pyw', 'txt', 'md', 'json', 'toml', 'cfg', 'ini'],
      java: ['java', 'class', 'jar', 'xml', 'properties', 'gradle', 'md', 'txt'],
      cpp: ['cpp', 'cc', 'cxx', 'h', 'hpp', 'hxx', 'c', 'txt', 'md', 'cmake'],
      c: ['c', 'h', 'txt', 'md'],
      go: ['go', 'mod', 'sum', 'txt', 'md'],
      rust: ['rs', 'toml', 'txt', 'md'],
      php: ['php', 'phtml', 'html', 'css', 'js', 'json', 'txt', 'md'],
      ruby: ['rb', 'erb', 'gemspec', 'txt', 'md', 'yml', 'yaml'],
      csharp: ['cs', 'csx', 'sln', 'csproj', 'xaml', 'txt', 'md', 'json'],
      kotlin: ['kt', 'kts', 'java', 'xml', 'gradle', 'txt', 'md'],
      html: ['html', 'htm', 'css', 'js', 'jsx', 'ts', 'json', 'svg', 'txt', 'md'],
      css: ['css', 'scss', 'sass', 'less', 'html', 'txt', 'md'],
      markdown: ['md', 'mdx', 'txt', 'html'],
    };

    const nameParts = name.split('.');
    if (nameParts.length > 1 && !(nameParts.length === 2 && nameParts[0] === '')) {
      const ext = nameParts.pop().toLowerCase();
      const allowedExts = validExtsForLang[primaryLanguage];
      if (allowedExts && !allowedExts.includes(ext)) {
        showToast(
          `Files with extension .${ext} are not allowed in a ${primaryLanguage} workspace.`,
          'error'
        );
        return;
      }
    }

    const ext = name.split('.').pop()?.toLowerCase();
    const matchedLang = extToLang[ext] || selectedLanguage;
    const template = starterTemplates[matchedLang] || '// Write your code here\n';
    const newFile = { name, content: template };
    const updatedFiles = [...files, newFile];
    const newIdx = updatedFiles.length - 1;
    setFiles(updatedFiles);
    setActiveFileIndex(newIdx);
    setCode(template);
    setOpenFileNames((prev) => [...prev, name]);
    broadcastFileOperation(updatedFiles, newIdx);
    pushWorkspaceHistory({
      files: updatedFiles,
      activeFileIndex: newIdx,
      code: template,
      selectedLanguage: matchedLang,
    });
    setIsAddingFile(false);
    setNewFileName('');
    showToast(`Created file: ${name}`, 'success');
  }, [
    newFileName,
    files,
    extToLang,
    selectedLanguage,
    primaryLanguage,
    showToast,
    pushWorkspaceHistory,
    broadcastFileOperation,
    setCode,
  ]);

  const handleDeleteFile = useCallback(
    (e, index) => {
      e.stopPropagation();
      const fileName = files[index]?.name;
      if (!window.confirm(`Are you sure you want to permanently delete "${fileName}"?`)) return;
      if (files.length <= 1) {
        showToast('You must keep at least one file in the project.', 'error');
        return;
      }
      const updatedFiles = files.filter((_, i) => i !== index);
      setOpenFileNames((prev) => prev.filter((name) => name !== fileName));
      let newIndex = activeFileIndex;
      if (activeFileIndex >= updatedFiles.length) newIndex = updatedFiles.length - 1;
      else if (activeFileIndex === index) newIndex = Math.max(0, index - 1);
      setFiles(updatedFiles);
      setActiveFileIndex(newIndex);
      let newCode = code;
      let matchedLang = selectedLanguage;
      if (updatedFiles[newIndex]) {
        newCode = updatedFiles[newIndex].content;
        setCode(newCode);
        const ext = updatedFiles[newIndex].name.split('.').pop()?.toLowerCase();
        const testLang = extToLang[ext];
        if (testLang) {
          matchedLang = testLang;
        }
      }
      broadcastFileOperation(updatedFiles, newIndex);
      pushWorkspaceHistory({
        files: updatedFiles,
        activeFileIndex: newIndex,
        code: newCode,
        selectedLanguage: matchedLang,
      });
      showToast(`Permanently deleted: ${fileName}`, 'info');
    },
    [
      files,
      activeFileIndex,
      code,
      selectedLanguage,
      extToLang,
      showToast,
      pushWorkspaceHistory,
      broadcastFileOperation,
      setCode,
    ]
  );

  const handleRenameFile = useCallback(
    (index) => {
      const oldName = files[index]?.name;
      if (!oldName) return;
      const newName = window.prompt(`Rename "${oldName}" to:`, oldName);
      if (!newName || newName === oldName) return;

      if (files.some((f, i) => i !== index && f.name.toLowerCase() === newName.toLowerCase())) {
        showToast('A file with this name already exists.', 'error');
        return;
      }

      const updatedFiles = [...files];
      updatedFiles[index] = { ...updatedFiles[index], name: newName };
      setFiles(updatedFiles);
      setOpenFileNames((prev) => prev.map((name) => (name === oldName ? newName : name)));
      broadcastFileOperation(updatedFiles, activeFileIndex);
      pushWorkspaceHistory({ files: updatedFiles, activeFileIndex });
      showToast(`Renamed to: ${newName}`, 'success');
    },
    [files, activeFileIndex, broadcastFileOperation, pushWorkspaceHistory, showToast]
  );

  const handleNewFileInFolder = useCallback(
    (folderPath) => {
      const fileName = window.prompt(`Create new file in "${folderPath}":`);
      if (!fileName) return;

      const fullPath = `${folderPath}/${fileName}`;
      if (files.some((f) => f.name.toLowerCase() === fullPath.toLowerCase())) {
        showToast('A file with this name already exists.', 'error');
        return;
      }

      const ext = fileName.split('.').pop()?.toLowerCase();
      const matchedLang = extToLang[ext] || selectedLanguage;
      const template = starterTemplates[matchedLang] || '// Write your code here\n';
      const newFile = { name: fullPath, content: template };
      const updatedFiles = [...files, newFile];
      const newIdx = updatedFiles.length - 1;

      setFiles(updatedFiles);
      setActiveFileIndex(newIdx);
      setCode(template);
      setOpenFileNames((prev) => [...prev, fullPath]);
      broadcastFileOperation(updatedFiles, newIdx);
      pushWorkspaceHistory({
        files: updatedFiles,
        activeFileIndex: newIdx,
        code: template,
        selectedLanguage: matchedLang,
      });
      showToast(`Created file: ${fullPath}`, 'success');
    },
    [
      files,
      extToLang,
      selectedLanguage,
      showToast,
      pushWorkspaceHistory,
      broadcastFileOperation,
      setCode,
    ]
  );

  const handleCloseTab = useCallback(
    (e, index) => {
      e.stopPropagation();
      const fileName = files[index]?.name;
      if (!fileName) return;
      setOpenFileNames((prev) => {
        if (prev.length === 0) return prev;
        const next = prev.filter((name) => name !== fileName);
        if (activeFileIndex === index) {
          const lastOpenName = next[next.length - 1];
          const newFileIdx = files.findIndex((f) => f.name === lastOpenName);
          if (newFileIdx !== -1) handleSwitchTab(newFileIdx);
        }
        return next;
      });
    },
    [files, activeFileIndex, handleSwitchTab]
  );

  const handleToggleFolder = useCallback((path) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleMoveFile = useCallback(
    (oldPath, targetFolderPath) => {
      if (oldPath === targetFolderPath) return;

      const isProjectRoot = targetFolderPath === 'PROJECT';
      const targetPrefix = isProjectRoot ? '' : `${targetFolderPath}/`;
      const oldName = oldPath.split('/').pop();
      const newPath = `${targetPrefix}${oldName}`;

      if (files.some((f) => f.name === newPath)) {
        showToast('A file with this name already exists in the target folder.', 'error');
        return;
      }

      const updatedFiles = files.map((f) => {
        if (f.name === oldPath) {
          return { ...f, name: newPath };
        }
        if (f.name.startsWith(`${oldPath}/`)) {
          return { ...f, name: f.name.replace(oldPath, newPath) };
        }
        return f;
      });

      setFiles(updatedFiles);

      // Update opened files
      setOpenFileNames((prev) =>
        prev.map((name) => {
          if (name === oldPath) return newPath;
          if (name.startsWith(`${oldPath}/`)) return name.replace(oldPath, newPath);
          return name;
        })
      );

      // Update active index if changed
      const oldIndex = files.findIndex((f) => f.name === oldPath);
      if (oldIndex === activeFileIndex) {
        const newIndex = updatedFiles.findIndex((f) => f.name === newPath);
        setActiveFileIndex(newIndex);
      }

      broadcastFileOperation(updatedFiles, activeFileIndex);
      pushWorkspaceHistory({ files: updatedFiles, activeFileIndex });
      showToast(`Moved to ${isProjectRoot ? 'root' : targetFolderPath}`, 'success');
    },
    [files, activeFileIndex, showToast, broadcastFileOperation, pushWorkspaceHistory]
  );

  const handleUploadFile = useCallback(
    (file) => {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const fileName = file.name;

        if (files.some((f) => f.name === fileName)) {
          showToast('A file with this name already exists in the workspace.', 'error');
          return;
        }

        const updatedFiles = [...files, { name: fileName, content }];
        const newIdx = updatedFiles.length - 1;

        setFiles(updatedFiles);
        setActiveFileIndex(newIdx);
        setCode(content);
        setOpenFileNames((prev) => [...prev, fileName]);

        broadcastFileOperation(updatedFiles, newIdx);
        pushWorkspaceHistory({ files: updatedFiles, activeFileIndex: newIdx, code: content });
        showToast(`Uploaded: ${fileName}`, 'success');
      };
      reader.readAsText(file);
    },
    [files, broadcastFileOperation, pushWorkspaceHistory, setCode, showToast]
  );

  const handleNewFolder = useCallback(() => {
    const folderName = window.prompt('Enter folder name (e.g. src or utils/shared):');
    if (!folderName) return;
    const placeholderName = `${folderName.replace(/\/$/, '')}/.placeholder`;
    setFiles((prev) => {
      if (prev.some((f) => f.name === placeholderName)) {
        showToast('Folder already exists', 'error');
        return prev;
      }
      return [...prev, { name: placeholderName, content: '' }];
    });
    setExpandedFolders((prev) => new Set(prev).add(folderName));
    showToast(`Folder "${folderName}" created`, 'success');
  }, [showToast]);

  return {
    files,
    setFiles,
    openFileNames,
    setOpenFileNames,
    activeFileIndex,
    setActiveFileIndex,
    isAddingFile,
    setIsAddingFile,
    newFileName,
    setNewFileName,
    expandedFolders,
    setExpandedFolders,
    handleSwitchTab,
    handleCreateFile,
    handleDeleteFile,
    handleRenameFile,
    handleNewFileInFolder,
    handleCloseTab,
    handleToggleFolder,
    handleNewFolder,
    handleMoveFile,
    handleUploadFile,
  };
};
