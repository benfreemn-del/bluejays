import type { Metadata, Viewport } from "next";

/**
 * LCAC mock backend demo — password-gated, NOT indexed. Robots:noindex
 * + nofollow per mock_backend skill defaults.
 *
 * Reference: docs/MOCK_BACKEND_PLAYBOOK.md
 * Industry config: docs/mock-backends/nonprofit.md (NEW — LCAC is the
 * first nonprofit anchor; this config locks the pattern for the next
 * nonprofit client install).
 *
 * Framing rule from nonprofit.md — commercial language is BANNED.
 * "Leads" → "Supporters", "Affiliates" → "Community Partners",
 * "Funnels" → "Engagement Pipelines", "Revenue" → "Impact / Reach".
 */

export const metadata: Metadata = {
  title: "Lewis County Autism Coalition — Mission Dashboard Preview",
  description: "Demo dashboard for LCAC. Mock data — never shared publicly.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function LcacDemoLayout({ children }: { children: React.ReactNode }) {
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
