# CodeX Product Roadmap

This document outlines the planned feature additions, architectural improvements, and strategic direction for **CodeX**.

---

## 🎯 Strategic Vision

CodeX aims to be the premier high-performance, web-based collaborative IDE and code execution platform. Our focus is on seamless real-time teamwork, intelligent AI assist capabilities, enterprise-grade security, and lightning-fast code execution.

---

## 📍 Near-Term (Q3 2026)

### ⚡ Core & Performance Improvements
- [ ] **WASM In-Browser Execution**: Expand local client-side WebAssembly execution for Pyodide (Python), QuickJS (JavaScript), and SQLite to reduce backend server load.
- [ ] **Fine-Grained User Quota Management**: Introduce configurable rate limit quotas per subscription tier (Free, Pro, Enterprise).
- [ ] **Granular Workspace Permissions**: Role-based access control (RBAC) for shared workspaces (Owner, Editor, Viewer).

### 🤖 AI Capabilities
- [ ] **Inline Code Completion**: Low-latency ghost-text code completion directly within the CodeMirror editor.
- [ ] **Multi-File Context AI Search**: RAG-based context embedding to allow AI chat to answer questions about entire codebases.

---

## 🚀 Medium-Term (Q4 2026)

### 👥 Collaboration & Teamwork
- [ ] **Voice & Video Chat**: Integrated WebRTC peer-to-peer audio/video calling within active workspace sessions.
- [ ] **Shared Terminal Sessions**: Interactive multi-user terminal streaming over WebSockets.
- [ ] **Version History & Diff Viewer**: Visual timeline of document edits with one-click revision rollback.

### 🛡️ Security & Enterprise Integration
- [ ] **SSO / SAML 2.0 Integration**: Enterprise single sign-on support (Okta, Azure AD, Auth0).
- [ ] **Custom Extension/Plugin SDK**: Plugin API allowing developers to create custom themes, linter extensions, and panel widgets.
- [ ] **SOC2 Audit Compliance Logging**: Exportable compliance audit logs and SIEM integration.

---

## 🌟 Long-Term (2027+)

### 🌐 Platform Expansion
- [ ] **Desktop Application**: Cross-platform desktop release built with Electron/Tauri.
- [ ] **Mobile & Tablet Optimized Interface**: Touch-friendly interface with virtual keyboard shortcuts for iPad and Android tablets.
- [ ] **Cloud Sandbox Clusters**: Self-scaling Kubernetes execution cluster for heavy multi-container dev environments.

---

## 💬 Community & Feedback

Have ideas or feature requests?
- Open a feature proposal in [GitHub Issues](https://github.com/dhruvmkolhe/codeX/issues).
- Check our [CONTRIBUTING.md](CONTRIBUTING.md) guide to join the development efforts.
