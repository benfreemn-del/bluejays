import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendEmail } from "@/lib/email-sender";
import {
  getAIPackageWelcome1,
  getAIPackageWelcome2,
  getAIPackageWelcome3,
} from "@/lib/ai-package-welcome-emails";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * /api/cron/ai-package-welcome
 *
 * Daily cron — sends the 3-email post-purchase welcome sequence to
 * AI Package ($9,700) clients. Closes the "Day 1 of being a paying
 * client is silent" gap that was costing trust on every $9.7K close.
 *
 * Trigger: prospect.pricing_tier = 'fullsystem' AND
 *          ai_package_welcome_step < 3 AND
 *          (per-step time gate hit since last welcome touch).
 *
 * Cadence:
 *   Step 0 → 1 (immediate, no time gate — fires same day as payment)
 *   Step 1 → 2 (24h after step 1)
 *   Step 2 → 3 (24h after step 2)
 *
 * The full 3-email sequence completes within 48 hours of payment.
 *
 * Cron schedule: 16:13 UTC daily (off-peak minute, after the audit
 * follow-up cron at 17:45 to avoid sender-rotation collision).
 *
 * Authoritative trigger relies on `pricing_tier = 'fullsystem'` being
 * stamped on the prospect when the AI Package payment lands. Stripe
 * webhook OR manual stamp via the dashboard sets it; this cron then
 * picks them up automatically.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface FullSystemProspect {
  id: string;
  business_name: string | null;
  owner_name: string | null;
  email: string | null;
  pricing_tier: string;
  ai_package_welcome_step: number | null;
  ai_package_welcome_at: string | null;
  status: string | null;
}

const STEP_GATE_HOURS: Record<number, number> = {
  // step→hours since last touch before sending the NEXT step
  0: 0, // first email fires immediately (no prior touch)
  1: 22, // ~24h, with 2h buffer so Day 1 lands the next morning naturally
  2: 22, // same gate for Day 2
};

export async function POST(request?: NextRequest) {
  if (request) {
    const auth = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    await logHeartbeat(
      "ai_package_welcome",
      { reason: "supabase_not_configured" },
      "skipped",
    );
    return NextResponse.json({ message: "Supabase not configured", sent: 0 });
  }

  const { data: rows } = await supabase
    .from("prospects")
    .select(
      "id, business_name, owner_name, email, pricing_tier, ai_package_welcome_step, ai_package_welcome_at, status",
    )
    .eq("pricing_tier", "fullsystem")
    .lt("ai_package_welcome_step", 3)
    .limit(100);

  const prospects = (rows ?? []) as FullSystemProspect[];

  if (prospects.length === 0) {
    await logHeartbeat("ai_package_welcome", { sent: 0 });
    return NextResponse.json({ message: "No new fullsystem clients", sent: 0 });
  }

  const now = Date.now();
  const HOUR_MS = 60 * 60 * 1000;
  let sent = 0;
  let failed = 0;
  const log: Array<{ id: string; step: number; result: string }> = [];

  for (const p of prospects) {
    if (!p.email) {
      log.push({ id: p.id, step: 0, result: "skipped_no_email" });
      continue;
    }
    // Don't email unsubscribed / bounced clients even if they're
    // technically pricing_tier=fullsystem (refund pending case).
    if (
      p.status === "unsubscribed" ||
      p.status === "bounced" ||
      p.status === "dismissed"
    ) {
      log.push({ id: p.id, step: 0, result: `skipped_status_${p.status}` });
      continue;
    }

    const currentStep = p.ai_package_welcome_step ?? 0;
    const nextStep = currentStep + 1;
    if (nextStep > 3) continue;

    // Time-gate check: don't fire next step until enough time has
    // passed since the last welcome touch.
    const lastTouchAt = p.ai_package_welcome_at
      ? new Date(p.ai_package_welcome_at).getTime()
      : 0;
    const hoursSince = lastTouchAt ? (now - lastTouchAt) / HOUR_MS : Infinity;
    const requiredGate = STEP_GATE_HOURS[currentStep] ?? 22;
    if (hoursSince < requiredGate) {
      log.push({
        id: p.id,
        step: nextStep,
        result: `gated_${Math.round(hoursSince)}h_of_${requiredGate}h`,
      });
      continue;
    }

    const businessName = p.business_name || "your business";
    const ownerFirstName =
      (p.owner_name || "").trim().split(/\s+/)[0] || undefined;
    const portalUrl = `https://bluejayportfolio.com/clients/${slugify(businessName)}/portal`;
    const aiSkillsUrl = `${portalUrl}?tab=ai-skills`;
    const onboardingUrl = `https://bluejayportfolio.com/onboarding/${p.id}`;

    let template;
    switch (nextStep) {
      case 1:
        template = getAIPackageWelcome1({
          businessName,
          ownerFirstName,
          portalUrl,
        });
        break;
      case 2:
        template = getAIPackageWelcome2({
          businessName,
          ownerFirstName,
          portalUrl,
          aiSkillsUrl,
        });
        break;
      case 3:
        template = getAIPackageWelcome3({
          businessName,
          ownerFirstName,
          onboardingUrl,
        });
        break;
      default:
        continue;
    }

    try {
      await sendEmail(
        p.id,
        p.email,
        template.subject,
        template.body,
        template.sequence,
        undefined,
        { transactional: true }, // post-purchase = transactional
      );
      await supabase
        .from("prospects")
        .update({
          ai_package_welcome_step: nextStep,
          ai_package_welcome_at: new Date().toISOString(),
        })
        .eq("id", p.id);
      sent++;
      log.push({ id: p.id, step: nextStep, result: "sent" });
    } catch (err) {
      failed++;
      log.push({
        id: p.id,
        step: nextStep,
        result: `failed:${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  await logHeartbeat("ai_package_welcome", {
    sent,
    failed,
    inspected: prospects.length,
  });

  return NextResponse.json({
    message: `AI Package welcome cron: ${sent} sent, ${failed} failed`,
    sent,
    failed,
    inspected: prospects.length,
    log,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}

/** Best-effort slug for portal URL — falls back to a sensible default
 *  if the business_name is awkward. The portal route resolves the slug
 *  via client_owners join so an exact match isn't required for the
 *  email link to work. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
