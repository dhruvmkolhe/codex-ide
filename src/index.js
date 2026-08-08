import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import reportWebVitals from './reportWebVitals';
import { purgeExpiredItems } from './utils/storage';
import { initializeSanitizer } from './utils/sanitizer';

// Initialize DOMPurify with security hooks
initializeSanitizer();

// Evict stale localStorage entries (code snippets, etc.) older than 7 days
purgeExpiredItems();

// Suppress benign ResizeObserver loop error notifications
window.addEventListener('error', (e) => {
  if (
    e.message &&
    (e.message.includes('ResizeObserver loop') ||
      e.message.includes('ResizeObserver loop completed with undelivered notifications'))
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (
    e.reason &&
    e.reason.message &&
    (e.reason.message.includes('ResizeObserver loop') ||
      e.reason.message.includes('ResizeObserver loop completed with undelivered notifications'))
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
