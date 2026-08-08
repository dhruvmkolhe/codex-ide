# CodeX

<p align="center">
  <img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square&logo=github" alt="CI Build Status" />
  <img src="https://img.shields.io/badge/tests-123%20passed-success?style=flat-square" alt="Tests Status" />
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=nodedotjs" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/security-user%20rate%20limited-blueviolet?style=flat-square" alt="Security" />
  <img src="https://img.shields.io/badge/code%20style-prettier-ff69b4?style=flat-square&logo=prettier" alt="Code Style" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
</p>

A high-performance, web-based collaborative code editor, AI copilot, and multi-language execution platform.

---

## ✨ Features

- **Code Editor**: CodeMirror 6 integration with multi-language syntax highlighting, themes, and Vim/Emacs keymap support.
- **Multi-Language Code Execution**: Run code in 60+ programming languages via OneCompiler API, Piston fallback, or local sandbox.
- **AI Copilot & Chat**: Context-aware AI completion, refactoring, and troubleshooting powered by a multi-provider LLM chain with circuit breaker and semantic caching.
- **Real-Time Collaboration**: Multi-user room collaboration with remote cursor indicators, position deltas, and shared canvas whiteboard.
- **SQL Playground & Database Engine**: Built-in SQL statement runner with table output rendering and relational syntax assistance.
- **Enterprise Security**: User ID-keyed rate limiting, AES-256 field encryption, Helmet headers, CORS policies, and non-blocking security audit logging.

---

## 🏗️ System Architecture

### 1. Real-Time Collaborative Editor Architecture
```mermaid
graph TD
    ClientA["React Frontend (User A)"] -->|WebSocket Position & Delta| Server["Node.js Express + WS Server"]
    ClientB["React Frontend (User B)"] -->|WebSocket Position & Delta| Server
    Server -->|Broadcast Cursor & Text Delta| ClientA
    Server -->|Broadcast Cursor & Text Delta| ClientB
    Server -->|Cache Active Room State| Redis["Redis Pub/Sub & Local LRU"]
    Server -->|Encrypted Session Persistence| Supabase[("Supabase DB (PostgreSQL)")]
```

### 2. AI Copilot, Circuit Breaker & Semantic Cache Architecture
```mermaid
graph TD
    User["User AI Chat / Prompt Request"] --> AuthLimiter["Authentication & User Rate Limiter"]
    AuthLimiter -->|Pass| Cache{"Semantic Prompt Cache Engine"}
    Cache -->|Hit| FastResponse["Instant Cached AI Response"]
    Cache -->|Miss| Breaker{"LLM Circuit Breaker"}
    Breaker -->|Primary Provider| Groq["Groq API (Llama 3.3 70B)"]
    Breaker -->|Fallback Provider 1| OpenRouter["OpenRouter API"]
    Breaker -->|Fallback Provider 2| Gemini["Google Gemini API"]
    Groq --> SaveCache["Store Response in Semantic Cache & Return"]
```

### 3. Code Execution Engine & SQL Playground Architecture
```mermaid
graph TD
    ExecReq["Code / SQL Execution Request"] --> SecurityFilter["Payload & Pattern Validation Middleware"]
    SecurityFilter -->|Pass| CompilerKey{"Compiler Provider Selector"}
    CompilerKey -->|Primary Remote| OneCompiler["OneCompiler API Engine"]
    CompilerKey -->|Fallback Remote| Piston["Free Piston Execution Engine"]
    CompilerKey -->|Fallback Local| Sandbox["In-Memory Local Code & SQL Sandbox"]
    OneCompiler --> OutFormat["Sanitize Output Logs & Execution Metrics"]
    Piston --> OutFormat
    Sandbox --> OutFormat
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, CodeMirror 6, Framer Motion, Tldraw, Vanilla CSS
- **Backend**: Node.js, Express, WebSockets (`ws`), `rate-limiter-flexible`, Redis
- **Database & Auth**: Supabase (PostgreSQL) with AES-256 Encryption
- **Containerization**: Docker, Nginx, Docker Compose

---

## 🚀 Quickstart

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dhruvmkolhe/codeX.git
   cd codeX
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   PORT=5001
   GROQ_API_KEY=your_groq_api_key
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5001`

---

## 🧪 Running Tests

Run the complete test suite across frontend, backend, and infrastructure:
```bash
npm run test:all
```

Or run individual test suites:
- Frontend: `npm test`
- Backend: `npm run test:backend`
- Infrastructure: `npm run test:infrastructure`

---

## 🐳 Docker Deployment

To run using Docker Compose:
```bash
docker compose up --build
```
Access the application at `http://localhost:8080`.

---

## 📄 License & Policies

- **License**: [MIT](LICENSE)
- **Security Policy**: [SECURITY.md](SECURITY.md)
- **Version History**: [CHANGELOG.md](CHANGELOG.md)
- **Product Roadmap**: [ROADMAP.md](ROADMAP.md)
