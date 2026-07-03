import type { Metadata } from "next";
import StatsClient from "./stats-client";

/**
 * /clients/zenith-sports/stats
 *
 * Owner analytics backend for the live Zenith Shopify site — reached
 * from the small lock icon at the bottom-right of the storefront
 * footer. Password-gated (server-verified in /api/clients/
 * zenith-sports/stats); shows collected emails + per-page site views.
 */

export const metadata: Metadata = {
  title: "Zenith Sports — Site Analytics",
  robots: { index: false, follow: false, nocache: true },
};

export default function ZenithStatsPage() {
  return <StatsClient />;
}
