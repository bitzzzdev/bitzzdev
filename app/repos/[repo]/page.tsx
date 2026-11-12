import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getRepo,
  getLanguages,
  getReadme,
  getTree,
  getFile,
  getCommits,
  getBranches,
  getTags,
  safePath,
  safeRef,
  relTime,
  formatBytes,
  nowMs,
  archiveUrl,
  type GitSource,
} from "@/lib/repos";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CopyButton from "@/components/CopyButton";
import BranchPicker from "@/components/BranchPicker";
import JsonLd from "@/components/JsonLd";
import {
  OverviewTab,
  FilesTab,
  FileTab,
  CommitsTab,
  BranchesTab,
} from "@/components/repo-tabs";

export const revalidate = 120;

interface PageParams {
  params: Promise<{ repo: string }>;
  searchParams: Promise<{ tab?: string; path?: string; ref?: string; page?: string }>;
}

const VALID_NAME = /^[A-Za-z0-9._-]{1,120}$/;

function sourceLabel(source: GitSource): string {
  return source === "github" ? "github" : "gitlab";
}

async function resolveRepo(rawName: string) {
  if (!VALID_NAME.test(rawName)) return null;
  return getRepo(rawName);
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { repo } = await params;
  const found = await resolveRepo(repo);
  const name = found?.name ?? (VALID_NAME.test(repo) ? repo : "repository");
  const description =
    found?.description ||
    `Browse the ${name} repository by Dev Borah (bitzzdev): README, source tree, commits, branches, and tags.`;
  return {
    title: name,
    description,
    alternates: { canonical: `https://bitz.is-a.dev/repos/${name}` },
    openGraph: {
      type: "website",
      url: `https://bitz.is-a.dev/repos/${name}`,
      siteName: "Bitz: Dev Borah",
      title: `${name} | Dev Borah`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Dev Borah`,
      description,
    },
  };
}

type Tab = "overview" | "files" | "file" | "commits" | "branches";

export default async function RepoDetailPage({ params, searchParams }: PageParams) {
  const { repo: rawName } = await params;
  const sp = await searchParams;

  const repo = await resolveRepo(rawName);
  if (!repo) notFound();

  const source = repo.source;
  const otherSource: GitSource = source === "github" ? "gitlab" : "github";
  const ref = safeRef(sp.ref ?? "", repo.defaultBranch);
  const tab: Tab = (["overview", "files", "file", "commits", "branches"] as const).includes(
    sp.tab as Tab
  )
    ? (sp.tab as Tab)
    : "overview";
  const path = safePath(sp.path ?? "");
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const now = nowMs();

  const branches = await getBranches(source, repo.name);
  const tags = tab === "branches" ? await getTags(source, repo.name) : [];
  const branchNames = branches.map((b) => b.name);
  const languages = await getLanguages(source, repo.name);

  const canonical = `https://bitz.is-a.dev/repos/${repo.name}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        "@id": `${canonical}#code`,
        name: repo.name,
        description: repo.description || undefined,
        url: canonical,
        codeRepository: [
          `https://github.com/bitzzdev/${repo.name}`,
          `https://gitlab.com/bitzzdev/${repo.name}`,
        ],
        programmingLanguage: languages[0]?.name,
        keywords: repo.topics.length > 0 ? repo.topics.join(", ") : undefined,
        author: { "@id": "https://bitz.is-a.dev/#person" },
        isPartOf: { "@id": "https://bitz.is-a.dev/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bitz.is-a.dev" },
          { "@type": "ListItem", position: 2, name: "Repositories", item: "https://bitz.is-a.dev/repos" },
          { "@type": "ListItem", position: 3, name: repo.name, item: canonical },
        ],
      },
    ],
  };

  const absHref = (t: string, p = path, r = ref, pg?: number) =>
    `/repos/${encodeURIComponent(repo.name)}?tab=${t}${p ? `&path=${encodeURIComponent(p)}` : ""}${r ? `&ref=${encodeURIComponent(r)}` : ""}${pg ? `&page=${pg}` : ""}`;

  const tabLink = (t: Tab, label: string) => (
    <Link
      key={t}
      href={absHref(t)}
      className={`repo-tab${tab === t || (t === "files" && tab === "file") ? " is-active" : ""}`}
      aria-current={tab === t ? "page" : undefined}
    >
      {label}
    </Link>
  );

  return (
    <>
      <div className="rails" aria-hidden="true" />
      <SiteHeader base="/" />

      <main>
        <JsonLd data={jsonLd} />
        <section className="am-section repo-detail" aria-labelledby="repo-title">
          <div className="am-inner">
            {/* Breadcrumb */}
            <nav className="repo-breadcrumb" aria-label="Breadcrumb">
              <Link href="/repos">repos</Link>
              <span aria-hidden="true">/</span>
              <span className="repo-breadcrumb__current">{repo.name}</span>
            </nav>

            {/* Repo header */}
            <div className="repo-head">
              <div className="repo-head__title-row">
                <h1 className="repo-head__name" id="repo-title">
                  {repo.name}
                </h1>
                <span className={`repo-source-badge repo-source-badge--${source}`}>
                  {sourceLabel(source)}
                </span>
                {repo.archived && <span className="repo-flag-badge">archived</span>}
                {repo.fork && <span className="repo-flag-badge">fork</span>}
              </div>
              <p className="repo-head__desc">
                {repo.description || "No description provided."}
              </p>

              <div className="repo-head__meta">
                <span>{repo.stars} stars</span>
                <span>{repo.forks} forks</span>
                <span>updated {relTime(repo.lastActivity, now)}</span>
                <span>default branch: {repo.defaultBranch}</span>
              </div>

              <div className="repo-actions">
                <BranchPicker
                  branches={branchNames.length > 0 ? branchNames : [repo.defaultBranch]}
                  defaultBranch={repo.defaultBranch}
                  current={ref}
                />
                <a className="repo-action-btn" href={archiveUrl(source, repo.name, ref)}>
                  Download .tar.gz
                </a>
                <a className="repo-action-btn" href={repo.webUrl} target="_blank" rel="noreferrer">
                  View on {sourceLabel(source)} ↗
                </a>
                <a
                  className="repo-action-btn"
                  href={
                    otherSource === "gitlab"
                      ? `https://gitlab.com/bitzzdev/${repo.name}`
                      : `https://github.com/bitzzdev/${repo.name}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  View on {otherSource} ↗
                </a>
              </div>

              {/* Clone row */}
              <div className="repo-clone">
                <span className="repo-clone__label">clone</span>
                <code className="repo-clone__url">{repo.cloneHttp}</code>
                <CopyButton text={repo.cloneHttp} label="copy" />
              </div>

              {repo.topics.length > 0 && (
                <div className="repo-topics-row">
                  {repo.topics.map((topic) => (
                    <span key={topic} className="repo-tag">{topic}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <nav className="repo-tabs" aria-label="Repository sections">
              {tabLink("overview", "Overview")}
              {tabLink("files", "Files")}
              {tabLink("commits", "Commits")}
              {tabLink("branches", "Branches & Tags")}
            </nav>

            {/* Tab content */}
            <div className="repo-panel">
              {tab === "overview" && (
                <OverviewTab source={source} repoName={repo.name} refName={ref} />
              )}
              {tab === "files" && (
                <FilesTab source={source} repoName={repo.name} dirPath={path} refName={ref} absHref={absHref} />
              )}
              {tab === "file" && (
                <FileTab source={source} repoName={repo.name} filePath={path} refName={ref} absHref={absHref} />
              )}
              {tab === "commits" && (
                <CommitsTab source={source} repoName={repo.name} refName={ref} page={page} absHref={absHref} now={now} />
              )}
              {tab === "branches" && (
                <BranchesTab branches={branches} tags={tags} refName={ref} absHref={absHref} />
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
