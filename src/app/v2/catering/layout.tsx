import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catering Business Website Design | Live Example — BlueJays",
  description:
    "See a premium catering company website in action. BlueJays builds custom catering websites starting at $997 — full custom design, domain, and hosting. 48-hour turnaround.",
  keywords: "catering website design, catering company website, event catering website, food service website",
  openGraph: {
    title: "Catering Business Website Design | Live Example — BlueJays",
    description: "See a premium catering company website in action. BlueJays builds custom catering websites starting at $997 — full custom design, domain, and hosting. 48-hour turnaround.",
    url: "https://bluejayportfolio.com/v2/catering",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/catering",
  },
};

export default function CateringV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Playfair Display (headings) + Lato (body) — spec for catering elegant food */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .cater-v2 h1, .cater-v2 h2, .cater-v2 h3, .cater-v2 h4 {
          font-family: 'Playfair Display', Georgia, serif !important;
          letter-spacing: 0em;
        }
        .cater-v2, .cater-v2 p, .cater-v2 a, .cater-v2 button, .cater-v2 input,
        .cater-v2 select, .cater-v2 textarea, .cater-v2 label, .cater-v2 span:not(.font-mono) {
          font-family: 'Lato', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
