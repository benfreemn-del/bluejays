import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";

/**
 * Layout for /clients/hector-landscaping. Houses metadata that the page
 * itself can't export — the page is `"use client"` (framer-motion +
 * hooks inherited from the Mt View template), so server-only exports
 * like `metadata` have to live here.
 *
 * The site is served at https://hectorlandscaping.com via the
 * CLIENT_DOMAIN_MAP rewrite in src/middleware.ts.
 */
export const metadata: Metadata = {
  title:
    "Hector Landscaping & Design — Hardscapes, Pavers, Retaining Walls & Lawn Care · Renton, WA",
  description:
    "Affordable landscaping with a 5-star reputation. Hardscapes, pavers, retaining walls, sod, lawn care and design serving Renton and the greater Seattle area. Owner-operated by Hector Landscaping & Design.",
};

export const viewport: Viewport = {
  themeColor: "#0f1a0f",
};

export default function HectorLandscapingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClientTrackingScripts slug="hector-landscaping" />
      {children}
    </>
  );
}
