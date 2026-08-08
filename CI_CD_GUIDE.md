# CodeX CI/CD Pipelines Guide

This repository includes a production-ready Continuous Integration and Continuous Deployment (CI/CD) suite powered by **GitHub Actions**.

---

## 🚀 Workflow Summary

### 1. Continuous Integration (`.github/workflows/ci.yml`)
* **Triggers**: Pull requests and commits to `main`, `master`, or `develop`.
* **Jobs**:
  * `Code Formatting & Quality`: Validates Prettier formatting across the codebase (`npm run format:check`).
  * `Security & Secret Scan`: Runs `Gitleaks` (configured with `gitleaks.toml`) to prevent sensitive API keys or credentials from entering git history, followed by an `npm audit` dependency check.
  * `Run Unit Tests`: Executes non-interactive React unit tests (`npm test -- --watchAll=false`).
  * `Build Verification`: Compiles the production application bundle (`npm run build`).

---

### 2. Docker Container CD (`.github/workflows/docker-cd.yml`)
* **Triggers**: Pushes to `main`/`master`, release tags (e.g. `v1.0.0`), or manual trigger (`workflow_dispatch`).
* **Outputs**: Automated container build from root `Dockerfile` pushed to **GitHub Container Registry (`ghcr.io`)**.
* **Tags Generated**:
  * `latest` (for primary branch updates)
  * `<branch-name>`
  * `<semantic-version>` (for git tags)
  * `sha-<short-sha>`

---

### 3. Vercel Frontend Deployment (`.github/workflows/vercel-deploy.yml`)
* **Triggers**: Pull requests (Preview deployments) and commits to `main`/`master` (Production deployment).
* **Behavior**: Uses the Vercel CLI and your repository's `vercel.json` configuration. Automatically skips safely with a warning if `VERCEL_TOKEN` is not configured in repository secrets.

---

## 🔑 Required Repository Secrets & Setup

To enable Vercel automated deployments, navigate to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** and add:

| Secret Name | Description | Where to find |
| :--- | :--- | :--- |
| `VERCEL_TOKEN` | Vercel Personal Access Token | [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel Organization / User ID | Vercel Project Settings -> General |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Vercel Project Settings -> General |

*Note: Container registry builds utilize the automatic `${{ secrets.GITHUB_TOKEN }}` provided by GitHub Actions.*

---

## 🧪 Testing Workflows Locally

You can test these workflows locally before pushing using [act](https://github.com/nektos/act):

```bash
# Run CI pipeline locally
act pull_request

# Run dry-run build check
npm run format:check
npm test -- --watchAll=false
npm run build
```
