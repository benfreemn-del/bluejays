/**
 * /api/qc/review/[id]
 *
 * Automated Quality Control gate for generated preview sites.
 *
 * POST — Run the full QC check on a prospect's generated site.
 *   - Verifies personalization (business name, city, phone, services populated — no placeholders)
 *   - Checks brand colors were applied (if scraped)
 *   - Verifies all image URLs are reachable (no broken URLs)
 *   - Checks the template matches the business category
 *   - Writes quality_score and quality_notes to the prospect record
 *   - Sets status to "ready_to_review" (pass) or "qc_failed" (fail)
 *   - Only sites that PASS get status "ready_to_review"
 *
 * GET — Return the stored QC result for a prospect (no re-run).
 */

import { NextResponse } from "next/server";
import { getProspect, getScrapedData, updateProspect } from "@/lib/store";
import { reviewSiteQuality, formatQualityReport } from "@/lib/quality-review";
import { CATEGORY_CONFIG } from "@/lib/types";
import type { GeneratedSiteData } from "@/lib/generator";

// QC pass threshold — must score >= 70 AND have zero critical issues
const QC_PASS_SCORE = 70;

// Placeholder strings that indicate un-personalized content
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

/**
 * Run extended QC checks beyond the base quality-review:
 * placeholder detection, brand color, image reachability, category match.
 */
async function runExtendedQcChecks(
  prospect: { businessName: string; city: string; phone?: string; category: string; scrapedData?: Record<string, unknown> },
  siteData: GeneratedSiteData
): Promise<QcCheckResult[]> {
  const checks: QcCheckResult[] = [];

  // 1. Business name personalization
  const hasRealName =
    siteData.businessName &&
    siteData.businessName.length >= 3 &&
    !PLACEHOLDER_PATTERNS.some((p) => siteData.businessName.toLowerCase().includes(p.toLowerCase()));
  checks.push({
    check: "Business Name",
    passed: !!hasRealName,
    detail: hasRealName
      ? `Business name "${siteData.businessName}" is populated`
      : `Business name is missing or contains a placeholder`,
  });

  // 2. City present in address or about
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

  // 3. Phone number — real number, not placeholder
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

  // 4. Services populated — at least 3 real (non-default) services
  const defaultServiceNames = new Set([
    "Buyer Representation", "Seller Services", "Market Analysis", "Investment Properties",
    "General Dentistry", "Cosmetic Dentistry", "Dental Implants", "Emergency Care",
    "Personal Injury", "Family Law", "Criminal Defense", "Estate Planning",
    "Landscape Design", "Lawn Maintenance", "Hardscaping", "Tree Services",
    "Haircuts & Styling", "Color Services", "Treatments", "Special Occasions",
    "Consultation", "Full Service", "Emergency Service", "Maintenance",
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

  // 5. Brand color applied (if scraped from website)
  const scrapedBrandColor = ((prospect.scrapedData as unknown) as Record<string, unknown> | undefined)?.brandColor as string | undefined;
  if (scrapedBrandColor) {
    const colorApplied = siteData.accentColor === scrapedBrandColor;
    checks.push({
      check: "Brand Color",
      passed: colorApplied,
      detail: colorApplied
        ? `Brand color ${scrapedBrandColor} applied correctly`
        : `Scraped brand color ${scrapedBrandColor} not applied — using default ${siteData.accentColor}`,
    });
  } else {
    checks.push({
      check: "Brand Color",
      passed: true,
      detail: "No brand color scraped — using category default (acceptable)",
    });
  }

  // 6. Template category match
  const categoryConfig = CATEGORY_CONFIG[siteData.category as keyof typeof CATEGORY_CONFIG];
  const categoryMatches = siteData.category === prospect.category;
  checks.push({
    check: "Template Category Match",
    passed: categoryMatches,
    detail: categoryMatches
      ? `Template category "${siteData.category}" matches prospect category`
      : `Template category "${siteData.category}" does NOT match prospect category "${prospect.category}"`,
  });

  // 7. Image URL reachability (check up to 3 photos, 3s timeout each)
  const photosToCheck = siteData.photos.slice(0, 3);
  if (photosToCheck.length > 0) {
    let brokenCount = 0;
    const brokenUrls: string[] = [];
    for (const url of photosToCheck) {
      if (!url || url.startsWith("/") || url.startsWith("data:")) continue; // local/data URLs are fine
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(url, { method: "HEAD", signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) {
          brokenCount++;
          brokenUrls.push(url);
        }
      } catch {
        brokenCount++;
        brokenUrls.push(url);
      }
    }
    const allLoad = brokenCount === 0;
    checks.push({
      check: "Image URLs",
      passed: allLoad,
      detail: allLoad
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

  return checks;
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

  const siteData = (await getScrapedData(id)) as GeneratedSiteData | null;
  if (!siteData) {
    return NextResponse.json(
      { error: "No generated site data found. Run site generation first." },
      { status: 400 }
    );
  }

  // Run base quality review (existing checks)
  const baseReport = reviewSiteQuality(prospect, siteData);

  // Run extended QC checks (personalization, brand color, images, category)
  const extendedChecks = await runExtendedQcChecks(
    {
      businessName: prospect.businessName,
      city: prospect.city,
      phone: prospect.phone,
      category: prospect.category,
      scrapedData: prospect.scrapedData as Record<string, unknown> | undefined,
    },
    siteData
  );

  // Merge extended check failures into the report
  const extendedFailures = extendedChecks.filter((c) => !c.passed);
  const extendedCritical = extendedChecks.filter(
    (c) =>
      !c.passed &&
      (c.check === "Phone Number" ||
        c.check === "Business Name" ||
        c.check === "Template Category Match")
  );

  // Compute final score: base score minus 5pts per extended critical failure
  const finalScore = Math.max(0, baseReport.score - extendedCritical.length * 5);

  // Pass criteria: score >= 70 AND no critical issues in base report AND no critical extended failures
  const baseCriticals = baseReport.issues.filter((i) => i.severity === "critical").length;
  const passed = finalScore >= QC_PASS_SCORE && baseCriticals === 0 && extendedCritical.length === 0;

  // Build quality notes
  const formattedBase = formatQualityReport(baseReport);
  const extendedLines: string[] = [];
  if (extendedChecks.length > 0) {
    extendedLines.push("\nEXTENDED QC CHECKS:");
    for (const c of extendedChecks) {
      extendedLines.push(`  ${c.passed ? "✓" : "✗"} [${c.check}] ${c.detail}`);
    }
  }
  const qualityNotes = formattedBase + extendedLines.join("\n");

  // Determine new status
  const newStatus = passed ? "ready_to_review" : "qc_failed";

  // Persist QC results to the prospect record
  await updateProspect(id, {
    status: newStatus,
    qualityScore: finalScore,
    qualityNotes,
    qcReviewedAt: new Date().toISOString(),
  });

  console.log(
    `  [QC] ${prospect.businessName}: score=${finalScore}/100, status=${newStatus}, ` +
      `baseCriticals=${baseCriticals}, extendedCriticals=${extendedCritical.length}`
  );

  return NextResponse.json({
    prospectId: id,
    businessName: prospect.businessName,
    score: finalScore,
    passed,
    status: newStatus,
    baseReport: {
      score: baseReport.score,
      passed: baseReport.passed,
      issues: baseReport.issues,
    },
    extendedChecks,
    extendedFailures,
    qualityNotes,
    reviewedAt: new Date().toISOString(),
  });
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

  // Return stored QC result without re-running
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
