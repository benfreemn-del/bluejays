import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounting & CPA Website Design | Live Example — BlueJays",
  description:
    "See a premium accounting and CPA firm website in action. BlueJays builds custom accounting websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
  keywords: "accounting website design, CPA website design, tax firm website, bookkeeping website",
  openGraph: {
    title: "Accounting & CPA Website Design | Live Example — BlueJays",
    description: "See a premium accounting and CPA firm website in action. BlueJays builds custom accounting websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/accounting",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/accounting",
  },
};

export default function AccountingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Crimson Pro (headings) + Inter (body) — spec for accounting professional trust */}
      <link
        href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .acct-v2 h1, .acct-v2 h2, .acct-v2 h3, .acct-v2 h4 {
          font-family: 'Crimson Pro', Georgia, serif !important;
          letter-spacing: -0.01em;
        }
        .acct-v2, .acct-v2 p, .acct-v2 a, .acct-v2 button, .acct-v2 input,
        .acct-v2 select, .acct-v2 textarea, .acct-v2 label, .acct-v2 span:not(.font-mono) {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
