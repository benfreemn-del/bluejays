import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Med Spa Website Design | Live Example — BlueJays",
  description:
    "See a premium medical spa and aesthetics website in action. BlueJays builds custom med spa websites starting at $997 — custom design, domain, and hosting. Treatment menus and booking.",
  keywords: "med spa website design, medical spa website, aesthetics clinic website, Botox website design",
  openGraph: {
    title: "Med Spa Website Design | Live Example — BlueJays",
    description: "See a premium medical spa and aesthetics website in action. BlueJays builds custom med spa websites starting at $997 — custom design, domain, and hosting. Treatment menus and booking.",
    url: "https://bluejayportfolio.com/v2/med-spa",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/med-spa",
  },
};

export default function MedSpaV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Cormorant Garamond (headings) + Jost (body) — spec for med spa luxury clinical */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .medspa-v2 h1, .medspa-v2 h2, .medspa-v2 h3, .medspa-v2 h4 {
          font-family: 'Cormorant Garamond', Georgia, serif !important;
          letter-spacing: 0.01em;
        }
        .medspa-v2, .medspa-v2 p, .medspa-v2 a, .medspa-v2 button, .medspa-v2 input,
        .medspa-v2 select, .medspa-v2 textarea, .medspa-v2 label, .medspa-v2 span:not(.font-mono) {
          font-family: 'Jost', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
