import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your AI System Dashboard — BlueJays",
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
