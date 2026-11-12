import type { MetadataRoute } from "next";
import { getAllRepos } from "@/lib/repos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: "https://bitz.is-a.dev",
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [
        "https://bitz.is-a.dev/me.png",
        "https://bitz.is-a.dev/favicon.png",
      ],
    },
    {
      url: "https://bitz.is-a.dev/repos",
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    const { repos } = await getAllRepos();
    const repoEntries: MetadataRoute.Sitemap = repos.map((repo) => ({
      url: `https://bitz.is-a.dev/repos/${encodeURIComponent(repo.name)}`,
      lastModified: new Date(repo.lastActivity),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    return [...staticEntries, ...repoEntries];
  } catch {
    return staticEntries;
  }
}
