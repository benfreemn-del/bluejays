import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { generatePreview } from "@/lib/generator";
import type { Prospect } from "@/lib/types";

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "bluejaycontactme@gmail.com";

const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;

/**
 * Win-Back Campaign — $497 limited offer for cold leads.
 *
 * Targets leads that went cold after initial contact:
 * - "dismissed" or "not_interested" — 60+ days ago
 * - "contacted" / "email_opened" — stuck 60+ days with no movement
 *
 * Different framing: "we refreshed your site" + lower price.
 *
 * GET  /api/winback — preview eligible leads
 * POST /api/winback — run the campaign
 */

function isEligible(p: Prospect, now: number): boolean {
  const age = now - new Date(p.updatedAt).getTime();
  if (age < SIXTY_DAYS) return false;
  if (["dismissed", "not_interested"].includes(p.status)) return true;
  if (["contacted", "email_opened"].includes(p.status)) return true;
  return false;
}

export async function GET() {
  const prospects = await getAllProspects();
  const now = Date.now();

  const eligible = prospects.filter((p) => isEligible(p, now));

  return NextResponse.json({
    eligible: eligible.map((p) => ({
      id: p.id,
      businessName: p.businessName,
      category: p.category,
      city: p.city,
      status: p.status,
      staleDays: Math.floor((now - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
      email: p.email,
      phone: p.phone,
    })),
    total: eligible.length,
  });
}

export async function POST() {
  const prospects = await getAllProspects();
  const now = Date.now();

  const eligible = prospects.filter((p) => isEligible(p, now));
  const results: { name: string; status: string }[] = [];

  for (const prospect of eligible) {
    try {
      // Regenerate with a fresh look
      const previewUrl = await generatePreview(prospect);
      prospect.generatedSiteUrl = previewUrl;

      if (prospect.email && SENDGRID_API_KEY) {
        await sendWinBackEmail(prospect, `${BASE_URL}${previewUrl}`);
        results.push({ name: prospect.businessName, status: "sent" });
      } else {
        results.push({ name: prospect.businessName, status: "regenerated (no email)" });
      }
    } catch (err) {
      results.push({ name: prospect.businessName, status: `failed: ${(err as Error).message}` });
    }
  }

  return NextResponse.json({
    message: `Win-back sent to ${results.filter((r) => r.status === "sent").length} leads`,
    results,
  });
}

async function sendWinBackEmail(prospect: Prospect, previewUrl: string) {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;

  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: prospect.email }] }],
      from: { email: FROM_EMAIL, name: "Ben @ BlueJays" },
      subject: `${name}, we rebuilt your ${prospect.businessName} site`,
      content: [{
        type: "text/plain",
        value: `Hey ${name},

A few months back I built a website for ${prospect.businessName}. I'm not sure if the timing was off or if life just got busy — either way, no hard feelings.

I rebuilt it recently with some improvements and wanted to give you another look before I move on:

${previewUrl}

Because you've seen this before, I'm offering it at $497 instead of the usual $997 — same site, same hosting, same everything. Just a second chance in case the timing is better now.

No pressure. If it's still not the right time, all good.

— Ben @ BlueJays
bluejaycontactme@gmail.com

To stop receiving emails: ${BASE_URL}/unsubscribe/${prospect.id}`,
      }],
    }),
  });
}
