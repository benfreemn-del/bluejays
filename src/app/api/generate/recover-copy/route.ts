import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { scrapeWebsite } from "@/lib/scraper";

/**
 * POST /api/generate/recover-copy
 *
 * Re-scrapes ONLY the tagline + about fields for prospects that had
 * their good scraped copy overwritten by the 2026-04-19 bulk-refresh
 * bug. Preserves everything else in scraped_data (services, photos,
 * testimonials, brand color, logo, etc.) — only patches tagline +
 * about back from the business's actual website.
 *
 * Eligibility:
 *   - Prospect status in the pre-paid pipeline (same as bulk-refresh)
 *   - Prospect has a currentWebsite we can hit
 *   - Prospect is NOT paid / deployed / dismissed / unsubscribed
 *
 * Body:
 *   { count?: number } — batch size, default 20, max 100
 *   { prospectIds?: string[] } — explicit list (overrides count)
 *   { force?: boolean } — re-scrape even if current copy looks good
 *
 * Returns per-prospect before/after so Ben can eyeball the recovery.
 *
 * ~10-15 sec per prospect (HTTP fetch + cheerio parse), so a batch of
 * 20 takes 3-5 minutes. Run it a few times to cover the 94 affected.
 */

const ELIGIBLE_STATUSES = [
  "approved",
  "pending-review",
  "ready_to_review",
  "ready_to_send",
  "generated",
  "qc_failed",
  "changes_pending",
  "contacted",
  "email_opened",
  "engaged",
  "link_clicked",
  "responded",
  "interested",
  "claimed",
];

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const count = Math.max(1, Math.min(100, Number(body?.count) || 20));
  const prospectIds = Array.isArray(body?.prospectIds) ? body.prospectIds : undefined;

  // 1. Fetch eligible prospects
  let query = supabase
    .from("prospects")
    .select("id, business_name, category, status, current_website, scraped_data, updated_at")
    .not("current_website", "is", null);

  if (prospectIds && prospectIds.length > 0) {
    query = query.in("id", prospectIds);
  } else {
    query = query
      .in("status", ELIGIBLE_STATUSES)
      .order("updated_at", { ascending: false })
      .limit(count);
  }

  const { data: prospects, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: `Fetch failed: ${error.message}` },
      { status: 500 }
    );
  }

  if (!prospects || prospects.length === 0) {
    return NextResponse.json({
      message: "No eligible prospects with currentWebsite found.",
      recovered: 0,
    });
  }

  const results: Array<{
    id: string;
    businessName: string;
    category: string;
    website: string;
    before: { tagline?: string; about?: string };
    after: { tagline: string; about: string };
    status: "recovered" | "skipped" | "failed";
    reason?: string;
  }> = [];

  let recovered = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of prospects) {
    const id = row.id as string;
    const businessName = (row.business_name as string) || "(unknown)";
    const category = (row.category as string) || "(unknown)";
    const website = (row.current_website as string) || "";
    const scrapedData = (row.scraped_data as Record<string, unknown>) || {};

    const before = {
      tagline: scrapedData.tagline as string | undefined,
      about: scrapedData.about as string | undefined,
    };

    if (!website) {
      skipped++;
      results.push({
        id,
        businessName,
        category,
        website: "",
        before,
        after: { tagline: "", about: "" },
        status: "skipped",
        reason: "no current website on file",
      });
      continue;
    }

    // Normalize URL
    const cleanUrl = website.startsWith("http") ? website : `https://${website}`;

    try {
      const fresh = await scrapeWebsite(cleanUrl);

      const newTagline = fresh.tagline?.trim() || "";
      const newAbout = fresh.about?.trim() || "";

      // If the scraper couldn't find either, don't overwrite with empty
      if (!newTagline && !newAbout) {
        skipped++;
        results.push({
          id,
          businessName,
          category,
          website: cleanUrl,
          before,
          after: { tagline: "", about: "" },
          status: "skipped",
          reason: "scraper returned empty tagline + about (site may have changed)",
        });
        continue;
      }

      // Patch into scraped_data (preserve everything else)
      const updatedScraped: Record<string, unknown> = { ...scrapedData };
      if (newTagline) updatedScraped.tagline = newTagline;
      if (newAbout) updatedScraped.about = newAbout;

      await supabase
        .from("prospects")
        .update({ scraped_data: updatedScraped })
        .eq("id", id);

      // Also patch generated_sites.site_data so the rendered preview reflects it
      const { data: existingSite } = await supabase
        .from("generated_sites")
        .select("site_data")
        .eq("prospect_id", id)
        .limit(1)
        .single();

      if (existingSite?.site_data) {
        const siteData = existingSite.site_data as Record<string, unknown>;
        const updatedSiteData = { ...siteData };
        if (newTagline) updatedSiteData.tagline = newTagline;
        if (newAbout) updatedSiteData.about = newAbout;
        await supabase
          .from("generated_sites")
          .update({ site_data: updatedSiteData })
          .eq("prospect_id", id);
      }

      recovered++;
      results.push({
        id,
        businessName,
        category,
        website: cleanUrl,
        before,
        after: { tagline: newTagline || before.tagline || "", about: newAbout || before.about || "" },
        status: "recovered",
      });
    } catch (err) {
      failed++;
      results.push({
        id,
        businessName,
        category,
        website: cleanUrl,
        before,
        after: { tagline: "", about: "" },
        status: "failed",
        reason: (err as Error).message,
      });
    }

    // Small delay between requests to avoid hammering third-party sites
    await new Promise((r) => setTimeout(r, 500));
  }

  return NextResponse.json({
    message: `Recovered ${recovered}/${prospects.length} prospects. Skipped ${skipped}, failed ${failed}.`,
    batchSize: count,
    recovered,
    skipped,
    failed,
    results: results.slice(0, 30),
    resultSummary: `${results.length} total processed, see results[] for first 30`,
  });
}

export async function GET() {
  return NextResponse.json({
    message:
      "POST { count, prospectIds? } to re-scrape tagline + about from prospect websites. Restores copy lost to the 2026-04-19 bulk-refresh bug.",
    eligibleStatuses: ELIGIBLE_STATUSES,
  });
}
