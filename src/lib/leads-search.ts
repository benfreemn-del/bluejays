/**
 * Shared filter logic for the leads-search bar.
 *
 * Used by:
 *   - BlueJays main dashboard (/dashboard) → filters Prospect[]
 *   - Per-client owner portal (/clients/[slug]/portal) → filters ClientLead[]
 *   - Anywhere else a "leads list" needs an inline search bar
 *
 * Contract:
 *   1. Pure function — same input always returns same output
 *   2. AND composes with existing filters — caller passes the
 *      already-filtered array, search narrows it further
 *   3. Empty/whitespace query returns the input list unchanged
 *   4. Short-code (8-char hex) or full UUID match jumps to the
 *      exact prospect — overrides text search entirely
 *   5. Otherwise multi-field substring match, case-insensitive
 *
 * Performance: client-side O(n) over the array. Fine for ≤500 rows.
 * Above that, the table itself should server-page; this helper still
 * works on whatever subset is in memory.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHORT_CODE_RE = /^[0-9a-f]{8}$/i;

/**
 * Normalizes the query: lowercase, trim, collapse whitespace.
 */
function normalize(q: string): string {
  return (q || "").toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Detects when the query is an exact ID or short-code match.
 * If so, the caller can short-circuit to render a single result
 * (the prospect/lead with that id) instead of running a fuzzy
 * substring scan.
 *
 * Returns the canonical lookup form, or null if not an ID-shaped query.
 */
export function extractIdLookup(
  query: string,
): { kind: "uuid" | "short_code"; value: string } | null {
  const q = normalize(query);
  if (!q) return null;
  if (UUID_RE.test(q)) return { kind: "uuid", value: q };
  if (SHORT_CODE_RE.test(q)) return { kind: "short_code", value: q };
  return null;
}

/**
 * Generic filter: caller provides an extractor that returns the
 * concatenated searchable text for one row. We lowercase + substring
 * match against the (also lowercased) query.
 *
 * Multi-token: each whitespace-separated token must match somewhere
 * in the text (AND between tokens). So "ben napavine" matches a row
 * whose text contains both "ben" and "napavine" — even if they're in
 * different fields.
 */
export function filterBySearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string,
): T[] {
  const q = normalize(query);
  if (!q) return items;

  const tokens = q.split(" ").filter(Boolean);
  if (tokens.length === 0) return items;

  return items.filter((item) => {
    const text = (getSearchableText(item) || "").toLowerCase();
    return tokens.every((token) => text.includes(token));
  });
}

/**
 * Extractor for the BlueJays main-dashboard Prospect[] filter.
 * Combines every reasonably-searchable field. Admin notes included so
 * Ben can scratch a tag (e.g. "needs follow-up monday") into a prospect
 * and find it later by typing that tag.
 */
export function extractProspectSearchText(p: {
  id?: string | null;
  shortCode?: string | null;
  short_code?: string | null;
  businessName?: string | null;
  business_name?: string | null;
  category?: string | null;
  city?: string | null;
  state?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  currentWebsite?: string | null;
  current_website?: string | null;
  customSiteUrl?: string | null;
  custom_site_url?: string | null;
  adminNotes?: string | null;
  admin_notes?: string | null;
  status?: string | null;
  pricingTier?: string | null;
  pricing_tier?: string | null;
}): string {
  const fields = [
    p.businessName ?? p.business_name,
    p.category,
    p.city,
    p.state,
    p.email,
    p.phone,
    p.address,
    p.currentWebsite ?? p.current_website,
    p.customSiteUrl ?? p.custom_site_url,
    p.adminNotes ?? p.admin_notes,
    p.status,
    p.pricingTier ?? p.pricing_tier,
    p.shortCode ?? p.short_code,
    p.id,
  ];
  return fields.filter(Boolean).join("   ");
}

/**
 * Extractor for the per-client portal ClientLead[] filter.
 * Same shape, smaller field set (clients don't see admin notes).
 */
export function extractClientLeadSearchText(l: {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  audience_segment?: string | null;
  competition_tier?: string | null;
  funnel_status?: string | null;
  city?: string | null;
  state?: string | null;
}): string {
  const fields = [
    l.name,
    l.email,
    l.phone,
    l.notes,
    l.audience_segment,
    l.competition_tier,
    l.funnel_status,
    l.city,
    l.state,
    l.id,
  ];
  return fields.filter(Boolean).join("   ");
}
