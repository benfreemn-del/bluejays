/**
 * /api/qc/review/[id]
 *
 * Premium Quality Control gate for generated preview sites.
 *
 * POST — Run the full QC pipeline on a prospect's generated site.
 *   1. Deep-research the prospect's original website when available
 *   2. Send the site through a Claude-powered supercharge pass
 *   3. Run the automated QC checks against the upgraded site data
 *   4. Run a separate Claude QC review using CLAUDE.md + QC rules
 *   5. Persist combined quality_score and quality_notes
 *
 * GET — Return the stored QC result for a prospect (no re-run).
 */

import path from "path";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getProspect, getScrapedData, saveScrapedData, updateProspect } from "@/lib/store";
import { reviewSiteQuality, formatQualityReport } from "@/lib/quality-review";
import { CATEGORY_CONFIG } from "@/lib/types";
import type { ScrapedData } from "@/lib/types";
import type { GeneratedSiteData } from "@/lib/generator";
import { lintPlaceholderContent } from "@/lib/content-brief";
import {
  researchBusinessWebsite,
  runClaudeQcReview,
  runClaudeSupercharge,
} from "@/lib/claude-qc";

const QC_PASS_SCORE = 70;

const PLACEHOLDER_PATTERNS = [
  "Call Us Today",
  "(555) 000-0000",
  "555-000-0000",
  "123 Main Street",
  "Your City",
  "City, State",
  "[BUSINESS_NAME]",
  "[PHONE]",
  "[ADDRESS]",
  "Lorem ipsum",
  "placeholder",
];

