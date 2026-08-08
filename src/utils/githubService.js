/**
 * CodeX GitHub & Git Cloud Ecosystem Integration Service
 *
 * Provides GitHub API integration for repo cloning, fetching user repositories,
 * creating commits, and opening Pull Requests directly from the CodeX IDE.
 */

import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Fetch public & private repositories for an authenticated user
 */
export async function getUserRepositories(token) {
  if (!token) throw new Error('GitHub Personal Access Token or OAuth token required.');
  const response = await axios.get(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=30`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  return response.data;
}

/**
 * Fetch file contents of a GitHub repository directory
 */
export async function fetchRepoContents(owner, repo, path = '', token = '') {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `token ${token}`;

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
  const response = await axios.get(url, { headers });
  return response.data;
}

/**
 * Create a new Pull Request on GitHub
 */
export async function createPullRequest(owner, repo, title, head, base = 'main', body = '', token) {
  if (!token) throw new Error('GitHub access token required to create a Pull Request.');

  const response = await axios.post(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`,
    { title, head, base, body },
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  return response.data;
}

/**
 * Format repository files into CodeX workspace file structure
 */
export function formatGitHubFilesToWorkspace(repoData, filesList) {
  return filesList.map((f) => ({
    name: f.name || f.path,
    content: f.content || '',
    language: f.name.endsWith('.js') ? 'javascript' : f.name.endsWith('.py') ? 'python' : 'text',
  }));
}
