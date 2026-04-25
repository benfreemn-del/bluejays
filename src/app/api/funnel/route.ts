import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { getDueProspects, getFunnelStatus, FUNNEL_STEPS } from "@/lib/auto-funnel";
import { sendPitchEmail } from "@/lib/outreach";
import { sendSms, getSmsHistory, getInitialSms, getFollowUpSms1, getFollowUpSms2 } from "@/lib/sms";
import { getProspectVideoUrl } from "@/lib/video-generator";

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

// GET: Show funnel status for all prospects
export async function GET() {
  const prospects = await getAllProspects();
  const statuses = [];

  for (const p of prospects) {
    if (["contacted", "responded", "paid"].includes(p.status)) {
      const status = await getFunnelStatus(p);
      statuses.push({
        ...status,
        businessName: p.businessName,
        category: p.category,
        status: p.status,
      });
    }
  }

  return NextResponse.json({
    prospects: statuses,
    funnelSteps: FUNNEL_STEPS,
    total: statuses.length,
  });
}

// POST: Run the auto-funnel — sends next step to all due prospects
export async function POST() {
  const prospects = await getAllProspects();
  const due = await getDueProspects(prospects);

  const results: { name: string; step: string; email?: string; sms?: string }[] = [];

  for (const { prospect, nextStep } of due) {
    const result: { name: string; step: string; email?: string; sms?: string } = {
      name: prospect.businessName,
      step: nextStep.label,
    };

    // Send email if channel includes it — respect domain warming limits
    if (nextStep.channels.includes("email") && prospect.email && prospect.generatedSiteUrl) {
      try {
        const { canSendEmail, recordEmailSent } = await import("@/lib/domain-warming");
        const { canSend, remaining, limit } = await canSendEmail();
        if (!canSend) {
          result.email = `skipped: daily warming limit reached (${limit}/day)`;
        } else {
          await sendPitchEmail(prospect);
          await recordEmailSent();
          result.email = `sent (${remaining - 1} remaining today)`;
        }
      } catch (err) {
        result.email = `failed: ${(err as Error).message}`;
      }
    }

    // Send SMS if channel includes it
    if (nextStep.channels.includes("sms") && prospect.phone && prospect.generatedSiteUrl && prospect.outreachChannel !== "email-only") {
      try {
        const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl}`;
        const videoUrl = await getProspectVideoUrl(prospect.id);
        const history = await getSmsHistory(prospect.id);
        const lastSeq = history.length > 0 ? Math.max(...history.map((s) => s.sequence)) : 0;
        let body: string;
        if (lastSeq === 0) body = getInitialSms(prospect, previewUrl, videoUrl);
        else if (lastSeq === 1) body = getFollowUpSms1(prospect, previewUrl, videoUrl);
        else if (lastSeq === 2) body = getFollowUpSms2(prospect, previewUrl, videoUrl);
        else { result.sms = "all sequences sent"; continue; }
        await sendSms(prospect.id, prospect.phone, body, lastSeq + 1);
        result.sms = "sent";
      } catch (err) {
        result.sms = `failed: ${(err as Error).message}`;
      }
    }

    results.push(result);
  }

  return NextResponse.json({
    message: `Auto-funnel processed ${results.length} prospects`,
    results,
    dueCount: due.length,
  });
}
