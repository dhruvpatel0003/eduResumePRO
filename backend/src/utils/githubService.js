const axios = require('axios');

const GITHUB_API_BASE = 'https://api.github.com';

function getGithubHeaders() {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'eduResumePRO/1.0',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchUserRepos(username) {
  try {
    const res = await axios.get(
      `${GITHUB_API_BASE}/users/${username}/repos`,
      {
        headers: getGithubHeaders(),
        params: {
          sort: 'updated',
          direction: 'desc',
          per_page: 30,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw new Error(`Failed to fetch repos: ${error.response?.status || error.message}`);
  }
}

async function fetchRepoLanguages(owner, repo) {
  try {
    const res = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`,
      { headers: getGithubHeaders() }
    );
    return res.data;
  } catch (error) {
    return {}; // Empty languages if fails
  }
}

async function buildProjectFromRepo(repo) {
  const languages = await fetchRepoLanguages(repo.owner.login, repo.name);

  return {
    githubId: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    description: repo.description || 'No description available',
    primaryLanguage: repo.language,
    languages: Object.keys(languages),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
    topics: repo.topics || [],
    pushedAt: repo.pushed_at,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    size: repo.size,
  };
}

module.exports = {
  fetchUserRepos,
  fetchRepoLanguages,
  buildProjectFromRepo,
};
