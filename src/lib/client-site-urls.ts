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
  // Internal showcase pages we built + host
  "zenith-sports": { kind: "internal", href: "/clients/zenith-sports" },
  "hector-landscaping": {
    kind: "internal",
    href: "/clients/hector-landscaping",
  },
  "itc-quick-attach": {
    kind: "internal",
    href: "/clients/itc-quick-attach",
  },
  "ps-reiki": { kind: "internal", href: "/clients/ps-reiki" },
  "heale-counseling": { kind: "internal", href: "/clients/heale-counseling" },
  "tacos-yum": { kind: "internal", href: "/clients/tacos-yum" },
  consulting: { kind: "internal", href: "/v2/consulting" },
  "wholme-naturopathy": {
    kind: "internal",
    href: "/clients/wholme-naturopathy",
  },
  "greatminds-ae": { kind: "internal", href: "/clients/greatminds-ae" },
  "riv-inc": { kind: "internal", href: "/clients/riv-inc" },
  "visit-marfa": { kind: "internal", href: "/clients/visit-marfa" },
  // Laser Lakes — Nate's bespoke marketing front. Storefront stays on
  // Shopify (laserlakes.com), but BlueJays runs the back-office:
  // customer + purchase ledger across Shopify + craft fairs + wholesale.
  "laser-lakes": { kind: "internal", href: "/clients/laser-lakes" },
  // Nevarland Outpost — Christopher's handmade kids' + adult apparel
  // brand. Same pattern as Laser Lakes: Shopify owns the storefront +
  // checkout, BlueJays builds the marketing/story front + back-office
  // for cross-channel customer + order tracking.
  "nevarland-outpost": { kind: "internal", href: "/clients/nevarland-outpost" },

  // Static-HTML sites under public/sites/ — built bespoke for clients
  // who needed a fast public marketing front but no Next-driven app.
  // Folder slugs sometimes differ from client_slug (lcac =
  // Lewis County Autism Coalition).
  "lewis-county-autism": {
    kind: "external",
    href: "https://bluejayportfolio.com/sites/lcac/",
  },
  // Next page lives under a different folder name (mt-view-landscaping)
  // than the DB slug (mountain-view-landscape). Wire to the actual
  // route that exists on disk.
  "mountain-view-landscape": {
    kind: "internal",
    href: "/clients/mt-view-landscaping",
  },
  // Olympic Inspections & Testing (formerly Pine & Particle Co.)
  "olympic-inspections": {
    kind: "external",
    href: "https://bluejayportfolio.com/sites/olympic-inspections/",
  },
  // Pine & Particle Co. — pre-rebrand site, still wired so any
  // legacy preview links route to the original asset.
  "pine-and-particle": {
    kind: "external",
    href: "https://bluejayportfolio.com/sites/pine-and-particle/",
  },
};

export function clientSiteFor(slug: string): ClientSite {
  return CLIENT_SITES[slug] ?? { kind: "none" };
}
