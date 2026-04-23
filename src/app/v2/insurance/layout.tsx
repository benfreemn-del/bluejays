import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insurance Agency Website Design | Live Example — BlueJays",
  description:
    "See a premium insurance agency website in action. BlueJays builds custom insurance websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
  keywords: "insurance agency website design, insurance broker website, independent agent website, insurance company website",
  openGraph: {
    title: "Insurance Agency Website Design | Live Example — BlueJays",
    description: "See a premium insurance agency website in action. BlueJays builds custom insurance websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/insurance",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/insurance",
  },
};

export default function InsuranceV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Libre Baskerville (headings) + Open Sans (body) — spec for insurance trust authority */}
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Open+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .insure-v2 h1, .insure-v2 h2, .insure-v2 h3, .insure-v2 h4 {
          font-family: 'Libre Baskerville', Georgia, serif !important;
          letter-spacing: -0.01em;
        }
        .insure-v2, .insure-v2 p, .insure-v2 a, .insure-v2 button, .insure-v2 input,
        .insure-v2 select, .insure-v2 textarea, .insure-v2 label, .insure-v2 span:not(.font-mono) {
          font-family: 'Open Sans', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
