/**
 * CodeX Real-Time SAST Secret & Security Vulnerability Scanner
 *
 * Performs high-speed client-side regex & heuristic AST security scanning
 * to detect hardcoded API keys, secrets, private SSH keys, and dangerous credentials.
 */

import { linter } from '@codemirror/lint';

export const SECRET_PATTERNS = [
  {
    name: 'AWS Access Key ID',
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    severity: 'error',
    message:
      'Exposed AWS Access Key ID detected! Move credentials to environment variables (.env).',
  },
  {
    name: 'AWS Secret Access Key',
    regex:
      /(?:aws_secret_access_key|aws_secret|secret_key)\s*[:=]\s*["']?([a-zA-Z0-9/+=]{40})["']?/gi,
    severity: 'error',
    message: 'Potential AWS Secret Access Key detected! Never commit cloud credentials to code.',
  },
  {
    name: 'OpenAI API Key',
    regex: /\b(sk-[a-zA-Z0-9_-]{20,})\b/g,
    severity: 'error',
    message: 'Exposed OpenAI API Key detected! Store key securely in server environment variables.',
  },
  {
    name: 'Groq API Key',
    regex: /\b(gsk_[a-zA-Z0-9]{48,})\b/g,
    severity: 'error',
    message: 'Exposed Groq API Key detected! Move credentials out of frontend source files.',
  },
  {
    name: 'GitHub Token',
    regex: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})\b/g,
    severity: 'error',
    message: 'Exposed GitHub Personal Access Token detected!',
  },
  {
    name: 'Private Key',
    regex: /-----BEGIN\s+(?:RSA|OPENSSH|DSA|EC|PGP)\s+PRIVATE\s+KEY-----/g,
    severity: 'error',
    message: 'Private RSA/SSH Key embedded directly in source code!',
  },
  {
    name: 'Database Connection String',
    regex:
      /\b(?:mongodb(?:\+srv)?|postgres|postgresql|mysql):\/\/[a-zA-Z0-9_]+:[^@\s]+@[a-zA-Z0-9.-]+\b/g,
    severity: 'warning',
    message: 'Database URI with plaintext password credentials detected!',
  },
  {
    name: 'Hardcoded Bearer Token',
    regex: /\bBearer\s+([a-zA-Z0-9._-]{30,})\b/gi,
    severity: 'warning',
    message: 'Hardcoded Authorization Bearer Token detected.',
  },
];

/**
 * Scans code text for secret vulnerabilities and returns diagnostic objects
 */
export function scanCodeForSecrets(codeText) {
  if (!codeText || typeof codeText !== 'string') return [];

  const diagnostics = [];

  for (const rule of SECRET_PATTERNS) {
    rule.regex.lastIndex = 0; // Reset regex state
    let match;
    while ((match = rule.regex.exec(codeText)) !== null) {
      const from = match.index;
      const to = from + match[0].length;

      diagnostics.push({
        from,
        to,
        severity: rule.severity,
        message: `🛡️ Security Alert: ${rule.name} - ${rule.message}`,
        source: 'CodeX SAST Scanner',
      });
    }
  }

  return diagnostics;
}

/**
 * CodeMirror 6 Linter Extension for real-time security scanning
 */
export const sastLinterExtension = linter(
  (view) => {
    const text = view.state.doc.toString();
    return scanCodeForSecrets(text);
  },
  {
    delay: 300, // 300ms debounce during typing
  }
);
