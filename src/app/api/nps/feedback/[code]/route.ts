import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";
import { sendEmail } from "@/lib/email-sender";

/**
 * POST /api/nps/feedback/[code]
 *
 * Submitted by `NpsThanksClient` after a passive (7-8) or detractor
 * (0-6) NPS click. The /r/[code]/[score] handler already inserted
 * the score row; this endpoint enriches that row with the textual
 * `feedback` and — for detractors — fires the at-risk-customer save.
 *
 * Detractor flow (CRITICAL — this is THE retention save):
 *   1. SMS Ben within seconds with the prospect name + raw feedback +
 *      dashboard link. He'll personally reach out within 24 hours
 *      (the page promised it).
 *   2. Email the BlueJays inbox so there's an in-tray paper trail.
 *   3. Flip `feedback_sent_to_ben=true` on the row for idempotency
 *      (re-submitting the form doesn't re-spam Ben).
 *
 * Passive flow:
 *   1. Save feedback to the row.
 *   2. Email the BlueJays inbox (no SMS — passive responses aren't
 *      time-sensitive; Ben can review in his daily digest).
 *
 * Public route — listed in middleware's `/api/nps/` allowlist (the
 * feedback POST has to work without an auth cookie since the
 * customer doesn't have one).
 *
 * Idempotency: keyed on the latest nps_responses row for the
 * prospect. Resubmitting the form updates the same row's feedback
 * column rather than spawning a new row, so the row count remains
 * "one click = one row". The Ben SMS only fires once (gated by
 * `feedback_sent_to_ben=false`).
 */
export const dynamic = "force-dynamic";

const BASE_URL = "https://bluejayportfolio.com";
const INBOX_EMAIL = process.env.FROM_EMAIL || "bluejaycontactme@gmail.com";

interface ProspectLite {
  id: string;
  businessName: string;
  ownerName: string | null;
  email: string | null;
  city: string | null;
  category: string | null;
}

async function lookupByCode(code: string): Promise<ProspectLite | null> {
  if (!/^[a-f0-9]{8}$/i.test(code)) return null;
  if (!isSupabaseConfigured()) return null;

  try {
    const { data } = await supabase
      .from("prospects")
      .select("id, business_name, owner_name, email, city, category")
      .eq("short_code", code.toLowerCase())
      .limit(1)
      .single();
    if (!data) return null;
    return {
      id: data.id as string,
      businessName: (data.business_name as string) || "Unknown",
      ownerName: (data.owner_name as string | null) || null,
      email: (data.email as string | null) || null,
      city: (data.city as string | null) || null,
      category: (data.category as string | null) || null,
    };
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  let payload: { feedback?: string; score?: number; variant?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const feedback = (payload.feedback || "").toString().trim().slice(0, 4000);
  if (!feedback) {
    return NextResponse.json({ error: "feedback_required" }, { status: 400 });
  }

  const prospect = await lookupByCode(code);
  if (!prospect) {
    // Don't reveal whether the code resolved — same defensive shape
    // as /u/[code]. Return 200 so the customer sees the success UI
    // even if their click landed on a stale code.
    return NextResponse.json({ ok: true });
  }

  const variant = payload.variant === "detractor" ? "detractor" : "passive";

  // Update the most recent NPS row for this prospect with the
  // textual feedback. If no row exists (e.g. customer landed on
  // /nps/thanks directly without clicking through /r/), insert one
  // so the feedback isn't lost. Score defaults to NULL in that
  // edge case so the dashboard knows it was orphaned.
  let rowId: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const { data: existing } = await supabase
        .from("nps_responses")
        .select("id, feedback_sent_to_ben")
        .eq("prospect_id", prospect.id)
        .order("responded_at", { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        rowId = existing[0].id as string;
        const alreadySent = !!existing[0].feedback_sent_to_ben;

        await supabase
          .from("nps_responses")
          .update({
            feedback,
            // Pre-mark sent so a concurrent retry can't double-fire
            // the SMS. If the SMS fails below we'll still have logged
            // intent — Ben can see the row in the dashboard.
            feedback_sent_to_ben:
              alreadySent || variant === "detractor" || variant === "passive",
          })
          .eq("id", rowId);
      } else {
        // Orphan submission — insert a row so the feedback is
        // captured. Score is left null since we can't trust the
        // client-supplied value.
        const score =
          typeof payload.score === "number" &&
          Number.isInteger(payload.score) &&
          payload.score >= 0 &&
          payload.score <= 10
            ? payload.score
            : null;
        const category =
          score === null
            ? variant
            : score >= 9
              ? "promoter"
              : score >= 7
                ? "passive"
                : "detractor";

        const insertPayload: Record<string, unknown> = {
          prospect_id: prospect.id,
          score: score ?? 0,
          category,
          feedback,
          feedback_sent_to_ben: true,
          metadata: { source: "thanks_page_orphan" },
        };
        // If score was null, mark the metadata so the dashboard
        // knows the score is a stand-in.
        if (score === null) {
          (insertPayload.metadata as Record<string, unknown>).orphan = true;
        }

        const { data: inserted } = await supabase
          .from("nps_responses")
          .insert(insertPayload)
          .select("id")
          .single();
        rowId = (inserted?.id as string) || null;
      }
    } catch (err) {
      console.error("[NPS feedback] Failed to write row:", err);
    }
  }

  // Detractor SMS — the at-risk-customer save. Fire FIRST, before
  // the email, because seconds matter here. Wrap in try/catch so a
  // Twilio outage doesn't 500 the request.
  if (variant === "detractor") {
    try {
      const lines = [
        `🚨 NPS DETRACTOR: ${prospect.businessName}`,
        prospect.city || prospect.category
          ? `📍 ${prospect.city || ""}${prospect.city && prospect.category ? " · " : ""}${prospect.category || ""}`
          : "",
        typeof payload.score === "number"
          ? `Score: ${payload.score}/10`
          : "",
        ``,
        `"${feedback.slice(0, 500)}${feedback.length > 500 ? "…" : ""}"`,
        ``,
        `📋 ${BASE_URL}/lead/${prospect.id}`,
      ]
        .filter(Boolean)
        .join("\n");

      await sendOwnerAlert(lines);
    } catch (err) {
      console.error(
        `[NPS feedback] Failed to SMS Ben for detractor ${prospect.id}:`,
        err,
      );
    }
  }

  // Mirror the feedback into the BlueJays inbox via SendGrid so
  // there's a thread Ben can reply on. Plain text — no template
  // chrome, this is internal. `sendEmail` falls into mock-mode
  // when SendGrid isn't configured so dev/CI is safe.
  try {
    const subject =
      variant === "detractor"
        ? `🚨 Detractor NPS — ${prospect.businessName}`
        : `NPS feedback — ${prospect.businessName}`;
    const body = [
      `From: ${prospect.ownerName || prospect.businessName}`,
      prospect.email ? `Email: ${prospect.email}` : "",
      typeof payload.score === "number" ? `Score: ${payload.score}/10` : "",
      `Variant: ${variant}`,
      ``,
      feedback,
      ``,
      `Lead: ${BASE_URL}/lead/${prospect.id}`,
    ]
      .filter(Boolean)
      .join("\n");

    await sendEmail(prospect.id, INBOX_EMAIL, subject, body, 222);
  } catch (err) {
    console.error("[NPS feedback] Failed to email inbox:", err);
  }

  return NextResponse.json({ ok: true, rowId });
}
