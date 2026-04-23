import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Physical Therapy Website Design | Live Example — BlueJays",
  description:
    "See a premium physical therapy and rehab clinic website in action. BlueJays builds custom PT websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "physical therapy website design, PT clinic website, rehab center website, sports therapy website",
  openGraph: {
    title: "Physical Therapy Website Design | Live Example — BlueJays",
    description: "See a premium physical therapy and rehab clinic website in action. BlueJays builds custom PT websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/physical-therapy",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/physical-therapy",
  },
};

export default function PhysicalTherapyV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Merriweather (headings) + Lato (body) — spec for physical therapy medical warmth */}
      <link
        href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Lato:wght@300;400;700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .pt-v2 h1, .pt-v2 h2, .pt-v2 h3, .pt-v2 h4 {
          font-family: 'Merriweather', Georgia, serif !important;
          letter-spacing: -0.01em;
        }
        .pt-v2, .pt-v2 p, .pt-v2 a, .pt-v2 button, .pt-v2 input,
        .pt-v2 select, .pt-v2 textarea, .pt-v2 label, .pt-v2 span:not(.font-mono) {
          font-family: 'Lato', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
