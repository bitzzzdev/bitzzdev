import { ImageResponse } from "next/og";
import OgCard from "@/components/OgCard";

export const alt = "Public repository on bitz.is-a.dev";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const VALID_NAME = /^[A-Za-z0-9._-]{1,120}$/;

export default async function OpenGraphImage({ params }: { params: Promise<{ repo: string }> }) {
  const { repo } = await params;
  const name = VALID_NAME.test(repo) ? repo : "repository";
  return new ImageResponse(
    (
      <OgCard
        title={name}
        subtitle="README, source tree, commits, branches, and tags. Browsed right here in the portfolio."
        footer="github.com/bitzzdev · gitlab.com/bitzzdev"
      />
    ),
    size
  );
}
