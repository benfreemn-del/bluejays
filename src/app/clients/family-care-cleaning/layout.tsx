import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";

/**
 * Layout for /clients/family-care-cleaning. Houses metadata that the page
 * itself can't export — page is "use client" (framer-motion + hooks).
 *
 * Custom-tier bespoke build for Family Care Cleaning — residential
 * cleaning company serving Clallam & Jefferson Counties (Olympic
 * Peninsula, WA). Logo is a Canva lemon-illustration circle stamp,
 * so the whole palette is built around the warm gold + leaf-green
 * pulled from that mark. Light/cream editorial theme per the
 * feminine/family-service quality rule.
 */
export const metadata: Metadata = {
  title:
    "Family Care Cleaning — House Cleaning with Care · Clallam & Jefferson Counties, WA",
  description:
    "Family-run residential cleaning across the Olympic Peninsula. Move-in/out cleans, routine maintenance, deep cleans, and one-time event prep — done with care, every visit. Free quotes for Port Angeles, Sequim, Port Townsend & beyond.",
};

export const viewport: Viewport = {
  themeColor: "#fdf8ec",
};

export default function FamilyCareCleaningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Scoped scrollbar — warm gold thumb on cream track, matches the
          logo's outer ring. Only injected while inside
          /clients/family-care-cleaning/* */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html { scrollbar-color: #d99a0f #fdf8ec; scrollbar-width: thin; }
            ::-webkit-scrollbar { width: 12px; height: 12px; }
            ::-webkit-scrollbar-track { background: #fdf8ec; }
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #f5b826 0%, #e0a418 50%, #b8860c 100%);
              border-radius: 6px;
              border: 2px solid #fdf8ec;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #ffc83d 0%, #f5b826 50%, #d99a0f 100%);
            }
            ::-webkit-scrollbar-corner { background: #fdf8ec; }
          `,
        }}
      />
      <ClientTrackingScripts slug="family-care-cleaning" />
      {children}
    </>
  );
}
