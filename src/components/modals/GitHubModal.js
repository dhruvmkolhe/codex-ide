import React, { useState } from 'react';
import { getUserRepositories, fetchRepoContents } from '../../utils/githubService';

export function GitHubModal({ isOpen, onClose, onImportFiles, showToast }) {
  const [token, setToken] = useState('');
  const [userRepos, setUserRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleFetchUserRepos = async () => {
    if (!token.trim()) {
      setErrorMessage('Please enter a GitHub Personal Access Token.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const repos = await getUserRepositories(token.trim());
      setUserRepos(repos);
      if (showToast) showToast(`Loaded ${repos.length} GitHub repositories.`, 'success');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to fetch repositories.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportRepo = async (owner, repoName) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const contents = await fetchRepoContents(owner, repoName, '', token.trim());
      const files = Array.isArray(contents)
        ? contents
            .filter((item) => item.type === 'file')
            .slice(0, 10)
            .map((f) => ({
              name: f.name,
              content: `// Imported from GitHub: ${owner}/${repoName}/${f.name}\n`,
              language: f.name.endsWith('.js')
                ? 'javascript'
                : f.name.endsWith('.py')
                  ? 'python'
                  : 'text',
            }))
        : [];

      if (files.length > 0 && onImportFiles) {
        onImportFiles(files);
        if (showToast)
          showToast(`Imported ${files.length} files from ${owner}/${repoName}!`, 'success');
        onClose();
      } else {
        setErrorMessage('No valid root files found in repository.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to import repository contents.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="db-playground-overlay" onClick={onClose}>
      <div className="db-playground-card max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="db-playground-header">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">code_blocks</span>
            <h3>GitHub Repository Import & Cloud Sync</h3>
          </div>
          <button className="db-playground-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="db-playground-body p-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-outline uppercase block mb-1">
              GitHub Personal Access Token (PAT):
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                className="flex-1 bg-surface-container-highest border border-outline-variant rounded px-3 py-1.5 text-sm text-on-surface"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <button
                type="button"
                className="bg-primary text-on-primary px-3 py-1.5 rounded text-sm font-medium hover:brightness-110"
                onClick={handleFetchUserRepos}
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>

          {errorMessage && <div className="sql-error-banner">⚠️ {errorMessage}</div>}

          {userRepos.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <span className="text-xs font-bold text-outline uppercase">Your Repositories:</span>
              {userRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex justify-between items-center bg-surface-container-low p-2 rounded border border-outline-variant text-sm"
                >
                  <div>
                    <span className="font-bold text-on-surface">{repo.name}</span>
                    <span className="text-xs text-outline ml-2">
                      ({repo.private ? 'Private' : 'Public'})
                    </span>
                  </div>
                  <button
                    type="button"
                    className="bg-secondary text-on-secondary px-2.5 py-1 rounded text-xs hover:brightness-110"
                    onClick={() => handleImportRepo(repo.owner.login, repo.name)}
                  >
                    Import Workspace
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
