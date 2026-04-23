import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitness & Gym Website Design | Live Example — BlueJays",
  description:
    "See a premium fitness studio and gym website in action. BlueJays builds custom fitness websites starting at $997 — custom design, domain, and hosting. Membership pages, class schedules, and more.",
  keywords: "fitness website design, gym website design, personal trainer website, fitness studio website",
  openGraph: {
    title: "Fitness & Gym Website Design | Live Example — BlueJays",
    description: "See a premium fitness studio and gym website in action. BlueJays builds custom fitness websites starting at $997 — custom design, domain, and hosting. Membership pages, class schedules, and more.",
    url: "https://bluejayportfolio.com/v2/fitness",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/fitness",
  },
};

export default function FitnessV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Bebas Neue (headings) + Open Sans (body) — spec for fitness high-energy */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .fit-v2 h1, .fit-v2 h2, .fit-v2 h3, .fit-v2 h4 {
          font-family: 'Bebas Neue', Impact, sans-serif !important;
          letter-spacing: 0.04em;
        }
        .fit-v2, .fit-v2 p, .fit-v2 a, .fit-v2 button, .fit-v2 input,
        .fit-v2 select, .fit-v2 textarea, .fit-v2 label, .fit-v2 span:not(.font-mono) {
          font-family: 'Open Sans', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
