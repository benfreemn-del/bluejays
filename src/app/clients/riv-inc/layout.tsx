import type { Metadata, Viewport } from "next";
import BackToTopButton from "@/components/BackToTopButton";

export const metadata: Metadata = {
  title:
    "RIV Inc. — CibusCloud · The most connected platform in food supply chain",
  description:
    "CibusCloud by RIV Inc. brings real-time traceability, lot-level history, and SAP/QuickBooks/Google Forms integrations to food producers and distributors worldwide. Streamline food safety operations — no more manual traceability work.",
};

export const viewport: Viewport = {
  themeColor: "#070a13",
};

export default function RivIncLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BackToTopButton bg="#7af0d4" fg="#070a13" />
    </>
  );
}
