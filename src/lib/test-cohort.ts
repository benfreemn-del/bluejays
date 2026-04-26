/**
 * Test Cohort module — Wave 1 full-stack outreach test.
 *
 * Selects 50 prospects (Pacific NW only, 6 categories, top quality)
 * for a controlled full-stack outreach test (email + voicemail + Lob
 * postcard at Day 7 + manual Loom for top 10). Skips manually-managed
 * prospects (Rule 49) and franchise/killer-site prospects (Rule 50,
 * heuristic — Ben does final manual review before flipping live).
 *
 * SMS is NOT in Wave 1 (gated to inbound prospects per A2P 10DLC).
 * Browserless video is NOT in Wave 1 (parked due to OOM issues).
 *
 * The selection is dry-run by default — returns the picked list to Ben
 * for review. Only commits the test_cohort_id tag when called with
 * { confirm: true }.
 *
 * See CLAUDE.md "Test Group Wave 1" spec + Rules 49/50.
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export const WAVE1_COHORT_ID = "wave1-2026-04-25";

/**
 * Per CLAUDE.md Rule 14, bulk-send selection MUST filter out garbage
 * email addresses BEFORE picking — image filenames, placeholder
 * domains, and generic "user@domain.com" entries hard-bounce and burn
 * sender reputation.
 *
 * Mirrors the helper in scripts/recover-broken-link-sends.ts.
 */
function isRealEmail(email: string | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  // Image filenames disguised as emails (the scraper sometimes pulls
  // mailto-like strings from page HTML that aren't real addresses).
  if (/\.(webp|png|jpg|jpeg|svg|gif)$/.test(e)) return false;
  const host = e.split("@")[1];
  // Known placeholder domains.
  if (
    [
      "domain.com",
      "example.com",
      "mysite.com",
      "mail.com",
      "yoursite.com",
      "yourdomain.com",
    ].includes(host)
  ) {
    return false;
  }
  const local = e.split("@")[0];
  // Generic placeholder local-parts paired with placeholder hosts.
  if (
    /^(user|email|example|info|contact|admin|test|demo|sample)$/.test(local) &&
    /^(domain|example|mysite|sample)\./.test(host)
  ) {
    return false;
  }
  // Third-party service emails the scraper sometimes lifts (booking
  // platforms, marketing agencies). These belong to vendors, not the
  // business — sending here just spams the vendor.
  const VENDOR_HOSTS = new Set([
    "vagaro.com",
    "weomedia.com",
    "weoadc.com",
    "podium.com",
    "birdeye.com",
    "yext.com",
    "constantcontact.com",
    "godaddy.com",
    "wix.com",
    "squarespace.com",
  ]);
  if (VENDOR_HOSTS.has(host)) return false;
  return true;
}

/**
 * Per CLAUDE.md Rule 50, cold outreach MUST skip franchise prospects.
 * Heuristics:
 *  - URL contains a `/locations/` or `/store/` path segment (national
 *    chain location pattern)
 *  - URL host is a known chain domain
 *  - Business name contains "Partner" / "Affiliate" branded chain phrasing
 */
