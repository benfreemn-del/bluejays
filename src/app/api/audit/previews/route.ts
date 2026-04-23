import { NextResponse } from "next/server";
import { getAllProspects, getScrapedData } from "@/lib/store";
import type { GeneratedSiteData } from "@/lib/generator";

/**
 * GET /api/audit/previews
 *
 * Audits all approved/ready_to_send prospects for launch readiness.
 * Checks each one for:
 *  1. Has a generated preview URL
 *  2. Has a real phone number
 *  3. Has 3+ services
 *  4. Has an about/description (not placeholder text)
 *  5. Hero image URL responds with HTTP 200
 *
 * Returns a structured report: passed, failed (with reasons), and a per-prospect list.
 *
 * POST /api/audit/previews — same as GET but runs live HTTP checks (slower)
 */

const AUDIT_STATUSES = ["approved", "ready_to_send", "pending-review", "ready_to_review"];
const PLACEHOLDER_PATTERNS = [
  /^is a .+ business serving/i,
  /^a .+ business/i,
  /proudly serving .+ and/i,
  /lorem ipsum/i,
  /your about text here/i,
];

function isPlaceholderText(text: string): boolean {
  return PLACEHOLDER_PATTERNS.some((re) => re.test(text.trim()));
}

async function checkImageUrl(url: string): Promise<boolean> {
  if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  return runAudit(false);
}

export async function POST() {
  return runAudit(true); // POST = run image HTTP checks too
}

async function runAudit(checkImages: boolean) {
  try {
    const prospects = await getAllProspects();
    const targets = prospects.filter((p) => AUDIT_STATUSES.includes(p.status));

    const results: {
      id: string;
      businessName: string;
      category: string;
      status: string;
      passed: boolean;
      issues: string[];
    }[] = [];

    for (const prospect of targets) {
      const issues: string[] = [];

      // 1. Has preview URL
      if (!prospect.generatedSiteUrl) {
        issues.push("Missing generated preview URL");
      }

      // 2. Has real phone
      if (!prospect.phone) {
        issues.push("No phone number");
      } else if (!/\d{7,}/.test(prospect.phone.replace(/\D/g, ""))) {
        issues.push(`Phone looks invalid: ${prospect.phone}`);
      }

      // 3. Check site_data quality
      let siteData: GeneratedSiteData | null = null;
      try {
        siteData = await getScrapedData(prospect.id) as GeneratedSiteData | null;
      } catch {
        issues.push("Failed to load site data");
      }

      if (siteData) {
        // 3a. Services count
        const serviceCount = siteData.services?.length || 0;
        if (serviceCount < 3) {
          issues.push(`Only ${serviceCount} service(s) — needs at least 3`);
        }

        // 3b. About text
        const about = siteData.about || siteData.description || "";
        if (!about || about.length < 30) {
          issues.push("About/description is missing or too short");
        } else if (isPlaceholderText(about)) {
          issues.push("About text looks like placeholder copy");
        }

        // 3c. Hero image (optional HTTP check)
        const heroImage = siteData.heroImage || (siteData.photos?.[0]);
        if (!heroImage) {
          issues.push("No hero image");
        } else if (checkImages) {
          const ok = await checkImageUrl(heroImage);
          if (!ok) issues.push(`Hero image returns non-200: ${heroImage.substring(0, 80)}`);
        }
      } else if (prospect.generatedSiteUrl) {
        issues.push("Site data not found in store");
      }

      results.push({
        id: prospect.id,
        businessName: prospect.businessName,
        category: prospect.category,
        status: prospect.status,
        passed: issues.length === 0,
        issues,
      });
    }

    const passed = results.filter((r) => r.passed);
    const failed = results.filter((r) => !r.passed);

    // Group failures by issue type for quick overview
    const issueFrequency: Record<string, number> = {};
    for (const r of failed) {
      for (const issue of r.issues) {
        const key = issue.replace(/:.*/g, "").trim();
        issueFrequency[key] = (issueFrequency[key] || 0) + 1;
      }
    }

    return NextResponse.json({
      summary: {
        total: targets.length,
        passed: passed.length,
        failed: failed.length,
        passRate: targets.length > 0 ? ((passed.length / targets.length) * 100).toFixed(0) + "%" : "0%",
        imageChecksRun: checkImages,
      },
      topIssues: Object.entries(issueFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(([issue, count]) => ({ issue, count })),
      passed: passed.map((r) => ({ id: r.id, businessName: r.businessName, status: r.status })),
      failed,
    });
  } catch (err) {
    console.error("[audit/previews]", err);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
