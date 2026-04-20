import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  buildResearchBrief,
  buildTaglineFromResearchBrief,
  buildAboutFromResearchBrief,
  isGenericTagline,
  isGenericAbout,
} from "@/lib/content-brief";
import type { Prospect } from "@/lib/types";

/**
 * POST /api/generate/bulk-refresh
 *
 * Targeted refresh of tagline + about for every prospect in the
 * pre-paid pipeline using the latest CATEGORY_VOICE table in
 * `src/lib/content-brief.ts`. Does NOT re-scrape, re-generate images,
 * or run the full generate pipeline — it only recomputes the two text
 * fields that depend on the category voice table.
 *
 * Why only these two fields?
 *   - They're the only thing the 2026-04-19 voice-table edit affects
 *   - Full regenerate takes 15-30s per prospect; this takes <500ms
 *   - 300+ prospect backlog = minutes vs hours
 *
 * Eligible prospect statuses:
 *   approved, pending-review, ready_to_review, ready_to_send,
 *   generated, qc_failed, changes_pending
 *
 * NOT eligible (preserved as-is):
 *   paid, dismissed, deployed, contacted, unsubscribed
 *
 * Body:
 *   { count?: number } — batch size, default 50, max 200
 *   { category?: string } — optional category filter
 *
 * Returns a summary + per-prospect before/after preview of the tagline.
 */

