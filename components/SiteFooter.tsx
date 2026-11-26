import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="am-footer">
      <div className="am-footer-inner">
        <div>
          &copy; {new Date().getFullYear()} bitz.is-a.dev. Handcrafted in India. All rights reserved.
        </div>
        <div className="am-footer-links">
          <Link href="/repos">Repos</Link>
          <Link href="/xeh">XEH</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/writings">Writings</Link>
          <a href="https://github.com/bitzzdev" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://gitlab.com/bitzzdev" target="_blank" rel="noreferrer">GitLab</a>
          <a href="https://ko-fi.com/bitzzdev" target="_blank" rel="noreferrer">Ko-fi</a>
          <a href="https://www.reddit.com/user/bitzzdev/" target="_blank" rel="noreferrer">Reddit</a>
          <a href="https://x.com/bitzzdev" target="_blank" rel="noreferrer">X (Twitter)</a>
          <a href="https://www.linkedin.com/in/bitzzdev/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://orcid.org/0009-0004-2013-2999" target="_blank" rel="noreferrer">ORCID</a>
          <a href="mailto:bitzzdev@gmail.com">Email</a>
          <a href="https://instagram.com/bitz.dev" target="_blank" rel="noreferrer">Instagram</a>
          <Link href="/#top">Top &uarr;</Link>
        </div>
      </div>
    </footer>
  );
}
