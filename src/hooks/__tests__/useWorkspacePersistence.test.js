import { renderHook, act } from '@testing-library/react';
import { useWorkspacePersistence } from '../useWorkspacePersistence';

describe('useWorkspacePersistence custom hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should schedule debounced storage updates for state changes', () => {
    const props = {
      code: 'console.log("hello");',
      files: [{ name: 'index.js', content: 'console.log("hello");' }],
      activeFileIndex: 0,
      selectedLanguage: 'javascript',
      primaryLanguage: 'javascript',
      activeTheme: 'one-dark',
      fontSize: 14,
      currentModel: 'groq',
      chatLanguage: 'english',
      consoleOutput: [],
      chatHistory: [],
      stdinMap: {},
      showLanding: false,
      isFocusMode: false,
      tabSize: 2,
      leftPanelWidth: 300,
      editorHeightPct: 60,
      chatHeightPct: 40,
      explorerWidth: 200,
      openFileNames: ['index.js'],
      isExplorerOpen: true,
      isAutoExplain: false,
      activeCloudFileId: null,
      cloudSaveName: '',
      customThemeColors: {},
      setPrimaryLanguage: jest.fn(),
      setSelectedLanguage: jest.fn(),
      setActiveFileIndex: jest.fn(),
      setActiveCloudFileId: jest.fn(),
      setCloudSaveName: jest.fn(),
      setFiles: jest.fn(),
      setCode: jest.fn(),
      showToast: jest.fn(),
      isNavigatingFromHistoryRef: { current: false },
    };

    renderHook(() => useWorkspacePersistence(props));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(localStorage.getItem('codex_language')).toBe('javascript');
    expect(localStorage.getItem('codex_fontsize')).toBe('14');
  });
});
