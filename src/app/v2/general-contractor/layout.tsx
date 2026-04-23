import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "General Contractor Website Design | Live Example — BlueJays",
  description:
    "See a premium general contractor website in action. BlueJays builds custom GC websites starting at $997 — full custom design, domain, and hosting included. 48-hour turnaround.",
  keywords: "general contractor website design, GC website, contractor website design, remodeling company website",
  openGraph: {
    title: "General Contractor Website Design | Live Example — BlueJays",
    description: "See a premium general contractor website in action. BlueJays builds custom GC websites starting at $997 — full custom design, domain, and hosting included. 48-hour turnaround.",
    url: "https://bluejayportfolio.com/v2/general-contractor",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/general-contractor",
  },
};

export default function GeneralContractorV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Barlow Condensed (headings) + Barlow (body) — spec for general contractor trades */}
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .gc-v2 h1, .gc-v2 h2, .gc-v2 h3, .gc-v2 h4 {
          font-family: 'Barlow Condensed', sans-serif !important;
          letter-spacing: 0em;
        }
        .gc-v2, .gc-v2 p, .gc-v2 a, .gc-v2 button, .gc-v2 input,
        .gc-v2 select, .gc-v2 textarea, .gc-v2 label, .gc-v2 span:not(.font-mono) {
          font-family: 'Barlow', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
