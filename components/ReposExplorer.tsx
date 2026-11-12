"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { relTime, type RepoSummary } from "@/lib/repos";

interface ReposExplorerProps {
  repos: RepoSummary[];
  topics: string[];
  source: "github" | "gitlab";
  githubOk: boolean;
  degraded: boolean;
  now: number;
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="8" r="2.5" />
      <path d="M6 8.5v7M18 10.5c0 4-6 3-9.5 5" />
    </svg>
  );
}

export default function ReposExplorer({ repos, topics, source, githubOk, degraded, now }: ReposExplorerProps) {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repos.filter((repo) => {
      if (activeTopic && !repo.topics.some((t) => t.toLowerCase() === activeTopic.toLowerCase())) {
        return false;
      }
      if (!q) return true;
      const haystack = [repo.name, repo.description, repo.language ?? "", ...repo.topics]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [repos, query, activeTopic]);

  return (
    <div>
      {degraded ? (
        <p className="repos-source-note" role="status">
          github api unavailable and the gitlab mirror is rate limited right now. Showing a cached snapshot
          captured on 2026-11-12.
        </p>
      ) : (
        !githubOk && (
          <p className="repos-source-note" role="status">
            github api unavailable (account flagged). Showing mirrored public repositories from gitlab.
          </p>
        )
      )}

      <div className="repos-toolbar">
        <input
          type="text"
          className="repos-search"
          placeholder="search repositories, tags, languages…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search repositories"
          spellCheck={false}
          autoComplete="off"
        />
        <span className="repos-count" aria-live="polite">
          {filtered.length}/{repos.length} repos
        </span>
      </div>

      {topics.length > 0 && (
        <div className="repos-topics" aria-label="Filter by tag">
          {topics.map((topic) => (
            <button
              key={topic}
              type="button"
              className={`repos-topic${activeTopic === topic ? " is-active" : ""}`}
              onClick={() => setActiveTopic(activeTopic === topic ? null : topic)}
              aria-pressed={activeTopic === topic}
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="repos-empty">
          <p>no repositories match {query ? `"${query}"` : "that filter"}.</p>
          <button
            type="button"
            className="repos-empty-clear"
            onClick={() => {
              setQuery("");
              setActiveTopic(null);
            }}
          >
            clear filters
          </button>
        </div>
      ) : (
        <div className="repos-grid">
          {filtered.map((repo) => (
            <Link key={repo.id} href={`/repos/${encodeURIComponent(repo.name)}`} className="repo-card">
              <div className="repo-card__top">
                <span className="repo-card__name">{repo.name}</span>
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

              <p className="repo-card__desc">
                {repo.description || "No description provided."}
              </p>

              {repo.topics.length > 0 && (
                <div className="repo-card__tags">
                  {repo.topics.slice(0, 4).map((topic) => (
                    <span key={topic} className="repo-tag">{topic}</span>
                  ))}
                  {repo.topics.length > 4 && (
                    <span className="repo-tag repo-tag--more">+{repo.topics.length - 4}</span>
                  )}
                </div>
              )}

              <div className="repo-card__meta">
                <span title="Last updated">{relTime(repo.lastActivity, now)}</span>
                {repo.language && <span>{repo.language}</span>}
                <span className="repo-card__stat" title="Stars">
                  <StarIcon /> {repo.stars}
                </span>
                <span className="repo-card__stat" title="Forks">
                  <ForkIcon /> {repo.forks}
                </span>
                {repo.archived && <span className="repo-card__flag">archived</span>}
                {repo.fork && <span className="repo-card__flag">fork</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
