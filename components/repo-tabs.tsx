import Link from "next/link";
import {
  getLanguages,
  getReadme,
  getTree,
  getFile,
  getCommits,
  relTime,
  formatBytes,
  rawBase,
  blobBase,
  type GitSource,
  type TreeEntry,
  type BranchEntry,
  type TagEntry,
} from "@/lib/repos";
import Readme from "@/components/Readme";

type HrefBuilder = (tab: string, path?: string, ref?: string, page?: number) => string;

/* Language bar */

export async function LanguageBar({ source, repoName }: { source: GitSource; repoName: string }) {
  const langs = await getLanguages(source, repoName);
  if (langs.length === 0) return null;
  const shown = langs.slice(0, 6);
  const shades = [0.95, 0.72, 0.52, 0.38, 0.27, 0.18];

  return (
    <div className="repo-languages" aria-label="Language breakdown">
      <div className="repo-languages__bar">
        {shown.map((lang, i) => (
          <span
            key={lang.name}
            style={{ width: `${lang.pct}%`, opacity: shades[i % shades.length] }}
            title={`${lang.name} ${lang.pct}%`}
          />
        ))}
      </div>
      <ul className="repo-languages__legend">
        {shown.map((lang, i) => (
          <li key={lang.name}>
            <span
              className="repo-languages__dot"
              style={{ opacity: shades[i % shades.length] }}
              aria-hidden="true"
            />
            {lang.name}
            <span className="repo-languages__pct">{lang.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Overview tab */

export async function OverviewTab({
  source,
  repoName,
  refName,
}: {
  source: GitSource;
  repoName: string;
  refName: string;
}) {
  const readme = await getReadme(source, repoName, refName);

  return (
    <div>
      <LanguageBar source={source} repoName={repoName} />
      {readme ? (
        <Readme content={readme.content} source={source} repoName={repoName} refName={refName} />
      ) : (
        <div className="repo-empty-block">
          <p>No README found in this repository.</p>
          <p className="repo-empty-block__hint">
            It may be empty or the default branch does not exist yet. Clone it to get started:
          </p>
          <code className="repo-empty-block__code">
            {source === "github"
              ? `git clone https://github.com/bitzzdev/${repoName}.git`
              : `git clone https://gitlab.com/bitzzdev/${repoName}.git`}
          </code>
        </div>
      )}
    </div>
  );
}

/* File tree breadcrumb */

function PathBreadcrumb({
  dirPath,
  refName,
  absHref,
}: {
  dirPath: string;
  refName: string;
  absHref: HrefBuilder;
}) {
  const segments = dirPath ? dirPath.split("/") : [];
  return (
    <nav className="repo-path" aria-label="Path">
      <Link href={absHref("files", "", refName)} className="repo-path__seg">
        root
      </Link>
      {segments.map((seg, i) => {
        const partial = segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <span key={partial} className="repo-path__part">
            <span aria-hidden="true">/</span>
            {isLast ? (
              <span className="repo-path__current">{seg}</span>
            ) : (
              <Link href={absHref("files", partial, refName)} className="repo-path__seg">
                {seg}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function sortEntries(entries: TreeEntry[]): TreeEntry[] {
  return [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/* Files tab */

export async function FilesTab({
  source,
  repoName,
  dirPath,
  refName,
  absHref,
}: {
  source: GitSource;
  repoName: string;
  dirPath: string;
  refName: string;
  absHref: HrefBuilder;
}) {
  const entries = await getTree(source, repoName, dirPath, refName);
  const parentPath = dirPath.includes("/") ? dirPath.split("/").slice(0, -1).join("/") : "";

  return (
    <div>
      <div className="repo-path-bar">
        <PathBreadcrumb dirPath={dirPath} refName={refName} absHref={absHref} />
        <span className="repo-path-bar__ref">@ {refName}</span>
      </div>

      {entries === null ? (
        <div className="repo-empty-block">
          <p>Could not read <code>{dirPath || "/"}</code> on <code>{refName}</code>.</p>
          <p className="repo-empty-block__hint">
            The repository may be empty, or this branch or tag no longer exists.
          </p>
          <Link className="repo-action-btn" href={absHref("files", "", undefined)}>
            back to default view
          </Link>
        </div>
      ) : entries.length === 0 ? (
        <div className="repo-empty-block">
          <p>This directory is empty.</p>
        </div>
      ) : (
        <div className="repo-table-wrap">
          <table className="repo-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col" className="repo-table__size">Size</th>
                <th scope="col" className="repo-table__kind">Type</th>
              </tr>
            </thead>
            <tbody>
              {dirPath && (
                <tr>
                  <td colSpan={2}>
                    <Link href={absHref("files", parentPath, refName)} className="repo-entry repo-entry--dir">
                      ..
                    </Link>
                  </td>
                  <td className="repo-table__kind">up</td>
                </tr>
              )}
              {sortEntries(entries).map((entry) => (
                <tr key={entry.path}>
                  <td>
                    <Link
                      href={absHref(entry.type === "dir" ? "files" : "file", entry.path, refName)}
                      className={`repo-entry ${entry.type === "dir" ? "repo-entry--dir" : "repo-entry--file"}`}
                    >
                      <span className="repo-entry__glyph" aria-hidden="true">
                        {entry.type === "dir" ? "▸" : "·"}
                      </span>
                      {entry.name}
                      {entry.type === "dir" ? "/" : ""}
                    </Link>
                  </td>
                  <td className="repo-table__size">
                    {entry.type === "dir" ? "-" : entry.size !== null ? formatBytes(entry.size) : "-"}
                  </td>
                  <td className="repo-table__kind">{entry.type === "dir" ? "dir" : "file"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* File viewer tab */

export async function FileTab({
  source,
  repoName,
  filePath,
  refName,
  absHref,
}: {
  source: GitSource;
  repoName: string;
  filePath: string;
  refName: string;
  absHref: HrefBuilder;
}) {
  const file = await getFile(source, repoName, filePath, refName);
  const rawUrl = rawBase(source, repoName, refName) + filePath.split("/").map(encodeURIComponent).join("/");
  const blobUrl = blobBase(source, repoName, refName) + filePath.split("/").map(encodeURIComponent).join("/");

  if (!file) {
    return (
      <div className="repo-empty-block">
        <p>File not found: <code>{filePath}</code></p>
        <Link className="repo-action-btn" href={absHref("files", "", refName)}>
          back to files
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="repo-path-bar">
        <PathBreadcrumb dirPath={file.path} refName={refName} absHref={absHref} />
        <span className="repo-path-bar__ref">@ {refName}</span>
      </div>

      <div className="repo-file-head">
        <div className="repo-file-head__meta">
          <span>{formatBytes(file.size)}</span>
          <span>{file.isBinary ? "binary" : "text"}</span>
        </div>
        <div className="repo-file-head__actions">
          <a className="repo-action-btn" href={rawUrl} target="_blank" rel="noreferrer">Raw</a>
          <a className="repo-action-btn" href={blobUrl} target="_blank" rel="noreferrer">View on {source} ↗</a>
        </div>
      </div>

      {file.tooLarge ? (
        <div className="repo-empty-block">
          <p>This file is {formatBytes(file.size)}, too large to display here.</p>
          <a className="repo-action-btn" href={rawUrl}>Open raw file</a>
        </div>
      ) : file.isBinary || file.text === null ? (
        <div className="repo-empty-block">
          <p>Binary file, cannot preview in the browser.</p>
          <a className="repo-action-btn" href={rawUrl}>Download {file.name}</a>
        </div>
      ) : (
        <pre className="repo-code">
          {file.text.split("\n").map((line, i) => (
            <div key={i} className="repo-code__line">
              <span className="repo-code__lineno" aria-hidden="true">{i + 1}</span>
              <span className="repo-code__text">{line || " "}</span>
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}

/* Commits tab */

export async function CommitsTab({
  source,
  repoName,
  refName,
  page,
  absHref,
  now,
}: {
  source: GitSource;
  repoName: string;
  refName: string;
  page: number;
  absHref: HrefBuilder;
  now: number;
}) {
  const { commits, hasMore, page: currentPage } = await getCommits(source, repoName, refName, page);

  return (
    <div>
      <div className="repo-path-bar">
        <span className="repo-path-bar__title">commit history</span>
        <span className="repo-path-bar__ref">@ {refName} · page {currentPage}</span>
      </div>

      {commits.length === 0 ? (
        <div className="repo-empty-block">
          <p>No commits found on <code>{refName}</code>.</p>
        </div>
      ) : (
        <ul className="repo-commits">
          {commits.map((commit) => (
            <li key={`${commit.shortId}-${commit.authoredAt}`} className="repo-commit">
              <div className="repo-commit__main">
                <a href={commit.url} target="_blank" rel="noreferrer" className="repo-commit__title">
                  {commit.title}
                </a>
                <span className="repo-commit__meta">
                  {commit.authorName} · {commit.authoredAt ? relTime(commit.authoredAt, now) : "unknown date"}
                </span>
              </div>
              <code className="repo-commit__sha">{commit.shortId}</code>
            </li>
          ))}
        </ul>
      )}

      <div className="repo-pagination">
        {currentPage > 1 ? (
          <Link className="repo-action-btn" href={absHref("commits", "", refName, currentPage - 1)}>Newer</Link>
        ) : (
          <span />
        )}
        {hasMore && (
          <Link className="repo-action-btn" href={absHref("commits", "", refName, currentPage + 1)}>Older</Link>
        )}
      </div>
    </div>
  );
}

/* Branches & tags tab */

export function BranchesTab({
  branches,
  tags,
  refName,
  absHref,
}: {
  branches: BranchEntry[];
  tags: TagEntry[];
  refName: string;
  absHref: HrefBuilder;
}) {
  return (
    <div className="repo-branches-grid">
      <div className="repo-branches-col">
        <h2 className="repo-branches-title">Branches ({branches.length})</h2>
        {branches.length === 0 ? (
          <p className="repo-empty-block__hint">No branches reported.</p>
        ) : (
          <ul className="repo-ref-list">
            {branches.map((branch) => (
              <li key={branch.name} className="repo-ref-row">
                <Link href={absHref("files", "", branch.name)} className="repo-ref-name">
                  {branch.name}
                </Link>
                {branch.isDefault && <span className="repo-tag repo-tag--default">default</span>}
                {branch.name === refName && !branch.isDefault && <span className="repo-tag">current</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="repo-branches-col">
        <h2 className="repo-branches-title">Tags ({tags.length})</h2>
        {tags.length === 0 ? (
          <p className="repo-empty-block__hint">No tags yet.</p>
        ) : (
          <ul className="repo-ref-list">
            {tags.map((tag) => (
              <li key={tag.name} className="repo-ref-row">
                <Link href={absHref("files", "", tag.name)} className="repo-ref-name">
                  {tag.name}
                </Link>
                {tag.name === refName && <span className="repo-tag">current</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
