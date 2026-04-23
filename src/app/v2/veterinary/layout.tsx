import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veterinary Clinic Website Design | Live Example — BlueJays",
  description:
    "See a premium veterinary clinic and animal hospital website in action. BlueJays builds custom vet websites starting at $997 — custom design, domain, and hosting. New patient forms and more.",
  keywords: "veterinary website design, vet clinic website, animal hospital website, pet clinic website design",
  openGraph: {
    title: "Veterinary Clinic Website Design | Live Example — BlueJays",
    description: "See a premium veterinary clinic and animal hospital website in action. BlueJays builds custom vet websites starting at $997 — custom design, domain, and hosting. New patient forms and more.",
    url: "https://bluejayportfolio.com/v2/veterinary",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/veterinary",
  },
};

export default function VeterinaryV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* DM Serif Display (headings) + DM Sans (body) — spec for veterinary warm approachable */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .vet-v2 h1, .vet-v2 h2, .vet-v2 h3, .vet-v2 h4 {
          font-family: 'DM Serif Display', Georgia, serif !important;
          letter-spacing: -0.02em;
        }
        .vet-v2, .vet-v2 p, .vet-v2 a, .vet-v2 button, .vet-v2 input,
        .vet-v2 select, .vet-v2 textarea, .vet-v2 label, .vet-v2 span:not(.font-mono) {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
