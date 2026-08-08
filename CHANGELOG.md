# Changelog

All notable changes to the **CodeX** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v1.0.0.html).

---

## [0.1.0] - 2026-08-07

### Added
- **User-Based Distributed Rate Limiting**:
  - Implemented user ID-keyed rate limiting (`user:<userId>`) using `rate-limiter-flexible` (with Redis store and in-memory fallback) and `express-rate-limit`.
  - Added user tier costing logic (Registered users standard cost, Guest users 2x, Unauthenticated IP 3x).
  - Enforced middleware ordering to populate authentication context before rate limit evaluation across Express backend and API proxy.
  - Standardized rate limit response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`) and HTTP 429 payload.
- **AI Chat & Copilot Integration**:
  - Multi-provider LLM fallback chain supporting Groq, OpenRouter, and Google Gemini API.
  - LLM Circuit Breaker module to handle upstream 429 rate limit errors gracefully.
  - In-memory & Redis semantic prompt cache engine to serve repetitive queries instantly.
- **Code Execution Sandbox Engine**:
  - Remote code execution in 60+ programming languages via OneCompiler and Piston execution APIs with local sandbox fallback.
  - Code validation middleware to guard against memory exhaustion, path traversal, infinite loops, and system calls.
- **Real-Time Collaboration**:
  - WebSocket collaboration protocol supporting room creation, state broadcast, and real-time remote cursor indicators.
- **Security & Privacy**:
  - Field-level AES-256 encryption for project content and chat session payloads.
  - Helmet security headers and strict CORS origin controls.
  - Security audit logging with non-blocking batch processing.

### Changed
- Refactored server telemetry and Prometheus metrics endpoints.
- Updated npm script runner to orchestrate frontend and backend environments concurrently.

### Fixed
- Fixed rate limiter key collision issue where authenticated users shared IP-based limit pools behind proxy networks.
- Resolved latency simulator bypass ensuring rate limiting applies across all environments.

---

## [0.0.2] - 2026-06-15

### Added
- CodeMirror 6 text editor integration with multi-language syntax highlighting, themes, and Vim/Emacs keymaps.
- Basic Supabase authentication integration for user login, signup, and project storage.

---

## [0.0.1] - 2026-04-01

### Added
- Initial project scaffold with React 18 frontend and Node.js Express backend proxy.
