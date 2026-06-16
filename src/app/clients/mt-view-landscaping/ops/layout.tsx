import type { Metadata, Viewport } from "next";

/**
 * Mt View operations backend — password-gated, NOT indexed.
 *
 * Bespoke crew + route + profitability tool for the Hunsakers. Visual-first
 * build on mock data (mock-ops-data.ts + profit-engine.ts). Loads Playfair
 * Display + Inter via a Google Fonts <link> so the inline font-family strings
 * resolve here (the parent /clients/mt-view-landscaping layout exposes the
 * fonts only as next/font CSS variables, which don't match the literal
 * family names this page uses).
 *
 * Password: 1976 (Mt View's founding year).
 */

export const metadata: Metadata = {
  title: "Mountain View Landscape & Design — Operations Backend",
  description: "Crew, route, and profitability backend for Mt View. Mock data — internal preview, never shared publicly.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#F5F1E8",
  width: "device-width",
  initialScale: 1,
};

export default function MtViewOpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
