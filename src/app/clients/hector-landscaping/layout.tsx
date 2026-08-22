import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";
import BackToTopButton from "@/components/BackToTopButton";

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
  // Canonical MUST be Hector's own domain (added 2026-08-17). Without
  // this the page inherits the root layout's `canonical: BASE_URL`, so
  // hectorlandscaping.com was telling Google it is a duplicate of the
  // BlueJays HOMEPAGE — a page with nothing to do with landscaping.
  // That suppresses his site from search entirely. Found while fixing
  // the same class of bug on Meyer Electric.
  // Apex 301s to www, so www is the one true URL.
  alternates: { canonical: "https://www.hectorlandscaping.com" },
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
      {/* Hector-specific scrollbar — vertical gradient earthy brown →
          lush green over a deep-soil track. Matches the landscaping
          dark-green hero palette. Style is scoped by route segment —
          Next only injects this block while inside
          /clients/hector-landscaping/*, so other tenants keep their
          own scrollbars (or the OS default) unaffected. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html { scrollbar-color: #4d7c0f #1a0f08; scrollbar-width: thin; }
            ::-webkit-scrollbar { width: 12px; height: 12px; }
            ::-webkit-scrollbar-track { background: #1a0f08; }
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #5e3a1e 0%, #7a4d28 50%, #4d7c0f 100%);
              border-radius: 6px;
              border: 2px solid #1a0f08;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #4a2d18 0%, #5e3a1e 50%, #65a30d 100%);
            }
            ::-webkit-scrollbar-corner { background: #1a0f08; }
          `,
        }}
      />
      <ClientTrackingScripts slug="hector-landscaping" />
      {children}
      <BackToTopButton bg="#16a34a" fg="#ffffff" />
    </>
  );
}
