import { Project } from '../types';

export interface GithubSyncSettings {
  enabled: boolean;
  token: string;
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
}

export const LOCAL_GITHUB_KEY = 'portfolio_github_sync_settings';

// Get default configuration from localStorage or Vite env fallback
export function getGithubSettings(): GithubSyncSettings {
  const metaEnv = (import.meta as any).env || {};
  
  try {
    const saved = localStorage.getItem(LOCAL_GITHUB_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        return {
          enabled: parsed.enabled !== undefined ? parsed.enabled : false,
          token: parsed.token || metaEnv.VITE_GITHUB_TOKEN || '',
          owner: parsed.owner || metaEnv.VITE_GITHUB_OWNER || '',
          repo: parsed.repo || metaEnv.VITE_GITHUB_REPO || '',
          branch: parsed.branch || metaEnv.VITE_GITHUB_BRANCH || 'main',
          filePath: parsed.filePath || metaEnv.VITE_GITHUB_FILE_PATH || 'projects-db.json'
        };
      }
    }
  } catch (e) {
    console.error('Failed to load GitHub settings from localStorage:', e);
  }

  // Pure environment variables fallback
  const envEnabled = !!(metaEnv.VITE_GITHUB_TOKEN && metaEnv.VITE_GITHUB_OWNER && metaEnv.VITE_GITHUB_REPO);
  return {
    enabled: envEnabled,
    token: metaEnv.VITE_GITHUB_TOKEN || '',
    owner: metaEnv.VITE_GITHUB_OWNER || '',
    repo: metaEnv.VITE_GITHUB_REPO || '',
    branch: metaEnv.VITE_GITHUB_BRANCH || 'main',
    filePath: metaEnv.VITE_GITHUB_FILE_PATH || 'projects-db.json'
  };
}

export function saveGithubSettings(settings: GithubSyncSettings): void {
  try {
    localStorage.setItem(LOCAL_GITHUB_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save GitHub settings to localStorage:', e);
  }
}

/**
 * Encodes a string to Base64 safely containing Unicode/UTF-8 characters
 */
function utf8ToBase64(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

/**
 * Decodes a Base64 string back to a UTF-8 string safely
 */
function base64ToUtf8(str: string): string {
  return decodeURIComponent(Array.prototype.map.call(atob(str.replace(/\s/g, '')), (c) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

/**
 * Fetch data.json from GitHub
 */
export async function fetchProjectsFromGithub(settings: GithubSyncSettings): Promise<Project[] | null> {
  if (!settings.enabled || !settings.owner || !settings.repo || !settings.filePath) {
    return null;
  }

  const { owner, repo, branch, filePath, token } = settings;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

  console.log(`[GitHub Sync] Fetching database file: ${filePath} from ${owner}/${repo}...`);

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(url, { headers });

    if (response.status === 404) {
      console.warn(`[GitHub Sync] File ${filePath} not found in ${owner}/${repo}. It will be created on save.`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    if (data && data.content) {
      const jsonText = base64ToUtf8(data.content);
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (parsed && Array.isArray(parsed.projects)) {
        return parsed.projects;
      }
    }
  } catch (err) {
    console.error('[GitHub Sync] Error loading database from GitHub:', err);
    throw err;
  }

  return null;
}

/**
 * Commit data.json back to GitHub
 */
export async function commitProjectsToGithub(projects: Project[], settings: GithubSyncSettings): Promise<boolean> {
  if (!settings.enabled || !settings.token || !settings.owner || !settings.repo || !settings.filePath) {
    console.warn('[GitHub Sync] Sync is disabled or missing credentials.');
    return false;
  }

  const { owner, repo, branch, filePath, token } = settings;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  console.log(`[GitHub Sync] Committing updated catalog to path ${filePath}...`);

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    };

    // 1. Try to fetch existing file to get its unique SHA ref (required for updates)
    let sha: string | undefined = undefined;
    try {
      const getFileUrl = `${url}?ref=${branch}`;
      const getRes = await fetch(getFileUrl, { headers: { 'Authorization': `token ${token}` } });
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }
    } catch (shaErr) {
      console.log('[GitHub Sync] Note: File does not exist yet (or SHA lookup skipped). Will create a fresh file.', shaErr);
    }

    // 2. Prepare JSON payload
    const jsonString = JSON.stringify(projects, null, 2);
    const base64Content = utf8ToBase64(jsonString);

    const body: Record<string, any> = {
      message: `Update ${filePath} from Portfolio Studio Panel`,
      content: base64Content,
      branch: branch
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const msg = await response.text();
      console.error(`[GitHub Sync] Commit failed: ${response.status} - ${msg}`);
      throw new Error(`GitHub Commit Failed: ${response.status} - ${msg}`);
    }

    console.log('[GitHub Sync] Success! File committed cleanly to repo list.');
    return true;
  } catch (err) {
    console.error('[GitHub Sync] Error committing to GitHub:', err);
    throw err;
  }
}
