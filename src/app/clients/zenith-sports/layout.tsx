import type { Metadata, Viewport } from "next";

/**
 * Layout for /clients/zenith-sports. Houses metadata that the page
 * itself can't export — the page uses client components nested inside.
 */
export const metadata: Metadata = {
  title:
    "Zenith Sports — The TEKKY Ball · Smaller Ball, Bigger Gains · Youth Soccer Training",
  description:
    "TEKKY by Zenith Sports — an innovative youth soccer training ball, smaller in size yet weighted to FIFA regulation. Build touch, control, and confidence in players ages 5 to high school. Founded by Philip Lund and Paul Hanson.",
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
