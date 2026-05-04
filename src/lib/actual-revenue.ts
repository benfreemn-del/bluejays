/**
 * actual-revenue — single source of truth for "how much money has
 * BlueJays actually booked". The funnel/cost dashboards used to
 * compute revenue as `paidCount * 997` which silently lies when:
 *
 *   1. A paid prospect negotiated below the list price (Hector
 *      Landscaping & Design paid $100, not $997).
 *   2. There are paying clients that never went through the prospect
 *      pipeline at all (Zenith Sports / TEKKY — a $10k contract
 *      paid quarterly, predates the scrape funnel).
 *
 * Anything not explicitly overridden falls back to the $997 list price.
 */

import type { Prospect } from "./types";

const LIST_PRICE_USD = 997;

/**
 * Per-prospect actual paid amount overrides. Keyed loosely on
 * lowercase business-name substring to survive small renames.
 */
const PROSPECT_OVERRIDES: Array<{ match: string; usd: number; note: string }> = [
  {
    match: "hector",
    usd: 100,
    note: "Hector Landscaping & Design — negotiated $100, not list price",
  },
];

/**
 * Paying clients that aren't in the prospect funnel. These were
 * closed outside the scrape pipeline (or predate it) but still
 * count toward booked revenue.
 *
 * Zenith: $10k contract, billed quarterly ($2,500 × 4). For now we
 * count the full deal value since it's signed; swap to billed-to-date
 * once we wire SendGrid invoice receipts.
 */
const EXTERNAL_CLIENT_REVENUE_USD: Array<{ name: string; usd: number }> = [
  {
    name: "Zenith Sports / TEKKY",
    usd: 10_000,
  },
];

export function actualRevenueFromProspect(p: Prospect): number {
  const haystack =
    `${p.businessName ?? ""} ${p.email ?? ""}`.toLowerCase();
  for (const o of PROSPECT_OVERRIDES) {
    if (haystack.includes(o.match)) return o.usd;
  }
  return LIST_PRICE_USD;
}

export function totalRevenueFromProspects(prospects: Prospect[]): number {
  let total = 0;
  for (const p of prospects) {
    if (p.status !== "paid") continue;
    total += actualRevenueFromProspect(p);
  }
  for (const c of EXTERNAL_CLIENT_REVENUE_USD) {
    total += c.usd;
  }
  return total;
}

/**
 * For routes that don't load full prospect rows — given just a
 * paid count, estimate revenue by assuming exactly one of the paid
 * rows is Hector (true today) and the rest are list price, then
 * add external client revenue.
 *
 * This is a best-effort fallback. Routes with prospect rows
 * available should call totalRevenueFromProspects() instead.
 */
export function estimatedRevenueFromPaidCount(paidCount: number): number {
  if (paidCount <= 0) {
    return EXTERNAL_CLIENT_REVENUE_USD.reduce((s, c) => s + c.usd, 0);
  }
  // Assume 1 of N paid rows is Hector ($100); rest at list price.
  const hectorAdj = 100;
  const restAtListPrice = (paidCount - 1) * LIST_PRICE_USD;
  return (
    hectorAdj +
    restAtListPrice +
    EXTERNAL_CLIENT_REVENUE_USD.reduce((s, c) => s + c.usd, 0)
  );
}
