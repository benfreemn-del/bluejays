import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Thrive Church Portal Demo — BlueJays",
  description: "Password-gated demo of the Thrive Church staff portal.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a3a36",
  width: "device-width",
  initialScale: 1,
};

export default function ThrivePortalDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