function looksLikeFranchise(p: {
  business_name: string;
  current_website: string | null;
}): boolean {
  const name = (p.business_name || "").toLowerCase();
  const url = (p.current_website || "").toLowerCase();

  // National chain location URL patterns.
  if (/\/locations?\//.test(url)) return true;
  if (/\/store\//.test(url)) return true;

  // Known chain domains (incomplete but covers what we've seen so far).
  const CHAIN_HOSTS = [
    "thrivepetcare.com",
    "vcahospitals.com",
    "banfield.com",
    "midaschain.com",
    "jiffylube.com",
    "valvolineinstantoilchange.com",
    "supercuts.com",
    "greatclips.com",
  ];
  for (const host of CHAIN_HOSTS) {
    if (url.includes(host)) return true;
  }

  // Branded chain phrasing in the business name.
  if (/\bpartner\b/.test(name)) return true;
  if (/\baffiliate\b/.test(name)) return true;
  if (/\b(part|division|location)\s+of\s+[A-Z]/.test(p.business_name)) return true;

  return false;
}

/** The 6 categories selected by Ben for Wave 1 (mixed-broad). */
export const WAVE1_CATEGORIES = [
  "dental",
  "electrician",
  "salon",
  "landscaping",
  "veterinary",
  "roofing",
] as const;

/** Pacific NW gravity — Ben's warm-outreach territory. */
export const WAVE1_STATES = ["WA", "OR", "ID"] as const;

/** Target cohort size. ~8 per category × 6 = 48-50 (room for category imbalance). */
export const WAVE1_TARGET_SIZE = 50;
export const WAVE1_PER_CATEGORY = Math.ceil(WAVE1_TARGET_SIZE / WAVE1_CATEGORIES.length);

export interface CohortCandidate {
  id: string;
  business_name: string;
  category: string;
  city: string | null;
  state: string | null;
  email: string | null;
  phone: string | null;
  google_rating: number | null;
  review_count: number | null;
  current_website: string | null;
  /** Quality score 0-100 (qualityScore × reviewCount-weighted). */
  qualityScore: number;
}

/**
 * Score a prospect for cohort selection. Higher = better candidate.
 *
 * Formula: googleRating × log(reviewCount + 1) — favors well-reviewed
 * businesses with both quality AND volume signal. A 5.0★ with 3 reviews
 * scores below a 4.7★ with 200 reviews because review count carries
 * statistical weight.
 */
function scoreProspect(p: {
  google_rating: number | null;
  review_count: number | null;
}): number {
  const rating = p.google_rating || 0;
  const reviews = p.review_count || 0;
  return rating * Math.log(reviews + 1);
}

/**
 * Find candidates for the cohort. Returns up to WAVE1_PER_CATEGORY
 * prospects per category, sorted by quality score descending.
 *
 * Filters:
 *  - status='approved'
 *  - manually_managed=false (Rule 49)
 *  - email IS NOT NULL (we need email to pitch)
 *  - state IN ('WA','OR','ID') (Pacific NW)
 *  - category IN WAVE1_CATEGORIES
 *  - test_cohort_id IS NULL (not already in another cohort)
 *
 * NOT filtered (Ben must do manual review before commit):
 *  - franchise detection (no automated tag yet)
 *  - killer-site detection (no automated quality_score on existing site yet)
 *
 * Returns the per-category picked lists + the union list.
 */
export async function findCohortCandidates(): Promise<{
  byCategory: Record<string, CohortCandidate[]>;
  total: CohortCandidate[];
  totalAvailable: number;
}> {
  if (!isSupabaseConfigured()) {
    return { byCategory: {}, total: [], totalAvailable: 0 };
  }

  const byCategory: Record<string, CohortCandidate[]> = {};
  const total: CohortCandidate[] = [];
  let totalAvailable = 0;

  for (const category of WAVE1_CATEGORIES) {
    const { data, error } = await supabase
      .from("prospects")
      .select(
        "id, business_name, category, city, state, email, phone, google_rating, review_count, current_website",
      )
      .eq("status", "approved")
      .eq("manually_managed", false)
      .eq("category", category)
      .in("state", WAVE1_STATES as unknown as string[])
      .is("test_cohort_id", null)
      .not("email", "is", null);

    if (error || !data) {
      console.error(`[test-cohort] Query failed for ${category}:`, error);
      byCategory[category] = [];
      continue;
    }

    // Apply Rule 14 (real-email) + Rule 50 (franchise skip) filters.
    // SQL can't easily express these — they're row-level heuristics —
    // so we filter in JS after the query returns.
    const filtered = data.filter(
      (r) =>
        isRealEmail(r.email as string | null) &&
        !looksLikeFranchise({
          business_name: r.business_name as string,
          current_website: r.current_website as string | null,
        }),
    );
    totalAvailable += filtered.length;

    const scored: CohortCandidate[] = filtered
      .map((row) => ({
        id: row.id as string,
        business_name: row.business_name as string,
        category: row.category as string,
        city: (row.city as string | null) || null,
        state: (row.state as string | null) || null,
        email: (row.email as string | null) || null,
        phone: (row.phone as string | null) || null,
        google_rating: (row.google_rating as number | null) ?? null,
        review_count: (row.review_count as number | null) ?? null,
        current_website: (row.current_website as string | null) || null,
        qualityScore: scoreProspect({
          google_rating: row.google_rating as number | null,
          review_count: row.review_count as number | null,
        }),
      }))
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, WAVE1_PER_CATEGORY);

    byCategory[category] = scored;
    total.push(...scored);
  }

  // If short of WAVE1_TARGET_SIZE due to category imbalance, fill the gap
  // by pulling additional top-scored prospects from any of the categories.
  if (total.length < WAVE1_TARGET_SIZE) {
    const shortfall = WAVE1_TARGET_SIZE - total.length;
    const usedIds = new Set(total.map((p) => p.id));

    const { data: extras } = await supabase
      .from("prospects")
      .select(
        "id, business_name, category, city, state, email, phone, google_rating, review_count, current_website",
      )
      .eq("status", "approved")
      .eq("manually_managed", false)
      .in("category", WAVE1_CATEGORIES as unknown as string[])
      .in("state", WAVE1_STATES as unknown as string[])
      .is("test_cohort_id", null)
      .not("email", "is", null)
      .limit(500);

    if (extras) {
      const extraScored = extras
        .filter(
          (r) =>
            !usedIds.has(r.id as string) &&
            isRealEmail(r.email as string | null) &&
            !looksLikeFranchise({
              business_name: r.business_name as string,
              current_website: r.current_website as string | null,
            }),
        )
        .map((row) => ({
          id: row.id as string,
          business_name: row.business_name as string,
          category: row.category as string,
          city: (row.city as string | null) || null,
          state: (row.state as string | null) || null,
          email: (row.email as string | null) || null,
          phone: (row.phone as string | null) || null,
          google_rating: (row.google_rating as number | null) ?? null,
          review_count: (row.review_count as number | null) ?? null,
          current_website: (row.current_website as string | null) || null,
          qualityScore: scoreProspect({
            google_rating: row.google_rating as number | null,
            review_count: row.review_count as number | null,
          }),
        }))
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .slice(0, shortfall);

      for (const p of extraScored) {
        if (!byCategory[p.category]) byCategory[p.category] = [];
        byCategory[p.category].push(p);
        total.push(p);
      }
    }
  }

  return { byCategory, total, totalAvailable };
}

/**
 * Tag the picked prospects with the cohort ID. Idempotent — re-tagging
 * with the same cohort ID is safe.
 */
export async function commitCohort(
  prospectIds: string[],
  cohortId: string = WAVE1_COHORT_ID,
): Promise<{ tagged: number; failed: number }> {
  if (!isSupabaseConfigured()) return { tagged: 0, failed: 0 };

  let tagged = 0;
  let failed = 0;
  for (const id of prospectIds) {
    const { error } = await supabase
      .from("prospects")
      .update({ test_cohort_id: cohortId })
      .eq("id", id);
    if (error) {
      console.error(`[test-cohort] Failed to tag ${id}:`, error);
      failed++;
    } else {
      tagged++;
    }
  }
  return { tagged, failed };
}

export interface CohortStats {
  cohortId: string;
  totalEnrolled: number;
  byCategory: Record<string, number>;
  byState: Record<string, number>;
  byStatus: Record<string, number>;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsReplied: number;
  postcardsSent: number;
  loomsRecorded: number;
  voicemailsDropped: number;
  paid: number;
  paidIds: string[];
  totalCostUsd: number;
  prospects: Array<{
    id: string;
    businessName: string;
    category: string;
    city: string | null;
    state: string | null;
    status: string;
    email: string | null;
    phone: string | null;
    enrolledAt: string | null;
    paidAt: string | null;
    cohortPostcardSentAt: string | null;
    loomVideoUrl: string | null;
    paymentFailureCount: number;
    qualityScore: number;
  }>;
}

/**
 * Aggregate stats for a cohort — drives the /dashboard/test-group/[id]
 * firehose page.
 */
export async function getCohortStats(cohortId: string): Promise<CohortStats | null> {
  if (!isSupabaseConfigured()) return null;

  const { data: rows, error } = await supabase
    .from("prospects")
    .select(
      "id, business_name, category, city, state, status, email, phone, paid_at, cohort_postcard_sent_at, loom_video_url, payment_failure_count, google_rating, review_count",
    )
    .eq("test_cohort_id", cohortId);

  if (error || !rows) return null;

  const ids = rows.map((r) => r.id as string);
  const stats: CohortStats = {
    cohortId,
    totalEnrolled: rows.length,
    byCategory: {},
    byState: {},
    byStatus: {},
    emailsSent: 0,
    emailsOpened: 0,
    emailsClicked: 0,
    emailsReplied: 0,
    postcardsSent: 0,
    loomsRecorded: 0,
    voicemailsDropped: 0,
    paid: 0,
    paidIds: [],
    totalCostUsd: 0,
    prospects: [],
  };

  // Pull funnel enrollment data for enrolledAt timestamps.
  const enrollmentMap = new Map<string, string>();
  if (ids.length > 0) {
    const { data: enrollRows } = await supabase
      .from("funnel_enrollments")
      .select("prospect_id, enrolled_at")
      .in("prospect_id", ids);
    for (const er of enrollRows || []) {
      enrollmentMap.set(er.prospect_id as string, er.enrolled_at as string);
    }
  }

  for (const r of rows) {
    const cat = (r.category as string) || "unknown";
    const st = (r.state as string) || "unknown";
    const status = (r.status as string) || "unknown";
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
    stats.byState[st] = (stats.byState[st] || 0) + 1;
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    if (status === "paid") {
      stats.paid++;
      stats.paidIds.push(r.id as string);
    }
    if (r.cohort_postcard_sent_at) stats.postcardsSent++;
    if (r.loom_video_url) stats.loomsRecorded++;

    stats.prospects.push({
      id: r.id as string,
      businessName: r.business_name as string,
      category: cat,
      city: (r.city as string | null) || null,
      state: (r.state as string | null) || null,
      status,
      email: (r.email as string | null) || null,
      phone: (r.phone as string | null) || null,
      enrolledAt: enrollmentMap.get(r.id as string) || null,
      paidAt: (r.paid_at as string | null) || null,
      cohortPostcardSentAt: (r.cohort_postcard_sent_at as string | null) || null,
      loomVideoUrl: (r.loom_video_url as string | null) || null,
      paymentFailureCount: (r.payment_failure_count as number | null) ?? 0,
      qualityScore: scoreProspect({
        google_rating: r.google_rating as number | null,
        review_count: r.review_count as number | null,
      }),
    });
  }

  // Email sent/open/click/reply counts (best-effort — fall through silently
  // if the email tables don't exist yet at small data volumes).
  if (ids.length > 0) {
    try {
      const { data: emailRows } = await supabase
        .from("emails")
        .select("id")
        .in("prospect_id", ids);
      stats.emailsSent = (emailRows || []).length;
    } catch {
      /* table missing — leave 0 */
    }

    try {
      const { data: eventRows } = await supabase
        .from("email_events")
        .select("event_type")
        .in("prospect_id", ids);
      for (const ev of eventRows || []) {
        const t = ev.event_type as string;
        if (t === "open") stats.emailsOpened++;
        else if (t === "click") stats.emailsClicked++;
        else if (t === "reply" || t === "responded") stats.emailsReplied++;
      }
    } catch {
      /* table missing — leave 0 */
    }
  }

  // Total cost — sum any system_costs rows for these prospect IDs.
  if (ids.length > 0) {
    try {
      const { data: costRows } = await supabase
        .from("system_costs")
        .select("cost_usd")
        .in("prospect_id", ids);
      stats.totalCostUsd = (costRows || []).reduce(
        (sum, c) => sum + Number(c.cost_usd || 0),
        0,
      );
    } catch {
      /* table missing — leave 0 */
    }
  }

  // Sort prospects: paid first, then by quality score descending.
  stats.prospects.sort((a, b) => {
    if (a.status === "paid" && b.status !== "paid") return -1;
    if (b.status === "paid" && a.status !== "paid") return 1;
    return b.qualityScore - a.qualityScore;
  });

  return stats;
}
