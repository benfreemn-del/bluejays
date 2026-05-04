import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title:
    "Build Your Player — Custom TEKKY® Training Plan · Zenith Sports",
  description:
    "Create your TEKKY® training plan in 60 seconds. Tell us about your player and get a personalized session plan + recommended kit. Free.",
  // Lead-magnet page — landing destination for the Meta + Google ads.
  // Index: yes, this is a marketing landing page we want discoverable.
};

export const viewport: Viewport = {
  themeColor: "#0a1832",
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
