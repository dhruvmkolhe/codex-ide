import React from 'react';
import { DEVICON_BASE, DEVICON_MAP } from './ideConstants';
import { getLangColor, languageConfig } from '../languagesData';

/**
 * Returns a human-readable label for a language version.
 */
export const getLanguageFooterLabel = (lang) => {
  const versions = {
    python: 'Python 3.10',
    python2: 'Python 2.7',
    javascript: 'JavaScript (ES6)',
    nodejs: 'NodeJS 18',
    typescript: 'TypeScript 5.0',
    java: 'Java 17',
    cpp: 'C++ 17',
    c: 'C11',
    go: 'Go 1.20',
    rust: 'Rust 1.70',
    php: 'PHP 8.2',
    ruby: 'Ruby 3.2',
    swift: 'Swift 5.8',
    kotlin: 'Kotlin 1.9',
  };
  return versions[lang] || (languageConfig[lang] ? languageConfig[lang].label : lang);
};

/**
 * Internal component for rendering language icons with a stateful fallback.
 */
const LanguageIcon = ({ langId, size }) => {
  const [error, setError] = React.useState(false);
  const normalized = langId.toLowerCase();
  const iconPath = DEVICON_MAP[normalized];
  const color = getLangColor(langId);

  const fallback = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color }}
    >
      <rect width="24" height="24" rx="4" fill="currentColor" opacity="0.15" />
      <path
        d="M8 8L4 12L8 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 8L20 12L16 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 18L14 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  if (error || !iconPath) {
    return fallback;
  }

  return (
    <img
      src={`${DEVICON_BASE}/${iconPath}`}
      alt={langId}
      width={size}
      height={size}
      style={{ display: 'block', objectFit: 'contain', borderRadius: '2px' }}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
};

/**
 * Returns a high-fidelity brand icon via Devicon CDN.
 * Now uses a React-native stateful logic for fail-safe rendering.
 */
export const getLanguageIcon = (langId, size = 16) => {
  return <LanguageIcon langId={langId} size={size} />;
};
