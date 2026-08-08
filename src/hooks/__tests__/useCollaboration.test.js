import { renderHook, act } from '@testing-library/react';
import { useCollaboration } from '../useCollaboration';

describe('useCollaboration custom hook', () => {
  const props = {
    roomId: 'room-101',
    activeFileIndex: 0,
    setCode: jest.fn(),
    setFiles: jest.fn(),
    setSelectedLanguage: jest.fn(),
    setPrimaryLanguage: jest.fn(),
    setActiveFileIndex: jest.fn(),
    showToast: jest.fn(),
    myCollaboratorId: 'collab-1',
    myColor: '#00ff00',
    myName: 'Peer 1',
    latestStateRef: { current: { files: [], activeFileIndex: 0, selectedLanguage: 'js' } },
    isRemoteChangeRef: { current: false },
  };

  test('should initialize collaboration state with default values', () => {
    const { result } = renderHook(() => useCollaboration(props));

    expect(result.current.collabActive).toBe(false);
    expect(result.current.collaborators).toEqual([]);
    expect(typeof result.current.broadcastCodeChange).toBe('function');
  });

  test('setCollabActive should toggle active state', () => {
    const { result } = renderHook(() => useCollaboration(props));

    act(() => {
      result.current.setCollabActive(true);
    });

    expect(result.current.collabActive).toBe(true);
  });
});
