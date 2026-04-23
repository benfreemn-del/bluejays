import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet Services Website Design | Live Example — BlueJays",
  description:
    "See a premium pet care and grooming website in action. BlueJays builds custom pet services websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "pet services website design, pet grooming website, dog boarding website, pet care website",
  openGraph: {
    title: "Pet Services Website Design | Live Example — BlueJays",
    description: "See a premium pet care and grooming website in action. BlueJays builds custom pet services websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/pet-services",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/pet-services",
  },
};

export default function PetServicesV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Nunito (headings) + Nunito Sans (body) — spec for pet services soft playful */}
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Nunito+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .pet-v2 h1, .pet-v2 h2, .pet-v2 h3, .pet-v2 h4 {
          font-family: 'Nunito', system-ui, sans-serif !important;
          letter-spacing: -0.01em;
        }
        .pet-v2, .pet-v2 p, .pet-v2 a, .pet-v2 button, .pet-v2 input,
        .pet-v2 select, .pet-v2 textarea, .pet-v2 label, .pet-v2 span:not(.font-mono) {
          font-family: 'Nunito Sans', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
