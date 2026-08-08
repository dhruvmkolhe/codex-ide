import {
  getUserRepositories,
  fetchRepoContents,
  createPullRequest,
  formatGitHubFilesToWorkspace,
} from '../githubService';
import axios from 'axios';

jest.mock('axios');

describe('githubService utility', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getUserRepositories should fetch repos with authorization header', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'my-repo' }] });

    const repos = await getUserRepositories('ghp_token123');
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.github.com/user/repos?sort=updated&per_page=30',
      expect.objectContaining({
        headers: {
          Authorization: 'token ghp_token123',
          Accept: 'application/vnd.github.v3+json',
        },
      })
    );
    expect(repos).toEqual([{ id: 1, name: 'my-repo' }]);
  });

  test('fetchRepoContents should request repository files', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ name: 'index.js', type: 'file' }] });

    const contents = await fetchRepoContents('octocat', 'Hello-World', 'src', 'ghp_token123');
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.github.com/repos/octocat/Hello-World/contents/src',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'token ghp_token123',
        }),
      })
    );
    expect(contents).toEqual([{ name: 'index.js', type: 'file' }]);
  });

  test('createPullRequest should post pull request payload', async () => {
    axios.post.mockResolvedValueOnce({ data: { number: 42, state: 'open' } });

    const pr = await createPullRequest(
      'octocat',
      'repo',
      'Fix bug',
      'feature-branch',
      'main',
      'Fix details',
      'token'
    );
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.github.com/repos/octocat/repo/pulls',
      { title: 'Fix bug', head: 'feature-branch', base: 'main', body: 'Fix details' },
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'token token' }),
      })
    );
    expect(pr.number).toBe(42);
  });

  test('formatGitHubFilesToWorkspace should map GitHub file objects', () => {
    const rawFiles = [
      { name: 'app.js', content: 'console.log("hello");' },
      { name: 'script.py', content: 'print("hello")' },
    ];
    const formatted = formatGitHubFilesToWorkspace({}, rawFiles);
    expect(formatted).toEqual([
      { name: 'app.js', content: 'console.log("hello");', language: 'javascript' },
      { name: 'script.py', content: 'print("hello")', language: 'python' },
    ]);
  });
});
