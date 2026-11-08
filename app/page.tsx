import { getPublicRepos } from "@/lib/github";
import AsciiWorkGrid from "@/components/AsciiWorkGrid";
import ThemeToggle from "@/components/ThemeToggle";
import ContactForm from "@/components/ContactForm";
import CpuAsciiArt from "@/components/CpuAsciiArt";
import AboutHalftoneImage from "@/components/AboutHalftoneImage";
import MinimalSkillsList from "@/components/MinimalSkillsList";

export default async function Home() {
  const repos = await getPublicRepos();

  return (
    <>
      {/* Structural side rails (faint vertical lines that run the full page height) */}
      <div className="rails" aria-hidden="true" />

      {/* Top status notification strip */}
      <div className="am-strip">
        <div className="am-strip__inner">
          <div>
            <span className="am-strip__tag">Status</span>
            <span>Open for freelance contracts, fullstack web applications, and systems design</span>
          </div>
          <a className="am-strip__cta" href="#contact">
            Initiate contact &rarr;
          </a>
        </div>
      </div>

      {/* Navigation header */}
      <header className="nav">
        <div className="nav__inner">
          <a className="nav__brand" href="/" aria-label="bitz.is-a.dev, home">
            bitz.is-a.dev
          </a>

          <nav className="nav__links" aria-label="Primary">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#process">Process</a>
            <a href="#metrics">Benchmarks</a>
            <a href="#testimonials">Feedback</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="nav__actions">
            <ThemeToggle />
            <div className="nav__cta">
              <span className="nav__cta-tab" aria-hidden="true" />
              <a className="nav__cta-btn" href="#contact">
                Transmit
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="hero" id="top">
          <div className="hero__wrap">
            <div className="hero__slider-frame">
              <span className="hero__label">Selected scene / kyoto dusk</span>
              <CpuAsciiArt />
            </div>

            <div className="hero__textrow">
              <div>
                <h1 className="hero__title">
                  Dev Borah (Bitupan Borah), Software &amp; Web Developer
                </h1>
                <p className="hero__subtitle">
                  Great founders changing the world deserve a digital presence as powerful as what they&apos;re building.
                  I engineer highly-optimized, pixel-perfect freelance web solutions: speed-obsessed development designed to scale businesses,
                  connect services, and convert users. No noise, no bloat. Just exceptional code that loads in milliseconds.
                </p>
              </div>

              <div className="hero__ctas">
                <a className="hero__cta-primary" href="#contact">
                  <span className="hero__cta-primary-label">Transmit terminal</span>
                </a>
                <a className="hero__cta-secondary" href="#work">
                  Explore work
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Selected work section */}
        <section className="am-section" id="work" aria-labelledby="work-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">Portfolio</span>
              <h2 className="am-h2" id="work-heading">Selected projects ({repos.length})</h2>
              <p className="am-desc">Featured open-source repositories and production web platforms.</p>
            </div>
            <AsciiWorkGrid initialRepos={repos} />
          </div>
        </section>

        {/* About section */}
        <section className="am-section" id="about" aria-labelledby="about-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">Identity</span>
              <h2 className="am-h2" id="about-heading">About the developer</h2>
              <p className="am-desc">Origin, technical philosophy, and verifiable creator dossier.</p>
            </div>

            <div className="about-grid">
              <div className="about-bio">
                <p>
                  Hey, I&apos;m Dev Borah (legally Bitupan Borah, known online as @bitz.dev and @bitzzdev). Honestly, I became a developer because I just really love computer stuff.
                  Ever since I first touched a computer, tinkering with software, understanding how systems work under the hood,
                  and building open-source projects from scratch has been what excites me every day. That&apos;s the simple truth.
                </p>
                <p>
                  I love clean code, lightning-fast interfaces, and getting rid of unnecessary bloat. Whether it&apos;s
                  crafting responsive web applications, designing developer tools, or optimizing performance so things load instantly,
                  I treat every project as something to build with genuine care, technical discipline, and craft.
                </p>
                <p style={{ color: "var(--text-50)", fontSize: "14px", marginTop: "24px" }}>
                  Based in Assam, India. Open for collaboration, open-source work, freelance contracts, and software engineering worldwide.
                </p>
              </div>

              <div>
                <AboutHalftoneImage />
              </div>
            </div>

            <div className="dossier-wrap">
              <p className="dossier-lead">
                <strong>Dev Borah</strong> (legal identity: <em>Bitupan Borah</em>) is a software developer and open-source creator from Lakhimpur, Assam, India. Dedicated to low-latency web platforms, Linux tooling, and systems programming.
              </p>

              <div className="dossier-grid">
                <div className="dossier-item">
                  <span className="dossier-label">Primary Name</span>
                  <span className="dossier-val">Dev Borah</span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-label">Legal Name</span>
                  <span className="dossier-val">Bitupan Borah</span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-label">Location</span>
                  <span className="dossier-val">Lakhimpur, Assam, India</span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-label">Date of Birth</span>
                  <span className="dossier-val">Aug 25, 2008 (25/08/2008)</span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-label">GitHub</span>
                  <span className="dossier-val">
                    <a href="https://github.com/bitzzdev" target="_blank" rel="noreferrer">@bitzzdev</a>
                  </span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-label">X / Twitter</span>
                  <span className="dossier-val">
                    <a href="https://x.com/bitzzdev" target="_blank" rel="noreferrer">@bitzzdev</a>
                  </span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-label">LinkedIn</span>
                  <span className="dossier-val">
                    <a href="https://www.linkedin.com/in/bitzzdev/" target="_blank" rel="noreferrer">bitzzdev</a>
                  </span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-label">ORCID</span>
                  <span className="dossier-val">
                    <a href="https://orcid.org/0009-0004-2013-2999" target="_blank" rel="noreferrer">0009-0004-2013-2999</a>
                  </span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-label">Instagram</span>
                  <span className="dossier-val">
                    <a href="https://instagram.com/bitz.dev" target="_blank" rel="noreferrer">@bitz.dev</a>
                  </span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-label">Canonical Web</span>
                  <span className="dossier-val">
                    <a href="https://bitz.is-a.dev">bitz.is-a.dev</a>
                  </span>
                </div>
              </div>

              <div className="dossier-edu">
                <span className="dossier-label">Academic Path</span>
                <div className="edu-entry">
                  <span className="edu-badge">Completed Feb 2026</span>
                  <span>High School &mdash; Lakhimpur, Assam, India</span>
                </div>
                <div className="edu-entry">
                  <span className="edu-badge">Current Status</span>
                  <span>Higher Secondary with Computer Science (CS) &mdash; Lakhimpur, Assam</span>
                </div>
              </div>

              <MinimalSkillsList />
            </div>
          </div>
        </section>

        {/* Services section */}
        <section className="am-section" id="services" aria-labelledby="services-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">Capabilities</span>
              <h2 className="am-h2" id="services-heading">Services &amp; capabilities</h2>
              <p className="am-desc">Direct technical offerings engineered for fast turnarounds and durability.</p>
            </div>

            <div className="am-flow">
              <div className="am-flow-row">
                <span className="am-flow-num">01</span>
                <span className="am-flow-title">Custom Web Applications</span>
                <p className="am-flow-desc">
                  Interactive Single Page Applications &amp; fullstack platforms tailored with modern JavaScript ecosystems.
                  Engineered for speed, durability, and fault tolerance.
                </p>
              </div>

              <div className="am-flow-row">
                <span className="am-flow-num">02</span>
                <span className="am-flow-title">UI/UX Systems &amp; Interfaces</span>
                <p className="am-flow-desc">
                  Responsive architectures with fluid ergonomics, cohesive color systems, and optimal conversion journeys.
                  Crafted with attention to micro-interactions and accessibility.
                </p>
              </div>

              <div className="am-flow-row">
                <span className="am-flow-num">03</span>
                <span className="am-flow-title">Performance &amp; SEO Auditing</span>
                <p className="am-flow-desc">
                  Eliminating script bloat and optimizing network waterfalls. Thorough Core Web Vital compliance
                  to rank your services at the top of search indexes and guarantee sub-second load times.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process section */}
        <section className="am-section" id="process" aria-labelledby="process-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">Methodology</span>
              <h2 className="am-h2" id="process-heading">How we build together</h2>
              <p className="am-desc">Three structured phases to go from blueprint to deployment.</p>
            </div>

            <div className="am-flow">
              <div className="am-flow-row">
                <span className="am-flow-num">01</span>
                <span className="am-flow-title">Discovery</span>
                <p className="am-flow-desc">
                  We review your brand, audience, and architectural goals to understand what makes your solution unique
                  and how to position you for lasting defensibility.
                </p>
              </div>

              <div className="am-flow-row">
                <span className="am-flow-num">02</span>
                <span className="am-flow-title">Strategy</span>
                <p className="am-flow-desc">
                  We craft a concise technical roadmap aligning your digital interface with business targets,
                  ensuring every engineering decision directly compounds revenue and performance.
                </p>
              </div>

              <div className="am-flow-row">
                <span className="am-flow-num">03</span>
                <span className="am-flow-title">Execution</span>
                <p className="am-flow-desc">
                  We build with absolute precision, combining clean and tested code with thoughtful design
                  to deploy experiences that impress and convert.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benchmarks section */}
        <section className="am-section" id="metrics" aria-labelledby="metrics-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">Verification</span>
              <h2 className="am-h2" id="metrics-heading">Performance benchmarks</h2>
              <p className="am-desc">Empirical standards upheld across production deployments.</p>
            </div>

            <div className="am-table-wrap">
              <table className="am-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Benchmark</th>
                    <th>Engineering Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Satisfaction</td>
                    <td>100%</td>
                    <td>Dedicated high-end support and precise engineering.</td>
                  </tr>
                  <tr>
                    <td>Deployments</td>
                    <td>40+</td>
                    <td>From high-performance SaaS platforms to custom commerce architectures.</td>
                  </tr>
                  <tr>
                    <td>Load Speed</td>
                    <td>3x Boost</td>
                    <td>Lightweight build tooling, code splitting, zero excess dependency trees.</td>
                  </tr>
                  <tr>
                    <td>Uptime &amp; Support</td>
                    <td>24/7</td>
                    <td>Direct communication channels, rapid iteration cycles.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section className="am-section" id="testimonials" aria-labelledby="feedback-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">Citations</span>
              <h2 className="am-h2" id="feedback-heading">Client feedback</h2>
              <p className="am-desc">Verified commentary from collaborators and founders.</p>
            </div>

            <div className="am-quotes-grid">
              <div className="am-quote-card">
                <p>
                  &ldquo;Dev&apos;s work was exceptional. He rewrote our entire web interface using custom-tailored elements.
                  Our loading speeds went from 4.2 seconds to under 0.8 seconds, and organic checkouts spiked by 35% within the first month itself.&rdquo;
                </p>
                <div className="quote-author">Johnathan S., SaaS Founder, Austin TX</div>
              </div>

              <div className="am-quote-card">
                <p>
                  &ldquo;The attention to detail is unmatched. Every pixel is in place, and the performance is breathtaking.
                  He didn&apos;t just build a site; he built a conversion engine for our agency.&rdquo;
                </p>
                <div className="quote-author">Sarah Chen, Creative Director, Tokyo</div>
              </div>

              <div className="am-quote-card">
                <p>
                  &ldquo;Professional, transparent, and incredibly fast. Dev delivered a complex dashboard architecture
                  in half the estimated time without compromising a single feature.&rdquo;
                </p>
                <div className="quote-author">Marcus Thorne, CTO, FinTech Global</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact transmission terminal */}
        <section className="am-section" id="contact" aria-labelledby="contact-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">Dispatch</span>
              <h2 className="am-h2" id="contact-heading">Transmission terminal</h2>
              <p className="am-desc">Direct line for contracts, audits, and engineering partnerships.</p>
            </div>

            <div className="am-contact-box">
              <p className="am-contact-intro">
                Have a project in mind, an existing codebase in need of optimization, or a contract to discuss?
                Transmit your briefing below or ping directly at <a href="mailto:bitzzdev@gmail.com">bitzzdev@gmail.com</a>.
              </p>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="am-footer">
        <div className="am-footer-inner">
          <div>
            &copy; {new Date().getFullYear()} bitz.is-a.dev. Handcrafted in India. All rights reserved.
          </div>
          <div className="am-footer-links">
            <a href="https://github.com/bitzzdev" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://x.com/bitzzdev" target="_blank" rel="noreferrer">X (Twitter)</a>
            <a href="https://www.linkedin.com/in/bitzzdev/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://orcid.org/0009-0004-2013-2999" target="_blank" rel="noreferrer">ORCID</a>
            <a href="mailto:bitzzdev@gmail.com">Email</a>
            <a href="https://instagram.com/bitz.dev" target="_blank" rel="noreferrer">Instagram</a>
            <a href="#top">Top &uarr;</a>
          </div>
        </div>
      </footer>
    </>
  );
}
