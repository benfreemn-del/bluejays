import type { Metadata } from "next";
import StatsClient from "./stats-client";

/**
 * /clients/meyer-electric/stats
 *
 * Owner analytics backend for Kyle Meyer — reached from the small lock
 * icon in the showcase footer. Password-gated (server-verified in
 * /api/clients/meyer-electric/stats); shows live site traffic, quote
 * requests (email captures), and his managed domains.
 */

export const metadata: Metadata = {
  title: "Meyer Electric — Site Analytics",
  robots: { index: false, follow: false, nocache: true },
};

export default function MeyerStatsPage() {
  return <StatsClient />;
}
