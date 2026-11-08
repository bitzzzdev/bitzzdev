"use client";

import { useEffect, useState } from "react";
import AsciiScene from "@/components/AsciiScene";
import { PROJECT_BANNER_CONFIGS } from "@/lib/ascii-pieces";
import { GITHUB_USERNAME, filterRepos, type GithubRepo } from "@/lib/github";

export default function AsciiWorkGrid({ initialRepos }: { initialRepos: GithubRepo[] }) {
  const [repos, setRepos] = useState<GithubRepo[]>(initialRepos);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchRepos = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
          { headers: { Accept: "application/vnd.github+json" } }
        );
        if (!res.ok) {
          setError(true);
          return;
        }
        const data: GithubRepo[] = await res.json();
        if (active) {
          setRepos(filterRepos(data));
          setError(false);
        }
      } catch {
        setError(true);
      }
    };

    fetchRepos();
    const interval = setInterval(fetchRepos, 300000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (repos.length === 0 && error) {
    return (
      <p style={{ margin: "1.5rem 0", color: "var(--text-50)" }}>
        [unable to reach github api right now, please view github.com/{GITHUB_USERNAME} directly]
      </p>
    );
  }

  return (
    <div>
      <div className="work-grid">
        {repos.map((repo, idx) => {
          const sceneConfig =
            idx < PROJECT_BANNER_CONFIGS.length
              ? PROJECT_BANNER_CONFIGS[idx]
              : PROJECT_BANNER_CONFIGS[idx % PROJECT_BANNER_CONFIGS.length];

          return (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="work-card"
            >
              <div className="work-card__media">
                <AsciiScene config={sceneConfig} label={sceneConfig.name} />
              </div>
              <div className="work-card__body">
                <div className="work-card__title">
                  <span>{repo.name.replace(/-/g, " ")}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </div>
                <p className="work-card__desc">
                  {repo.description || repo.language || "Public repository on GitHub"}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      <div className="work-viewall">
        <a
          href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`}
          target="_blank"
          rel="noreferrer"
          className="work-viewall-btn"
        >
          <span>view all repositories on github</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </a>
      </div>
    </div>
  );
}
