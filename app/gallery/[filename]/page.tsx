import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { getGalleryImage, getGalleryImages } from '@/lib/content';

interface GalleryImagePageProps {
  params: Promise<{ filename: string }>;
}

export async function generateStaticParams() {
  const images = getGalleryImages();
  return images.map((img) => ({ filename: img.filename }));
}

export async function generateMetadata({ params }: GalleryImagePageProps): Promise<Metadata> {
  const { filename } = await params;
  const image = getGalleryImage(filename);

  if (!image) {
    return { title: 'Not Found' };
  }

  return {
    title: `${image.title} | Gallery`,
    description: image.description || `View ${image.title} in the gallery.`,
    alternates: { canonical: `https://bitz.is-a.dev/gallery/${filename}` },
    openGraph: {
      type: 'website',
      url: `https://bitz.is-a.dev/gallery/${filename}`,
      siteName: 'Bitz: Dev Borah',
      title: image.title,
      description: image.description || `View ${image.title} in the gallery.`,
      images: [`https://bitz.is-a.dev/gallery/${filename}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: image.title,
      description: image.description || `View ${image.title} in the gallery.`,
      images: [`https://bitz.is-a.dev/gallery/${filename}`],
    },
  };
}

export default async function GalleryImagePage({ params }: GalleryImagePageProps) {
  const { filename } = await params;
  const image = getGalleryImage(filename);

  if (!image) {
    notFound();
  }

  const allImages = getGalleryImages();
  const currentIndex = allImages.findIndex(img => img.filename === filename);
  const prevImage = currentIndex > 0 ? allImages[currentIndex - 1] : null;
  const nextImage = currentIndex < allImages.length - 1 ? allImages[currentIndex + 1] : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ImageObject',
        '@id': `https://bitz.is-a.dev/gallery/${filename}#image`,
        name: image.title,
        description: image.description,
        contentUrl: `https://bitz.is-a.dev/gallery/${filename}`,
        datePublished: image.date,
        keywords: image.tags.join(', '),
        category: image.category,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bitz.is-a.dev' },
          { '@type': 'ListItem', position: 2, name: 'Gallery', item: 'https://bitz.is-a.dev/gallery' },
          { '@type': 'ListItem', position: 3, name: image.title, item: `https://bitz.is-a.dev/gallery/${filename}` },
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
        <section className="am-section gallery-image-page" aria-labelledby="image-title">
          <div className="am-inner">
            <nav className="gallery-nav" aria-label="Gallery navigation">
              <Link href="/gallery" className="gallery-back">
                ← Back to Gallery
              </Link>
              <div className="gallery-pager">
                {prevImage && (
                  <Link href={`/gallery/${prevImage.filename}`} className="gallery-prev" aria-label={`Previous: ${prevImage.title}`}>
                    ← Prev
                  </Link>
                )}
                {nextImage && (
                  <Link href={`/gallery/${nextImage.filename}`} className="gallery-next" aria-label={`Next: ${nextImage.title}`}>
                    Next →
                  </Link>
                )}
              </div>
            </nav>

            <article className="gallery-image-article">
              <header className="gallery-image-header">
                <span className="gallery-image-category">{image.category}</span>
                <h1 id="image-title" className="gallery-image-title">{image.title}</h1>
                {image.description && <p className="gallery-image-desc">{image.description}</p>}
                <div className="gallery-image-meta">
                  <time dateTime={image.date}>{new Date(image.date).toLocaleDateString()}</time>
                  {image.tags.length > 0 && (
                    <div className="gallery-image-tags">
                      {image.tags.map(tag => (
                        <span key={tag} className="repo-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </header>

              <figure className="gallery-image-figure">
                <img
                  src={`/gallery/${filename}`}
                  alt={image.title}
                  className="gallery-image-main"
                />
              </figure>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}