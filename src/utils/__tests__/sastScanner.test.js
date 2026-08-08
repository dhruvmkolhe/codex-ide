/* eslint-disable import/first */
jest.mock(
  '@codemirror/lint',
  () => ({
    linter: (fn) => fn,
  }),
  { virtual: true }
);

import { scanCodeForSecrets } from '../sastScanner';

describe('SAST Secret Scanner', () => {
  test('should detect AWS Access Key ID', () => {
    const code = 'const awsKey = "AKIAIOSFODNN7EXAMPLE";';
    const diagnostics = scanCodeForSecrets(code);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].message).toContain('AWS Access Key ID');
  });

  test('should detect OpenAI API Key', () => {
    const code = 'const key = "sk-proj-1234567890abcdef1234567890abcdef";';
    const diagnostics = scanCodeForSecrets(code);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].message).toContain('OpenAI API Key');
  });

  test('should detect Groq API Key', () => {
    const code = 'const groqKey = "gsk_1234567890abcdef1234567890abcdef1234567890abcdef";';
    const diagnostics = scanCodeForSecrets(code);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].message).toContain('Groq API Key');
  });

  test('should return empty array for safe clean code', () => {
    const code = 'function add(a, b) { return a + b; }';
    const diagnostics = scanCodeForSecrets(code);
    expect(diagnostics).toEqual([]);
  });
});
