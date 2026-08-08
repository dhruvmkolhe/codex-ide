import { renderHook, act } from '@testing-library/react';
import { useTimeTravel } from '../useTimeTravel';

jest.mock('../../supabaseClient', () => ({
  __esModule: true,
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

describe('useTimeTravel custom hook', () => {
  const props = {
    user: { id: 'user-1' },
    files: [{ name: 'main.js', content: 'console.log("time travel test content long enough");' }],
    setFiles: jest.fn(),
    activeFileIndex: 0,
    setActiveFileIndex: jest.fn(),
    setCode: jest.fn(),
    showToast: jest.fn(),
  };

  test('restoreSnapshot should set files, active index, and code', () => {
    const { result } = renderHook(() => useTimeTravel(props));

    const mockSnapshot = {
      created_at: new Date().toISOString(),
      activeFileIndex: 0,
      files: [{ name: 'main.js', content: 'restored code' }],
    };

    act(() => {
      result.current.restoreSnapshot(mockSnapshot);
    });

    expect(props.setFiles).toHaveBeenCalledWith(mockSnapshot.files);
    expect(props.setCode).toHaveBeenCalledWith('restored code');
  });
});
