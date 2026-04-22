import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Proposal | BlueJays",
  description: "Your personalized website proposal from BlueJays — custom design, domain, and hosting starting at $997.",
  robots: { index: false }, // proposals are private/personalized
};

export default function ProposalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          header, footer, nav { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-background { background: white !important; }
          .bg-surface { background: #f8f8f8 !important; border: 1px solid #ddd !important; }
          .text-muted { color: #555 !important; }
          .text-foreground, h1, h2, h3 { color: #111 !important; }
          .border-border { border-color: #ddd !important; }
          a { color: #0ea5e9 !important; }
          .sticky { position: static !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
      {children}
    </>
  );
}
