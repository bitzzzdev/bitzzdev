import type { Metadata } from "next";
import { getAllRepos, allTopics, nowMs } from "@/lib/repos";
import ReposExplorer from "@/components/ReposExplorer";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Public repositories",
  description:
    "Every public open-source repository by Dev Borah (bitzzdev), mirrored on GitHub and GitLab: name, description, tags, languages, and full in-browser code browsing.",
  alternates: { canonical: "https://bitz.is-a.dev/repos" },
  openGraph: {
    type: "website",
    url: "https://bitz.is-a.dev/repos",
    siteName: "Bitz: Dev Borah",
    title: "Public repositories | Dev Borah",
    description:
      "Browse every public repository by Dev Borah (bitzzdev): filter by tags, read the README, and explore the code in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Public repositories | Dev Borah",
    description:
      "Open-source repositories by Dev Borah (bitzzdev), served live from GitHub with automatic GitLab fallback.",
  },
};

export default async function ReposPage() {
  const { repos, source, githubOk, degraded } = await getAllRepos();
  const topics = allTopics(repos);
  const now = nowMs();

  return (
    <>
      <div className="rails" aria-hidden="true" />
      <SiteHeader base="/" />

      <main>
        <section className="am-section repos-page" aria-labelledby="repos-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">/SOURCE</span>
              <h1 className="am-h2" id="repos-heading">
                Public repositories ({repos.length})
              </h1>
              <p className="am-desc">
                Everything I publish, open source, in one place. Repositories are served
                live from GitHub with an automatic fallback to the GitLab mirror when the
                GitHub account is unavailable. Open any repository to browse its code,
                README, commits, branches, and tags right here.
              </p>
              <div className="repos-source-links">
                <span className="repos-source-item">
                  <span className={`repos-dot${githubOk ? " is-live" : ""}`} aria-hidden="true" />
                  <a href="https://github.com/bitzzdev" target="_blank" rel="noreferrer">
                    github.com/bitzzdev
                  </a>
                  {!githubOk && <span className="repos-source-state">flagged, using gitlab mirror</span>}
                </span>
                <span className="repos-source-item">
                  <span className={`repos-dot is-live`} aria-hidden="true" />
                  <a href="https://gitlab.com/bitzzdev" target="_blank" rel="noreferrer">
                    gitlab.com/bitzzdev
                  </a>
                  {source === "gitlab" && <span className="repos-source-state">live</span>}
                </span>
              </div>
            </div>

            <ReposExplorer
              repos={repos}
              topics={topics}
              source={source}
              githubOk={githubOk}
              degraded={degraded}
              now={now}
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