const ELIGIBLE_STATUSES = [
  "approved",
  "pending-review",
  "ready_to_review",
  "ready_to_send",
  "generated",
  "qc_failed",
  "changes_pending",
];

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const count = Math.max(1, Math.min(200, Number(body?.count) || 50));
  const categoryFilter = body?.category ? String(body.category) : undefined;

  // 1. Fetch eligible prospects
  let query = supabase
    .from("prospects")
    .select("*")
    .in("status", ELIGIBLE_STATUSES)
    .order("updated_at", { ascending: true }) // oldest first — refresh stale ones before newest
    .limit(count);

  if (categoryFilter) {
    query = query.eq("category", categoryFilter);
  }

  const { data: prospects, error: prospectsErr } = await query;
  if (prospectsErr) {
    return NextResponse.json(
      { error: `Fetch failed: ${prospectsErr.message}` },
      { status: 500 }
    );
  }

  if (!prospects || prospects.length === 0) {
    return NextResponse.json({
      message: "No eligible prospects found — pipeline is empty or filter excluded everything.",
      refreshed: 0,
      skipped: 0,
    });
  }

  // 2. For each prospect, compute new tagline + about
  //    Then patch generated_sites.site_data in place (single UPDATE query)
  const results: Array<{
    id: string;
    businessName: string;
    category: string;
    before: { tagline?: string; about?: string };
    after: { tagline: string; about: string };
    status: "refreshed" | "skipped";
    reason?: string;
  }> = [];

  let refreshed = 0;
  let skipped = 0;

  for (const row of prospects) {
    const prospect = {
      id: row.id as string,
      businessName: row.business_name as string,
      ownerName: (row.owner_name as string | null) || undefined,
      phone: (row.phone as string | null) || undefined,
      email: (row.email as string | null) || undefined,
      address: (row.address as string) || "",
      city: (row.city as string) || "",
      state: (row.state as string) || "",
      category: row.category as Prospect["category"],
      currentWebsite: (row.current_website as string | null) || undefined,
      googleRating: (row.google_rating as number | null) || undefined,
      reviewCount: (row.review_count as number | null) || undefined,
      estimatedRevenueTier: "medium" as const,
      status: row.status as Prospect["status"],
      scrapedData: (row.scraped_data as Prospect["scrapedData"]) || undefined,
      createdAt: (row.created_at as string) || new Date().toISOString(),
      updatedAt: (row.updated_at as string) || new Date().toISOString(),
    };

    try {
      const brief = buildResearchBrief(prospect, prospect.scrapedData);
      const newTagline = buildTaglineFromResearchBrief(brief, prospect.category);
      const newAbout = buildAboutFromResearchBrief(brief, prospect.category);

      // Get existing generated_sites row for before/after comparison
      const { data: existingSite } = await supabase
        .from("generated_sites")
        .select("site_data")
        .eq("prospect_id", prospect.id)
        .limit(1)
        .single();

      const siteData = (existingSite?.site_data as Record<string, unknown>) || {};
      const scrapedTagline = (prospect.scrapedData as Record<string, unknown> | undefined)?.tagline as string | undefined;
      const scrapedAbout = (prospect.scrapedData as Record<string, unknown> | undefined)?.about as string | undefined;

      const currentTagline = (siteData.tagline as string | undefined) || scrapedTagline;
      const currentAbout = (siteData.about as string | undefined) || scrapedAbout;

      const before = {
        tagline: currentTagline,
        about: currentAbout,
      };

      // CRITICAL: only replace copy that matches our known-bad generic
      // patterns. Real scraped/human-written copy must be preserved.
      //
      // This was a bug in the 2026-04-19 first version that nuked 94
      // prospects' good copy before it was caught. See CLAUDE.md
      // "Generated Site Copy Rules" — the refresh is a PATCH for the
      // system's own bad fallbacks, not a stylistic rewrite.
      const shouldReplaceTagline = isGenericTagline(currentTagline);
      const shouldReplaceAbout = isGenericAbout(currentAbout);

      if (!shouldReplaceTagline && !shouldReplaceAbout) {
        skipped++;
        results.push({
          id: prospect.id,
          businessName: prospect.businessName,
          category: prospect.category,
          before,
          after: { tagline: newTagline, about: newAbout },
          status: "skipped",
          reason: "current copy is not generic — preserved",
        });
        continue;
      }

      const finalTagline = shouldReplaceTagline ? newTagline : (currentTagline || newTagline);
      const finalAbout = shouldReplaceAbout ? newAbout : (currentAbout || newAbout);

      // Patch site_data in generated_sites (merge; don't overwrite other fields)
      const updatedSiteData = {
        ...siteData,
        tagline: finalTagline,
        about: finalAbout,
      };

      const { error: updateErr } = await supabase
        .from("generated_sites")
        .update({ site_data: updatedSiteData })
        .eq("prospect_id", prospect.id);

      if (updateErr) {
        // No generated_sites row yet — insert one
        if (updateErr.code === "PGRST116" || updateErr.message.includes("no rows")) {
          await supabase.from("generated_sites").insert({
            prospect_id: prospect.id,
            site_data: updatedSiteData,
          });
        } else {
          throw updateErr;
        }
      }

      // ALSO update the prospect's scraped_data.tagline + scraped_data.about
      // so if something downstream reads from scraped_data instead of
      // generated_sites.site_data, the new copy is there too — but ONLY
      // for the fields we're actually replacing. Don't overwrite a
      // preserved field with the new (unchosen) value.
      const updatedScraped: Record<string, unknown> = { ...(prospect.scrapedData || {}) };
      if (shouldReplaceTagline) updatedScraped.tagline = finalTagline;
      if (shouldReplaceAbout) updatedScraped.about = finalAbout;
      await supabase
        .from("prospects")
        .update({ scraped_data: updatedScraped })
        .eq("id", prospect.id);

      refreshed++;
      results.push({
        id: prospect.id,
        businessName: prospect.businessName,
        category: prospect.category,
        before,
        after: { tagline: finalTagline, about: finalAbout },
        status: "refreshed",
      });
    } catch (err) {
      skipped++;
      results.push({
        id: prospect.id,
        businessName: prospect.businessName,
        category: prospect.category,
        before: {},
        after: { tagline: "", about: "" },
        status: "skipped",
        reason: (err as Error).message,
      });
    }
  }

  return NextResponse.json({
    message: `Refreshed ${refreshed}/${prospects.length} prospects. Skipped ${skipped}.`,
    batchSize: count,
    categoryFilter: categoryFilter || "(none)",
    refreshed,
    skipped,
    results: results.slice(0, 20), // trim for response size; full list would balloon
    resultSummary: `${results.length} total processed, see results[] for first 20`,
  });
}

export async function GET() {
  return NextResponse.json({
    message:
      "POST this endpoint with { count, category? } to refresh tagline + about for up to 200 prospects using the latest CATEGORY_VOICE table.",
    eligibleStatuses: ELIGIBLE_STATUSES,
  });
}
