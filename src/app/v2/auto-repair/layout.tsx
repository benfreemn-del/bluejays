import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Repair Website Design | Live Example — BlueJays",
  description:
    "See a premium auto repair and mechanic shop website in action. BlueJays builds custom auto repair websites starting at $997 — custom design, domain, and hosting. 48-hour launch.",
  keywords: "auto repair website design, mechanic shop website, car repair website, automotive website",
  openGraph: {
    title: "Auto Repair Website Design | Live Example — BlueJays",
    description: "See a premium auto repair and mechanic shop website in action. BlueJays builds custom auto repair websites starting at $997 — custom design, domain, and hosting. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/auto-repair",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/auto-repair",
  },
};

export default function AutoRepairV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Barlow Condensed (headings) + Barlow (body) — spec for auto repair trades */}
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .auto-v2 h1, .auto-v2 h2, .auto-v2 h3, .auto-v2 h4 {
          font-family: 'Barlow Condensed', sans-serif !important;
          letter-spacing: 0em;
        }
        .auto-v2, .auto-v2 p, .auto-v2 a, .auto-v2 button, .auto-v2 input,
        .auto-v2 select, .auto-v2 textarea, .auto-v2 label, .auto-v2 span:not(.font-mono) {
          font-family: 'Barlow', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
