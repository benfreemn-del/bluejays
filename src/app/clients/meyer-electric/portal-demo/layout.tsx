import type { Metadata, Viewport } from "next";

/**
 * Mock backend demo for Meyer Electric — password-gated, NOT for public
 * indexing. Robots:noindex+nofollow so Google never sees it (it'd hurt
 * the public Meyer site's SEO if it leaked).
 *
 * The MOCK BACKEND playbook (docs/MOCK_BACKEND_PLAYBOOK.md +
 * docs/mock-backends/electrician.md) defines reuse instructions for
 * other prospects. Pattern is: live the demo at /clients/[slug]/portal-demo
 * with a tiny secondary feather in the public site footer as the entry.
 */

export const metadata: Metadata = {
  title: "Meyer Electric — Backend Demo",
  description: "Demo backend for Meyer Electric LLC.",
  robots: { index: false, follow: false, nocache: true },
};

// Skip static prerendering — the demo is fully client-side (sessionStorage,
// stateful interactivity) and prerendering it has no SEO value (robots:noindex).
// Forces every request to render on demand, dodging SSR-incompatible
// dependencies that may exist in the import graph.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function MeyerDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
