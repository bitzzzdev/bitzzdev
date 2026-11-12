// Unified repository data layer for bitz.is-a.dev/repos.
// Prefers GitHub (bitzzdev) and falls back to GitLab (bitzzdev) when the
// GitHub account is unavailable or returns no public repositories.

export const GITHUB_USER = "bitzzdev";
export const GITLAB_USER = "bitzzdev";
export const GITLAB_NAMESPACE = "bitzzdev";

export type GitSource = "github" | "gitlab";

export interface RepoSummary {
  id: string;
  name: string;
  description: string;
  webUrl: string;
  cloneHttp: string;
  cloneSsh: string;
  defaultBranch: string;
  topics: string[];
  language: string | null;
  stars: number;
  forks: number;
  fork: boolean;
  archived: boolean;
  lastActivity: string;
  source: GitSource;
}

export interface ReposListResult {
  repos: RepoSummary[];
  source: GitSource;
  githubOk: boolean;
  /** true when both APIs were unavailable and the cached snapshot is served */
  degraded: boolean;
}

export interface TreeEntry {
  name: string;
  path: string;
  type: "dir" | "file";
  size: number | null;
}

export interface FileContent {
  name: string;
  path: string;
  size: number;
  text: string | null;
  isBinary: boolean;
  tooLarge: boolean;
}

export interface CommitEntry {
  shortId: string;
  title: string;
  authorName: string;
  authoredAt: string;
  url: string;
}

export interface BranchEntry {
  name: string;
  isDefault: boolean;
}

export interface TagEntry {
  name: string;
}

export interface LanguageShare {
  name: string;
  pct: number;
}

import { REPO_FALLBACK_REPOS } from "./repos-fallback";

const REVALIDATE = 300;
const MAX_FILE_BYTES = 512 * 1024;
const MAX_LINES = 5000;

