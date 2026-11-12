const BASE = "#0b0b0b";
const FG = "#e8e6df";
const DIM = "#8a867c";
const ACCENT = "#c9a227";

export default function OgCard({ title, subtitle, footer }: { title: string; subtitle?: string; footer: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BASE,
        padding: "56px 64px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: ACCENT,
          }}
        />
        <div style={{ color: DIM, fontSize: 26, letterSpacing: 2, textTransform: "uppercase" }}>
          bitz.is-a.dev
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            color: FG,
            fontSize: title.length > 32 ? 72 : 92,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 1080,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ color: DIM, fontSize: 28, lineHeight: 1.35, maxWidth: 1000 }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `2px solid ${ACCENT}`,
          paddingTop: 28,
          color: FG,
          fontSize: 24,
        }}
      >
        <div>Dev Borah (bitzzdev)</div>
        <div style={{ color: DIM, fontSize: 22 }}>{footer}</div>
      </div>
    </div>
  );
}
