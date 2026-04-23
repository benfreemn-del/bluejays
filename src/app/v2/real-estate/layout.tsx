import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Estate Agent Website Design | Live Example — BlueJays",
  description:
    "See a premium real estate agent website in action. BlueJays builds custom real estate websites starting at $997 — custom design, domain, and hosting. Mortgage calculator, listings, and more.",
  keywords: "real estate website design, realtor website, real estate agent website, property website design",
  openGraph: {
    title: "Real Estate Agent Website Design | Live Example — BlueJays",
    description: "See a premium real estate agent website in action. BlueJays builds custom real estate websites starting at $997 — custom design, domain, and hosting. Mortgage calculator, listings, and more.",
    url: "https://bluejayportfolio.com/v2/real-estate",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/real-estate",
  },
};

export default function RealEstateV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* DM Serif Display (headings) + DM Sans (body) — spec for real estate luxury */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .re-v2 h1, .re-v2 h2, .re-v2 h3, .re-v2 h4 {
          font-family: 'DM Serif Display', Georgia, serif !important;
          letter-spacing: -0.02em;
        }
        .re-v2, .re-v2 p, .re-v2 a, .re-v2 button, .re-v2 input,
        .re-v2 select, .re-v2 textarea, .re-v2 label, .re-v2 span:not(.font-mono) {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
