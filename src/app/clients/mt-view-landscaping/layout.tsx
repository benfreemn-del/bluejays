import type { Metadata, Viewport } from "next";

/**
 * Layout for /clients/mt-view-landscaping. Houses metadata that the page
 * itself can't export — the page is `"use client"` (framer-motion + hooks
 * inherited from the v2/landscaping template), so server-only exports like
 * `metadata` have to live here.
 */
export const metadata: Metadata = {
  title:
    "Mountain View Landscape & Design — Custom Landscapes in King, Pierce, Snohomish & Kittitas Counties, WA",
  description:
    "Family-owned landscape design and installation in Auburn, WA. Hardscapes, water features, retaining walls, irrigation, sod, native planting and night lighting. Serving King, Pierce, Snohomish and Kittitas counties since 1976.",
};

export const viewport: Viewport = {
  themeColor: "#0f1a0f",
};

export default function MtViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
