import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Church Website Design | Live Example — BlueJays",
  description:
    "See a premium church and ministry website in action. BlueJays builds custom church websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
  keywords: "church website design, ministry website, congregation website, faith community website",
  openGraph: {
    title: "Church Website Design | Live Example — BlueJays",
    description: "See a premium church and ministry website in action. BlueJays builds custom church websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/church",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/church",
  },
};

export default function ChurchV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Merriweather (headings) + Lato (body) — spec for church tradition and trust */}
      <link
        href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Lato:wght@300;400;700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .church-v2 h1, .church-v2 h2, .church-v2 h3, .church-v2 h4 {
          font-family: 'Merriweather', Georgia, serif !important;
          letter-spacing: -0.01em;
        }
        .church-v2, .church-v2 p, .church-v2 a, .church-v2 button, .church-v2 input,
        .church-v2 select, .church-v2 textarea, .church-v2 label, .church-v2 span:not(.font-mono) {
          font-family: 'Lato', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
