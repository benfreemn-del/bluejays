import { NextResponse } from "next/server";
import { getAllProspects, updateProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import { getReferralEmail } from "@/lib/email-templates";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * GET /api/referral/send
 *
 * Cron job (daily at 10am Pacific) — finds paid clients who:
 *   1. Paid 30+ days ago
 *   2. Haven't received a referral invite yet
 *   3. Are NPS PROMOTERS (latest `nps_responses.category === 'promoter'`)
 *
 * Wave-5b retention: this cron used to fire to every paid customer
 * regardless of how happy they were. Detractors and lukewarm passives
 * were getting a tone-deaf "send your friends!" pitch — actively
 * harmful for at-risk customers. Per Rule 44, the Day-30 referral
 * email is now NPS-gated:
 *   - promoter (9-10) → fire the email (this cron's job)
 *   - passive  (7-8)  → SKIP entirely
 *   - detractor (0-6) → SKIP entirely
 *   - no NPS response → SKIP (we don't know yet — wait for them)
 *
 * Promoters who clicked /r/[code]/9-or-10 already got the
 * `getPromoterReferralEmail()` auto-fired on click. This cron picks
 * up promoters whose response came in via some other channel (manual
 * dashboard entry, future inbound surveys) OR whose auto-fire
 * failed and need a retry on the regular Day-30 schedule.
 *
 * Referral codes are embedded in the claim URL as ?ref=CODE so we can
 * track which referrer brought in each new prospect.
 */

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Generates a deterministic but opaque referral code from the prospect ID. */
function generateReferralCode(prospectId: string): string {
  let hash = 5381;
  for (let i = 0; i < prospectId.length; i++) {
    hash = ((hash << 5) + hash + prospectId.charCodeAt(i)) >>> 0;
  }
  // 8-char alphanumeric — short enough to share, unique enough to track
  return hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
}

/**
 * Look up the latest NPS category for a prospect. Returns null if
 * the prospect has no NPS responses yet — caller treats null as
 * "skip, not eligible" (we don't know if they're a promoter, so
 * don't take the risk of asking a detractor for referrals).
 */
async function getLatestNpsCategory(
  prospectId: string,
): Promise<"promoter" | "passive" | "detractor" | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase
      .from("nps_responses")
      .select("category")
      .eq("prospect_id", prospectId)
      .order("responded_at", { ascending: false })
      .limit(1);
    if (!data || data.length === 0) return null;
    const cat = (data[0]?.category as string) || "";
    if (cat === "promoter" || cat === "passive" || cat === "detractor") {
      return cat;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dry") === "true";

  const prospects = await getAllProspects();
  const now = Date.now();

  const candidates = prospects.filter((p) => {
    if (!["paid", "claimed"].includes(p.status)) return false;
    if (!p.paidAt) return false;
    if (p.referralSentAt) return false; // already sent
    if (!p.email) return false;

    const daysSincePaid = now - new Date(p.paidAt).getTime();
    return daysSincePaid >= THIRTY_DAYS_MS;
  });

  // NPS promoter gate (Rule 44). Done as a separate pass since each
  // candidate needs a Supabase round-trip; the prefilter above
  // narrows the set first to keep the lookup volume sane.
  const eligible: typeof candidates = [];
  const skipped: { id: string; business: string; reason: string }[] = [];
  for (const p of candidates) {
    const cat = await getLatestNpsCategory(p.id);
    if (cat === "promoter") {
      eligible.push(p);
    } else {
      skipped.push({
        id: p.id,
        business: p.businessName,
        reason: cat ? `nps_category=${cat}` : "no_nps_response",
      });
    }
  }

  const results: { id: string; business: string; code: string; sent: boolean }[] = [];

  for (const prospect of eligible) {
    const code = generateReferralCode(prospect.id);
    const template = getReferralEmail(prospect, code);

    let sent = false;
    if (!dryRun && prospect.email) {
      try {
        await sendEmail(
          prospect.id,
          prospect.email,
          template.subject,
          template.body,
          0,
        );
        await updateProspect(prospect.id, {
          referralCode: code,
          referralSentAt: new Date().toISOString(),
        });
        sent = true;
        console.log(`[Referral] Sent to ${prospect.businessName} (${prospect.email}) code=${code}`);
      } catch (err) {
        console.error(`[Referral] Failed for ${prospect.id}:`, err);
      }
    } else if (dryRun) {
      // In dry-run, persist the code without sending
      await updateProspect(prospect.id, { referralCode: code });
      sent = false;
    }

    results.push({ id: prospect.id, business: prospect.businessName, code, sent });
  }

  await logHeartbeat("referral_send", {
    candidates: candidates.length,
    eligible: eligible.length,
    processed: results.length,
    sent: results.filter((r) => r.sent).length,
    skipped: skipped.length,
    dryRun,
  });

  return NextResponse.json({
    candidates: candidates.length,
    eligible: eligible.length,
    processed: results.length,
    skipped,
    dryRun,
    results,
    referralBaseUrl: `${BASE_URL}?ref=`,
  });
}
