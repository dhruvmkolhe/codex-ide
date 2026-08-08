import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const LOCAL_CHAT_KEY = 'codex_chat_sessions';

export function useAIChat({ user, selectedLanguage, showToast, setShowSqlGuide }) {
  const [chatSessions, setChatSessions] = useState([]);
  const [chatSessionsLoading, setChatSessionsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const getLocalSessions = () => {
    try {
      const stored = localStorage.getItem(LOCAL_CHAT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const setLocalSessions = (sessions) => {
    try {
      localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(sessions));
    } catch (e) {
      // ignore
    }
  };

  const fetchChatSessions = useCallback(async () => {
    setChatSessionsLoading(true);
    let local = getLocalSessions();

    if (!supabase || !user) {
      setChatSessions(local);
      setChatSessionsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Fetch chat sessions error:', error);
        if (error.code === '42P01' || error.message?.includes('relation')) {
          if (setShowSqlGuide) setShowSqlGuide(true);
        }
        setChatSessions(local);
      } else if (data) {
        // Merge Supabase and local sessions uniquely by id
        const mergedMap = new Map();
        data.forEach((s) => mergedMap.set(s.id, s));
        local.forEach((s) => {
          if (!mergedMap.has(s.id)) mergedMap.set(s.id, s);
        });
        const merged = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setChatSessions(merged);
      }
    } catch (err) {
      setChatSessions(local);
    } finally {
      setChatSessionsLoading(false);
    }
  }, [user, setShowSqlGuide]);

  const saveChatSessionRef = useRef(null);
  saveChatSessionRef.current = {
    user,
    selectedLanguage,
    currentSessionId,
    setCurrentSessionId,
    fetchChatSessions,
    showToast,
    setShowSqlGuide,
  };

  const saveChatSession = useCallback(async (history, label) => {
    const {
      user: u,
      selectedLanguage: lang,
      currentSessionId: sid,
      setCurrentSessionId: setSid,
      fetchChatSessions: fetch,
    } = saveChatSessionRef.current;

    if (!history || history.length === 0) return;

    try {
      const title =
        label ||
        history.find((m) => m.role === 'user')?.content?.slice(0, 60) + '...' ||
        'Chat session';

      const newId = sid || 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const sessionData = {
        id: newId,
        user_id: u?.id || 'guest',
        title,
        messages: JSON.stringify(history),
        language: lang || 'javascript',
        created_at: new Date().toISOString(),
      };

      // 1. Always save to LocalStorage
      let local = getLocalSessions();
      const existingIdx = local.findIndex((s) => s.id === newId);
      if (existingIdx >= 0) {
        local[existingIdx] = sessionData;
      } else {
        local.unshift(sessionData);
      }
      setLocalSessions(local);

      if (!sid) setSid(newId);

      // 2. Save to Supabase if logged in
      if (supabase && u) {
        const dbPayload = {
          user_id: u.id,
          title,
          messages: JSON.stringify(history),
          language: lang,
        };
        if (sid && !sid.startsWith('local_')) {
          dbPayload.id = sid;
        }
        await supabase.from('chat_sessions').upsert([dbPayload]);
      }

      fetch();
    } catch (err) {
      console.error('Save chat session error:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteChatSession = useCallback(
    async (sessionId) => {
      // Delete from LocalStorage
      let local = getLocalSessions().filter((s) => s.id !== sessionId);
      setLocalSessions(local);

      // Delete from Supabase if logged in
      if (supabase && user && !sessionId.toString().startsWith('local_')) {
        try {
          await supabase.from('chat_sessions').delete().eq('id', sessionId);
        } catch (err) {
          console.error('Delete chat session error:', err);
        }
      }

      if (currentSessionId === sessionId) setCurrentSessionId(null);
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    },
    [user, currentSessionId]
  );

  const clearAllChatSessions = useCallback(async () => {
    setLocalSessions([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('codex_chatHistory');
    } catch (e) {
      // ignore storage error
    }

    if (supabase && user) {
      try {
        await supabase.from('chat_sessions').delete().eq('user_id', user.id);
      } catch (err) {
        console.error('Clear all chat sessions error:', err);
      }
    }

    setCurrentSessionId(null);
    setChatSessions([]);
  }, [user]);

  useEffect(() => {
    fetchChatSessions();
  }, [user, fetchChatSessions]);

  return {
    chatSessions,
    chatSessionsLoading,
    fetchChatSessions,
    saveChatSession,
    deleteChatSession,
    clearAllChatSessions,
    currentSessionId,
    setCurrentSessionId,
  };
}
