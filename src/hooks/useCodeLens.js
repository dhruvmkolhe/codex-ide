import { useState, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';

export function useCodeLens({ selectedLanguage, currentModel, enabled }) {
  const [lenses, setLenses] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback(
    async (currentCode) => {
      if (!enabled || !currentCode || currentCode.trim().length < 30) {
        setLenses([]);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        setIsAnalyzing(true);
        setLenses([]);

        const prompt = `You are a code analysis engine. Analyze the following ${selectedLanguage} code and return a JSON array of code lenses.

For EACH top-level function or class method you find, return an object with:
- "name": function name
- "line": approximate 1-indexed line number where the function starts
- "complexity": Big O time complexity (e.g., "O(n)", "O(n²)", "O(1)")
- "score": maintainability score from 0-100
- "tip": a single, actionable performance tip (max 15 words) or null if no tip

Rules:
- Return ONLY a valid JSON array, no markdown, no other text.
- Max 5 lenses to avoid overwhelming the UI.
- If no functions found, return [].

Code:
\`\`\`${selectedLanguage}
${currentCode.substring(0, 3000)}
\`\`\``;

        const response = await axios.post(
          '/api/ai/chat',
          {
            model: currentModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 600,
          },
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );

        const raw = response.data?.choices?.[0]?.message?.content || '[]';
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed)) {
            setLenses(parsed.slice(0, 5));
          }
        }
      } catch (err) {
        setLenses([]);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [enabled, selectedLanguage, currentModel]
  );

  const clearLenses = useCallback(() => setLenses([]), []);

  return { lenses, isAnalyzing, analyze, clearLenses };
}
