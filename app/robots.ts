import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/ascii/", "/ascii-posters/", "/dashboard/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/favicon.png", "/gallery/"],
        disallow: ["/ascii/", "/ascii-posters/", "/dashboard/"],
      },
    ],
    sitemap: "https://bitz.is-a.dev/sitemap.xml",
  };
}