interface QcCheckResult {
  check: string;
  passed: boolean;
  detail: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeScrapedRecords(
  existing: Partial<ScrapedData> | undefined,
  incoming: Partial<ScrapedData> | undefined
): Partial<ScrapedData> | undefined {
  if (!existing && !incoming) return undefined;

  return {
    ...(existing || {}),
    ...(incoming || {}),
    services:
      Array.isArray(incoming?.services) && incoming.services.length > 0
        ? incoming.services
        : existing?.services,
    testimonials:
      Array.isArray(incoming?.testimonials) && incoming.testimonials.length > 0
        ? incoming.testimonials
        : existing?.testimonials,
    photos:
      Array.isArray(incoming?.photos) && incoming.photos.length > 0
        ? incoming.photos
        : existing?.photos,
    socialLinks: {
      ...(isRecord(existing?.socialLinks) ? existing.socialLinks : {}),
      ...(isRecord(incoming?.socialLinks) ? incoming.socialLinks : {}),
    },
  };
}

async function loadRuleDocuments() {
  const projectRoot = process.cwd();
  const [claudeRules, qcRules, qcGuide] = await Promise.all([
    readFile(path.join(projectRoot, "CLAUDE.md"), "utf-8"),
    readFile(path.join(projectRoot, "QC_RULES.md"), "utf-8"),
    readFile(path.join(projectRoot, "VISUAL_QC_REVIEW_GUIDE.md"), "utf-8").catch(() => ""),
  ]);

  return { claudeRules, qcRules, qcGuide };
}

async function runExtendedQcChecks(
  prospect: {
    businessName: string;
    city: string;
    phone?: string;
    category: string;
    scrapedData?: Partial<ScrapedData>;
  },
  siteData: GeneratedSiteData
): Promise<QcCheckResult[]> {
  const checks: QcCheckResult[] = [];

  const hasRealName =
    siteData.businessName &&
    siteData.businessName.length >= 3 &&
    !PLACEHOLDER_PATTERNS.some((p) => siteData.businessName.toLowerCase().includes(p.toLowerCase()));
  checks.push({
    check: "Business Name",
    passed: !!hasRealName,
    detail: hasRealName
      ? `Business name "${siteData.businessName}" is populated`
      : "Business name is missing or contains a placeholder",
  });

  const cityInSite =
    siteData.address?.toLowerCase().includes(prospect.city.toLowerCase()) ||
    siteData.about?.toLowerCase().includes(prospect.city.toLowerCase());
  checks.push({
    check: "City Personalization",
    passed: !!cityInSite,
    detail: cityInSite
      ? `City "${prospect.city}" found in site content`
      : `City "${prospect.city}" not found in address or about section — site may be generic`,
  });

  const hasRealPhone =
    !!siteData.phone &&
    siteData.phone !== "Call Us Today" &&
    siteData.phone !== "(555) 000-0000" &&
    siteData.phone !== "555-000-0000" &&
    !PLACEHOLDER_PATTERNS.some((p) => siteData.phone === p);
  checks.push({
    check: "Phone Number",
    passed: hasRealPhone,
    detail: hasRealPhone
      ? `Real phone number present: ${siteData.phone}`
      : `Phone number is missing or is a placeholder ("${siteData.phone || "none"}")`,
  });

  const defaultServiceNames = new Set([
    "Buyer Representation",
    "Seller Services",
    "Market Analysis",
    "Investment Properties",
    "General Dentistry",
    "Cosmetic Dentistry",
    "Dental Implants",
    "Emergency Care",
    "Personal Injury",
    "Family Law",
    "Criminal Defense",
    "Estate Planning",
    "Landscape Design",
    "Lawn Maintenance",
    "Hardscaping",
    "Tree Services",
    "Haircuts & Styling",
    "Color Services",
    "Treatments",
    "Special Occasions",
    "Consultation",
    "Full Service",
    "Emergency Service",
    "Maintenance",
  ]);
  const realServices = siteData.services.filter((s) => !defaultServiceNames.has(s.name));
  const hasRealServices = realServices.length >= 1 || siteData.services.length >= 3;
  checks.push({
    check: "Services",
    passed: hasRealServices,
    detail: hasRealServices
      ? `${siteData.services.length} services listed (${realServices.length} appear business-specific)`
      : `All ${siteData.services.length} services appear to be generic defaults — no real business data scraped`,
  });

  const brief = siteData.researchBrief;
  const hasStructuredBrief =
    !!brief &&
    brief.serviceAreas.length > 0 &&
    brief.actualServices.length > 0 &&
    brief.differentiators.length > 0;
  checks.push({
    check: "Structured Research Brief",
    passed: hasStructuredBrief,
    detail: hasStructuredBrief
      ? `Research brief includes ${brief?.serviceAreas.length || 0} service area(s), ${brief?.actualServices.length || 0} actual service(s), and ${brief?.differentiators.length || 0} differentiator(s)`
      : "Structured research brief is missing required real-business facts (service areas, actual services, or differentiators)",
  });

  const placeholderIssues = lintPlaceholderContent({
    businessName: siteData.businessName,
    tagline: siteData.tagline,
    about: siteData.about,
    testimonials: siteData.testimonials,
    services: siteData.services,
    city: prospect.city,
  });
  checks.push({
    check: "Placeholder Content",
    passed: placeholderIssues.length === 0,
    detail:
      placeholderIssues.length === 0
        ? "No placeholder or template copy detected in key content sections"
        : placeholderIssues.map((issue) => `${issue.section}: ${issue.message}`).join(" | "),
  });

  const scrapedBrandColor = prospect.scrapedData?.brandColor as string | undefined;
  const scrapedBrandColorSource = prospect.scrapedData?.brandColorSource as
    | "official-site"
    | "logo"
    | "category-default"
    | undefined;
  const generatedBrandColorSource = siteData.brandColorSource;

  if (scrapedBrandColor && scrapedBrandColorSource && scrapedBrandColorSource !== "category-default") {
    const colorApplied = siteData.accentColor === scrapedBrandColor;
    checks.push({
      check: "Brand Color",
      passed: colorApplied && generatedBrandColorSource === scrapedBrandColorSource,
      detail: colorApplied
        ? `Applied extracted ${scrapedBrandColorSource} color ${scrapedBrandColor}`
        : `Extracted ${scrapedBrandColorSource} color ${scrapedBrandColor} was not applied — generated site used ${siteData.accentColor} from ${generatedBrandColorSource || "unknown source"}`,
    });
  } else {
    checks.push({
      check: "Brand Color",
      passed: generatedBrandColorSource === "category-default",
      detail:
        generatedBrandColorSource === "category-default"
          ? "No usable brand color was extracted, so a category-safe default was applied explicitly."
          : `Generated site reports ${generatedBrandColorSource || "unknown"} brand-color source without a matching extracted brand color.`,
    });
  }

  const categoryConfig = CATEGORY_CONFIG[siteData.category as keyof typeof CATEGORY_CONFIG];
  const categoryMatches = siteData.category === prospect.category;
  checks.push({
    check: "Template Category Match",
    passed: categoryMatches,
    detail: categoryMatches
      ? `Template category "${siteData.category}" matches prospect category`
      : `Template category "${siteData.category}" does NOT match prospect category "${prospect.category}"`,
  });

  const photosToCheck = siteData.photos.slice(0, 3);
  if (photosToCheck.length > 0) {
    let brokenCount = 0;
    for (const url of photosToCheck) {
      if (!url || url.startsWith("/") || url.startsWith("data:")) continue;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(url, { method: "HEAD", signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) brokenCount += 1;
      } catch {
        brokenCount += 1;
      }
    }
    checks.push({
      check: "Image URLs",
      passed: brokenCount === 0,
      detail:
        brokenCount === 0
          ? `All ${photosToCheck.length} checked images load successfully`
          : `${brokenCount} of ${photosToCheck.length} images are broken or unreachable`,
    });
  } else {
    checks.push({
      check: "Image URLs",
      passed: false,
      detail: "No photos present — site will have no images",
    });
  }

  if (categoryConfig) {
    checks.push({
      check: "Category Config",
      passed: true,
      detail: `Category configuration loaded for ${prospect.category} with accent ${categoryConfig.accentColor}`,
    });
  }

  return checks;
}

function formatExtendedChecks(checks: QcCheckResult[]): string {
  if (!checks.length) return "";
  return [
    "EXTENDED QC CHECKS:",
    ...checks.map((check) => `  ${check.passed ? "✓" : "✗"} [${check.check}] ${check.detail}`),
  ].join("\n");
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const prospect = await getProspect(id);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    const siteData = (await getScrapedData(id)) as GeneratedSiteData | null;
    if (!siteData) {
      return NextResponse.json(
        { error: "No generated site data found. Run site generation first." },
        { status: 400 }
      );
    }

    const { claudeRules, qcRules, qcGuide } = await loadRuleDocuments();
    const websiteResearch = await researchBusinessWebsite(prospect.currentWebsite);

    const mergedScrapedData = mergeScrapedRecords(
      prospect.scrapedData,
      websiteResearch?.mergedScrapedData
    );

    if (websiteResearch?.mergedScrapedData) {
      await updateProspect(id, {
        scrapedData: mergedScrapedData,
        phone: prospect.phone || (websiteResearch.mergedScrapedData.phone as string | undefined),
        email: prospect.email || (websiteResearch.mergedScrapedData.email as string | undefined),
      });
    }

    const superchargeResult = await runClaudeSupercharge({
      prospect: {
        ...prospect,
        phone: prospect.phone || (websiteResearch?.mergedScrapedData.phone as string | undefined),
        email: prospect.email || (websiteResearch?.mergedScrapedData.email as string | undefined),
        scrapedData: mergedScrapedData,
      },
      siteData,
      websiteResearch,
      claudeRules,
      qcRules,
    });

    await saveScrapedData(id, superchargeResult.siteData);

    const qcProspect = {
      ...prospect,
      phone: prospect.phone || superchargeResult.siteData.phone || (websiteResearch?.mergedScrapedData.phone as string | undefined),
      scrapedData: mergedScrapedData,
    };

    const baseReport = reviewSiteQuality(qcProspect, superchargeResult.siteData);
    const extendedChecks = await runExtendedQcChecks(
      {
        businessName: prospect.businessName,
        city: prospect.city,
        phone: qcProspect.phone,
        category: prospect.category,
        scrapedData: mergedScrapedData,
      },
      superchargeResult.siteData
    );

    const formattedBase = formatQualityReport(baseReport);
    const formattedExtended = formatExtendedChecks(extendedChecks);
    const automatedQcNotes = [formattedBase, formattedExtended].filter(Boolean).join("\n\n");

    const claudeQc = await runClaudeQcReview({
      prospect: qcProspect,
      siteData: superchargeResult.siteData,
      websiteResearch,
      claudeRules,
      qcRules,
      qcGuide,
      automatedQcNotes,
    });

    const extendedFailures = extendedChecks.filter((check) => !check.passed);
    const extendedCritical = extendedChecks.filter(
      (check) =>
        !check.passed &&
        (check.check === "Phone Number" ||
          check.check === "Business Name" ||
          check.check === "Template Category Match" ||
          check.check === "Placeholder Content" ||
          check.check === "Structured Research Brief" ||
          check.check === "Image URLs")
    );
    const automatedScore = Math.max(0, baseReport.score - extendedCritical.length * 5);
    const baseCriticals = baseReport.issues.filter((issue) => issue.severity === "critical").length;
    const finalScore = Math.round(automatedScore * 0.45 + claudeQc.score * 0.55);
    const passed =
      finalScore >= QC_PASS_SCORE &&
      baseCriticals === 0 &&
      extendedCritical.length === 0 &&
      claudeQc.passed;
    const newStatus = passed ? "ready_to_review" : "qc_failed";
    const reviewedAt = new Date().toISOString();

    const qualityNotes = [
      `QC PIPELINE: Claude supercharge → automated checks → Claude premium review`,
      `Supercharge summary: ${superchargeResult.summary}`,
      websiteResearch?.summary ? `Website research:\n${websiteResearch.summary}` : "Website research: no original website available.",
      automatedQcNotes,
      "CLAUDE PREMIUM REVIEW:",
      claudeQc.qualityNotes,
      `FINAL DECISION: ${passed ? "PASS" : "FAIL"}`,
      `Combined score: ${finalScore}/100 (automated ${automatedScore}/100, Claude ${claudeQc.score}/100)`,
      `Final status: ${newStatus}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    await updateProspect(id, {
      status: newStatus,
      qualityScore: finalScore,
      qualityNotes,
      qcReviewedAt: reviewedAt,
      phone: qcProspect.phone,
    });

    console.log(
      `[QC] ${prospect.businessName}: automated=${automatedScore}/100, claude=${claudeQc.score}/100, final=${finalScore}/100, status=${newStatus}`
    );

    return NextResponse.json({
      prospectId: id,
      businessName: prospect.businessName,
      score: finalScore,
      passed,
      status: newStatus,
      reviewedAt,
      websiteResearch: {
        sourceUrl: websiteResearch?.sourceUrl,
        pageCount: websiteResearch?.pages.length || 0,
      },
      supercharge: {
        model: superchargeResult.model,
        summary: superchargeResult.summary,
      },
      automated: {
        score: automatedScore,
        baseReport: {
          score: baseReport.score,
          passed: baseReport.passed,
          issues: baseReport.issues,
        },
        extendedChecks,
        extendedFailures,
      },
      claudeReview: {
        model: claudeQc.model,
        summary: claudeQc.summary,
        premiumVerdict: claudeQc.premiumVerdict,
        score: claudeQc.score,
        passed: claudeQc.passed,
        strengths: claudeQc.strengths,
        blockers: claudeQc.blockers,
        notes: claudeQc.notes,
      },
      qualityNotes,
    });
  } catch (error) {
    console.error("[QC] review pipeline failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "QC review failed unexpectedly.",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  if (prospect.qualityScore === undefined) {
    return NextResponse.json(
      {
        prospectId: id,
        businessName: prospect.businessName,
        hasQcResult: false,
        message: "No QC review has been run yet. POST to this endpoint to run QC.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    prospectId: id,
    businessName: prospect.businessName,
    hasQcResult: true,
    score: prospect.qualityScore,
    passed: prospect.status === "ready_to_review",
    status: prospect.status,
    qualityNotes: prospect.qualityNotes,
    reviewedAt: prospect.qcReviewedAt,
  });
}
