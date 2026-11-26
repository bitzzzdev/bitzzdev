import { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { getGalleryImages, getGalleryCategories } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Gallery | Dev Borah',
  description: 'A curated gallery of screenshots, diagrams, and visual work from projects and experiments.',
  alternates: { canonical: 'https://bitz.is-a.dev/gallery' },
  openGraph: {
    type: 'website',
    url: 'https://bitz.is-a.dev/gallery',
    siteName: 'Bitz: Dev Borah',
    title: 'Gallery | Dev Borah',
    description: 'Screenshots, diagrams, and visual work from projects and experiments.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery | Dev Borah',
    description: 'A curated gallery of visual work from projects and experiments.',
  },
};

export default function GalleryPage() {
  const images = getGalleryImages();
  const categories = getGalleryCategories();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ImageGallery',
        '@id': 'https://bitz.is-a.dev/gallery#gallery',
        name: 'Gallery',
        description: 'A curated gallery of screenshots, diagrams, and visual work from projects and experiments.',
        image: images.map(img => `https://bitz.is-a.dev/gallery/${img.filename}`),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bitz.is-a.dev' },
          { '@type': 'ListItem', position: 2, name: 'Gallery', item: 'https://bitz.is-a.dev/gallery' },
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
        <section className="am-section gallery-page" aria-labelledby="gallery-heading">
          <div className="am-inner">
            <div className="am-section-head">
              <span className="am-eyebrow">/VISUAL</span>
              <h1 className="am-h2" id="gallery-heading">Gallery</h1>
              <p className="am-desc">
                Screenshots, diagrams, architecture sketches, and visual artifacts from projects and experiments.
                {images.length} images across {categories.length} categories.
              </p>
            </div>

            {categories.length > 0 && (
              <div className="gallery-categories" aria-label="Filter by category">
                <button
                  className="gallery-category active"
                  data-category="all"
                >
                  All ({images.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className="gallery-category"
                    data-category={cat.name}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
            )}

            {images.length === 0 ? (
              <div className="gallery-empty">
                <p>No images yet. Upload some from the <a href="/dashboard">dashboard</a>.</p>
              </div>
            ) : (
              <div className="gallery-grid" role="list">
                {images.map((img) => (
                  <figure
                    key={img.filename}
                    className="gallery-item"
                    data-category={img.category.toLowerCase()}
                    role="listitem"
                  >
                    <a
                      href={`/gallery/${img.filename}`}
                      className="gallery-link"
                      aria-label={`View ${img.title}`}
                    >
                      <img
                        src={`/gallery/${img.filename}`}
                        alt={img.title}
                        loading="lazy"
                        className="gallery-image"
                      />
                      <figcaption className="gallery-caption">
                        <span className="gallery-title">{img.title}</span>
                        {img.description && <span className="gallery-desc">{img.description}</span>}
                        <span className="gallery-meta">
                          <span className="gallery-category-tag">{img.category}</span>
                          <time dateTime={img.date}>{new Date(img.date).toLocaleDateString()}</time>
                        </span>
                      </figcaption>
                    </a>
                  </figure>
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
              const buttons = document.querySelectorAll('.gallery-category');
              const items = document.querySelectorAll('.gallery-item');
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
