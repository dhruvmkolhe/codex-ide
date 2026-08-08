import { useState, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { queryLocalLlm } from '../utils/localLlmService';
import { getByokHeaders } from '../utils/byokProviderService';

export const useAIAnalysis = ({
  code,
  selectedLanguage,
  currentModel,
  showToast,
  setShowAuthModal,
  editorViewRef,
  setMobileActiveTab,
  taskPresetId = 'general',
}) => {
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);
  const [errorAnalysis, setErrorAnalysis] = useState(null);
  const [codeExplanation, setCodeExplanation] = useState('Code explanation will appear here...');

  const callAiApi = useCallback(
    async (model, messages, options = {}) => {
      const selectedModel = model || 'llama-3.1-8b-instant';

      // Check for Local LLM routing (Ollama or LM Studio)
      if (selectedModel.startsWith('ollama') || selectedModel.startsWith('lmstudio')) {
        const providerId = selectedModel.startsWith('ollama') ? 'ollama' : 'lmstudio';
        const modelName =
          selectedModel.split('/')[1] || (providerId === 'ollama' ? 'codellama' : 'local-model');
        const userPrompt = messages
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join('\n\n');

        try {
          const content = await queryLocalLlm({
            providerId,
            model: modelName,
            prompt: userPrompt,
            taskPresetId: options.taskPresetId || taskPresetId,
          });
          return {
            data: {
              choices: [{ message: { content } }],
            },
          };
        } catch (localErr) {
          if (showToast) showToast(`Local LLM Error: ${localErr.message}`, 'error');
          throw localErr;
        }
      }

      let session = null;
      try {
        const sessionRes = await supabase.auth.getSession();
        session = sessionRes?.data?.session;
      } catch (sErr) {
        // ignore session lookup failure
      }

      if (!session) {
        if (showToast) showToast('Please log in to use AI features.', 'warning');
        if (setShowAuthModal) setShowAuthModal(true);
        throw new Error('Authentication required for AI features.');
      }

      return await axios.post(
        '/api/ai/chat',
        {
          model: selectedModel,
          messages,
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          stop: options.stop,
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            ...getByokHeaders(),
          },
        }
      );
    },
    [showToast, setShowAuthModal, taskPresetId]
  );

  const localErrorClassifier = useCallback((errorText, lang) => {
    const text = errorText.toLowerCase();
    const syntaxPatterns = [
      'syntaxerror',
      'syntax error',
      'invalid syntax',
      'unexpected token',
      'unexpected character',
      "expected ';'",
      "missing ';'",
      'parse error',
      'parsererror',
      'indentationerror',
      'taberror',
      'unmatched parenthesis',
    ];
    const semanticPatterns = [
      'typeerror',
      'type error',
      'referenceerror',
      'reference error',
      'not in scope',
      'undefined variable',
      'not defined',
      'cannot find symbol',
      'undefined reference',
      'no member named',
      'does not exist',
      'value of type',
      'mismatched types',
      'undeclared',
      'is not declared',
      'variable not declared',
      'unknown type',
      'invalid conversion',
      'no matching function',
    ];
    const runtimePatterns = [
      'zerodivisionerror',
      'division by zero',
      'divide by zero',
      'indexerror',
      'index out of range',
      'out of bounds',
      'keyerror',
      'nullpointerexception',
      'null pointer',
      'segmentation fault',
      'segfault',
      'recursionerror',
      'valueerror',
      'assertionerror',
      'arithmeticexception',
      'nosuchelementexception',
    ];

    let errorType = 'Semantic Error';
    let category = 'Compilation/Logical Issue';
    let line = null;
    let file = null;

    const hsPattern = /main\.hs:(\d+):(\d+)/i;
    const pyPattern = /line (\d+)/i;
    const jsPattern = /([a-zA-Z0-9_-]+\.[a-zA-Z0-9]+):(\d+)/i;
    const cppPattern = /([a-zA-Z0-9_-]+\.[a-zA-Z0-9]+):(\d+):(\d+)/i;
    const javaPattern = /:(\d+)\)/i;

    let match;
    if ((match = errorText.match(hsPattern))) {
      line = parseInt(match[1], 10);
      file = 'main.hs';
    } else if ((match = errorText.match(cppPattern))) {
      file = match[1];
      line = parseInt(match[2], 10);
    } else if ((match = errorText.match(jsPattern))) {
      file = match[1];
      line = parseInt(match[2], 10);
    } else if ((match = errorText.match(pyPattern))) {
      line = parseInt(match[1], 10);
      file = 'main.py';
    } else if ((match = errorText.match(javaPattern))) {
      line = parseInt(match[1], 10);
    }

    if (syntaxPatterns.some((p) => text.includes(p))) {
      errorType = 'Syntax Error';
      category = 'Grammar & Syntax Violation';
    } else if (runtimePatterns.some((p) => text.includes(p))) {
      errorType = 'Runtime Error';
      category = 'Runtime Crash / Exception';
    } else if (semanticPatterns.some((p) => text.includes(p))) {
      errorType = 'Semantic Error';
      category = 'Type or Scope Resolution Issue';
    }

    return {
      errorType,
      category,
      file,
      line,
      column: null,
      explanation: 'Locally parsed compiler output.',
      suggestion: 'Review the line number highlighted above.',
    };
  }, []);

  const handleAnalyzeError = useCallback(
    async (errorOutput, language) => {
      setIsAnalyzingError(true);
      const localResult = localErrorClassifier(errorOutput, language);
      setErrorAnalysis(localResult);

      try {
        const prompt = `You are a high-fidelity code compiler error analyzer. Analyze this compiler error for ${language}:\n${errorOutput}`;
        const response = await callAiApi(currentModel, [{ role: 'user', content: prompt }]);
        const cleanedJSON = response.data?.choices?.[0]?.message?.content
          .replace(/```json|```/g, '')
          .trim();
        const aiResult = JSON.parse(cleanedJSON);
        if (aiResult && aiResult.errorType) {
          setErrorAnalysis((prev) => ({ ...prev, ...aiResult }));
        }
      } catch (err) {
        console.error('Error Analysis failed:', err);
      } finally {
        setIsAnalyzingError(false);
      }
    },
    [currentModel, callAiApi, localErrorClassifier]
  );

  const jumpToErrorLine = useCallback(
    (lineNum) => {
      const view = editorViewRef.current?.view;
      if (view && lineNum) {
        try {
          const lineCount = view.state.doc.lines;
          const targetLine = Math.min(Math.max(1, lineNum), lineCount);
          const lineInfo = view.state.doc.line(targetLine);
          view.dispatch({
            selection: { anchor: lineInfo.from, head: lineInfo.from },
            scrollIntoView: true,
          });
          view.focus();
          showToast(`Jumped to Line ${targetLine}`, 'success');
          setMobileActiveTab('editor');
        } catch (err) {
          console.error('Jump failed:', err);
        }
      } else {
        showToast('No active editor session.', 'error');
      }
    },
    [showToast, setMobileActiveTab, editorViewRef]
  );

  const getCodeExplanation = useCallback(
    async (currentCode) => {
      if (!currentCode.trim() || currentCode === '// Write your code here') {
        setCodeExplanation('Start writing code to see the explanation...');
        return;
      }
      try {
        const response = await callAiApi(currentModel, [
          { role: 'user', content: `Explain this ${selectedLanguage} code: ${currentCode}` },
        ]);
        setCodeExplanation(
          response.data?.choices?.[0]?.message?.content || 'No explanation available.'
        );
      } catch (error) {
        console.error('AI Error:', error);
      }
    },
    [callAiApi, currentModel, selectedLanguage]
  );

  return {
    isAnalyzingError,
    errorAnalysis,
    setErrorAnalysis,
    codeExplanation,
    setCodeExplanation,
    handleAnalyzeError,
    jumpToErrorLine,
    getCodeExplanation,
    callAiApi,
    setIsAnalyzingError,
  };
};
