import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Law Firm Website Design | Live Example — BlueJays",
  description:
    "See a premium law firm and attorney website in action. BlueJays builds custom legal websites starting at $997 — full custom design, domain, and hosting. Free consultation CTAs and more.",
  keywords: "law firm website design, attorney website design, lawyer website, legal services website",
  openGraph: {
    title: "Law Firm Website Design | Live Example — BlueJays",
    description: "See a premium law firm and attorney website in action. BlueJays builds custom legal websites starting at $997 — full custom design, domain, and hosting. Free consultation CTAs and more.",
    url: "https://bluejayportfolio.com/v2/law-firm",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/law-firm",
  },
};

export default function LawFirmV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* EB Garamond (headings) + Source Sans Pro (body) — spec for law firm authority */}
      <link
        href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Sans+3:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .law-v2 h1, .law-v2 h2, .law-v2 h3, .law-v2 h4 {
          font-family: 'EB Garamond', Georgia, serif !important;
          letter-spacing: -0.01em;
        }
        .law-v2, .law-v2 p, .law-v2 a, .law-v2 button, .law-v2 input,
        .law-v2 select, .law-v2 textarea, .law-v2 label, .law-v2 span:not(.font-mono) {
          font-family: 'Source Sans 3', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
