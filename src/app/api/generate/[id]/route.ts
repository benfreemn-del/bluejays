import path from "path";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getProspect, getScrapedData, saveScrapedData, updateProspect } from "@/lib/store";
import { generatePreview } from "@/lib/generator";
import { extractBusinessData } from "@/lib/data-extractor";
import { recommendTheme } from "@/lib/theme-recommender";
import { logCost, COST_RATES } from "@/lib/cost-logger";
import {
  researchBusinessWebsite,
  runClaudeSupercharge,
  runClaudeQcReview,
} from "@/lib/claude-qc";
import type { GeneratedSiteData } from "@/lib/generator";

// Vercel Pro: up to 300s — increased for Claude integration
export const maxDuration = 300;

/**
 * Load CLAUDE.md, QC_RULES.md, and VISUAL_QC_REVIEW_GUIDE.md for Claude prompts.
 */
async function loadRuleDocuments() {
  const projectRoot = process.cwd();
  const [claudeRules, qcRules, qcGuide] = await Promise.all([
    readFile(path.join(projectRoot, "CLAUDE.md"), "utf-8"),
    readFile(path.join(projectRoot, "QC_RULES.md"), "utf-8").catch(() => ""),
    readFile(path.join(projectRoot, "VISUAL_QC_REVIEW_GUIDE.md"), "utf-8").catch(() => ""),
  ]);
  return { claudeRules, qcRules, qcGuide };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  try {
    // STEP 1: Cascading data extraction — try every method until we have good data
    console.log(`\n🔄 Starting data extraction for "${prospect.businessName}"...`);
    const { data, methods, quality } = await extractBusinessData(
      prospect.businessName,
      prospect.city,
      prospect.currentWebsite,
    );

    // Save scraped data if we got anything useful — SMART MERGE to preserve manual enrichments
    // Key rule: NEVER overwrite non-empty enriched data with empty scraper results
    const hasData = data.phone || data.services.length > 0 || data.about || data.photos.length > 0;
    if (hasData) {
      const existingSD = (prospect.scrapedData || {}) as Record<string, unknown>;
      const existingServices = existingSD.services as Array<unknown> | undefined;
      const existingAbout = existingSD.about as string | undefined;
      const existingTagline = existingSD.tagline as string | undefined;
      const existingStats = existingSD.stats as Array<unknown> | undefined;
      const existingPhotos = existingSD.photos as string[] | undefined;
      // If existing photos include local /images/ paths (manually curated), preserve them
      const hasManualPhotos = existingPhotos?.some((p: string) => typeof p === "string" && p.startsWith("/images/"));
      prospect.scrapedData = ({
        ...existingSD,
        ...data,
        // Preserve manually curated photos (local /images/ paths) over scraper results
        photos: hasManualPhotos ? (existingPhotos || []) : (data.photos?.length > 0 ? data.photos : (existingPhotos || data.photos || [])),
        // Preserve enriched data if scraper returned empty — never overwrite good data with nothing
        services: data.services?.length > 0 ? data.services : (existingServices?.length ? existingServices : data.services),
        about: (data.about && data.about.length > 50) ? data.about : (existingAbout && existingAbout.length > 50 ? existingAbout : data.about),
        tagline: data.tagline || existingTagline || "",
        stats: (data.stats as Array<unknown>)?.length > 0 ? data.stats : (existingStats?.length ? existingStats : (data.stats || [])),
        businessName: data.businessName || (existingSD.businessName as string) || prospect.businessName,
        brandColor: (existingSD.brandColor as string) || data.brandColor,
        accentColor: (existingSD.accentColor as string) || data.accentColor || (existingSD.brandColor as string) || data.brandColor,
        brandColorSource:
          data.brandColorSource ||
          (existingSD.brandColorSource as "official-site" | "logo" | "category-default" | undefined),
        logoUrl: data.logoUrl || (existingSD.logoUrl as string),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any;
      const updates: Record<string, unknown> = {
        scrapedData: prospect.scrapedData,
        status: "scraped" as const,
      };
      if (data.address) {
        prospect.address = data.address;
        updates.address = data.address;
      }
      if (data.city && data.city !== prospect.city) {
        prospect.city = data.city;
        updates.city = data.city;
      }
      if (data.phone && !prospect.phone) {
        prospect.phone = data.phone;
        updates.phone = data.phone;
      }
      if (data.email && !prospect.email) {
        prospect.email = data.email;
        updates.email = data.email;
      }
      const igHandle = (data as unknown as Record<string, unknown>).__instagramHandle as string | undefined;
      if (igHandle && !prospect.instagramHandle) {
        prospect.instagramHandle = igHandle;
        updates.instagramHandle = igHandle;
      }
      await updateProspect(id, updates);
      console.log(`  ✅ Data loaded (quality: ${quality}, methods: ${methods.join(", ")})`);
    } else {
      console.log(`  ⚠️ No data extracted from any source — using defaults`);
    }

    // STEP 2: AI theme recommendation based on category, brand colors, and business data
    const themeRec = recommendTheme(prospect);
    const resolvedTheme = prospect.selectedTheme || themeRec.recommended;
    await updateProspect(id, {
      aiThemeRecommendation: themeRec.recommended,
      ...(prospect.selectedTheme ? {} : { selectedTheme: themeRec.recommended }),
    });
    prospect.aiThemeRecommendation = themeRec.recommended;
    prospect.selectedTheme = resolvedTheme;
    console.log(`  🎨 Theme recommendation: ${themeRec.recommended} (confidence: ${themeRec.confidence}%)`);
    console.log(`     Reasons: ${themeRec.reasons.join("; ")}`);

    // STEP 3: Generate preview (quality gate built into generator)
    const previewUrl = await generatePreview(prospect);

    // Log site generation cost
    await logCost({
      prospectId: id,
      service: "manus",
      action: "site_generation",
      costUsd: COST_RATES.site_generation,
      metadata: {
        model: "template_engine",
        quality,
        methods,
        theme: prospect.selectedTheme,
        category: prospect.category,
      },
    });

    // STEP 4: Claude supercharge + QC review — runs automatically after generation
    // This deep-scrapes the original website, upgrades the site data, and runs QC
    let claudeResult: { superchargeSummary: string; qcScore: number; qcPassed: boolean; qcStatus: string } | null = null;
    try {
      console.log(`  🤖 Running Claude supercharge + QC for "${prospect.businessName}"...`);

      const { claudeRules, qcRules, qcGuide } = await loadRuleDocuments();

      // Deep research the original business website
      const websiteResearch = await researchBusinessWebsite(prospect.currentWebsite);

      // Get the generated site data
      const siteData = (await getScrapedData(id)) as GeneratedSiteData | null;
      if (siteData) {
        // Run Claude supercharge — upgrades site data with everything from the original website
        const superchargeResult = await runClaudeSupercharge({
          prospect,
          siteData,
          websiteResearch,
          claudeRules,
          qcRules,
        });

        // Save the supercharged site data
        await saveScrapedData(id, superchargeResult.siteData);

        // Run Claude QC review on the supercharged data
        const qcResult = await runClaudeQcReview({
          prospect,
          siteData: superchargeResult.siteData,
          websiteResearch,
          claudeRules,
          qcRules,
          qcGuide,
          automatedQcNotes: "",
        });

        const finalScore = Math.round(qcResult.score);
        const passed = finalScore >= 70 && qcResult.passed;
        const newStatus = passed ? "ready_to_review" : "qc_failed";

        const qualityNotes = [
          `AUTO-QC PIPELINE: generation → Claude supercharge → Claude premium review`,
          `Supercharge summary: ${superchargeResult.summary}`,
          websiteResearch?.summary ? `Website research:\n${websiteResearch.summary}` : "Website research: no original website available.",
          "CLAUDE PREMIUM REVIEW:",
          qcResult.qualityNotes,
          `FINAL DECISION: ${passed ? "PASS" : "FAIL"}`,
          `Score: ${finalScore}/100`,
          `Status: ${newStatus}`,
        ].filter(Boolean).join("\n\n");

        await updateProspect(id, {
          status: newStatus,
          qualityScore: finalScore,
          qualityNotes,
          qcReviewedAt: new Date().toISOString(),
        });

        claudeResult = {
          superchargeSummary: superchargeResult.summary,
          qcScore: finalScore,
          qcPassed: passed,
          qcStatus: newStatus,
        };

        console.log(`  ✅ Claude QC complete: score=${finalScore}/100, status=${newStatus}`);
      }
    } catch (claudeError) {
      // Claude integration is best-effort during generation — don't fail the whole generation
      console.error(`  ⚠️ Claude supercharge/QC failed (non-blocking):`, claudeError);
      // Still mark as generated so the site is visible, just without Claude QC
      await updateProspect(id, { status: "generated" });
    }

    return NextResponse.json({
      message: `Preview generated for ${prospect.businessName}`,
      previewUrl,
      quality,
      methods,
      hasPhone: !!prospect.phone || !!data.phone,
      claude: claudeResult,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
