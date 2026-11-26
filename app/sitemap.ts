import type { MetadataRoute } from "next";
import { getAllRepos } from "@/lib/repos";
import { getGalleryImages, getWritingPosts } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: "https://bitz.is-a.dev",
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [
        "https://ipfhkjeedqyo2rxr.public.blob.vercel-storage.com/me.png",
        "https://bitz.is-a.dev/favicon.png",
      ],
    },
    {
      url: "https://bitz.is-a.dev/repos",
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
      images: [
        "https://bitz.is-a.dev/repos/opengraph-image",
      ],
    },
    {
      url: "https://bitz.is-a.dev/xeh",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://bitz.is-a.dev/gallery",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://bitz.is-a.dev/writings",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    const { repos } = await getAllRepos();
    const repoEntries: MetadataRoute.Sitemap = repos.map((repo) => ({
      url: `https://bitz.is-a.dev/repos/${encodeURIComponent(repo.name)}`,
      lastModified: new Date(repo.lastActivity),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      images: [
        `https://bitz.is-a.dev/repos/${encodeURIComponent(repo.name)}/opengraph-image`,
      ],
    }));

    // Gallery images
    const galleryImages = getGalleryImages();
    const galleryEntries: MetadataRoute.Sitemap = galleryImages.map((img) => ({
      url: `https://bitz.is-a.dev/gallery/${img.filename}`,
      lastModified: new Date(img.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    // Writing posts (published only)
    const writingPosts = getWritingPosts(true);
    const writingEntries: MetadataRoute.Sitemap = writingPosts.map((post) => ({
      url: `https://bitz.is-a.dev/writings/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticEntries, ...repoEntries, ...galleryEntries, ...writingEntries];
  } catch {
    return staticEntries;
  }
}
