import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cascade Electric Co. | Licensed Master Electricians — V2 Template",
  description:
    "Premium V2 electrician website template by Bluejay Business Solutions. Residential wiring, commercial electrical, panel upgrades, EV charger installation, emergency repairs, and lighting design.",
};

export default function ElectricianV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
