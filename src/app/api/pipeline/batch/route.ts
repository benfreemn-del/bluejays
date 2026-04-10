import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { scout } from "@/lib/scout";
import { getProspect, getScrapedData, saveScrapedData, updateProspect, getAllProspects } from "@/lib/store";
import { generatePreview } from "@/lib/generator";
import { extractBusinessData } from "@/lib/data-extractor";
import { recommendTheme } from "@/lib/theme-recommender";
import { logCost, COST_RATES } from "@/lib/cost-logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Category } from "@/lib/types";
import type { GeneratedSiteData } from "@/lib/generator";
import { readFile } from "fs/promises";
import path from "path";
import {
  researchBusinessWebsite,
  runClaudeSupercharge,
  runClaudeQcReview,
} from "@/lib/claude-qc";
import { CATEGORY_CONFIG } from "@/lib/types";

export const maxDuration = 300; // 5 minutes max for batch processing

const VALID_CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];

// Rate limiting: max batches per day
const DAILY_BATCH_LIMIT = 5;
const MAX_SITES_PER_BATCH = 100;

interface BatchResult {
  batchId: string;
  status: "running" | "completed" | "failed";
  targetCount: number;
  location: string;
  categories: string[];
  results: {
    scouted: number;
    generated: number;
    queued: number;
    skipped: number;
    failed: number;
  };
  costs: {
    googlePlaces: number;
    siteGeneration: number;
    dataExtraction: number;
    total: number;
  };
  prospects: { id: string; businessName: string; status: string; previewUrl?: string }[];
  errors: string[];
  startedAt: string;
  completedAt?: string;
}

