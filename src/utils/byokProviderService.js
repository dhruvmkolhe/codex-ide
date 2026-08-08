/**
 * byokProviderService.js
 * Modular Bring Your Own Key (BYOK) & Provider Service Layer
 *
 * Manages API keys, provider enablement status, connection testing,
 * custom provider additions, and secure request header generation.
 */

const STORAGE_KEY = 'codex_byok_providers_v1';

// Clean client-side local storage key persistence
const encodeKey = (str) => (str ? String(str) : '');
const decodeKey = (str) => (str ? String(str) : '');

// Out-of-the-box standard providers configuration
const DEFAULT_PROVIDERS = [
  {
    id: 'groq',
    name: 'Groq (Fast Inference)',
    type: 'ai',
    description: 'Ultra-fast Llama 3.3 70B & Mixtral LLM inference',
    endpoint: 'https://api.groq.com/openai/v1',
    headerName: 'X-Groq-API-Key',
    envFallbackKey: 'GROQ_API_KEY',
    enabled: true,
    apiKey: '',
    isCustom: false,
    docsUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Multi-Model)',
    type: 'ai',
    description: 'Access 100+ AI models including Claude, GPT-4, Llama, and Qwen',
    endpoint: 'https://openrouter.ai/api/v1',
    headerName: 'X-OpenRouter-API-Key',
    envFallbackKey: 'OPENROUTER_API_KEY',
    enabled: true,
    apiKey: '',
    isCustom: false,
    docsUrl: 'https://openrouter.ai/keys',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'ai',
    description: 'Google Gemini 1.5 & 2.0 Flash multimodal AI models',
    endpoint: 'https://generativelanguage.googleapis.com',
    headerName: 'X-Gemini-API-Key',
    envFallbackKey: 'GEMINI_API_KEY',
    enabled: true,
    apiKey: '',
    isCustom: false,
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'onecompiler',
    name: 'OneCompiler (Code Execution)',
    type: 'execution',
    description: 'Remote code execution in 60+ programming languages',
    endpoint: 'https://api.onecompiler.com/v1/run',
    headerName: 'X-OneCompiler-API-Key',
    envFallbackKey: 'ONECOMPILER_API_KEY',
    enabled: true,
    apiKey: '',
    isCustom: false,
    docsUrl: 'https://onecompiler.com/api',
  },
];

/**
 * Load saved providers from localStorage
 */
export const getProviders = () => {
  if (typeof localStorage === 'undefined') return DEFAULT_PROVIDERS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROVIDERS;

    const saved = JSON.parse(raw);
    return DEFAULT_PROVIDERS.map((def) => {
      const found = saved.find((p) => p.id === def.id);
      if (found) {
        return {
          ...def,
          enabled: found.enabled !== undefined ? found.enabled : def.enabled,
          apiKey: found.apiKey ? decodeKey(found.apiKey) : '',
        };
      }
      return def;
    }).concat(
      (saved.filter((p) => p.isCustom) || []).map((p) => ({
        ...p,
        apiKey: p.apiKey ? decodeKey(p.apiKey) : '',
      }))
    );
  } catch (err) {
    console.error('Failed to parse saved BYOK providers:', err);
    return DEFAULT_PROVIDERS;
  }
};

/**
 * Save provider configuration to localStorage
 */
