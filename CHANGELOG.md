# Changelog

All notable changes to this project are documented in this file.
The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [Unreleased]

### Added
- Added `/repos`: a live index of every public repository served from GitHub with automatic fallback to GitLab when the GitHub account is unavailable, with search, tag filters, and per-card name, description, and tags.
- Added a full in-browser git environment at `/repos/[repo]`: rendered README (GFM), browsable file tree, text file viewer with line numbers, commit history with pagination, and a branches and tags view, all in the portfolio's Paper Mono aesthetic.
- Added a cached snapshot of the public GitLab namespace (captured 2026-11-12) used only when both hosts are unreachable or rate limited, so the repository index never renders empty.
- Added `/api/repos/curated` route feeding the homepage work grid from the same unified data layer.
- Added per-repo metadata (title, description, canonical URL, Open Graph) and sitemap entries for `/repos` and every public repository.
- Added `Repos` links to the header navigation, footer, and the homepage selected work section.
- Added `dual-git-sync` personal skill under `skills/dual-git-sync/` codifying automated dual remote pushes, dual CI/CD pipeline parity across GitHub and GitLab, and full source references.
- Added explicit GitLab repository reference links alongside GitHub links across all indexed repositories in README.
- Added GitLab profile links to the README header, repository browse links, connect section, site dossier, footer, and Schema.org sameAs graph.
- Added GitLab clone instructions to the local setup section.
- Added a GitLab CI pipeline mirroring the GitHub build verification.
- Added Azure VPS and Firebase to the Technical Stack dossier and technical competencies.
- Added Azure and Firebase SVG icons and shields badges.
- Added third-party open-source attribution in CREDITS.md.
- Added local setup, installation, and run instructions to README.
- Added Ko-fi and Reddit socials to profile README, Schema.org sameAs graph, and footer navigation.
- Added complete repository directory indexing systems tools, desktop customization, and Minecraft mods.
- Added Rust to technical language competencies and quick info dossier.
- Added CircleCI icon to technical stack and dark-mode icon variants for javascript, linux, and bash in the skills list.
- Added procedural GitHub activity banner powered by git-tulkun to profile README.
- Added tulkun GitHub Actions workflow and automated CI build verification.
- Added MIT License, Contributing Guide, Code of Conduct, and Security Policy.
- Added a custom themed dropdown component (`components/ThemedSelect.tsx`) used for the branch picker on repository pages and the project type field, replacing every native browser select with a keyboard-navigable Paper Mono listbox.
- Added a Vercel preview deployment requirement to the dual-git-sync skill: every push that updates `dev` or `preview` also gets a preview deployment of the exact pushed commit, with the stable dev alias `bitzzzdev.vercel.app` repointed to it, and the production branch untouched unless the user explicitly authorizes a release.
- Added dynamic per-page Open Graph images (1200x630) for `/repos` and every `/repos/<repo>` page, generated at build/request time from the repository name and site brand text; query parameters never reach the image.
- Added page-specific structured data on `/repos` (CollectionPage, ItemList of all repositories, BreadcrumbList) and on each `/repos/<repo>` page (SoftwareSourceCode with both GitHub and GitLab repository URLs, BreadcrumbList), on top of the global Person/Brand/WebSite/ProfilePage graph.
- Added Twitter card metadata (`summary_large_image`) to repository detail pages; X/Twitter falls back to the new Open Graph images.
- Added image entries for `/repos` and every public repository to the sitemap, pointing at each page's Open Graph image.

### Removed
- Removed the unreferenced duplicate `public/tulkun.gif` (the README profile keeps `assets/tulkun.gif`).

### Changed
- Homepage work grid cards now open the in-site repository explorer instead of external GitHub URLs, keeping the flagged GitHub account from breaking project links.
- Homepage and `/repos` now share one data layer (`lib/repos.ts`) that prefers GitHub and falls back to GitLab for repository metadata, README, tree, file, commit, branch, and tag data.
- Updated technical stack categories to include a dedicated cloud and infrastructure section.
- Synchronized Schema.org knowsAbout graph with Azure VPS, Microsoft Azure, and Firebase.
- Refined portfolio bio, service descriptions, and performance benchmarks to reflect cloud infrastructure workflows.
- Updated profile metadata, titles, and schema graphs to optimize Google search discovery for Dev Borah, bitzzdev, and bitz.dev.
- Reordered featured projects to highlight DEVos, quickShelf, devSubstrate, devLauncher, bitzdots, and oha.
- Synchronized Schema.org creator and knowsAbout graph to reflect new projects and Rust competency.
- Replaced em dashes and legacy punctuation in documentation with human-writing standards.
- The portrait image (`me.png`, 1.8 MB) is now served from the free Vercel Blob CDN instead of the git repository, shrinking clone size and bandwidth on every build.
- Every query-parameter variant of a repository page (`?tab=`, `?path=`, `?ref=`, `?page=`) declares the same `rel=canonical` to its base URL, so search engines consolidate ranking signals on the canonical page instead of indexing duplicates; parameters also never reach the Open Graph image.

### Fixed
- Fixed skill icons disappearing on the dark theme: the SVG icons for Fish, CircleCI, Zed and GitHub fill with `currentColor`, which `<img>` cannot resolve, so they rendered black on dark backgrounds. All four now ship dark variants shown only under `[data-theme='dark']`, joined by working Linux, JavaScript and Bash variants. CircleCI keeps its brand orange artwork, re-shaded per theme for contrast.
- Fixed the repository tab bar (Overview, Files, Commits, Branches & Tags) showing a vertical scrollbar; `overflow-y` is now pinned to `hidden` because `overflow-x: auto` silently promotes the vertical axis to `auto`.
- Fixed procedural activity banner image reference and linked followers, repos, and views badges in profile README.
- Removed incorrect name alias from Schema.org metadata and repository topic tags.

## [1.0.0] - 2026-10-30

### Added
- Production-ready personal developer portfolio and web platform for Dev Borah.
- Modern Next.js interface with PaperMono typography and theme toggle.
- Interactive ASCII scenes and halftone portrait reveal.
- Schema.org structured data graph for Person, Brand, WebSite, and ProfilePage entities.