function fetchOpts(): RequestInit & { next: { revalidate: number } } {
  return {
    headers: {
      "User-Agent": "bitz.is-a.dev",
      Accept: "application/json",
    },
    next: { revalidate: REVALIDATE },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(
  url: string,
  attempt = 0
): Promise<{ ok: boolean; status: number; body: unknown }> {
  try {
    const res = await fetch(url, fetchOpts());
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 1) {
      await sleep(1200);
      return fetchJson(url, attempt + 1);
    }
    return { ok: res.ok, status: res.status, body };
  } catch {
    if (attempt < 1) {
      await sleep(1200);
      return fetchJson(url, attempt + 1);
    }
    return { ok: false, status: 0, body: null };
  }
}

export function safePath(p: string): string {
  const cleaned = p.replace(/^\/+|\/+$/g, "");
  if (cleaned.split("/").some((seg) => seg === ".." || seg === "." || seg === "")) return "";
  return cleaned;
}

export function safeRef(ref: string, fallback: string): string {
  if (!ref) return fallback;
  return /^[A-Za-z0-9._\-/]{1,200}$/.test(ref) && !ref.includes("..") ? ref : fallback;
}

export function relTime(iso: string, now: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "unknown";
  const diff = Math.max(0, now - t);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function rawBase(source: GitSource, name: string, ref: string): string {
  return source === "github"
    ? `https://raw.githubusercontent.com/${GITHUB_USER}/${name}/${ref}/`
    : `https://gitlab.com/${GITLAB_NAMESPACE}/${name}/-/raw/${ref}/`;
}

export function blobBase(source: GitSource, name: string, ref: string): string {
  return source === "github"
    ? `https://github.com/${GITHUB_USER}/${name}/blob/${ref}/`
    : `https://gitlab.com/${GITLAB_NAMESPACE}/${name}/-/blob/${ref}/`;
}

export function archiveUrl(source: GitSource, name: string, ref: string): string {
  return source === "github"
    ? `https://codeload.github.com/${GITHUB_USER}/${name}/tar.gz/${ref}`
    : `https://gitlab.com/${GITLAB_NAMESPACE}/${name}/-/archive/${ref}/${name}-${ref}.tar.gz`;
}

/* GitHub                                                              */

interface GithubApiRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  default_branch: string;
  topics?: string[];
}

function fromGithub(r: GithubApiRepo): RepoSummary {
  return {
    id: `github:${r.id}`,
    name: r.name,
    description: r.description ?? "",
    webUrl: r.html_url,
    cloneHttp: `https://github.com/${GITHUB_USER}/${r.name}.git`,
    cloneSsh: `git@github.com:${GITHUB_USER}/${r.name}.git`,
    defaultBranch: r.default_branch || "main",
    topics: r.topics ?? [],
    language: r.language,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    fork: !!r.fork,
    archived: !!r.archived,
    lastActivity: r.pushed_at,
    source: "github",
  };
}

export async function listGithub(): Promise<RepoSummary[] | null> {
  const { ok, body } = await fetchJson(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`
  );
  if (!ok || !Array.isArray(body) || body.length === 0) return null;
  return (body as GithubApiRepo[]).map(fromGithub);
}

/* GitLab                                                              */

interface GitlabApiProject {
  id: number;
  path: string;
  name: string;
  description: string | null;
  web_url: string;
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  default_branch: string | null;
  topics?: string[];
  tag_list?: string[];
  star_count: number;
  forks_count: number;
  forked_from_project?: unknown;
  archived?: boolean;
  last_activity_at: string;
}

function fromGitlab(p: GitlabApiProject): RepoSummary {
  return {
    id: `gitlab:${p.id}`,
    name: p.path,
    description: p.description ?? "",
    webUrl: p.web_url,
    cloneHttp: p.http_url_to_repo,
    cloneSsh: p.ssh_url_to_repo,
    defaultBranch: p.default_branch || "main",
    topics: p.topics ?? p.tag_list ?? [],
    language: null,
    stars: p.star_count ?? 0,
    forks: p.forks_count ?? 0,
    fork: !!p.forked_from_project,
    archived: !!p.archived,
    lastActivity: p.last_activity_at,
    source: "gitlab",
  };
}

function gitlabProjectId(name: string): string {
  return encodeURIComponent(`${GITLAB_NAMESPACE}/${name}`);
}

export async function listGitlab(): Promise<RepoSummary[] | null> {
  const { ok, body } = await fetchJson(
    `https://gitlab.com/api/v4/users/${GITLAB_USER}/projects?per_page=100&order_by=updated_at`
  );
  if (!ok || !Array.isArray(body)) return null;
  return (body as GitlabApiProject[]).map(fromGitlab);
}

/* Fallback orchestration                                              */

export async function getAllRepos(): Promise<ReposListResult> {
  const gh = await listGithub();
  if (gh) {
    gh.sort((a, b) => Date.parse(b.lastActivity) - Date.parse(a.lastActivity));
    return { repos: gh, source: "github", githubOk: true, degraded: false };
  }
  const gl = await listGitlab();
  if (gl && gl.length > 0) {
    gl.sort((a, b) => Date.parse(b.lastActivity) - Date.parse(a.lastActivity));
    return { repos: gl, source: "gitlab", githubOk: false, degraded: false };
  }
  const snapshot = [...REPO_FALLBACK_REPOS].sort(
    (a, b) => Date.parse(b.lastActivity) - Date.parse(a.lastActivity)
  );
  return { repos: snapshot, source: "gitlab", githubOk: false, degraded: true };
}

export async function getRepo(name: string): Promise<RepoSummary | null> {
  const { repos } = await getAllRepos();
  const needle = name.toLowerCase();
  return (
    repos.find(
      (r) => r.name.toLowerCase() === needle || r.webUrl.split("/").pop()?.toLowerCase() === needle
    ) ?? null
  );
}

/* Languages                                                           */

export async function getLanguages(source: GitSource, name: string): Promise<LanguageShare[]> {
  if (source === "github") {
    const { ok, body } = await fetchJson(`https://api.github.com/repos/${GITHUB_USER}/${name}/languages`);
    if (!ok || !body || typeof body !== "object") return [];
    const entries = Object.entries(body as Record<string, number>);
    const total = entries.reduce((sum, [, v]) => sum + v, 0);
    if (total <= 0) return [];
    return entries
      .map(([lang, bytes]) => ({ name: lang, pct: Math.round((bytes / total) * 1000) / 10 }))
      .sort((a, b) => b.pct - a.pct);
  }
  const { ok, body } = await fetchJson(`https://gitlab.com/api/v4/projects/${gitlabProjectId(name)}/languages`);
  if (!ok || !body || typeof body !== "object") return [];
  return Object.entries(body as Record<string, number>)
    .map(([lang, pct]) => ({ name: lang, pct: Math.round(pct * 10) / 10 }))
    .sort((a, b) => b.pct - a.pct);
}

/* README                                                              */

const README_CANDIDATES = [
  "README.md", "readme.md", "Readme.md",
  "README.markdown", "README.rst", "README.txt", "README",
];

export interface ReadmeResult {
  name: string;
  content: string;
}

export async function getReadme(source: GitSource, name: string, ref: string): Promise<ReadmeResult | null> {
  for (const candidate of README_CANDIDATES) {
    const url =
      source === "github"
        ? `https://raw.githubusercontent.com/${GITHUB_USER}/${name}/${ref}/${candidate}`
        : `https://gitlab.com/api/v4/projects/${gitlabProjectId(name)}/repository/files/${encodeURIComponent(candidate)}/raw?ref=${encodeURIComponent(ref)}`;
    try {
      const res = await fetch(url, fetchOpts());
      if (!res.ok) continue;
      const content = await res.text();
      if (content.length === 0) continue;
      return { name: candidate, content: content.slice(0, 400 * 1024) };
    } catch {
      continue;
    }
  }
  return null;
}

/* Tree + file contents                                                */

export async function getTree(
  source: GitSource,
  name: string,
  dirPath: string,
  ref: string
): Promise<TreeEntry[] | null> {
  const dir = safePath(dirPath);
  if (source === "github") {
    const url = dir
      ? `https://api.github.com/repos/${GITHUB_USER}/${name}/contents/${dir}?ref=${encodeURIComponent(ref)}`
      : `https://api.github.com/repos/${GITHUB_USER}/${name}/contents/?ref=${encodeURIComponent(ref)}`;
    const { ok, body } = await fetchJson(url);
    if (!ok || !Array.isArray(body)) return null;
    return (body as Array<{ type: string; name: string; path: string; size?: number }>).map((e) => ({
      name: e.name,
      path: e.path,
      type: e.type === "dir" ? "dir" : "file",
      size: e.type === "dir" ? null : e.size ?? 0,
    }));
  }
  const params = new URLSearchParams({ ref, per_page: "100" });
  if (dir) params.set("path", dir);
  const { ok, body } = await fetchJson(
    `https://gitlab.com/api/v4/projects/${gitlabProjectId(name)}/repository/tree?${params.toString()}`
  );
  if (!ok || !Array.isArray(body)) return null;
  return (body as Array<{ type: string; name: string; path: string }>).map((e) => ({
    name: e.name,
    path: e.path,
    type: e.type === "tree" ? "dir" : "file",
    size: null,
  }));
}

const BINARY_EXTENSIONS = new Set([
  "png","jpg","jpeg","gif","webp","ico","bmp","tiff",
  "woff","woff2","ttf","otf","eot",
  "pdf","zip","gz","tar","7z","rar","jar","exe","dll","so","dylib",
  "mp3","mp4","mkv","mov","avi","webm","flac","wav",
  "bin","o","a","pyc","class","wasm","db","sqlite","ds_store",
]);

export async function getFile(
  source: GitSource,
  name: string,
  filePath: string,
  ref: string
): Promise<FileContent | null> {
  const filePathSafe = safePath(filePath);
  if (!filePathSafe) return null;
  const fileName = filePathSafe.split("/").pop() ?? filePathSafe;
  const ext = fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : "";

  let size = 0;
  let text: string | null = null;
  let encoded: string | null = null;

  if (source === "github") {
    const { ok, body } = await fetchJson(
      `https://api.github.com/repos/${GITHUB_USER}/${name}/contents/${filePathSafe}?ref=${encodeURIComponent(ref)}`
    );
    if (!ok || !body || typeof body !== "object" || Array.isArray(body)) return null;
    const b = body as { size?: number; content?: string; encoding?: string };
    size = b.size ?? 0;
    if (b.encoding === "base64" && typeof b.content === "string") encoded = b.content.replace(/\n/g, "");
  } else {
    const { ok, body } = await fetchJson(
      `https://gitlab.com/api/v4/projects/${gitlabProjectId(name)}/repository/files/${encodeURIComponent(filePathSafe)}?ref=${encodeURIComponent(ref)}`
    );
    if (!ok || !body || typeof body !== "object") return null;
    const b = body as { size?: number; content?: string; encoding?: string };
    size = b.size ?? 0;
    if (b.encoding === "base64" && typeof b.content === "string") encoded = b.content;
  }

  if (size > MAX_FILE_BYTES) {
    return { name: fileName, path: filePathSafe, size, text: null, isBinary: BINARY_EXTENSIONS.has(ext), tooLarge: true };
  }
  if (BINARY_EXTENSIONS.has(ext)) {
    return { name: fileName, path: filePathSafe, size, text: null, isBinary: true, tooLarge: false };
  }
  if (encoded) {
    try {
      const buf = Buffer.from(encoded, "base64");
      if (buf.includes(0)) {
        return { name: fileName, path: filePathSafe, size, text: null, isBinary: true, tooLarge: false };
      }
      text = buf.toString("utf8");
    } catch {
      text = null;
    }
  }
  if (text && text.split("\n").length > MAX_LINES) {
    text = text.split("\n").slice(0, MAX_LINES).join("\n") + `\n\n… truncated at ${MAX_LINES} lines`;
  }
  return { name: fileName, path: filePathSafe, size, text, isBinary: text === null, tooLarge: false };
}

/* Commits, branches, tags                                             */

export interface CommitsPage {
  commits: CommitEntry[];
  hasMore: boolean;
  page: number;
}

export async function getCommits(
  source: GitSource,
  name: string,
  ref: string,
  page: number
): Promise<CommitsPage> {
  const per = 30;
  const p = Math.max(1, page);
  if (source === "github") {
    const { ok, body } = await fetchJson(
      `https://api.github.com/repos/${GITHUB_USER}/${name}/commits?sha=${encodeURIComponent(ref)}&per_page=${per + 1}&page=${p}`
    );
    if (!ok || !Array.isArray(body)) return { commits: [], hasMore: false, page: p };
    const list = (body as Array<{
      sha: string;
      html_url: string;
      commit: { message: string; author: { name: string; date: string } };
    }>).map((c) => ({
      shortId: c.sha.slice(0, 8),
      title: (c.commit.message || "").split("\n")[0],
      authorName: c.commit.author?.name ?? "unknown",
      authoredAt: c.commit.author?.date ?? "",
      url: c.html_url,
    }));
    return { commits: list.slice(0, per), hasMore: list.length > per, page: p };
  }
  const params = new URLSearchParams({
    ref_name: ref,
    per_page: String(per + 1),
    page: String(p),
  });
  const { ok, body } = await fetchJson(
    `https://gitlab.com/api/v4/projects/${gitlabProjectId(name)}/repository/commits?${params.toString()}`
  );
  if (!ok || !Array.isArray(body)) return { commits: [], hasMore: false, page: p };
  const list = (body as Array<{
    short_id: string;
    title: string;
    author_name: string;
    authored_date: string;
    web_url: string;
  }>).map((c) => ({
    shortId: c.short_id,
    title: c.title,
    authorName: c.author_name,
    authoredAt: c.authored_date,
    url: c.web_url,
  }));
  return { commits: list.slice(0, per), hasMore: list.length > per, page: p };
}

export async function getBranches(source: GitSource, name: string): Promise<BranchEntry[]> {
  if (source === "github") {
    const { ok, body } = await fetchJson(
      `https://api.github.com/repos/${GITHUB_USER}/${name}/branches?per_page=100`
    );
    if (!ok || !Array.isArray(body)) return [];
    return (body as Array<{ name: string }>).map((b) => ({ name: b.name, isDefault: false }));
  }
  const { ok, body } = await fetchJson(
    `https://gitlab.com/api/v4/projects/${gitlabProjectId(name)}/repository/branches?per_page=100`
  );
  if (!ok || !Array.isArray(body)) return [];
  return (body as Array<{ name: string; default?: boolean }>).map((b) => ({
    name: b.name,
    isDefault: !!b.default,
  }));
}

export async function getTags(source: GitSource, name: string): Promise<TagEntry[]> {
  if (source === "github") {
    const { ok, body } = await fetchJson(
      `https://api.github.com/repos/${GITHUB_USER}/${name}/tags?per_page=100`
    );
    if (!ok || !Array.isArray(body)) return [];
    return (body as Array<{ name: string }>).map((t) => ({ name: t.name }));
  }
  const { ok, body } = await fetchJson(
    `https://gitlab.com/api/v4/projects/${gitlabProjectId(name)}/repository/tags?per_page=100`
  );
  if (!ok || !Array.isArray(body)) return [];
  return (body as Array<{ name: string }>).map((t) => ({ name: t.name }));
}

export function allTopics(repos: RepoSummary[], limit = 16): string[] {
  const counts = new Map<string, number>();
  for (const r of repos) {
    for (const t of r.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([t]) => t);
}

export function nowMs(): number {
  return Date.now();
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 1) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}
