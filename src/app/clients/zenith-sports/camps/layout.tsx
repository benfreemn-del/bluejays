import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "TEKKY® Camps + Clinics — Get Notified When One Opens · Zenith Sports",
  description:
    "TEKKY® training camps + clinics are rolling out by region. Tell us about your player and we'll notify you the moment a camp opens near you.",
  // Until Philip + Paul finalize the partner-camp list, keep this
  // unindexed. Once data populates, flip robots.
  robots: { index: false, follow: false },
};

export default function CampsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
