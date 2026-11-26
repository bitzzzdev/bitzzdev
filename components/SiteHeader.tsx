import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Shared site header matching the portfolio homepage.
 * `base` prefixes in-page anchor links, so the header works from subpages
 * ("/#work") as well as from the homepage itself ("" or "#work").
 */
export default function SiteHeader({ base = "/" }: { base?: string }) {
  const anchor = (id: string) => (base === "" ? `#${id}` : `${base}#${id}`);

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link className="nav__brand" href="/" aria-label="bitz.is-a.dev, home">
          bitz.is-a.dev
        </Link>

        <nav className="nav__links" aria-label="Primary">
          <a href={anchor("work")}>Work</a>
          <a href={anchor("about")}>About</a>
          <Link href="/repos">Repos</Link>
          <Link href="/xeh">XEH</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/writings">Writings</Link>
          <a href={anchor("contact")}>Contact</a>
        </nav>

        <div className="nav__actions">
          <ThemeToggle />
          <div className="nav__cta">
            <span className="nav__cta-tab" aria-hidden="true" />
            <a className="nav__cta-btn" href={anchor("contact")}>
              Transmit
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
