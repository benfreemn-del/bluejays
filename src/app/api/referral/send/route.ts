import { NextResponse } from "next/server";
import { getAllProspects, updateProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import { getReferralEmail } from "@/lib/email-templates";

/**
 * GET /api/referral/send
 *
 * Cron job (daily at 10am Pacific) — finds paid clients who:
 *   1. Paid 30+ days ago
 *   2. Haven't received a referral invite yet
 *
 * Generates a unique referral code per client and sends the day-30
 * referral flywheel email. Referrers get $50 off their next annual
 * renewal for each successful referral.
 *
 * Referral codes are embedded in the claim URL as ?ref=CODE so we can
 * track which referrer brought in each new prospect.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dry") === "true";

  const prospects = await getAllProspects();
  const now = Date.now();

  const eligible = prospects.filter((p) => {
    if (!["paid", "claimed"].includes(p.status)) return false;
    if (!p.paidAt) return false;
    if (p.referralSentAt) return false; // already sent
    if (!p.email) return false;

    const daysSincePaid = now - new Date(p.paidAt).getTime();
    return daysSincePaid >= THIRTY_DAYS_MS;
  });

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

  return NextResponse.json({
    eligible: eligible.length,
    processed: results.length,
    dryRun,
    results,
    referralBaseUrl: `${BASE_URL}?ref=`,
  });
}
