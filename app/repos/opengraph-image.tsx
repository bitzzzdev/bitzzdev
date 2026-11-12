import { ImageResponse } from "next/og";
import OgCard from "@/components/OgCard";

export const alt = "Public repositories by Dev Borah (bitzzdev), browsable in the browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <OgCard
        title="Public repositories"
        subtitle="Every open-source repository by Dev Borah: name, description, tags, README, and in-browser code browsing."
        footer="github.com/bitzzdev · gitlab.com/bitzzdev"
      />
    ),
    size
  );
}
