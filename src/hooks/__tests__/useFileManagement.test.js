import { renderHook, act } from '@testing-library/react';
import { useFileManagement } from '../useFileManagement';

jest.mock('../../languagesData', () => ({
  __esModule: true,
  DEFAULT_MULTI_FILES: {
    javascript: [{ name: 'index.js', content: 'console.log("hello");' }],
  },
  starterTemplates: {
    javascript: 'console.log("hello");',
  },
}));

describe('useFileManagement custom hook', () => {
  const defaultProps = {
    selectedLanguage: 'javascript',
    setSelectedLanguage: jest.fn(),
    primaryLanguage: 'javascript',
    code: 'console.log("hello")',
    setCode: jest.fn(),
    showToast: jest.fn(),
    broadcastFileOperation: jest.fn(),
    pushWorkspaceHistory: jest.fn(),
    extToLang: { js: 'javascript', py: 'python' },
    sharedData: null,
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should initialize with default file list', () => {
    const { result } = renderHook(() => useFileManagement(defaultProps));
    expect(result.current.files.length).toBeGreaterThan(0);
    expect(result.current.activeFileIndex).toBe(0);
  });

  test('handleSwitchTab should update activeFileIndex and invoke callbacks', () => {
    const setCode = jest.fn();
    const setSelectedLanguage = jest.fn();
    const pushWorkspaceHistory = jest.fn();

    const { result } = renderHook(() =>
      useFileManagement({
        ...defaultProps,
        setCode,
        setSelectedLanguage,
        pushWorkspaceHistory,
      })
    );

    act(() => {
      result.current.handleSwitchTab(0);
    });

    expect(setCode).toHaveBeenCalled();
    expect(pushWorkspaceHistory).toHaveBeenCalled();
  });

  test('handleToggleFolder should add and remove folder paths from expandedFolders set', () => {
    const { result } = renderHook(() => useFileManagement(defaultProps));

    act(() => {
      result.current.handleToggleFolder('src');
    });
    expect(result.current.expandedFolders.has('src')).toBe(true);

    act(() => {
      result.current.handleToggleFolder('src');
    });
    expect(result.current.expandedFolders.has('src')).toBe(false);
  });
});
