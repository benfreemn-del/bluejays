import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "LCAC Owner Portal — Lewis County Autism Coalition",
  description: "Owner portal for the LCAC executive director.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function LcacPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
