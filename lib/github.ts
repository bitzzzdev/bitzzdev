import { getAllRepos, type RepoSummary } from "./repos";

export const GITHUB_USERNAME = "bitzzdev";

export interface GithubRepo {
  id: string;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  topics: string[];
}

export const CURATED_REPO_NAMES = [
  "devos",
  "quickshelf",
  "devsubstrate",
  "devlauncher",
  "bitzdots",
  "oha",
];

const FALLBACK_DEVOS: GithubRepo = {
  id: "fallback:devos",
  name: "DEVos",
  full_name: "bitzzdev/DEVos",
  description: "Early native Linux project for the Realme C11 2021 (RMX3231): research, kernel/firmware analysis, boot/initramfs work, and a custom Linux userspace for a pocket-server-style device port.",
  html_url: "https://github.com/bitzzdev/DEVos",
  language: "Python",
  stargazers_count: 0,
  forks_count: 0,
  fork: false,
  archived: false,
  pushed_at: new Date().toISOString(),
  topics: [],
};

const FALLBACK_QUICKSHELF: GithubRepo = {
  id: "fallback:quickshelf",
  name: "quickShelf",
  full_name: "bitzzdev/quickShelf",
  description: "Rust-based Wayland desktop widget and Waybar popover for pinned app shortcuts, image drop previews, and quick access to media and launcher actions.",
  html_url: "https://github.com/bitzzdev/quickShelf",
  language: "Rust",
  stargazers_count: 0,
  forks_count: 0,
  fork: false,
  archived: false,
  pushed_at: new Date().toISOString(),
  topics: [],
};

const FALLBACK_DEVSUBSTRATE: GithubRepo = {
  id: "fallback:devsubstrate",
  name: "devSubstrate",
  full_name: "bitzzdev/devSubstrate",
  description: "A research substrate for modern engineering: AI API architectures, terminal-native agents, and OS repair notes.",
  html_url: "https://github.com/bitzzdev/devSubstrate",
  language: "Shell",
  stargazers_count: 0,
  forks_count: 0,
  fork: false,
  archived: false,
  pushed_at: new Date().toISOString(),
  topics: [],
};

const FALLBACK_DEVLAUNCHER: GithubRepo = {
  id: "fallback:devlauncher",
  name: "devLauncher",
  full_name: "bitzzdev/devLauncher",
  description: "Minimal Launcher for Android. Reduce your screen time.",
  html_url: "https://github.com/bitzzdev/devLauncher",
  language: "Kotlin",
  stargazers_count: 0,
  forks_count: 0,
  fork: false,
  archived: false,
  pushed_at: new Date().toISOString(),
  topics: [],
};

const FALLBACK_BITZDOTS: GithubRepo = {
  id: "fallback:bitzdots",
  name: "bitzdots",
  full_name: "bitzzdev/bitzdots",
  description: "Lean Hyprland dotfiles with automatic wallust theming. Low-end optimized, full-stack auto-coloring, 26 Jinja2 templates.",
  html_url: "https://github.com/bitzzdev/bitzdots",
  language: "Shell",
  stargazers_count: 0,
  forks_count: 0,
  fork: false,
  archived: false,
  pushed_at: new Date().toISOString(),
  topics: [],
};

const FALLBACK_OHA: GithubRepo = {
  id: "fallback:oha",
  name: "oha",
  full_name: "bitzzdev/oha",
  description: "Terminal-based fullscreen text editor written in C with file manager and syntax highlighting.",
  html_url: "https://github.com/bitzzdev/oha",
  language: "C",
  stargazers_count: 0,
  forks_count: 0,
  fork: false,
  archived: false,
  pushed_at: new Date().toISOString(),
  topics: [],
};

export const DEFAULT_FALLBACK_REPOS: GithubRepo[] = [
  FALLBACK_DEVOS,
  FALLBACK_QUICKSHELF,
  FALLBACK_DEVSUBSTRATE,
  FALLBACK_DEVLAUNCHER,
  FALLBACK_BITZDOTS,
  FALLBACK_OHA,
];

function toGithubRepo(r: RepoSummary): GithubRepo {
  return {
    id: r.id,
    name: r.name,
    full_name: `bitzzdev/${r.name}`,
    description: r.description || null,
    html_url: r.webUrl,
    language: r.language,
    stargazers_count: r.stars,
    forks_count: r.forks,
    fork: r.fork,
    archived: r.archived,
    pushed_at: r.lastActivity,
    topics: r.topics,
  };
}

function selectCurated(repos: RepoSummary[]): GithubRepo[] {
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));
  const picked: RepoSummary[] = [];
  for (const wanted of CURATED_REPO_NAMES) {
    const hit = byName.get(wanted);
    if (hit) picked.push(hit);
  }
  const chosen =
    picked.length > 0
      ? picked
      : [...repos]
          .sort((a, b) => Date.parse(b.lastActivity) - Date.parse(a.lastActivity))
          .slice(0, 6);
  return chosen.map(toGithubRepo);
}

export async function getPublicRepos(): Promise<GithubRepo[]> {
  try {
    const { repos } = await getAllRepos();
    if (repos.length === 0) return DEFAULT_FALLBACK_REPOS;
    return selectCurated(repos);
  } catch {
    return DEFAULT_FALLBACK_REPOS;
  }
}

export function filterRepos(data: GithubRepo[]): GithubRepo[] {
  const curated = data.filter((repo) =>
    CURATED_REPO_NAMES.includes(repo.name.toLowerCase())
  );

  for (const fallback of DEFAULT_FALLBACK_REPOS) {
    const exists = curated.some(
      (repo) => repo.name.toLowerCase() === fallback.name.toLowerCase()
    );
    if (!exists) {
      curated.push(fallback);
    }
  }

  return curated.sort((a, b) => {
    const idxA = CURATED_REPO_NAMES.indexOf(a.name.toLowerCase());
    const idxB = CURATED_REPO_NAMES.indexOf(b.name.toLowerCase());
    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });
}
