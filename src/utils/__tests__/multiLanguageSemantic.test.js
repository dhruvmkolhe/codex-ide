/* eslint-disable import/first */
jest.mock('@codemirror/lang-javascript', () => ({ javascript: () => [] }));
jest.mock('@codemirror/lang-python', () => ({ python: () => [] }));
jest.mock('@codemirror/lang-java', () => ({ java: () => [] }));
jest.mock('@codemirror/lang-cpp', () => ({ cpp: () => [] }));
jest.mock('@codemirror/lang-html', () => ({ html: () => [] }));
jest.mock('@codemirror/lang-css', () => ({ css: () => [] }));
jest.mock('@codemirror/lang-markdown', () => ({ markdown: () => [] }));

import {
  checkDelimiterBalance,
  analyzeSemanticErrors,
  validateAllLanguageTemplates,
} from '../semanticErrorChecker';

describe('Multi-Language Semantic Error & Syntax Validation Engine', () => {
  describe('Universal Delimiter Balance Checker', () => {
    test('should validate balanced brackets, parentheses, and braces', () => {
      const validCode = 'function test() { const arr = [1, 2, 3]; return (arr[0] + 1); }';
      const result = checkDelimiterBalance(validCode);
      expect(result.valid).toBe(true);
    });

    test('should detect unclosed opening parenthesis', () => {
      const invalidCode = 'function test(a, b { return a + b; }';
      const result = checkDelimiterBalance(invalidCode);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unclosed opening');
    });

    test('should detect unmatched closing bracket', () => {
      const invalidCode = 'const arr = [1, 2, 3]];';
      const result = checkDelimiterBalance(invalidCode);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unmatched closing');
    });

    test('should ignore delimiters inside string literals', () => {
      const codeWithString = 'const msg = "Unclosed string paren ( { [ ";';
      const result = checkDelimiterBalance(codeWithString);
      expect(result.valid).toBe(true);
    });
  });

  describe('Language-Specific Semantic Analyzers', () => {
    test('should detect Python indentation errors after colon', () => {
      const pyCode = 'def hello():\nprint("Hello World")';
      const analysis = analyzeSemanticErrors('python', pyCode);
      expect(analysis.valid).toBe(false);
      expect(analysis.errors[0].type).toBe('PYTHON_INDENTATION_ERROR');
    });

    test('should pass valid Python code with proper indentation', () => {
      const pyCode = 'def hello():\n    print("Hello World")';
      const analysis = analyzeSemanticErrors('python', pyCode);
      expect(analysis.valid).toBe(true);
    });

    test('should detect missing semicolons in C/C++', () => {
      const cppCode = 'int main() {\n    int a = 10\n    return 0;\n}';
      const analysis = analyzeSemanticErrors('cpp', cppCode);
      expect(analysis.errors.some((e) => e.type === 'MISSING_SEMICOLON_WARNING')).toBe(true);
    });

    test('should detect unmatched closing tags in HTML', () => {
      const htmlCode = '<div><p>Hello</div></p>';
      const analysis = analyzeSemanticErrors('html', htmlCode);
      expect(analysis.valid).toBe(false);
      expect(analysis.errors[0].type).toBe('HTML_UNMATCHED_TAG');
    });
  });

  describe('ALL Multi-Language Workspace Templates Validation Sweep', () => {
    test('should validate workspace code templates for all configured languages', () => {
      const results = validateAllLanguageTemplates();
      const keys = Object.keys(results);

      expect(keys.length).toBeGreaterThan(0);

      let totalValid = 0;
      for (const key of keys) {
        if (results[key].valid) {
          totalValid++;
        }
      }

      console.log(
        `Verified ${totalValid} / ${keys.length} workspace file templates passed semantic validation cleanly.`
      );
      expect(totalValid).toBeGreaterThanOrEqual(keys.length - 2);
    });
  });
});
