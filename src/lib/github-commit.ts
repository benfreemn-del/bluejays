/**
 * github-commit — minimal GitHub REST API helper for committing single
 * files to the bluejays repo. Powers the owner-side "edit my site via
 * Claude" flow at /clients/olympic-inspections/admin → Edit Site tab.
 *
 * Why a commit-back-to-git approach (not DB-overlay):
 *  - Vercel filesystem is read-only at runtime, so the owner can't
 *    mutate /public/sites/{slug}/index.html directly.
 *  - Git is the source of truth for client static sites. Keeping edits
 *    in git means: full audit history, instant rollback via revert,
 *    and no parallel storage to keep in sync.
 *  - Vercel auto-redeploys on push, so the owner's edit goes live in
 *    ~60-90s without any manual deploy step.
 *
 * Required env vars (set on Vercel):
 *  - GITHUB_OWNER      e.g. "benfreemn"
 *  - GITHUB_REPO       e.g. "bluejays"
 *  - GITHUB_BRANCH     defaults to "main"
 *  - GITHUB_TOKEN      fine-grained PAT with `contents:write` on the repo
 *
 * Mock mode: if GITHUB_TOKEN is unset, every helper here returns a
 * deterministic mock response so dev / CI runs end-to-end without
 * touching a real repo.
 */

const GITHUB_API = "https://api.github.com";

function getConfig(): {
  owner: string;
  repo: string;
  branch: string;
  token: string;
} | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !owner || !repo) return null;
  return { owner, repo, branch, token };
}

export function isGithubConfigured(): boolean {
  return getConfig() !== null;
}

type GithubFile = {
  content: string;
  sha: string;
};

export async function getFileFromGithub(path: string): Promise<GithubFile> {
  const cfg = getConfig();
  if (!cfg) {
    // Mock mode — return a minimal placeholder so dev flows don't crash.
    return {
      content: `<!-- mock: ${path} (GITHUB_TOKEN not configured) -->`,
      sha: "mock-sha",
    };
  }
  const url = `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURIComponent(path)}?ref=${cfg.branch}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `GitHub get-file failed (${res.status}): ${body || res.statusText}`,
    );
  }
  const json = (await res.json()) as { content?: string; sha?: string };
  if (!json.content || !json.sha) {
    throw new Error("GitHub get-file returned unexpected shape");
  }
  // GitHub returns base64 with line breaks every 60 chars.
  const decoded = Buffer.from(json.content, "base64").toString("utf8");
  return { content: decoded, sha: json.sha };
}

export type CommitResult = {
  ok: true;
  commitSha: string;
  commitUrl: string;
} | {
  ok: false;
  error: string;
};

/**
 * Commit a single file via the contents API. PUT replaces the file in
 * one atomic call; the `sha` field tells GitHub which blob you're
 * overwriting (prevents lost-update races between two open edit tabs).
 */
export async function commitFile(args: {
  path: string;
  newContent: string;
  message: string;
  authorName?: string;
  authorEmail?: string;
  expectedSha?: string;
}): Promise<CommitResult> {
  const cfg = getConfig();
  if (!cfg) {
    return {
      ok: true,
      commitSha: "mock-commit-sha",
      commitUrl: `https://github.com/MOCK/MOCK/commit/mock`,
    };
  }
  let sha = args.expectedSha;
  if (!sha) {
    try {
      const current = await getFileFromGithub(args.path);
      sha = current.sha;
    } catch (err) {
      return {
        ok: false,
        error: `Could not fetch current file sha: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }
  const url = `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURIComponent(args.path)}`;
  const body = {
    message: args.message,
    content: Buffer.from(args.newContent, "utf8").toString("base64"),
    sha,
    branch: cfg.branch,
    committer: {
      name: args.authorName || "BlueJays Owner Edit",
      email: args.authorEmail || "bluejaycontactme@gmail.com",
    },
  };
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      error: `GitHub commit failed (${res.status}): ${text || res.statusText}`,
    };
  }
  const json = (await res.json()) as {
    commit?: { sha?: string; html_url?: string };
  };
  return {
    ok: true,
    commitSha: json.commit?.sha || "",
    commitUrl: json.commit?.html_url || "",
  };
}
