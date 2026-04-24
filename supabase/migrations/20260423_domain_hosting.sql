-- Hosted-domain fields on prospects.
--
-- When Ben registers a domain on behalf of a paying client (standard
-- or free tier) and flips DNS to point at our Vercel deployment,
-- these columns record the commercial + operational facts:
--
--   assigned_domain       — the customer-facing domain, e.g. "meyerelectric.com"
--   domain_cost_usd       — annual registrar cost Ben pays (e.g. $12.98),
--                           subtracted from the $100/yr mgmt sub to compute
--                           net recurring profit on the dashboard
--   domain_registrar      — "namecheap" | "porkbun" | "godaddy" | "google"
--                           | "cloudflare" | etc — free-form text
--   domain_registered_at  — when Ben registered / renewed the domain
--   site_live_at          — when the domain is DNS-pointed at our server and
--                           the client's site is publicly accessible.
--                           Populates the green "live" checkmark badge on
--                           the dashboard.
--
-- Distinction from the existing custom_site_url column:
--   custom_site_url — used ONLY for pricing_tier="custom" prospects (bespoke
--                     hand-built sites hosted at the client's own domain,
--                     e.g. lcautism.org). Nothing to do with Ben hosting
--                     the domain on our servers.
--   assigned_domain — used for standard/free-tier prospects whose V2
--                     template preview has been flipped live on Ben's
--                     infrastructure with a custom domain.

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS assigned_domain       TEXT,
  ADD COLUMN IF NOT EXISTS domain_cost_usd       NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS domain_registrar      TEXT,
  ADD COLUMN IF NOT EXISTS domain_registered_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS site_live_at          TIMESTAMPTZ;

-- Partial index for the dashboard's "Live Sites" filter — only indexes
-- rows that have actually been flipped live (small subset vs. total
-- prospects), keeping index size small.
CREATE INDEX IF NOT EXISTS idx_prospects_site_live_at
  ON prospects (site_live_at DESC)
  WHERE site_live_at IS NOT NULL;

-- Partial index for domain uniqueness lookups (so two prospects don't
-- accidentally get assigned the same domain).
CREATE INDEX IF NOT EXISTS idx_prospects_assigned_domain
  ON prospects (assigned_domain)
  WHERE assigned_domain IS NOT NULL;

COMMENT ON COLUMN prospects.assigned_domain IS
  'Customer-facing domain registered on behalf of the client (e.g. meyerelectric.com). Only set for hosted prospects on Ben''s infrastructure; distinct from custom_site_url which points at a bespoke external site.';
COMMENT ON COLUMN prospects.domain_cost_usd IS
  'Annual registrar cost Ben pays — subtracted from the $100/yr mgmt sub for net-profit tracking.';
COMMENT ON COLUMN prospects.site_live_at IS
  'Timestamp when DNS is pointed at our server and the site is publicly accessible. Drives the green "live" checkmark on the dashboard and the "Live Sites" category filter.';
