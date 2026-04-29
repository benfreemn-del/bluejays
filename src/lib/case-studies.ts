import { supabase, isSupabaseConfigured } from "./supabase";
import type { AuditContent } from "./site-audit";

/**
 * Case-studies layer — public, SEO-indexable view of an audit.
 *
 * The same `site_audits` row backs two URLs:
 *   /audit/[uuid]            — private (URL-as-secret), funnel-heavy
 *   /case-studies/[slug]     — public, opted-in, SEO-optimized
 *
 * Visibility gate: case_study_slug + published_at both non-null.
 * Anyone can hit /case-studies/[slug] and see the audit, but Google
 * never crawls anything that hasn't been explicitly published.
 *
 * Slug strategy: kebab-case of business_name + 4-char random suffix
 * on collision. Example: "hector-landscaping", "summit-fence-co-k7m4".
 */

export type CaseStudyRow = {
  id: string;
  case_study_slug: string;
  published_at: string;
  audit_content: AuditContent | null;
  business_category: string | null;
  target_url: string | null;
  generated_at: string | null;
  prospect_id: string;
};

export type CaseStudyWithBusiness = CaseStudyRow & {
  businessName: string;
};

/** Slug a business name into a URL-safe slug. */
export function slugifyBusinessName(raw: string): string {
  return (
    (raw || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "case-study"
  );
}

function randomSuffix(len = 4): string {
  // No 0/o/1/l/i — verbal-shareable + URL-safe
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/**
 * Fetch a single published case study by slug. Returns null if:
 *   - slug doesn't exist
 *   - audit isn't published
 *   - audit_content is null (not yet generated)
 */
export async function getPublishedCaseStudy(
  slug: string,
): Promise<CaseStudyWithBusiness | null> {
  if (!isSupabaseConfigured()) return null;
  const cleaned = (slug || "").toLowerCase().trim();
  if (!cleaned) return null;

  const { data: auditRow } = await supabase
    .from("site_audits")
    .select(
      "id, case_study_slug, published_at, audit_content, business_category, target_url, generated_at, prospect_id",
    )
    .eq("case_study_slug", cleaned)
    .not("published_at", "is", null)
    .maybeSingle();

  if (!auditRow) return null;
  const audit = auditRow as unknown as CaseStudyRow;
  if (!audit.audit_content) return null;

  // Look up business name from prospects
  const { data: prospect } = await supabase
    .from("prospects")
    .select("business_name")
    .eq("id", audit.prospect_id)
    .maybeSingle();

  return {
    ...audit,
    businessName:
      ((prospect as { business_name?: string } | null)?.business_name ||
        "Local Business").trim(),
  };
}

/**
 * List published case studies — used by /case-studies index page +
 * sitemap. Newest first, capped (sitemap caps higher).
 */
export async function listPublishedCaseStudies(
  limit = 100,
): Promise<CaseStudyWithBusiness[]> {
  if (!isSupabaseConfigured()) return [];

  const { data: auditRows } = await supabase
    .from("site_audits")
    .select(
      "id, case_study_slug, published_at, audit_content, business_category, target_url, generated_at, prospect_id",
    )
    .not("published_at", "is", null)
    .not("case_study_slug", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (!auditRows || auditRows.length === 0) return [];
  const audits = auditRows as unknown as CaseStudyRow[];

  // Batch-fetch business names
  const prospectIds = Array.from(new Set(audits.map((a) => a.prospect_id)));
  const { data: prospectRows } = await supabase
    .from("prospects")
    .select("id, business_name")
    .in("id", prospectIds);
  const nameById = new Map(
    (prospectRows || []).map((p) => [
      (p as { id: string }).id,
      (p as { business_name: string }).business_name || "Local Business",
    ]),
  );

  return audits
    .filter((a) => !!a.audit_content)
    .map((a) => ({
      ...a,
      businessName: nameById.get(a.prospect_id) || "Local Business",
    }));
}

/**
 * Generate a unique slug for an audit. Tries kebab(businessName) first,
 * appends a 4-char suffix on collision (up to 6 attempts).
 */
export async function generateUniqueSlug(businessName: string): Promise<string> {
  if (!isSupabaseConfigured()) return slugifyBusinessName(businessName);
  const base = slugifyBusinessName(businessName);
  let slug = base;
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data: clash } = await supabase
      .from("site_audits")
      .select("id")
      .eq("case_study_slug", slug)
      .maybeSingle();
    if (!clash) return slug;
    slug = `${base}-${randomSuffix(4)}`;
  }
  return slug;
}
