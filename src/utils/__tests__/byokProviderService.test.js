import {
  getProviders,
  setProviderKey,
  toggleProviderEnabled,
  addCustomProvider,
  deleteCustomProvider,
  getByokHeaders,
  testProviderConnection,
} from '../byokProviderService';

describe('Bring Your Own Key (BYOK) Provider Service Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should return default out-of-the-box providers on initial load', () => {
    const providers = getProviders();
    expect(providers.length).toBeGreaterThanOrEqual(4);
    const ids = providers.map((p) => p.id);
    expect(ids).toContain('groq');
    expect(ids).toContain('openrouter');
    expect(ids).toContain('gemini');
    expect(ids).toContain('onecompiler');
  });

  test('should set and persist API keys securely', () => {
    setProviderKey('groq', 'gsk_test_key_12345');
    const providers = getProviders();
    const groq = providers.find((p) => p.id === 'groq');
    expect(groq.apiKey).toBe('gsk_test_key_12345');
  });

  test('should toggle provider enabled state', () => {
    toggleProviderEnabled('groq', false);
    let providers = getProviders();
    let groq = providers.find((p) => p.id === 'groq');
    expect(groq.enabled).toBe(false);

    toggleProviderEnabled('groq', true);
    providers = getProviders();
    groq = providers.find((p) => p.id === 'groq');
    expect(groq.enabled).toBe(true);
  });

  test('should generate BYOK request headers for enabled providers with set keys', () => {
    toggleProviderEnabled('groq', true);
    setProviderKey('groq', 'gsk_key');
    setProviderKey('onecompiler', 'oc_key');

    const headers = getByokHeaders();
    expect(headers['X-Groq-API-Key']).toBe('gsk_key');
    expect(headers['X-OneCompiler-API-Key']).toBe('oc_key');
  });

  test('should add and delete custom providers', () => {
    let providers = addCustomProvider({
      name: 'Custom AI Proxy',
      type: 'ai',
      endpoint: 'https://proxy.example.com/v1',
      headerName: 'X-Custom-Key',
      apiKey: 'custom_secret_123',
    });

    const custom = providers.find((p) => p.isCustom);
    expect(custom).toBeDefined();
    expect(custom.name).toBe('Custom AI Proxy');
    expect(custom.endpoint).toBe('https://proxy.example.com/v1');

    providers = deleteCustomProvider(custom.id);
    expect(providers.find((p) => p.id === custom.id)).toBeUndefined();
  });

  test('should reject connection test when API key is missing', async () => {
    const res = await testProviderConnection('groq');
    expect(res.success).toBe(false);
    expect(res.message).toBeDefined();
  });
});
