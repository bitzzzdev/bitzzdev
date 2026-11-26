import { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { getWritingPosts, getWritingCategories } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Writings | Dev Borah',
  description: 'Technical writings, project postmortems, engineering notes, and thoughts on software development.',
  alternates: { canonical: 'https://bitz.is-a.dev/writings' },
  openGraph: {
    type: 'website',
    url: 'https://bitz.is-a.dev/writings',
    siteName: 'Bitz: Dev Borah',
    title: 'Writings | Dev Borah',
    description: 'Technical writings, project postmortems, engineering notes, and thoughts on software development.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Writings | Dev Borah',
    description: 'Technical writings, project postmortems, engineering notes, and thoughts on software development.',
  },
}

export default function WritingsPage() {
  const posts = getWritingPosts();
  const categories = getWritingCategories();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': 'https://bitz.is-a.dev/writings#blog',
        name: 'Writings',
        description: 'Technical writings, project postmortems, engineering notes, and thoughts on software development.',
        blogPosts: posts.map(post => ({
          '@type': 'BlogPosting',
          '@id': `https://bitz.is-a.dev/writings/${post.slug}#post`,
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          keywords: post.tags.join(', '),
          articleSection: post.category,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bitz.is-a.dev' },
          { '@type': 'ListItem', position: 2, name: 'Writings', item: 'https://bitz.is-a.dev/writings' },
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
        <section className="am-section writings-page" aria-labelledby="writings-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">/WRITINGS</span>
              <h1 className="am-h2" id="writings-heading">Writings</h1>
              <p className="am-desc">
                Technical writings, project postmortems, engineering notes, and thoughts on software development.
                {posts.length} posts across {categories.length} categories.
              </p>
            </div>

            {categories.length > 0 && (
              <div className="writings-categories" aria-label="Filter by category">
                <button
                  className="writings-category active"
                  data-category="all"
                  onClick={(e) => filterCategory(e, 'all')}
                >
                  All ({posts.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className="writings-category"
                    data-category={cat.name}
                    onClick={(e) => filterCategory(e, cat.name)}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
            )}

            {posts.length === 0 ? (
              <div className="writings-empty">
                <p>No writings yet. Create some from the <a href="/dashboard">dashboard</a>.</p>
              </div>
            ) : (
              <div className="writings-grid">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="writing-card"
                    data-category={post.category.toLowerCase()}
                  >
                    <div className="writing-card__meta">
                      <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                      <span className="writing-card__category">{post.category}</span>
                      {post.readingTime && <span className="writing-card__read-time">{post.readingTime}</span>}
                    </div>
                    <h2 className="writing-card__title">
                      <Link href={`/writings/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.description && <p className="writing-card__desc">{post.description}</p>}
                    {post.tags.length > 0 && (
                      <div className="writing-card__tags">
                        {post.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="repo-tag">{tag}</span>
                        ))}
                        {post.tags.length > 4 && <span className="repo-tag repo-tag--more">+{post.tags.length - 4}</span>}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const buttons = document.querySelectorAll('.writings-category');
              const items = document.querySelectorAll('.writing-card');
              function filterCategory(activeCategory) {
                buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.category === activeCategory));
                items.forEach(item => {
                  const cat = item.dataset.category;
                  item.style.display = (activeCategory === 'all' || cat === activeCategory) ? 'block' : 'none';
                });
              }
              buttons.forEach(btn => {
                btn.addEventListener('click', () => filterCategory(btn.dataset.category));
              });
            })();
          `,
        }}
      />
    </>
  );
}

function filterCategory(e: React.MouseEvent<HTMLButtonElement>, category: string) {
  // Handled by inline script
}