/**
 * POST /api/pipeline/batch
 *
 * Automated batch pipeline that:
 * 1. Scouts businesses via Google Places
 * 2. Filters out duplicates already in the system
 * 3. Generates preview sites for new ones
 * 4. Queues them with status "pending-review" for admin approval
 *
 * Does NOT auto-start the funnel — sites are queued for manual review first.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      targetCount = 10,
      location,
      categories,
    } = body as {
      targetCount?: number;
      location: string;
      categories?: string[];
    };

    // Validate inputs
    if (!location) {
      return NextResponse.json(
        { error: "location is required (e.g., 'Austin, TX')" },
        { status: 400 }
      );
    }

    if (targetCount > MAX_SITES_PER_BATCH) {
      return NextResponse.json(
        { error: `Maximum ${MAX_SITES_PER_BATCH} sites per batch` },
        { status: 400 }
      );
    }

    if (targetCount < 1) {
      return NextResponse.json(
        { error: "targetCount must be at least 1" },
        { status: 400 }
      );
    }

    // Validate categories
    const categoriesToProcess: Category[] = categories
      ? (categories.filter((c: string) => VALID_CATEGORIES.includes(c as Category)) as Category[])
      : VALID_CATEGORIES.slice(0, 10); // Default to first 10 categories

    if (categoriesToProcess.length === 0) {
      return NextResponse.json(
        { error: "No valid categories provided" },
        { status: 400 }
      );
    }

    // Check daily rate limit
    const todaysBatches = await getTodaysBatchCount();
    if (todaysBatches >= DAILY_BATCH_LIMIT) {
      return NextResponse.json(
        {
          error: `Daily batch limit reached (${DAILY_BATCH_LIMIT}/day). Try again tomorrow.`,
          batchesToday: todaysBatches,
          limit: DAILY_BATCH_LIMIT,
        },
        { status: 429 }
      );
    }

    // Initialize batch tracking
    const batchId = uuidv4();
    const batch: BatchResult = {
      batchId,
      status: "running",
      targetCount,
      location,
      categories: categoriesToProcess,
      results: { scouted: 0, generated: 0, queued: 0, skipped: 0, failed: 0 },
      costs: { googlePlaces: 0, siteGeneration: 0, dataExtraction: 0, total: 0 },
      prospects: [],
      errors: [],
      startedAt: new Date().toISOString(),
    };

    // Save initial batch record
    await saveBatchRecord(batch);

    // Step 1: Scout businesses across categories
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Pipeline Batch ${batchId}`);
    console.log(`Target: ${targetCount} sites | Location: ${location}`);
    console.log(`Categories: ${categoriesToProcess.join(", ")}`);
    console.log(`${"=".repeat(60)}\n`);

    const perCategoryLimit = Math.ceil(targetCount / categoriesToProcess.length);
    let allScoutedProspects: { id: string; businessName: string }[] = [];

    for (const category of categoriesToProcess) {
      if (allScoutedProspects.length >= targetCount) break;

      try {
        const remaining = targetCount - allScoutedProspects.length;
        const limit = Math.min(perCategoryLimit, remaining);

        const prospects = await scout({
          city: location,
          category,
          limit,
        });

        // Log scouting cost
        const scoutCost = prospects.length * COST_RATES.google_places_search;
        batch.costs.googlePlaces += scoutCost;

        await logCost({
          batchId,
          service: "google_places",
          action: "batch_scout",
          costUsd: scoutCost,
          metadata: { category, location, count: prospects.length },
        });

        for (const p of prospects) {
          allScoutedProspects.push({ id: p.id, businessName: p.businessName });
        }

        batch.results.scouted += prospects.length;
      } catch (err) {
        const errorMsg = `Scout failed for ${category}: ${(err as Error).message}`;
        batch.errors.push(errorMsg);
        console.error(`  ${errorMsg}`);
      }
    }

    // Cap at target count
    allScoutedProspects = allScoutedProspects.slice(0, targetCount);

    console.log(`\nScouted ${allScoutedProspects.length} businesses. Starting generation...\n`);

    // Step 2: Generate preview sites for each scouted prospect
    for (const { id, businessName } of allScoutedProspects) {
      try {
        const prospect = await getProspect(id);
        if (!prospect) {
          batch.results.skipped++;
          continue;
        }

        // Skip if already has a generated site
        if (prospect.generatedSiteUrl && prospect.status !== "scouted") {
          batch.results.skipped++;
          batch.prospects.push({
            id: prospect.id,
            businessName: prospect.businessName,
            status: "skipped",
          });
          continue;
        }

        // Extract business data
        console.log(`  Processing: ${businessName}...`);
        const { data, methods, quality } = await extractBusinessData(
          prospect.businessName,
          prospect.city,
          prospect.currentWebsite,
        );

        // Merge extracted data
        const hasData = data.phone || data.services.length > 0 || data.about || data.photos.length > 0;
        if (hasData) {
          const existingSD = (prospect.scrapedData || {}) as Record<string, unknown>;
          prospect.scrapedData = {
            ...existingSD,
            ...data,
            businessName: data.businessName || (existingSD.businessName as string) || prospect.businessName,
            brandColor: (existingSD.brandColor as string) || data.brandColor,
            logoUrl: (existingSD.logoUrl as string) || data.logoUrl,
          };

          const updates: Record<string, unknown> = {
            scrapedData: prospect.scrapedData,
            status: "scraped" as const,
          };
          if (data.phone && !prospect.phone) {
            prospect.phone = data.phone;
            updates.phone = data.phone;
          }
          if (data.email && !prospect.email) {
            prospect.email = data.email;
            updates.email = data.email;
          }
          await updateProspect(id, updates);

          // Log extraction cost
          const extractCost = COST_RATES.google_places_detail;
          batch.costs.dataExtraction += extractCost;
        }

        // Theme recommendation
        const themeRec = recommendTheme(prospect);
        await updateProspect(id, {
          aiThemeRecommendation: themeRec.recommended,
          selectedTheme: themeRec.recommended,
        });
        prospect.aiThemeRecommendation = themeRec.recommended;
        prospect.selectedTheme = themeRec.recommended;

        // Generate preview
        const previewUrl = await generatePreview(prospect);

        // Log generation cost
        const genCost = COST_RATES.site_generation;
        batch.costs.siteGeneration += genCost;

        await logCost({
          batchId,
          prospectId: id,
          service: "manus",
          action: "site_generation",
          costUsd: genCost,
          metadata: { quality, methods, businessName, model: "template_engine" },
        });

         batch.results.generated++;
        batch.results.queued++;

        // STEP 4: Claude supercharge + QC (best-effort, non-blocking)
        let finalStatus = "generated";
        try {
          const projectRoot = process.cwd();
          const [claudeRules, qcRules, qcGuide] = await Promise.all([
            readFile(path.join(projectRoot, "CLAUDE.md"), "utf-8"),
            readFile(path.join(projectRoot, "QC_RULES.md"), "utf-8").catch(() => ""),
            readFile(path.join(projectRoot, "VISUAL_QC_REVIEW_GUIDE.md"), "utf-8").catch(() => ""),
          ]);
          const websiteResearch = await researchBusinessWebsite(prospect.currentWebsite);
          const siteData = (await getScrapedData(id)) as GeneratedSiteData | null;
          if (siteData) {
            const superchargeResult = await runClaudeSupercharge({
              prospect, siteData, websiteResearch, claudeRules, qcRules,
            });
            await saveScrapedData(id, superchargeResult.siteData);
            const qcResult = await runClaudeQcReview({
              prospect, siteData: superchargeResult.siteData, websiteResearch,
              claudeRules, qcRules, qcGuide, automatedQcNotes: "",
            });
            const score = Math.round(qcResult.score);
            const passed = score >= 70 && qcResult.passed;
            finalStatus = passed ? "ready_to_review" : "qc_failed";
            await updateProspect(id, {
              status: finalStatus,
              qualityScore: score,
              qualityNotes: `AUTO-QC: supercharge + Claude review. Score: ${score}/100. ${passed ? "PASS" : "FAIL"}`,
              qcReviewedAt: new Date().toISOString(),
            });
            console.log(`  🤖 Claude QC: ${businessName} score=${score}/100 status=${finalStatus}`);
          }
        } catch (claudeErr) {
          console.error(`  ⚠️ Claude QC failed for ${businessName} (non-blocking):`, claudeErr);
          await updateProspect(id, { status: "generated" });
        }

        batch.prospects.push({
          id: prospect.id,
          businessName: prospect.businessName,
          status: finalStatus as "pending-review",
          previewUrl,
        });
        console.log(`  Done: ${businessName} -> ${previewUrl}`);
      } catch (err) {
        batch.results.failed++;
        const errorMsg = `Generation failed for ${businessName}: ${(err as Error).message}`;
        batch.errors.push(errorMsg);
        batch.prospects.push({
          id,
          businessName,
          status: "failed",
        });
        console.error(`  ${errorMsg}`);
      }
    }

    // Finalize batch
    batch.status = "completed";
    batch.completedAt = new Date().toISOString();
    batch.costs.total = batch.costs.googlePlaces + batch.costs.siteGeneration + batch.costs.dataExtraction;

    // Log total batch cost
    await logCost({
      batchId,
      service: "pipeline",
      action: "batch_total",
      costUsd: batch.costs.total,
      metadata: {
        targetCount,
        location,
        categories: categoriesToProcess,
        results: batch.results,
      },
    });

    // Save final batch record
    await saveBatchRecord(batch);

    console.log(`\n${"=".repeat(60)}`);
    console.log(`Batch ${batchId} Complete!`);
    console.log(`  Scouted: ${batch.results.scouted}`);
    console.log(`  Generated: ${batch.results.generated}`);
    console.log(`  Queued for review: ${batch.results.queued}`);
    console.log(`  Skipped: ${batch.results.skipped}`);
    console.log(`  Failed: ${batch.results.failed}`);
    console.log(`  Total cost: $${batch.costs.total.toFixed(4)}`);
    console.log(`${"=".repeat(60)}\n`);

    return NextResponse.json(batch);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pipeline/batch
 *
 * Returns batch history and daily stats for the pipeline dashboard.
 */
