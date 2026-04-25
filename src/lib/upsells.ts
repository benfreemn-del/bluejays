/**
 * Upsell SKU catalog — single source of truth for the 4 productized add-ons.
 *
 * Used by:
 *   - `/api/checkout/upsell` (resolves SKU → Stripe price id or inline price)
 *   - `/api/webhooks/stripe` (resolves SKU → welcome email template)
 *   - `/upsells/[id]` (renders the SKU cards on the customer-facing page)
 *   - `ProspectDetail` operator dashboard (renders purchased SKUs + status)
 *
 * Adding a new SKU? Add it here, register a price-env var name, write a
 * SKU-specific welcome email helper in `email-templates.ts`, and the rest
 * of the pipeline picks it up automatically.
 *
 * Pricing is mirrored in cents on `priceCents` and as the human-readable
 * `priceLabel`. Keep the two in sync when changing a price — they're
 * rendered as such on the upsells page.
 */

export type UpsellSku =
  | "review_blast"
  | "extra_pages"
  | "gbp_setup"
  | "monthly_updates";

export interface UpsellDefinition {
  sku: UpsellSku;
  /** Customer-facing display name */
  displayName: string;
  /** Customer-facing 1-paragraph description (shown on the cards) */
  description: string;
  /** Pricing in cents (matches `unit_amount` on Stripe inline price_data) */
  priceCents: number;
  /** Pricing label rendered on the card (e.g. "$99 one-time", "$50/month") */
  priceLabel: string;
  /** Stripe billing mode — `payment` for one-time, `subscription` for recurring */
  mode: "payment" | "subscription";
  /** For subscriptions only — Stripe billing interval */
  interval?: "month" | "year";
  /** Env var name carrying the pre-created Stripe Price ID (preferred path) */
  envVar: string;
  /** Short product description sent to Stripe (helps reconciliation) */
  productDescription: string;
}

export const UPSELL_CATALOG: Record<UpsellSku, UpsellDefinition> = {
  review_blast: {
    sku: "review_blast",
    displayName: "Review Request Blast",
    description:
      "Send 50 review-request SMS to your past customers in 24 hrs. Average return: 10-15 new 5-star Google reviews.",
    priceCents: 9900, // $99
    priceLabel: "$99 one-time",
    mode: "payment",
    envVar: "STRIPE_PRICE_REVIEW_BLAST",
    productDescription:
      "Review Request Blast — 50 SMS to past customers, average 10-15 new 5-star reviews",
  },
  extra_pages: {
    sku: "extra_pages",
    displayName: "Add 5 Extra Pages",
    description:
      "Add 5 additional pages to your site (services, FAQ, gallery, blog, case studies — your choice). Live in 48 hrs.",
    priceCents: 40000, // $400
    priceLabel: "$400 one-time",
    mode: "payment",
    envVar: "STRIPE_PRICE_EXTRA_PAGES",
    productDescription:
      "Add 5 Extra Pages — additional services, FAQ, gallery, blog, or case study pages, live in 48 hrs",
  },
  gbp_setup: {
    sku: "gbp_setup",
    displayName: "Google Business Profile Setup",
    description:
      "I claim, optimize, and post-schedule your Google Business Profile so you show up in local searches. Includes 5 weekly posts pre-scheduled.",
    priceCents: 15000, // $150
    priceLabel: "$150 one-time",
    mode: "payment",
    envVar: "STRIPE_PRICE_GBP_SETUP",
    productDescription:
      "Google Business Profile Setup — claim, optimize, and pre-schedule 5 weekly posts",
  },
  monthly_updates: {
    sku: "monthly_updates",
    displayName: "Monthly Content Updates",
    description:
      "I update your site once a month with new photos, copy tweaks, seasonal banners, or special offers — whatever you ask. Cancel anytime.",
    priceCents: 5000, // $50
    priceLabel: "$50/month",
    mode: "subscription",
    interval: "month",
    envVar: "STRIPE_PRICE_MONTHLY_UPDATES",
    productDescription:
      "Monthly Content Updates — once-a-month site refresh with photos, copy, seasonal banners, or offers",
  },
};

export const UPSELL_SKUS = Object.keys(UPSELL_CATALOG) as UpsellSku[];

export function isUpsellSku(value: unknown): value is UpsellSku {
  return typeof value === "string" && (value as UpsellSku) in UPSELL_CATALOG;
}

export function getUpsellDefinition(sku: UpsellSku): UpsellDefinition {
  return UPSELL_CATALOG[sku];
}

/** Format an amount in cents as a human-readable USD string (e.g. 9900 → "$99"). */
export function formatUsd(cents: number): string {
  if (cents % 100 === 0) return `$${cents / 100}`;
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Logged row shape for the `upsells` Supabase table. Mirrors the migration
 * 20260424_upsells.sql column set + camel-cased for TS consumers.
 */
export interface UpsellRecord {
  id: string;
  prospect_id: string;
  sku: UpsellSku;
  amount_cents: number;
  currency: string;
  stripe_session_id: string;
  stripe_subscription_id: string | null;
  status: "paid" | "fulfilled" | "cancelled" | "refunded";
  fulfilled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
