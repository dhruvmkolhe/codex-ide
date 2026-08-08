import { renderHook, act } from '@testing-library/react';
import { useAIChat } from '../useAIChat';

describe('useAIChat custom hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saveChatSession should store chat history in localStorage', async () => {
    const { result } = renderHook(() =>
      useAIChat({ user: null, selectedLanguage: 'javascript', showToast: jest.fn() })
    );

    const history = [
      { role: 'user', content: 'What is JS?' },
      { role: 'assistant', content: 'JS is JavaScript.' },
    ];

    await act(async () => {
      await result.current.saveChatSession(history, 'JS Session');
    });

    expect(result.current.chatSessions.length).toBeGreaterThan(0);
    expect(result.current.chatSessions[0].title).toBe('JS Session');
  });

  test('deleteChatSession should remove session from state and storage', async () => {
    const { result } = renderHook(() =>
      useAIChat({ user: null, selectedLanguage: 'javascript', showToast: jest.fn() })
    );

    const history = [{ role: 'user', content: 'Test' }];

    await act(async () => {
      await result.current.saveChatSession(history, 'To Delete');
    });

    const sessionId = result.current.chatSessions[0].id;

    await act(async () => {
      await result.current.deleteChatSession(sessionId);
    });

    expect(result.current.chatSessions.find((s) => s.id === sessionId)).toBeUndefined();
  });

  test('clearAllChatSessions should wipe all saved sessions from state and storage', async () => {
    const { result } = renderHook(() =>
      useAIChat({ user: null, selectedLanguage: 'javascript', showToast: jest.fn() })
    );

    await act(async () => {
      await result.current.saveChatSession([{ role: 'user', content: 'Session 1' }], 'Session 1');
      await result.current.saveChatSession([{ role: 'user', content: 'Session 2' }], 'Session 2');
    });

    expect(result.current.chatSessions.length).toBe(2);

    await act(async () => {
      await result.current.clearAllChatSessions();
    });

    expect(result.current.chatSessions.length).toBe(0);
  });
});
