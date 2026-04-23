import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appliance Repair Website Design | Live Example — BlueJays",
  description:
    "See a premium appliance repair business website in action. BlueJays builds custom appliance repair websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "appliance repair website design, appliance service website, repair business website",
  openGraph: {
    title: "Appliance Repair Website Design | Live Example — BlueJays",
    description: "See a premium appliance repair business website in action. BlueJays builds custom appliance repair websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/appliance-repair",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/appliance-repair",
  },
};

export default function ApplianceRepairV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Space Grotesk (headings) + Inter (body) — spec for appliance repair technical service */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .appl-v2 h1, .appl-v2 h2, .appl-v2 h3, .appl-v2 h4 {
          font-family: 'Space Grotesk', system-ui, sans-serif !important;
          letter-spacing: -0.02em;
        }
        .appl-v2, .appl-v2 p, .appl-v2 a, .appl-v2 button, .appl-v2 input,
        .appl-v2 select, .appl-v2 textarea, .appl-v2 label, .appl-v2 span:not(.font-mono) {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
