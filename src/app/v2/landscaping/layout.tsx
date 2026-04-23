import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landscaping Company Website Design | Live Example — BlueJays",
  description:
    "See a premium landscaping and lawn care website in action. BlueJays builds custom landscaping websites starting at $997 — custom design, domain, and hosting. Seasonal services and more.",
  keywords: "landscaping website design, lawn care website, landscape company website, yard service website",
  openGraph: {
    title: "Landscaping Company Website Design | Live Example — BlueJays",
    description: "See a premium landscaping and lawn care website in action. BlueJays builds custom landscaping websites starting at $997 — custom design, domain, and hosting. Seasonal services and more.",
    url: "https://bluejayportfolio.com/v2/landscaping",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/landscaping",
  },
};

export default function LandscapingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Raleway (headings) + Lato (body) — spec for landscaping outdoor/nature */}
      <link
        href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&family=Lato:wght@300;400;700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .land-v2 h1, .land-v2 h2, .land-v2 h3, .land-v2 h4 {
          font-family: 'Raleway', system-ui, sans-serif !important;
          letter-spacing: -0.01em;
        }
        .land-v2, .land-v2 p, .land-v2 a, .land-v2 button, .land-v2 input,
        .land-v2 select, .land-v2 textarea, .land-v2 label, .land-v2 span:not(.font-mono) {
          font-family: 'Lato', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
