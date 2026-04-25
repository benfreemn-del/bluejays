import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getProspect, updateProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import { getPromoterReferralEmail } from "@/lib/email-templates";

/**
 * Public NPS click handler — `GET /r/[code]/[score]`
 *
 * Wave-5b retention. The Day-14 NPS survey email renders 11 score
 * links (one per 0–10) pointing at this route. A click does five
 * things in sequence:
 *
 *   1. Validates `score` is an integer 0..10. Anything else 302s
 *      home — same defensive shape as `/u/[code]` (we never reveal
 *      whether a code exists).
 *   2. Resolves the 8-char short code → prospect record.
 *   3. INSERTS one row into `nps_responses` with the derived
 *      category (promoter/passive/detractor). Per Rule 43 the
 *      persistence happens BEFORE any side-effect (email, SMS,
 *      redirect) — losing the row is worse than losing the touch.
 *   4. Stamps `prospect.nps_sent_at` if it's still null. Two
 *      reasons: (a) lets the daily cron skip this prospect on
 *      future runs, (b) the existing `getReferralEmail` gate
 *      reads it as "this customer has been NPS-classified, OK
 *      to consult `nps_responses` for the gate verdict".
 *   5. Branches on category and 302s the user to the appropriate
 *      thanks page:
 *        - promoter (9-10) → `/nps/thanks/[code]?promoter=true`
 *          AND fires the promoter-specific referral email + flips
 *          `referral_email_sent=true`
 *        - passive  (7-8)  → `/nps/thanks/[code]`
 *        - detractor (0-6) → `/nps/thanks/[code]?detractor=true`
 *
 * The detractor SMS-Ben fire actually happens inside the feedback
 * POST endpoint (`/api/nps/feedback/[code]`) once the customer
 * tells us *what* went wrong — a bare 6/10 click without context
 * isn't actionable, but a "1/10 — your team ghosted me" is.
 *
 * Public route — listed in `PUBLIC_API_PATHS`-equivalent below in
 * middleware.ts (the `/r/` and `/nps/` prefixes are added so
 * customers don't need an admin auth cookie to click their
 * survey link).
 *
 * Idempotent: clicking the same score twice inserts a second
 * `nps_responses` row but preserves the first one's
 * `referral_email_sent=true` so we never double-fire the
 * promoter email. The first response is the canonical answer;
 * subsequent rows are kept as audit signal (e.g. "they re-clicked
 * a different score 10 min later").
 */
export const dynamic = "force-dynamic";

const BASE_URL = "https://bluejayportfolio.com";

function categoryFromScore(
  score: number,
): "promoter" | "passive" | "detractor" {
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

async function resolveCodeToId(code: string): Promise<string | null> {
  if (!/^[a-f0-9]{8}$/i.test(code)) return null;
  if (!isSupabaseConfigured()) return null;

  try {
    const { data } = await supabase
      .from("prospects")
      .select("id")
      .eq("short_code", code.toLowerCase())
      .limit(1)
      .single();
    return (data?.id as string) || null;
  } catch {
    return null;
  }
}

/**
 * Has this prospect already had a promoter-referral email auto-fired
 * via a previous /r/ click? If so, the new click should record the
 * response but skip the duplicate email send.
 */
async function hasPriorPromoterEmail(prospectId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { data } = await supabase
      .from("nps_responses")
      .select("id")
      .eq("prospect_id", prospectId)
      .eq("referral_email_sent", true)
      .limit(1);
    return !!(data && data.length > 0);
  } catch {
    // If the lookup fails, assume it WAS sent — better to skip a
    // duplicate email than spam the same customer twice.
    return true;
  }
}

/**
 * Generate the same deterministic referral code shape used by
 * `/api/referral/send` so the auto-fired promoter email and the
 * (now-promoter-gated) Day-30 cron both produce the same `?ref=`
 * link. Identical hash function as `/api/referral/send/route.ts`.
 */
