import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutoring Business Website Design | Live Example — BlueJays",
  description:
    "See a premium tutoring and academic coaching website in action. BlueJays builds custom tutoring websites starting at $997 — custom design, domain, and hosting. Subject pages and more.",
  keywords: "tutoring website design, tutor website, academic coaching website, education business website",
  openGraph: {
    title: "Tutoring Business Website Design | Live Example — BlueJays",
    description: "See a premium tutoring and academic coaching website in action. BlueJays builds custom tutoring websites starting at $997 — custom design, domain, and hosting. Subject pages and more.",
    url: "https://bluejayportfolio.com/v2/tutoring",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/tutoring",
  },
};

export default function TutoringV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Merriweather (headings) + Open Sans (body) — spec for tutoring academic authority */}
      <link
        href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Open+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .tutor-v2 h1, .tutor-v2 h2, .tutor-v2 h3, .tutor-v2 h4 {
          font-family: 'Merriweather', Georgia, serif !important;
          letter-spacing: -0.01em;
        }
        .tutor-v2, .tutor-v2 p, .tutor-v2 a, .tutor-v2 button, .tutor-v2 input,
        .tutor-v2 select, .tutor-v2 textarea, .tutor-v2 label, .tutor-v2 span:not(.font-mono) {
          font-family: 'Open Sans', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
