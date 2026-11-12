---
name: dual-git-sync
description: Enforces continuous dual-remote synchronization across GitHub and GitLab for bitzzdev repositories. Guides agents to always maintain references to both GitHub and GitLab profile/repository sources, configure dual push URLs on remotes, maintain dual CI/CD pipelines (.github/workflows and .gitlab-ci.yml), and push to both remotes respecting all installed skills.
---

# Dual Git Sync

This skill establishes persistent operational guidelines for managing repositories across GitHub and GitLab for the developer bitzzdev.

## Identity and Profiles

- **Developer / Maintainer**: Dev Borah (online alias `bitzzdev`, `bitz.dev`)
- **GitHub Profile**: https://github.com/bitzzdev
- **GitLab Profile**: https://gitlab.com/bitzzdev

All repositories in the bitzzdev ecosystem exist on both platforms. Agents must always reference both GitHub and GitLab sources when writing documentation, guides, clone snippets, badges, and metadata.

## Core Rules

1. **Dual Remote Configuration**:
   - Every local git repository must have both remotes defined:
     - `origin` pointing to the GitHub repository URL (`git@github.com:bitzzdev/<repo>.git` or HTTPS equivalent)
     - `gitlab` pointing to the GitLab repository URL (`git@gitlab.com:bitzzdev/<repo>.git` or HTTPS equivalent)
   - To guarantee synchronized pushes, `remote.origin.pushurl` should contain both the GitHub URL and the GitLab URL:
     ```bash
     git config --unset-all remote.origin.pushurl
     git config --add remote.origin.pushurl git@github.com:bitzzdev/<repo>.git
     git config --add remote.origin.pushurl git@gitlab.com:bitzzdev/<repo>.git
     ```
   - Running `git push origin <branch>` will immediately transmit commits to both GitHub and GitLab.

2. **Dual CI/CD Pipelines**:
   - Every repository maintains active continuous integration pipelines on both platforms:
     - GitHub Actions: `.github/workflows/` (e.g. `ci.yml`)
     - GitLab CI: `.gitlab-ci.yml`
   - Any pipeline changes, test additions, or build steps added to GitHub Actions must have equivalent representation in `.gitlab-ci.yml`, and vice-versa.
   - Pushes must pass CI on both systems before declaring work complete.

3. **Documentation and Source References**:
   - Any reference to repository sources in `README.md`, `CONTRIBUTING.md`, or architecture docs must reference both platforms:
     - GitHub URL: `https://github.com/bitzzdev/<repo>`
     - GitLab URL: `https://gitlab.com/bitzzdev/<repo>`
   - Provide dual clone instructions and dual raw download URLs (e.g. `raw.githubusercontent.com` and `gitlab.com/.../-/raw`) where applicable.

4. **Vercel Preview Deployments**:
   - Every push that updates `dev` (and fast-forwards `preview`) is also deployed to Vercel as a preview deployment (`vercel deploy`), never with `--prod` unless the user explicitly authorizes a production release.
   - The preview deployment is created for the exact commit being reported, checked until it reaches `READY`, and the resulting preview URL is reported to the user.
   - Preview deployments are behind Vercel Deployment Protection (SSO); state that when reporting the URL.
   - Production (`bitz.is-a.dev`, branch `ascii`, or `vercel deploy --prod`) is never promoted without a green CI run on the exact commit, or explicit user authorization.

5. **Integration with Installed Skills**:
   - **production-ready**: Maintain dev/main branch flow, verify CI/CD before production deployment, audit credentials, and adhere to clean documentation standards.
   - **context-rich-commits**: Structure commit messages with context, decisions, and verification steps; push to both remotes.
   - **credential-safety**: Never commit API keys or private tokens to either remote.
   - **human-writing**: Keep docs, instructions, and commit messages clean, concise, human, and free of em dashes or unnecessary emoji.
