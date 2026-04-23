import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Junk Removal Website Design | Live Example — BlueJays",
  description:
    "See a premium junk removal and hauling website in action. BlueJays builds custom junk removal websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "junk removal website design, junk hauling website, trash removal website, debris removal website",
  openGraph: {
    title: "Junk Removal Website Design | Live Example — BlueJays",
    description: "See a premium junk removal and hauling website in action. BlueJays builds custom junk removal websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/junk-removal",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/junk-removal",
  },
};

export default function JunkRemovalV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Barlow Condensed (headings) + Barlow (body) — spec for junk removal industrial trades */}
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .junk-v2 h1, .junk-v2 h2, .junk-v2 h3, .junk-v2 h4 {
          font-family: 'Barlow Condensed', sans-serif !important;
          letter-spacing: 0em;
        }
        .junk-v2, .junk-v2 p, .junk-v2 a, .junk-v2 button, .junk-v2 input,
        .junk-v2 select, .junk-v2 textarea, .junk-v2 label, .junk-v2 span:not(.font-mono) {
          font-family: 'Barlow', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
