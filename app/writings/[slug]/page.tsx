import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { getWritingPost, getWritingPosts } from '@/lib/content';

interface WritingPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getWritingPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: WritingPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getWritingPost(slug);

  if (!post || !post.published) {
    return { title: 'Not Found' };
  }

  return {
    title: `${post.title} | Writings`,
    description: post.description || post.title,
    alternates: { canonical: `https://bitz.is-a.dev/writings/${slug}` },
    openGraph: {
      type: 'article',
      url: `https://bitz.is-a.dev/writings/${slug}`,
      siteName: 'Bitz: Dev Borah',
      title: post.title,
      description: post.description || post.title,
      publishedTime: post.date,
      authors: ['Dev Borah'],
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || post.title,
    },
    other: {
      'article:published_time': post.date,
      'article:author': 'Dev Borah',
      'article:section': post.category,
      'article:tag': post.tags.join(','),
    },
  };
}

export default async function WritingPostPage({ params }: WritingPostPageProps) {
  const { slug } = await params;
  const post = getWritingPost(slug);

  if (!post || !post.published) {
    notFound();
  }

  const allPosts = getWritingPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `https://bitz.is-a.dev/writings/${slug}#post`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          '@type': 'Person',
          name: 'Dev Borah',
          url: 'https://bitz.is-a.dev/',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Bitz',
          logo: {
            '@type': 'ImageObject',
            url: 'https://bitz.is-a.dev/favicon.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://bitz.is-a.dev/writings/${slug}`,
        },
        keywords: post.tags.join(', '),
        articleSection: post.category,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bitz.is-a.dev' },
          { '@type': 'ListItem', position: 2, name: 'Writings', item: 'https://bitz.is-a.dev/writings' },
          { '@type': 'ListItem', position: 3, name: post.title, item: `https://bitz.is-a.dev/writings/${slug}` },
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
        <section className="am-section writing-post-page" aria-labelledby="post-title">
          <div className="am-inner">
            <nav className="writing-nav" aria-label="Writing navigation">
              <Link href="/writings" className="writing-back">
                ← Back to Writings
              </Link>
              <div className="writing-pager">
                {prevPost && (
                  <Link href={`/writings/${prevPost.slug}`} className="writing-prev" aria-label={`Previous: ${prevPost.title}`}>
                    ← Prev
                  </Link>
                )}
                {nextPost && (
                  <Link href={`/writings/${nextPost.slug}`} className="writing-next" aria-label={`Next: ${nextPost.title}`}>
                    Next →
                  </Link>
                )}
              </div>
            </nav>

            <article className="writing-article">
              <header className="writing-header">
                <span className="writing-category">{post.category}</span>
                <h1 id="post-title" className="writing-title">{post.title}</h1>
                {post.description && <p className="writing-desc">{post.description}</p>}
                <div className="writing-meta">
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                  {post.readingTime && <span className="writing-read-time">{post.readingTime}</span>}
                  {post.tags.length > 0 && (
                    <div className="writing-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="repo-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </header>

              <div className="writing-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}