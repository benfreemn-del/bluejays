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

  // External production sites — clients who already had a site
  // when they entered the BlueJays system. Update these as we
  // confirm each client's actual public URL.
  "lewis-county-autism": { kind: "none" },
  "mountain-view-landscape": { kind: "none" },
  // Olympic Inspections & Testing (formerly Pine & Particle Co.)
  "olympic-inspections": {
    kind: "external",
    href: "https://bluejayportfolio.com/sites/olympic-inspections/",
  },
};

export function clientSiteFor(slug: string): ClientSite {
  return CLIENT_SITES[slug] ?? { kind: "none" };
}
