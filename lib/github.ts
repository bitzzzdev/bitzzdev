export const GITHUB_USERNAME = "bitzzdev";

export interface GithubRepo {
  id: number;
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
  "devsubstrate",
  "bitzdots",
  "tiv",
  "oha",
  "hyprconfig",
  "minegpt",
];

const FALLBACK_DEVSUBSTRATE: GithubRepo = {
  id: 1449997967,
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

export async function getPublicRepos(): Promise<GithubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return [FALLBACK_DEVSUBSTRATE];
    const data: GithubRepo[] = await res.json();
    return filterRepos(data);
  } catch {
    return [FALLBACK_DEVSUBSTRATE];
  }
}

export function filterRepos(data: GithubRepo[]): GithubRepo[] {
  const curated = data.filter((repo) =>
    CURATED_REPO_NAMES.includes(repo.name.toLowerCase())
  );

  // If devSubstrate isn't returned by GitHub API cache, inject it
  const hasDevSubstrate = curated.some(
    (repo) => repo.name.toLowerCase() === "devsubstrate"
  );
  if (!hasDevSubstrate) {
    curated.push(FALLBACK_DEVSUBSTRATE);
  }

  // Ensure strict ordering: devSubstrate, bitzdots, then others
  return curated.sort((a, b) => {
    const idxA = CURATED_REPO_NAMES.indexOf(a.name.toLowerCase());
    const idxB = CURATED_REPO_NAMES.indexOf(b.name.toLowerCase());
    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });
}
