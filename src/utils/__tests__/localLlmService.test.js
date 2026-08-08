import { checkLocalLlmHealth, queryLocalLlm } from '../localLlmService';

beforeAll(() => {
  if (!AbortSignal.timeout) {
    AbortSignal.timeout = () => new AbortController().signal;
  }
});

describe('localLlmService utility', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('checkLocalLlmHealth should return models list when Ollama endpoint responds', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ models: [{ name: 'codellama:latest' }, { name: 'llama3:latest' }] }),
    });

    const result = await checkLocalLlmHealth('ollama', 'http://localhost:11434');
    expect(result.available).toBe(true);
    expect(result.models).toEqual(['codellama:latest', 'llama3:latest']);
  });

  test('checkLocalLlmHealth should return offline state on error', async () => {
    global.fetch.mockRejectedValue(new Error('Connection refused'));

    const result = await checkLocalLlmHealth('ollama', 'http://localhost:11434');
    expect(result.available).toBe(false);
    expect(result.models).toEqual([]);
  });

  test('queryLocalLlm should post generation payload to Ollama endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'const a = 1;' }),
    });

    const output = await queryLocalLlm({
      providerId: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'codellama',
      prompt: 'Write JS code',
      taskPresetId: 'general',
    });

    expect(output).toBe('const a = 1;');
  });
});
