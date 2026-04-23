import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental Practice Website Design | Live Example — BlueJays",
  description:
    "See a premium dental practice website in action. BlueJays builds custom dental websites starting at $997 — custom design, domain, and hosting included. New patients, insurance sections, and more.",
  keywords: "dental website design, dentist website, dental practice website, dental office website design",
  openGraph: {
    title: "Dental Practice Website Design | Live Example — BlueJays",
    description: "See a premium dental practice website in action. BlueJays builds custom dental websites starting at $997 — custom design, domain, and hosting included. New patients, insurance sections, and more.",
    url: "https://bluejayportfolio.com/v2/dental",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/dental",
  },
};

export default function DentalV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* DM Serif Display (headings) + DM Sans (body) — spec for dental warm light theme */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .dental-v2 h1, .dental-v2 h2, .dental-v2 h3, .dental-v2 h4 {
          font-family: 'DM Serif Display', Georgia, serif !important;
          letter-spacing: -0.02em;
        }
        .dental-v2, .dental-v2 p, .dental-v2 a, .dental-v2 button, .dental-v2 input,
        .dental-v2 select, .dental-v2 textarea, .dental-v2 label, .dental-v2 span:not(.font-mono) {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
