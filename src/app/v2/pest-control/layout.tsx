import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pest Control Website Design | Live Example — BlueJays",
  description:
    "See a premium pest control and exterminator website in action. BlueJays builds custom pest control websites starting at $997 — custom design, domain, and hosting. 48-hour launch.",
  keywords: "pest control website design, exterminator website, pest management website, termite control website",
  openGraph: {
    title: "Pest Control Website Design | Live Example — BlueJays",
    description: "See a premium pest control and exterminator website in action. BlueJays builds custom pest control websites starting at $997 — custom design, domain, and hosting. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/pest-control",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/pest-control",
  },
};

export default function PestControlV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Space Grotesk (headings) + Inter (body) — spec for pest control technical service */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .pest-v2 h1, .pest-v2 h2, .pest-v2 h3, .pest-v2 h4 {
          font-family: 'Space Grotesk', system-ui, sans-serif !important;
          letter-spacing: -0.02em;
        }
        .pest-v2, .pest-v2 p, .pest-v2 a, .pest-v2 button, .pest-v2 input,
        .pest-v2 select, .pest-v2 textarea, .pest-v2 label, .pest-v2 span:not(.font-mono) {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
