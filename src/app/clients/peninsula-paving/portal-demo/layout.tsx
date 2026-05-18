import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peninsula Paving — Owner Portal (Demo)",
  description:
    "Password-gated mock backend demo for Peninsula Paving & Excavating. The $10k BlueJays AI System tour: leads, calls, ads, AI replies, and pipeline — built for sales-call demos only.",
  robots: { index: false, follow: false },
};

export default function PortalDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
