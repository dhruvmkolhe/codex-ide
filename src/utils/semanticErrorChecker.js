/**
 * CodeX Multi-Language Semantic Error & Syntax Validation Engine
 *
 * Provides static semantic error checking, delimiter balancing, indentation validation,
 * and language-specific syntax rule checks across 88+ supported programming languages.
 */

import { DEFAULT_MULTI_FILES } from '../languagesData';

/**
 * Validate brace/bracket/parentheses balance across source text
 */
export function checkDelimiterBalance(codeText) {
  const stack = [];
  const openToClose = { '(': ')', '[': ']', '{': '}' };
  const closeToOpen = { ')': '(', ']': '[', '}': '{' };
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < codeText.length; i++) {
    const char = codeText[i];
    const prevChar = i > 0 ? codeText[i - 1] : '';

    // Handle string literal quotes
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }

    if (inString) continue;

    if (openToClose[char]) {
      stack.push({ char, position: i });
    } else if (closeToOpen[char]) {
      if (stack.length === 0 || stack[stack.length - 1].char !== closeToOpen[char]) {
        return {
          valid: false,
          error: `Unmatched closing '${char}' at position ${i}`,
          position: i,
        };
      }
      stack.pop();
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    return {
      valid: false,
      error: `Unclosed opening '${unclosed.char}' at position ${unclosed.position}`,
      position: unclosed.position,
    };
  }

  return { valid: true };
}

/**
 * Perform language-specific semantic syntax checks
 */
export function analyzeSemanticErrors(langId, codeText) {
  if (!codeText || typeof codeText !== 'string') {
    return { valid: true, errors: [] };
  }

  const errors = [];

  // 1. Universal Delimiter Balance Check
  const balance = checkDelimiterBalance(codeText);
  if (!balance.valid) {
    errors.push({
      type: 'SYNTAX_DELIMITER_ERROR',
      message: balance.error,
      position: balance.position,
    });
  }

  const lang = (langId || 'javascript').toLowerCase();

  // 2. Python-specific semantic indentation check
  if (lang.includes('python')) {
    const lines = codeText.split('\n');
    lines.forEach((line, idx) => {
      if (line.trim().endsWith(':') && idx + 1 < lines.length) {
        const nextLine = lines[idx + 1];
        if (nextLine.trim() && !/^\s+/.test(nextLine)) {
          errors.push({
            type: 'PYTHON_INDENTATION_ERROR',
            message: `Line ${idx + 2}: Expected an indented block after ':' on line ${idx + 1}`,
            line: idx + 2,
          });
        }
      }
    });
  }

  // 3. Strict Semicolon Languages (C, C++, Java, C#, PHP, Rust)
  if (['c', 'cpp', 'java', 'csharp', 'php', 'rust'].includes(lang)) {
    const lines = codeText.split('\n');
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (
        trimmed.length > 0 &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*') &&
        !trimmed.endsWith('*/') &&
        !trimmed.startsWith('using') &&
        !trimmed.startsWith('import')
      ) {
        if (trimmed.includes('=') || trimmed.includes('return') || trimmed.includes('System.out')) {
          errors.push({
            type: 'MISSING_SEMICOLON_WARNING',
            message: `Line ${idx + 1}: Possible missing semicolon at end of statement`,
            line: idx + 1,
          });
        }
      }
    });
  }

  // 4. HTML Tag Matching Check
  if (lang === 'html') {
    const tagRegex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
    const tagStack = [];
    const selfClosing = new Set([
      'area',
      'base',
      'br',
      'col',
      'embed',
      'hr',
      'img',
      'input',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr',
    ]);
    let match;

    while ((match = tagRegex.exec(codeText)) !== null) {
      const fullTag = match[0];
      const tagName = match[1].toLowerCase();

      if (selfClosing.has(tagName) || fullTag.endsWith('/>')) continue;

      if (fullTag.startsWith('</')) {
        if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName) {
          errors.push({
            type: 'HTML_UNMATCHED_TAG',
            message: `Unmatched HTML closing tag </${tagName}>`,
            position: match.index,
          });
        } else {
          tagStack.pop();
        }
      } else {
        tagStack.push(tagName);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate default template code snippets for all supported languages
 */
export function validateAllLanguageTemplates() {
  const results = {};

  for (const [langId, files] of Object.entries(DEFAULT_MULTI_FILES)) {
    if (Array.isArray(files)) {
      files.forEach((file) => {
        const analysis = analyzeSemanticErrors(langId, file.content);
        results[`${langId}:${file.name}`] = {
          valid: analysis.valid,
          errorCount: analysis.errors.length,
          errors: analysis.errors,
        };
      });
    }
  }

  return results;
}