export async function GET() {
  try {
    const batches = await getBatchHistory();
    const todayCount = await getTodaysBatchCount();
    const dailyStats = await getDailyGenerationStats();

    // Get queue status from prospects
    const allProspects = await getAllProspects();
    const queueStatus = {
      pendingReview: allProspects.filter((p) => ["pending-review", "ready_to_review", "qc_failed"].includes(p.status)).length,
      approved: allProspects.filter((p) => p.status === "approved").length,
      generated: allProspects.filter((p) => p.status === "generated").length,
      scouted: allProspects.filter((p) => p.status === "scouted").length,
      totalActive: allProspects.filter(
        (p) => !["dismissed", "unsubscribed"].includes(p.status)
      ).length,
    };

    return NextResponse.json({
      batches,
      todayBatchCount: todayCount,
      dailyBatchLimit: DAILY_BATCH_LIMIT,
      maxSitesPerBatch: MAX_SITES_PER_BATCH,
      queueStatus,
      dailyStats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ==================== BATCH PERSISTENCE ====================

async function saveBatchRecord(batch: BatchResult): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("pipeline_batches").upsert({
        id: batch.batchId,
        status: batch.status,
        target_count: batch.targetCount,
        location: batch.location,
        categories: batch.categories,
        results: batch.results,
        costs: batch.costs,
        prospects: batch.prospects,
        errors: batch.errors,
        started_at: batch.startedAt,
        completed_at: batch.completedAt || null,
      });
    } catch {
      // Table might not exist yet — fall through to file
    }
  }

  // Also save locally for dev
  const fs = await import("fs");
  const path = await import("path");
  const dir = path.join(process.cwd(), "data", "batches");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${batch.batchId}.json`),
    JSON.stringify(batch, null, 2)
  );
}

async function getBatchHistory(): Promise<BatchResult[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("pipeline_batches")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          batchId: row.id as string,
          status: row.status as BatchResult["status"],
          targetCount: row.target_count as number,
          location: row.location as string,
          categories: row.categories as string[],
          results: row.results as BatchResult["results"],
          costs: row.costs as BatchResult["costs"],
          prospects: row.prospects as BatchResult["prospects"],
          errors: row.errors as string[],
          startedAt: row.started_at as string,
          completedAt: row.completed_at as string | undefined,
        }));
      }
    } catch {
      // Table might not exist
    }
  }

  // Fall back to file-based
  try {
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.join(process.cwd(), "data", "batches");
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".json"));
    const batches: BatchResult[] = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      batches.push(JSON.parse(content));
    }
    return batches.sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  } catch {
    return [];
  }
}

async function getTodaysBatchCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isSupabaseConfigured()) {
    try {
      const { count, error } = await supabase
        .from("pipeline_batches")
        .select("*", { count: "exact", head: true })
        .gte("started_at", today.toISOString());

      if (!error && count !== null) return count;
    } catch {
      // Table might not exist
    }
  }

  // Fall back to file-based
  const batches = await getBatchHistory();
  return batches.filter(
    (b) => new Date(b.startedAt) >= today
  ).length;
}

async function getDailyGenerationStats(): Promise<
  { date: string; count: number; cost: number }[]
> {
  // Get the last 30 days of generation stats
  const stats: { date: string; count: number; cost: number }[] = [];
  const batches = await getBatchHistory();

  const dailyMap = new Map<string, { count: number; cost: number }>();

  for (const batch of batches) {
    const date = new Date(batch.startedAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { count: 0, cost: 0 };
    existing.count += batch.results.generated;
    existing.cost += batch.costs.total;
    dailyMap.set(date, existing);
  }

  // Fill in last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const data = dailyMap.get(dateStr) || { count: 0, cost: 0 };
    stats.push({ date: dateStr, ...data });
  }

  return stats;
}
