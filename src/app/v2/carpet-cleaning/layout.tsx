import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carpet Cleaning Website Design | Live Example — BlueJays",
  description:
    "See a premium carpet cleaning business website in action. BlueJays builds custom carpet cleaning websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "carpet cleaning website design, carpet cleaner website, floor cleaning website",
  openGraph: {
    title: "Carpet Cleaning Website Design | Live Example — BlueJays",
    description: "See a premium carpet cleaning business website in action. BlueJays builds custom carpet cleaning websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/carpet-cleaning",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/carpet-cleaning",
  },
};

export default function CarpetCleaningV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Poppins (headings + body) — spec for carpet cleaning clean modern */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .carpet-v2 h1, .carpet-v2 h2, .carpet-v2 h3, .carpet-v2 h4 {
          font-family: 'Poppins', system-ui, sans-serif !important;
          letter-spacing: -0.01em;
        }
        .carpet-v2, .carpet-v2 p, .carpet-v2 a, .carpet-v2 button, .carpet-v2 input,
        .carpet-v2 select, .carpet-v2 textarea, .carpet-v2 label, .carpet-v2 span:not(.font-mono) {
          font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
