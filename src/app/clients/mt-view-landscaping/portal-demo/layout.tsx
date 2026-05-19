import type { Metadata, Viewport } from "next";

/**
 * Mt View mock backend demo — password-gated, NOT indexed.
 *
 * Pattern: docs/MOCK_BACKEND_PLAYBOOK.md
 * Industry: landscaping (Mt View is the first landscaping mock-backend
 * install — same operator-portal shape as Hector Landscaping + Elite
 * Hardscapes when those add demos).
 *
 * Password: 1976 (Mt View's founding year).
 */

export const metadata: Metadata = {
  title: "Mountain View Landscape & Design — Owner Portal Preview",
  description: "Demo dashboard for Mt View. Mock data — never shared publicly.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#F5F1E8",
  width: "device-width",
  initialScale: 1,
};

export default function MtViewPortalDemoLayout({
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
