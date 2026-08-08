import {
  sanitizeHtml,
  sanitizeUserInput,
  escapeHtml,
  createSafeHtml,
  initializeSanitizer,
} from '../sanitizer';

describe('sanitizer utility', () => {
  test('sanitizeHtml should strip dangerous script tags', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<p>Hello</p>');
  });

  test('sanitizeUserInput should enforce ultra-strict tag policy', () => {
    const dirty = '<p>Safe</p><div onclick="alert(1)">Div Content</div>';
    const clean = sanitizeUserInput(dirty);
    expect(clean).not.toContain('onclick');
    expect(clean).toContain('<p>Safe</p>');
  });

  test('escapeHtml should convert HTML characters into entities', () => {
    const raw = '<script>alert(1)</script>';
    const escaped = escapeHtml(raw);
    expect(escaped).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  test('createSafeHtml should return object formatted for React dangerouslySetInnerHTML', () => {
    const safeObj = createSafeHtml('<b>Bold</b>');
    expect(safeObj).toEqual({ __html: '<b>Bold</b>' });
  });

  test('initializeSanitizer should initialize DOMPurify hooks without error', () => {
    expect(() => initializeSanitizer()).not.toThrow();
  });
});
