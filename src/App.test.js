import { render, screen } from '@testing-library/react';
import App from './App';

// Override environment variables to force offline-bypass mode in unit tests
process.env.REACT_APP_SUPABASE_URL = '';

// ── JSDOM polyfills ─────────────────────────────────────────────────────────────
// JSDOM does not implement IntersectionObserver. Provide a no-op stub so
// Landing page components (Home, Blog, Docs, Community) don't crash.
// Also add scrollIntoView which is missing in JSDOM but used by GlobalChat.
beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.HTMLElement.prototype.scrollIntoView = function () {};
});

// ── Core mocks ──────────────────────────────────────────────────────────────────
// Mock Supabase client to prevent network calls
jest.mock('./supabaseClient', () => ({
  __esModule: true,
  supabase: {
    auth: {
      getSession: () => new Promise(() => {}), // Never resolves – keeps component in "logged-out" state
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: {} }, error: null }),
      signUp: () => Promise.resolve({ data: { user: {} }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    }),
    // GlobalChat.js calls supabase.channel() for real-time chat
    channel: () => ({
      on: function () {
        return this;
      },
      subscribe: function () {
        return this;
      },
      unsubscribe: jest.fn(),
    }),
  },
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: {} })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
}));

// ── Heavy-dependency component mocks ────────────────────────────────────────────
// Mock IdeEditor at the module level. This single mock prevents the entire
// tldraw, CodeMirror, framer-motion, and html-to-image dependency chain from
// being loaded by Jest, which cannot parse their ESM-only dist files.
jest.mock('./IdeEditor', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function MockIdeEditor() {
      return React.createElement('div', { 'data-testid': 'ide-editor-mock' }, 'IDE Editor Mock');
    },
  };
});

// ── Tests ───────────────────────────────────────────────────────────────────────
test('renders landing page with hero section', async () => {
  render(<App />);

  // The landing page lazy-loads Home, so wait for its content
  const headings = await screen.findAllByText(/Code in 60\+ Languages/i, {}, { timeout: 5000 });
  expect(headings[0]).toBeInTheDocument();

  const startButtons = screen.getAllByText(/Start Coding Now/i);
  expect(startButtons[0]).toBeInTheDocument();
});
