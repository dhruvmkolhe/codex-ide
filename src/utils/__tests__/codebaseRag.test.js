import { codebaseRag } from '../codebaseRag';

describe('Codebase RAG Vector Search Engine', () => {
  beforeEach(() => {
    const mockFiles = [
      {
        name: 'auth.js',
        content: `
          function authenticateUser(username, password) {
            console.log("Authenticating user with Supabase JWT token");
            return { user: username, token: "jwt_token_sample" };
          }
        `,
      },
      {
        name: 'math.js',
        content: `
          function calculateSum(numbers) {
            return numbers.reduce((acc, curr) => acc + curr, 0);
          }
        `,
      },
    ];
    codebaseRag.indexFiles(mockFiles);
  });

  test('should index workspace files into chunks', () => {
    expect(codebaseRag.chunks.length).toBeGreaterThan(0);
  });

  test('should search and retrieve relevant authentication code chunks', () => {
    const results = codebaseRag.search('authenticate JWT token', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].fileName).toBe('auth.js');
  });

  test('should generate RAG context text for LLM system prompts', () => {
    const context = codebaseRag.generateRagContext('calculateSum numbers', 1);
    expect(context).toContain('math.js');
    expect(context).toContain('Codebase RAG Relevant Context');
  });
});
