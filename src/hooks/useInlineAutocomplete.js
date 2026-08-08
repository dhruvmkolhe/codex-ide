import { useEffect, useRef } from 'react';
import axios from 'axios';
import { setGhostTextEffect } from '../utils/editorUtils';
import { supabase } from '../supabaseClient';

// High-speed in-memory completion cache (LRU, max 150 items)
const completionCache = new Map();
const MAX_CACHE_SIZE = 150;

function getCachedCompletion(key) {
  return completionCache.get(key) || null;
}

function setCachedCompletion(key, completion) {
  if (completionCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = completionCache.keys().next().value;
    if (oldestKey) completionCache.delete(oldestKey);
  }
  completionCache.set(key, completion);
}

// In-memory auth token cache to eliminate per-keypress async auth checks
let cachedAuthToken = null;
let tokenExpiry = 0;

async function getFastAuthToken() {
  const now = Date.now();
  if (cachedAuthToken && now < tokenExpiry) {
    return cachedAuthToken;
  }
  if (!supabase) return 'guest';
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      cachedAuthToken = session.access_token;
      tokenExpiry = now + 30000; // Cache token for 30s
      return cachedAuthToken;
    }
  } catch (err) {
    // Fall back to guest token on error
  }
  return 'guest';
}

export function useInlineAutocomplete(
  view,
  code,
  activeFileIndex,
  selectedLanguage,
  workspaceMode = 'beta'
) {
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Only run ghost text auto-completion in Beta mode
    if (!view || !code || activeFileIndex === null || workspaceMode !== 'beta') return;

    // Clear previous timeout and request
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const state = view.state;
    const pos = state.selection.main.head;

    // Only suggest if at the end of a line or after a space/newline
    const line = state.doc.lineAt(pos);
    const textAfter = line.text.slice(pos - line.from);

    // Heuristic: if there's text immediately after the cursor on the same line, don't suggest
    if (textAfter.trim().length > 0) {
      view.dispatch({ effects: setGhostTextEffect.of({ text: '', pos: null }) });
      return;
    }

    const docText = state.doc.toString();
    const codeBefore = docText.slice(0, pos);
    const contextSnippet = codeBefore.slice(-600);
    const cacheKey = `${selectedLanguage}:${contextSnippet}`;

    // Instant local cache lookup (0ms latency response)
    const cachedSuggestion = getCachedCompletion(cacheKey);
    if (cachedSuggestion !== null) {
      if (cachedSuggestion) {
        view.dispatch({
          effects: setGhostTextEffect.of({ text: cachedSuggestion, pos }),
        });
      }
      return;
    }

    // High-performance 180ms debounce for ultra-responsive ghost text
    timeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        const token = await getFastAuthToken();

        const response = await axios.post(
          '/api/ai/chat',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are an expert AI code completion tool. 
              The user is typing code in ${selectedLanguage}. 
              Provide ONLY the next few characters, words, or lines that should follow the current cursor position. 
              Do not repeat any existing code. Do not provide explanations or markdown wrappers. 
              If no completion is confident, return an empty string.
              Context before cursor:
              \`\`\`
              ${contextSnippet}
              \`\`\``,
              },
              {
                role: 'user',
                content: 'Complete the code.',
              },
            ],
            temperature: 0.1,
            max_tokens: 50,
            stop: ['\n\n', '```'],
          },
          {
            signal: abortControllerRef.current.signal,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const suggestion = response.data?.choices?.[0]?.message?.content || '';
        const cleanedSuggestion = suggestion
          .replace(/^```[a-z]*\n?/gi, '')
          .replace(/```$/g, '')
          .replace(/[\r\n]+$/, '');

        // Cache the result (even if empty) to avoid redundant requests
        setCachedCompletion(cacheKey, cleanedSuggestion);

        if (cleanedSuggestion) {
          view.dispatch({
            effects: setGhostTextEffect.of({ text: cleanedSuggestion, pos }),
          });
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Inline autocomplete error:', error);
        }
      }
    }, 180);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [code, activeFileIndex, selectedLanguage, view, workspaceMode]);
}
