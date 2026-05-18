/**
 * Per-client public-site URL map. Used by the dashboard's "Site ↗"
 * buttons on /dashboard/clients/[slug] + /dashboard/clients/[slug]/leads
 * to open the client's actual website.
 *
 * Three categories of URL:
 *   1. Internal showcase — we built the site under /clients/{slug}
 *      (Zenith, Hector, ITC, the bespoke template clients).
 *   2. External — the client has their own production domain
 *      and we link directly to it.
 *   3. None yet — the client is in the leads/jobs pipeline but
 *      we don't have a URL wired. Button renders disabled with
 *      a "no site URL set yet" tooltip.
 *
 * Adding a client = drop one entry here. URLs live in code (not the
 * DB) because they rarely change and per-tenant config is light.
 */

export type ClientSite =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }
  | { kind: "none" };

const CLIENT_SITES: Record<string, ClientSite> = {
  // ─── Internal Next-driven showcase pages ─────────────────────────────
  "zenith-sports": { kind: "internal", href: "/clients/zenith-sports" },
  "hector-landscaping": { kind: "internal", href: "/clients/hector-landscaping" },
  "itc-quick-attach": { kind: "internal", href: "/clients/itc-quick-attach" },
  "ps-reiki": { kind: "internal", href: "/clients/ps-reiki" },
  "heale-counseling": { kind: "internal", href: "/clients/heale-counseling" },
  "tacos-yum": { kind: "internal", href: "/clients/tacos-yum" },
  consulting: { kind: "internal", href: "/v2/consulting" },
  "wholme-naturopathy": { kind: "internal", href: "/clients/wholme-naturopathy" },
  "greatminds-ae": { kind: "internal", href: "/clients/greatminds-ae" },
  "riv-inc": { kind: "internal", href: "/clients/riv-inc" },
  "visit-marfa": { kind: "internal", href: "/clients/visit-marfa" },
  // Laser Lakes — Nate's bespoke marketing front. Storefront stays on
  // Shopify (laserlakes.com), but BlueJays runs the back-office:
  // customer + purchase ledger across Shopify + craft fairs + wholesale.
  "laser-lakes": { kind: "internal", href: "/clients/laser-lakes" },
  // Nevarland Outpost — Christopher's handmade kids' + adult apparel
  // brand. Same pattern as Laser Lakes: Shopify owns the storefront +
  // checkout, BlueJays builds the marketing/story front + back-office.
  "nevarland-outpost": { kind: "internal", href: "/clients/nevarland-outpost" },
  // Bloodlines — Preston Hunsaker's indie-author bespoke showcase.
  "bloodlines": { kind: "internal", href: "/clients/bloodlines" },
  // Masters Window Tinting — Long Island NY auto detail + tint shop.
  "masters-window-tinting": {
    kind: "internal",
    href: "/clients/masters-window-tinting",
  },
  // Elite Hardscapes & Landscapes — Tyler Fritz, Port Angeles WA.
  // $1k bespoke custom-tier hardscape + landscape crew. Olympic
  // Peninsula. No portal backend (No-Backend Client Pattern) —
  // leads via mailto + tel/sms.
  "elite-hardscapes-and-landscapes": {
    kind: "internal",
    href: "/clients/elite-hardscapes-and-landscapes",
  },
  // Meyer Electric — Snohomish, WA. Custom-tier mock-backend showcase.
  "meyer-electric": { kind: "internal", href: "/clients/meyer-electric" },
  // All In One Service's LLC — Sequim WA. Custom-tier bespoke build for
  // Kyle Fritz's family-operated GC. Meyer Electric twin pattern,
  // copper-amber palette. Built 2026-05-17.
  "all-in-one-services": {
    kind: "internal",
    href: "/clients/all-in-one-services",
  },
  // Peninsula Paving & Excavating — Sequim, WA. Bespoke premium pitch
  // piece for the $10k AI System sales motion. 41-year family paving
  // crew, no existing website. Mock backend at /portal-demo (gate: 1212).
  "peninsula-paving": {
    kind: "internal",
    href: "/clients/peninsula-paving",
  },
  // The Oregon Appraisers — bespoke real-estate appraisal showcase.
  "theoregonappraisers": {
    kind: "internal",
    href: "/clients/theoregonappraisers",
  },
  // Family Care Cleaning — Olympic Peninsula (Clallam + Jefferson Counties, WA).
  // Custom-tier bespoke build, light/citrus editorial theme.
  "family-care-cleaning": {
    kind: "internal",
    href: "/clients/family-care-cleaning",
  },
  // WAYS Executive Sedan — luxury chauffeur service.
  "ways-executive-sedan": {
    kind: "internal",
    href: "/clients/ways-executive-sedan",
  },
  // Reconciled 2026-05-09 (audit B1): canonical slug is now
  // mt-view-landscaping everywhere. Pre-audit there were TWO active
  // slugs (mountain-view-landscape in DB, mt-view-landscaping on
  // disk). DB has been migrated; route folder unchanged.
  "mt-view-landscaping": {
    kind: "internal",
    href: "/clients/mt-view-landscaping",
  },

  // ─── Static-HTML sites under public/sites/ ───────────────────────────
  //
  // ⚠ TRAILING-SLASH BUG (fixed 2026-05-09): Next.js's default
  // trailingSlash:false issues a 308 redirect on /sites/SLUG/ →
  // /sites/SLUG. Some browsers (Edge specifically) render that 308
  // chain as a 404 in the destination tab when opened via a click
  // from the dashboard. Diagnosed via curl: status 308 then 200,
  // but the new-tab UX treats it as broken.
  //
  // Fix: use the EXPLICIT /index.html form for all static-site URLs.
  // This bypasses both the trailing-slash redirect AND the legacy
  // /sites/pine-and-particle/* → /sites/olympic-inspections/* permanent
  // redirect chain in next.config.ts.

  // Lewis County Autism Coalition — folder slug `lcac` differs from DB.
  "lewis-county-autism": {
    kind: "external",
    href: "https://bluejayportfolio.com/sites/lcac/index.html",
  },
  // Olympic Inspections & Testing (formerly Pine & Particle Co.)
  "olympic-inspections": {
    kind: "external",
    href: "https://bluejayportfolio.com/sites/olympic-inspections/index.html",
  },
  // Pine & Particle Co. — pre-rebrand legacy. Routes through the
  // permanent redirect in next.config.ts to OIT's index.
  "pine-and-particle": {
    kind: "external",
    href: "https://bluejayportfolio.com/sites/olympic-inspections/index.html",
  },
  // KR Ranches — farm-direct meat in Prosser WA. Static HTML at
  // /sites/kr-ranches/. Custom-tier client (shipped 2026-05-05).
  "kr-ranches": {
    kind: "external",
    href: "https://bluejayportfolio.com/sites/kr-ranches/index.html",
  },
  // Dungeness Meadows HOA — Sequim WA. ~200-home homeowners' association
  // along the Dungeness River. Bespoke static HTML pitch piece (sales
  // preview) at /sites/dungeness-meadows/. Pacific Northwest residential
  // palette · 8 real Unsplash photos · numbered amenity cards.
  "dungeness-meadows": {
    kind: "external",
    href: "https://bluejayportfolio.com/sites/dungeness-meadows/index.html",
  },
};

export function clientSiteFor(slug: string): ClientSite {
  return CLIENT_SITES[slug] ?? { kind: "none" };
}