function generateReferralCode(prospectId: string): string {
  let hash = 5381;
  for (let i = 0; i < prospectId.length; i++) {
    hash = ((hash << 5) + hash + prospectId.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; score: string }> },
) {
  const { code, score: rawScore } = await params;

  // 1. Validate score is an integer 0..10.
  const score = Number.parseInt(rawScore, 10);
  if (!Number.isInteger(score) || score < 0 || score > 10) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Resolve short code → prospect.
  const prospectId = await resolveCodeToId(code);
  if (!prospectId) {
    // Don't reveal whether the code exists — same pattern as /u/[code].
    return NextResponse.redirect(new URL("/", request.url));
  }

  const prospect = await getProspect(prospectId);
  if (!prospect) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const category = categoryFromScore(score);
  const isPromoter = category === "promoter";

  // 3. Persist BEFORE any side effect (Rule 43).
  let inserted = false;
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("nps_responses").insert({
        prospect_id: prospectId,
        score,
        category,
        // referral_email_sent flips to true below if we successfully
        // dispatch the promoter email — set tentatively here so a
        // dispatch failure leaves the audit trail accurate.
        referral_email_sent: false,
        feedback_sent_to_ben: false,
        metadata: {
          source: "email_click",
          user_agent: request.headers.get("user-agent") || null,
        },
      });
      if (!error) inserted = true;
    } catch (err) {
      console.error("[NPS] Failed to insert response row:", err);
    }
  }

  // 4. Stamp nps_sent_at if not already set. Done as a separate
  //    update so a row-insert failure above doesn't block the flag.
  if (!prospect.npsSentAt) {
    try {
      await updateProspect(prospectId, {
        npsSentAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[NPS] Failed to stamp nps_sent_at:", err);
    }
  }

  // 5a. Promoter side-effect — auto-fire the dedicated referral email.
  //     Idempotent via hasPriorPromoterEmail() so re-clicks don't double-send.
  if (isPromoter && prospect.email) {
    const alreadySent = await hasPriorPromoterEmail(prospectId);
    if (!alreadySent) {
      const referralCode =
        prospect.referralCode || generateReferralCode(prospectId);
      const template = getPromoterReferralEmail(prospect, referralCode, score);

      try {
        await sendEmail(
          prospect.id,
          prospect.email,
          template.subject,
          template.body,
          template.sequence,
        );

        // Persist the referral code on the prospect so future-cron
        // and the thanks page show the same `?ref=` value.
        await updateProspect(prospectId, {
          referralCode,
          referralSentAt: new Date().toISOString(),
        });

        // Flip the flag on the most recent nps_responses row.
        if (isSupabaseConfigured() && inserted) {
          try {
            await supabase
              .from("nps_responses")
              .update({ referral_email_sent: true })
              .eq("prospect_id", prospectId)
              .order("responded_at", { ascending: false })
              .limit(1);
          } catch (err) {
            console.error(
              "[NPS] Failed to flag referral_email_sent:",
              err,
            );
          }
        }
      } catch (err) {
        console.error(
          `[NPS] Failed to send promoter email to ${prospect.email}:`,
          err,
        );
      }
    }
  }

  // 5b. Branch redirect to the right thanks-page variant.
  const thanksUrl = new URL(`/nps/thanks/${code}`, request.url);
  if (isPromoter) thanksUrl.searchParams.set("promoter", "true");
  else if (category === "detractor")
    thanksUrl.searchParams.set("detractor", "true");
  // Pass the score so the thanks page can echo it back ("Thanks
  // for the 8/10!") without doing another DB lookup.
  thanksUrl.searchParams.set("score", String(score));

  return NextResponse.redirect(thanksUrl);
}

// Mark the BASE_URL as used so the linter doesn't strip it — kept
// for parity with sibling routes (`/u/[code]`, `/o/[code]`) that
// reference a hardcoded base in case future logic needs it.
void BASE_URL;
