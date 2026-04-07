import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { generatePreview } from "@/lib/generator";
import { sendPitchEmail } from "@/lib/outreach";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * Win-Back Campaign
 *
 * Finds leads that were dismissed 90+ days ago,
 * regenerates their website with a fresh look,
 * and sends a "we rebuilt your site" email.
 *
 * POST /api/winback — runs the win-back for all eligible leads
 * GET /api/winback — shows eligible leads without sending
 */

export async function GET() {
  const prospects = await getAllProspects();
  const now = Date.now();
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

  const eligible = prospects.filter((p) => {
    if (p.status !== "dismissed") return false;
    const dismissedAge = now - new Date(p.updatedAt).getTime();
    return dismissedAge >= NINETY_DAYS;
  });

  return NextResponse.json({
    eligible: eligible.map((p) => ({
      id: p.id,
      businessName: p.businessName,
      category: p.category,
      city: p.city,
      dismissedDaysAgo: Math.floor((now - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
      email: p.email,
      phone: p.phone,
    })),
    total: eligible.length,
  });
}

export async function POST() {
  const prospects = await getAllProspects();
  const now = Date.now();
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

  const eligible = prospects.filter((p) => {
    if (p.status !== "dismissed") return false;
    const dismissedAge = now - new Date(p.updatedAt).getTime();
    return dismissedAge >= NINETY_DAYS;
  });

  const results: { name: string; status: string }[] = [];

  for (const prospect of eligible) {
    try {
      // Regenerate their site (fresh design)
      const previewUrl = await generatePreview(prospect);

      // Send win-back email
      if (prospect.email) {
        // Override status temporarily to allow sending
        prospect.status = "approved";
        prospect.generatedSiteUrl = previewUrl;
        await sendPitchEmail(prospect);
        results.push({ name: prospect.businessName, status: "sent" });
      } else {
        results.push({ name: prospect.businessName, status: "regenerated (no email)" });
      }
    } catch (err) {
      results.push({ name: prospect.businessName, status: `failed: ${(err as Error).message}` });
    }
  }

  return NextResponse.json({
    message: `Win-back campaign sent to ${results.filter((r) => r.status === "sent").length} leads`,
    results,
  });
}
