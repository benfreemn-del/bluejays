import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hair Salon Website Design | Live Example — BlueJays",
  description:
    "See a premium hair salon and beauty studio website in action. BlueJays builds custom salon websites starting at $997 — custom design, domain, and hosting. Service menu, stylists, and booking.",
  keywords: "hair salon website design, beauty salon website, salon website, barbershop website design",
  openGraph: {
    title: "Hair Salon Website Design | Live Example — BlueJays",
    description: "See a premium hair salon and beauty studio website in action. BlueJays builds custom salon websites starting at $997 — custom design, domain, and hosting. Service menu, stylists, and booking.",
    url: "https://bluejayportfolio.com/v2/salon",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/salon",
  },
};

export default function SalonV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Cormorant Garamond (headings) + Raleway (body) — spec for salon elegant */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Raleway:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .salon-v2 h1, .salon-v2 h2, .salon-v2 h3, .salon-v2 h4 {
          font-family: 'Cormorant Garamond', Georgia, serif !important;
          letter-spacing: 0.01em;
        }
        .salon-v2, .salon-v2 p, .salon-v2 a, .salon-v2 button, .salon-v2 input,
        .salon-v2 select, .salon-v2 textarea, .salon-v2 label, .salon-v2 span:not(.font-mono) {
          font-family: 'Raleway', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
