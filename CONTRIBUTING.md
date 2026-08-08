# Contributing to CodeX

Thank you for your interest in contributing to **CodeX — Open-Source AI-Powered Collaborative Cloud IDE**! 🚀

We welcome contributions of all kinds: bug fixes, new language runtimes, UI enhancements, documentation, and performance optimizations.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **Git**

### 1. Fork & Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/codeX.git
cd codeX
```

### 2. Install Dependencies
```bash
npm install
cd server && npm install && cd ..
```

### 3. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Start Development Servers
```bash
npm start
```
- **React Frontend**: Runs on `http://localhost:3000`
- **Proxy Server**: Runs on `http://localhost:5001`

---

## 🧪 Running Unit Tests

Execute the automated test suite before opening a Pull Request:
```bash
# Run frontend & utility tests
npm test -- --watchAll=false

# Run server system tests
node --test server/__tests__/server.test.js

# Run proxy syntax check
node --check server/index.js
```

---

## 🌿 Branching & Pull Request Guidelines

1. **Branch Naming**: Use descriptive branch names:
   - `feature/add-rust-wasm`
   - `fix/ghost-text-indentation`
   - `docs/update-readme`
2. **Commit Messages**: Follow standard conventional commit format:
   - `feat(ai): add vector RAG embeddings search`
   - `fix(editor): resolve cursor offset calculation`
3. **Pull Request Checklist**:
   - Ensure all tests pass (`npm test`).
   - Run linter/formatting checks.
   - Include a clear summary of your changes.

---

## 📄 License
By contributing to CodeX, you agree that your contributions will be licensed under the **MIT License**.
