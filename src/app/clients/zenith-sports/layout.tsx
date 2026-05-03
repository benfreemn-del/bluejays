import type { Metadata, Viewport } from "next";

/**
 * Layout for /clients/zenith-sports. Houses metadata that the page
 * itself can't export — the page uses client components nested inside.
 */
export const metadata: Metadata = {
  title:
    "Zenith Sports — TEKKY® · Building Better Players, One Touch at a Time · Patent Pending",
  description:
    "TEKKY® by Zenith Sports — a patent-pending technical training accelerator for youth soccer. FIFA Size 3 control, FIFA Size 5 match-day weight. Inspired by European-style development. Founded by Philip Lund and Paul Hanson.",
};

export const viewport: Viewport = {
  themeColor: "#0a1832",
};

export default function ZenithSportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
