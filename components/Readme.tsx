import Markdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { rawBase, blobBase, type GitSource } from "@/lib/repos";

interface ReadmeProps {
  content: string;
  source: GitSource;
  repoName: string;
  refName: string;
}

export default function Readme({ content, source, repoName, refName }: ReadmeProps) {
  const raw = rawBase(source, repoName, refName);
  const blob = blobBase(source, repoName, refName);

  const resolve = (href: string, base: string): string => {
    if (!href) return href;
    if (/^(https?:|data:|mailto:|tel:|#)/i.test(href)) return href;
    if (href.startsWith("//")) return `https:${href}`;
    const clean = href.replace(/^\.\//, "").replace(/^\/+/, "");
    return base + clean;
  };

  const urlTransform = (url: string) => {
    const safe = defaultUrlTransform(url);
    return safe.startsWith("/") ? safe.replace(/^\/+/, "") : safe;
  };

  return (
    <div className="repo-readme">
      <Markdown
        remarkPlugins={[remarkGfm]}
        urlTransform={urlTransform}
        components={{
          a: ({ href, children, ...rest }) => (
            <a
              {...rest}
              href={href ? resolve(href, blob) : href}
              target={href && /^https?:/i.test(href) ? "_blank" : undefined}
              rel={href && /^https?:/i.test(href) ? "noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...rest }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...rest} src={src ? resolve(String(src), raw) : src} alt={alt ?? ""} loading="lazy" />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
