import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Electrician Website Design | Live Example — BlueJays",
  description:
    "See a premium licensed electrician website in action. BlueJays builds custom electrician websites starting at $997 — full custom design, domain, and hosting. 48-hour launch.",
  keywords: "electrician website design, electrical contractor website, licensed electrician website, electric company website",
  openGraph: {
    title: "Electrician Website Design | Live Example — BlueJays",
    description: "See a premium licensed electrician website in action. BlueJays builds custom electrician websites starting at $997 — full custom design, domain, and hosting. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/electrician",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/electrician",
  },
};

export default function ElectricianV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Space Grotesk (headings) + Inter (body) — spec for electrician modern trades */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .elec-v2 h1, .elec-v2 h2, .elec-v2 h3, .elec-v2 h4 {
          font-family: 'Space Grotesk', system-ui, sans-serif !important;
          letter-spacing: -0.02em;
        }
        .elec-v2, .elec-v2 p, .elec-v2 a, .elec-v2 button, .elec-v2 input,
        .elec-v2 select, .elec-v2 textarea, .elec-v2 label, .elec-v2 span:not(.font-mono) {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
