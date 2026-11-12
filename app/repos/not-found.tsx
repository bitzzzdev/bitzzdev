import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function ReposNotFound() {
  return (
    <>
      <div className="rails" aria-hidden="true" />
      <SiteHeader base="/" />
      <main>
        <section className="am-section" aria-labelledby="repos-404">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">/404</span>
              <h1 className="am-h2" id="repos-404">Repository not found</h1>
              <p className="am-desc">
                That repository does not exist on either GitHub or GitLab, or it is private.
                Check the listing for everything that is public.
              </p>
              <div className="repos-source-links">
                <Link className="repo-action-btn" href="/repos">Browse all repositories →</Link>
                <a className="repo-action-btn" href="https://github.com/bitzzdev" target="_blank" rel="noreferrer">github.com/bitzzdev ↗</a>
                <a className="repo-action-btn" href="https://gitlab.com/bitzzdev" target="_blank" rel="noreferrer">gitlab.com/bitzzdev ↗</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
