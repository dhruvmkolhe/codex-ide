/**
 * Local LLM Integration Service (Ollama & LM Studio)
 * Supports custom coding task prompts and direct / proxied local AI inference.
 */

export const LOCAL_AI_PROVIDERS = {
  OLLAMA: {
    id: 'ollama',
    name: 'Ollama (Local)',
    defaultUrl: 'http://localhost:11434',
    defaultModel: 'codellama',
  },
  LM_STUDIO: {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    defaultUrl: 'http://localhost:1234',
    defaultModel: 'local-model',
  },
};

export const CODING_TASK_PRESETS = [
  {
    id: 'general',
    label: 'General Code Assistant',
    description: 'Standard expert coding help, code generation, and error fixing.',
    systemPrompt:
      'You are CodeX AI, a world-class senior software engineer and technical architect. Provide clean, secure, production-ready code with concise explanations.',
  },
  {
    id: 'refactor',
    label: 'Code Refactoring & Optimization',
    description: 'Optimize execution speed, reduce complexity, and improve readability.',
    systemPrompt:
      'You are an expert in code refactoring, performance optimization, and clean code architecture. Focus on improving runtime complexity, memory efficiency, and readability without breaking existing logic.',
  },
  {
    id: 'security',
    label: 'Security & Vulnerability Audit',
    description: 'Detect security flaws, injection risks, and secret leaks.',
    systemPrompt:
      'You are a cybersecurity expert and application security auditor. Analyze code for vulnerabilities (OWASP Top 10, injection, buffer overflows, insecure dependencies, secret leaks) and provide hardened code fixes.',
  },
  {
    id: 'bugfix',
    label: 'Semantic Error Repair',
    description: 'Locate subtle bugs, logic flaws, and runtime edge cases.',
    systemPrompt:
      'You are a diagnostic bug-hunting engine. Identify exact syntax errors, runtime exceptions, race conditions, or logic flaws in the code and provide a complete, working fix.',
  },
  {
    id: 'tests',
    label: 'Unit & Integration Test Creator',
    description: 'Generate unit tests, edge case assertions, and mock structures.',
    systemPrompt:
      'You are a test engineering automation specialist. Generate comprehensive, high-coverage unit tests with mocks, boundary condition tests, and assertions.',
  },
];

/**
 * Check health / connectivity to local Ollama or LM Studio instance
 */
export const checkLocalLlmHealth = async (providerId, baseUrl) => {
  const provider =
    Object.values(LOCAL_AI_PROVIDERS).find((p) => p.id === providerId) || LOCAL_AI_PROVIDERS.OLLAMA;
  const targetUrl = baseUrl || provider.defaultUrl;

  try {
    const endpoint = providerId === 'ollama' ? `${targetUrl}/api/tags` : `${targetUrl}/v1/models`;
    const response = await fetch(endpoint, { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json();
      return {
        available: true,
        models:
          providerId === 'ollama'
            ? (data.models || []).map((m) => m.name)
            : (data.data || []).map((m) => m.id),
      };
    }
  } catch (err) {
    // Attempt backend proxy fallback if direct browser fetch hit CORS
    try {
      const proxyRes = await fetch(
        `/api/ai/health?provider=${providerId}&url=${encodeURIComponent(targetUrl)}`
      );
      if (proxyRes.ok) {
        return await proxyRes.json();
      }
    } catch (e) {
      // Ignore
    }
  }

  return { available: false, models: [] };
};

/**
 * Generate code completion or answer using local LLM
 */
export const queryLocalLlm = async ({
  providerId,
  baseUrl,
  model,
  prompt,
  taskPresetId = 'general',
}) => {
  const task = CODING_TASK_PRESETS.find((t) => t.id === taskPresetId) || CODING_TASK_PRESETS[0];
  const systemPrompt = task.systemPrompt;
  const targetUrl =
    baseUrl || (providerId === 'lmstudio' ? 'http://localhost:1234' : 'http://localhost:11434');

  if (providerId === 'ollama') {
    const response = await fetch(`${targetUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'codellama',
        prompt: prompt,
        system: systemPrompt,
        stream: false,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama HTTP Error ${response.status}`);
    }
    const data = await response.json();
    return data.response;
  } else {
    // OpenAI-compatible format (LM Studio / LocalAI)
    const response = await fetch(`${targetUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'local-model',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });
    if (!response.ok) {
      throw new Error(`LM Studio HTTP Error ${response.status}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response returned from local model.';
  }
};
