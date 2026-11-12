"use client";

import dynamic from "next/dynamic";

const HalftoneReveal = dynamic(() => import("@/components/HalftoneReveal"), {
  ssr: false,
});

export default function AboutHalftoneImage() {
  return (
    <figure
      className="about-image-wrap"
      aria-label="Portrait of Dev Borah (Bitupan Borah)"
    >
      <div className="about-image-card">
        {/*
          Primary server-rendered image element visible to search engine bots (Googlebot, Bingbot),
          AI search indexers, and browsers. The portrait is served from the free Vercel Blob CDN.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://ipfhkjeedqyo2rxr.public.blob.vercel-storage.com/me.png"
          alt="Dev Borah (Bitupan Borah), Software and Web Developer"
          width={480}
          height={480}
          fetchPriority="high"
          decoding="async"
          className="about-image-photo"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
          <HalftoneReveal
            src="https://ipfhkjeedqyo2rxr.public.blob.vercel-storage.com/me.png"
            mode="mono"
            shape="dot"
            cellSize={6}
            angle={45}
            inkColor="#f4f1ea"
            paperColor="#120f17"
            revealRadius={160}
          />
        </div>
      </div>
      <figcaption className="sr-only">
        Portrait photograph of software developer Dev Borah (Bitupan Borah)
      </figcaption>
    </figure>
  );
}
