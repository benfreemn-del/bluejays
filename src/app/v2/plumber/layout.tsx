import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plumbing Company Website Design | Live Example — BlueJays",
  description:
    "See a premium licensed plumber website in action. BlueJays builds custom plumbing websites starting at $997 — custom design, domain, and hosting. 24/7 emergency, pricing, and trust sections.",
  keywords: "plumber website design, plumbing company website, plumbing contractor website, pipe repair website",
  openGraph: {
    title: "Plumbing Company Website Design | Live Example — BlueJays",
    description: "See a premium licensed plumber website in action. BlueJays builds custom plumbing websites starting at $997 — custom design, domain, and hosting. 24/7 emergency, pricing, and trust sections.",
    url: "https://bluejayportfolio.com/v2/plumber",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/plumber",
  },
};

export default function PlumberV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Space Grotesk (headings) + Inter (body) — spec for plumber modern trades */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .plumber-v2 h1, .plumber-v2 h2, .plumber-v2 h3, .plumber-v2 h4 {
          font-family: 'Space Grotesk', system-ui, sans-serif !important;
          letter-spacing: -0.02em;
        }
        .plumber-v2, .plumber-v2 p, .plumber-v2 a, .plumber-v2 button, .plumber-v2 input,
        .plumber-v2 select, .plumber-v2 textarea, .plumber-v2 label, .plumber-v2 span:not(.font-mono) {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