export const saveProviders = (providersList) => {
  if (typeof localStorage === 'undefined') return;

  try {
    const serialized = providersList.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      description: p.description,
      endpoint: p.endpoint,
      headerName: p.headerName,
      enabled: p.enabled,
      isCustom: p.isCustom,
      apiKey: p.apiKey ? encodeKey(p.apiKey) : '',
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (err) {
    console.error('Failed to save BYOK providers:', err);
  }
};

/**
 * Update API key for a specific provider
 */
export const setProviderKey = (providerId, apiKey) => {
  const providers = getProviders();
  const index = providers.findIndex((p) => p.id === providerId);
  if (index !== -1) {
    providers[index].apiKey = apiKey.trim();
    saveProviders(providers);
  }
  return providers;
};

/**
 * Toggle provider enabled/disabled state
 */
export const toggleProviderEnabled = (providerId, enabledState) => {
  const providers = getProviders();
  const index = providers.findIndex((p) => p.id === providerId);
  if (index !== -1) {
    providers[index].enabled = enabledState;
    saveProviders(providers);
  }
  return providers;
};

/**
 * Add custom user-defined provider
 */
export const addCustomProvider = (customProvider) => {
  const providers = getProviders();
  const newProvider = {
    id: `custom_${Date.now()}`,
    name: customProvider.name || 'Custom Provider',
    type: customProvider.type || 'ai',
    description: customProvider.description || 'User defined custom API endpoint',
    endpoint: customProvider.endpoint || '',
    headerName: customProvider.headerName || 'Authorization',
    enabled: true,
    apiKey: (customProvider.apiKey || '').trim(),
    isCustom: true,
  };
  providers.push(newProvider);
  saveProviders(providers);
  return providers;
};

/**
 * Delete custom user-defined provider
 */
export const deleteCustomProvider = (providerId) => {
  let providers = getProviders();
  providers = providers.filter((p) => p.id !== providerId || !p.isCustom);
  saveProviders(providers);
  return providers;
};

/**
 * Generate custom request headers for active enabled providers with set BYOK keys
 */
export const getByokHeaders = () => {
  const providers = getProviders();
  const headers = {};

  providers.forEach((p) => {
    if (p.enabled && p.apiKey && p.headerName) {
      headers[p.headerName] = p.apiKey;
    }
  });

  return headers;
};

/**
 * Test API Key Connection to Provider
 */
export const testProviderConnection = async (providerId) => {
  const providers = getProviders();
  const provider = providers.find((p) => p.id === providerId);

  if (!provider) {
    return { success: false, message: 'Provider not found.' };
  }

  if (!provider.apiKey) {
    return { success: false, message: 'Please enter an API key before testing connection.' };
  }

  try {
    if (provider.id === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${provider.apiKey}` },
      });
      if (res.ok) {
        return { success: true, message: 'Connection successful! Groq API key is valid.' };
      }
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        message: err.error?.message || `Groq returned HTTP ${res.status}`,
      };
    } else if (provider.id === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${provider.apiKey}` },
      });
      if (res.ok) {
        return { success: true, message: 'Connection successful! OpenRouter API key is valid.' };
      }
      return { success: false, message: `OpenRouter returned HTTP ${res.status}. Check key.` };
    } else if (provider.id === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${provider.apiKey}`
      );
      if (res.ok) {
        return { success: true, message: 'Connection successful! Gemini API key is valid.' };
      }
      return { success: false, message: `Gemini returned HTTP ${res.status}. Check API key.` };
    } else if (provider.id === 'onecompiler') {
      const isDirectKey = provider.apiKey.startsWith('oc_');
      const url = isDirectKey
        ? 'https://api.onecompiler.com/v1/run'
        : 'https://onecompiler-apis.p.rapidapi.com/api/v1/run';
      const headers = isDirectKey
        ? { 'X-API-Key': provider.apiKey, 'Content-Type': 'application/json' }
        : {
            'X-RapidAPI-Key': provider.apiKey,
            'X-RapidAPI-Host': 'onecompiler-apis.p.rapidapi.com',
            'Content-Type': 'application/json',
          };

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          language: 'python',
          files: [{ name: 'main.py', content: 'print(1)' }],
        }),
      });

      if (res.ok || res.status === 200 || res.status === 400) {
        return {
          success: true,
          message: 'Connection successful! OneCompiler API key is valid.',
        };
      }
      return { success: false, message: `OneCompiler returned HTTP ${res.status}. Check API key.` };
    } else {
      // Custom Provider generic endpoint ping
      const res = await fetch(provider.endpoint, {
        headers: { [provider.headerName || 'Authorization']: provider.apiKey },
      });
      if (res.ok || res.status < 500) {
        return {
          success: true,
          message: `Custom provider '${provider.name}' connection verified.`,
        };
      }
      return { success: false, message: `Provider returned HTTP ${res.status}` };
    }
  } catch (err) {
    return {
      success: false,
      message: `Connection failed: ${err.message || 'Network error'}`,
    };
  }
};
