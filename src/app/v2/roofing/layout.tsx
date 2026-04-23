import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roofing Company Website Design | Live Example — BlueJays",
  description:
    "See a premium roofing contractor website in action. BlueJays builds custom roofing websites starting at $997 — custom design, domain, and hosting. Insurance claims, financing, and more.",
  keywords: "roofing website design, roofing contractor website, roof repair website, roofer website",
  openGraph: {
    title: "Roofing Company Website Design | Live Example — BlueJays",
    description: "See a premium roofing contractor website in action. BlueJays builds custom roofing websites starting at $997 — custom design, domain, and hosting. Insurance claims, financing, and more.",
    url: "https://bluejayportfolio.com/v2/roofing",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/roofing",
  },
};

export default function RoofingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Barlow Condensed (headings) + Barlow (body) — spec for roofing trades */}
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .roof-v2 h1, .roof-v2 h2, .roof-v2 h3, .roof-v2 h4 {
          font-family: 'Barlow Condensed', sans-serif !important;
          letter-spacing: 0em;
        }
        .roof-v2, .roof-v2 p, .roof-v2 a, .roof-v2 button, .roof-v2 input,
        .roof-v2 select, .roof-v2 textarea, .roof-v2 label, .roof-v2 span:not(.font-mono) {
          font-family: 'Barlow', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
