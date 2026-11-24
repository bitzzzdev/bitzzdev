import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import {
  xeh,
  xehTeam,
  xehProducts,
  xehFocus,
  xehPhilosophy,
  xehTech,
  xehStats,
} from "@/lib/xeh";

export const metadata: Metadata = {
  title: "XEH (XEHhq) | Independent open-source engineering organization",
  description:
    "XEH (XEHhq) is an independent open-source engineering organization building Linux tools, developer utilities, frontend systems, and practical software. Meet the team: Dev Borah (founder and lead developer), Biswajit Tanti (product lead and developer), and Abhilasha Ray (marketing head). Products: DEVdots and XEHkit.",
  alternates: { canonical: "https://bitz.is-a.dev/xeh" },
  openGraph: {
    type: "website",
    url: "https://bitz.is-a.dev/xeh",
    siteName: "Bitz: Dev Borah",
    title: "XEH (XEHhq) | Independent open-source engineering organization",
    description:
      "Linux tools, developer utilities, frontend systems, and practical software, built in the open. Team, products, focus areas, and engineering philosophy.",
  },
  twitter: {
    card: "summary_large_image",
    title: "XEH (XEHhq) | Independent open-source engineering organization",
    description:
      "An independent open-source engineering organization building Linux tools, developer utilities, frontend systems, and practical software.",
  },
};

export default function XehPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://bitz.is-a.dev/xeh#org",
        name: xeh.name,
        alternateName: "XEHhq",
        url: xeh.url,
        description: xeh.description,
        slogan: xeh.tagline,
        sameAs: [xeh.gitlab],
        contactPoint: {
          "@type": "ContactPoint",
          email: xeh.contactEmail,
          contactType: "general inquiries",
        },
        founder: {
          "@type": "Person",
          name: "Dev Borah",
          url: "https://bitz.is-a.dev/",
          jobTitle: "Founder and lead developer",
        },
        member: xehTeam.map((member) => ({
          "@type": "Person",
          name: member.name,
          jobTitle: member.role,
          url: member.href,
        })),
      },
      {
        "@type": "Person",
        "@id": "https://bitz.is-a.dev/#person",
        name: "Dev Borah",
        url: "https://bitz.is-a.dev/",
        jobTitle: "Founder and lead developer",
        worksFor: { "@id": "https://bitz.is-a.dev/xeh#org" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bitz.is-a.dev" },
          { "@type": "ListItem", position: 2, name: "XEH", item: "https://bitz.is-a.dev/xeh" },
        ],
      },
    ],
  };

  return (
    <>
      <div className="rails" aria-hidden="true" />
      <SiteHeader base="/" />

      <main>
        <JsonLd data={jsonLd} />

        <section className="am-section xeh-page" aria-labelledby="xeh-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">/NOW BUILDING</span>
              <h1 className="am-h2" id="xeh-heading">
                XEH (XEHhq)
              </h1>
              <p className="am-desc">
                {xeh.description} {xeh.tagline}
              </p>
              <div className="repos-source-links">
                <span className="repos-source-item">
                  <span className="repos-dot is-live" aria-hidden="true" />
                  <a href={xeh.url} target="_blank" rel="noreferrer">
                    xeh.devs.surf
                  </a>
                </span>
                <span className="repos-source-item">
                  <span className="repos-dot is-live" aria-hidden="true" />
                  <a href={xeh.gitlab} target="_blank" rel="noreferrer">
                    gitlab.com/xehhq
                  </a>
                </span>
                <span className="repos-source-item">
                  <span className="repos-dot is-live" aria-hidden="true" />
                  <a href={`mailto:${xeh.contactEmail}`}>{xeh.contactEmail}</a>
                </span>
              </div>
            </div>

            <p className="xeh-lead">
              I work with XEH as founder and lead developer. XEH is an independent open-source
              engineering organization. The work stays open so people can read it, fork it, and
              improve it. This page is the full dossier: the team, the products, the focus areas,
              and the engineering philosophy.
            </p>

            <h2 className="xeh-subhead">Team</h2>
            <div className="xeh-team-grid">
              {xehTeam.map((member) => (
                <div className="xeh-card" key={member.name}>
                  <span className="xeh-card__label">{member.label}</span>
                  <span className="xeh-card__name">{member.name}</span>
                  <span className="xeh-card__role">{member.role}</span>
                  <a
                    className="xeh-card__link"
                    href={member.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {member.hrefLabel}
                  </a>
                </div>
              ))}
            </div>

            <h2 className="xeh-subhead">Products</h2>
            <div className="xeh-product-grid">
              {xehProducts.map((product) => (
                <div className="xeh-product" key={product.name}>
                  <div className="xeh-product__top">
                    <span className="xeh-product__name">{product.name}</span>
                    <span className="xeh-product__status">{product.status}</span>
                  </div>
                  <p className="xeh-product__desc">{product.description}</p>
                  <a
                    className="xeh-card__link"
                    href={product.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {product.hrefLabel}
                  </a>
                </div>
              ))}
            </div>

            <h2 className="xeh-subhead">Focus areas</h2>
            <div className="am-flow">
              {xehFocus.map((area, i) => (
                <div className="am-flow-row" key={area.title}>
                  <span className="am-flow-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="am-flow-title">{area.title}</span>
                  <p className="am-flow-desc">{area.body}</p>
                </div>
              ))}
            </div>

            <h2 className="xeh-subhead">Engineering philosophy</h2>
            <div className="am-flow">
              {xehPhilosophy.map((item, i) => (
                <div className="am-flow-row" key={item.title}>
                  <span className="am-flow-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="am-flow-title">{item.title}</span>
                  <p className="am-flow-desc">{item.body}</p>
                </div>
              ))}
            </div>

            <h2 className="xeh-subhead">Technology</h2>
            <div className="repo-card__tags xeh-tech">
              {xehTech.map((tech) => (
                <span className="repo-tag" key={tech}>
                  {tech}
                </span>
              ))}
            </div>

            <h2 className="xeh-subhead">By the numbers</h2>
            <div className="dossier-grid">
              {xehStats.map((stat) => (
                <div className="dossier-item" key={stat.label}>
                  <span className="dossier-label">{stat.label}</span>
                  <span className="dossier-val">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="xeh-cta">
              <p>
                Read the work in the open, or start with the organization site.
              </p>
              <div className="hero__ctas">
                <a className="hero__cta-primary" href={xeh.url} target="_blank" rel="noreferrer">
                  <span className="hero__cta-primary-label">Visit xeh.devs.surf</span>
                </a>
                <a className="hero__cta-secondary" href={xeh.gitlab} target="_blank" rel="noreferrer">
                  GitLab group
                </a>
                <Link className="hero__cta-secondary" href="/repos">
                  Browse my repos
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}