import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "[V2] A Place to Belong | Premium Church Template",
  description: "Premium animated church/ministry website template by BlueJay Business Solutions.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
