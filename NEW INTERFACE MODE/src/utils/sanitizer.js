/**
 * sanitizer.js
 * DOMPurify-based HTML sanitization utility to prevent XSS attacks
 * 
 * SECURITY: All user-generated content and AI responses must be sanitized
 * before rendering with dangerouslySetInnerHTML or innerHTML
 */

import DOMPurify from 'dompurify';

/**
 * Strict sanitization config for markdown/chat content
 * Allows only safe HTML tags and attributes
 */
const STRICT_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'span', 'div',
    'strong', 'b', 'em', 'i', 'u', 's',
    'code', 'pre',
    'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'blockquote',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'class', 'id',
    'data-language' // for code blocks
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|ftp):\/\/|\/|#)/i,
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  KEEP_CONTENT: true,
  RETURN_TRUSTED_TYPE: false
};

/**
 * Ultra-strict config for user input (chat messages, comments)
 * Very limited HTML allowed
 */
const ULTRA_STRICT_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'a'],
  ALLOWED_ATTR: ['href', 'class'],
  ALLOWED_URI_REGEXP: /^https?:\/\//i,
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  KEEP_CONTENT: true
};

/**
 * Sanitizes HTML content with strict security policy
 * @param {string} dirty - Potentially dangerous HTML string
 * @param {object} config - Optional custom DOMPurify config
 * @returns {string} - Sanitized HTML safe for rendering
 */
export function sanitizeHtml(dirty, config = STRICT_CONFIG) {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  
  try {
    return DOMPurify.sanitize(dirty, config);
  } catch (error) {
    console.error('Sanitization error:', error);
    return ''; // Return empty string on error for safety
  }
}

/**
 * Sanitizes user input with ultra-strict policy
 * Use for chat messages, comments, and user-generated content
 * @param {string} dirty - User input
 * @returns {string} - Sanitized content
 */
export function sanitizeUserInput(dirty) {
  return sanitizeHtml(dirty, ULTRA_STRICT_CONFIG);
}

/**
 * Escapes HTML entities (alternative to sanitization)
 * Use when NO HTML should be allowed at all
 * @param {string} text - Plain text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitizes and creates safe __html object for dangerouslySetInnerHTML
 * @param {string} dirty - HTML content to sanitize
 * @param {object} config - Optional DOMPurify config
 * @returns {object} - { __html: sanitizedString }
 */
export function createSafeHtml(dirty, config = STRICT_CONFIG) {
  return {
    __html: sanitizeHtml(dirty, config)
  };
}

/**
 * Sanitizes markdown-rendered HTML
 * @param {string} markdownHtml - HTML from markdown renderer
 * @returns {object} - Safe HTML object for React
 */
export function sanitizeMarkdown(markdownHtml) {
  return createSafeHtml(markdownHtml, STRICT_CONFIG);
}

/**
 * Sanitizes chat message HTML
 * @param {string} messageHtml - HTML from chat message
 * @returns {object} - Safe HTML object for React
 */
export function sanitizeChatMessage(messageHtml) {
  return createSafeHtml(messageHtml, ULTRA_STRICT_CONFIG);
}

/**
 * Adds additional security hooks to DOMPurify
 * Call once during app initialization
 */
export function initializeSanitizer() {
  // Hook to enforce target="_blank" and rel="noopener noreferrer" on all links
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
      
      // Ensure only safe protocols
      const href = node.getAttribute('href');
      if (href && !href.match(/^(?:https?|mailto|ftp):\/\/|^#|^\//i)) {
        node.removeAttribute('href');
      }
    }
  });
  
  console.log('✅ DOMPurify sanitizer initialized with security hooks');
}
