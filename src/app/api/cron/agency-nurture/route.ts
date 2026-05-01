import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  NURTURE_STEPS,
  firstNameOf,
  nextSendForStep,
} from "@/lib/agency-nurture";

/**
 * GET /api/cron/agency-nurture
 *
 * Daily cron — find every agency_application in the nurture funnel
 * whose nurture_next_send_at has come due, send the appropriate
 * step's email, advance the step, schedule the next.
 *
 * Cadence: 9am Pacific (16:00 UTC) — well within Ben's morning so
 * any failures show up in the SendGrid dashboard before the day's
 * call schedule starts.
 *
 * Skips applicants who:
 *   - Are unsubscribed (nurture_unsubscribed_at set)
 *   - Have already completed the sequence (nurture_completed_at set)
 *   - Have moved off 'dnq' status (Ben re-qualified them, or they
 *     re-applied successfully)
 *
 * Auth: gated by CRON_SECRET. Vercel Cron auto-attaches.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CRON_SECRET = process.env.CRON_SECRET;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "ben@bluejayportfolio.com";
const FROM_NAME = "Ben @ BlueJays";

type App = {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  industry: string | null;
  status: string;
  nurture_step: number;
  nurture_next_send_at: string | null;
  nurture_unsubscribed_at: string | null;
  nurture_completed_at: string | null;
};

async function sendNurtureEmail(args: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.log(`  📧 [DRY] Would send to ${args.to}: ${args.subject}`);
    return false;
  }
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: args.to }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        reply_to: { email: FROM_EMAIL, name: FROM_NAME },
        subject: args.subject,
        content: [
          { type: "text/plain", value: args.text },
          {
            type: "text/html",
            value: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;max-width:560px">${args.html}</div>`,
          },
        ],
        // RFC 8058 list-unsubscribe — keeps Gmail from spam-binning
        // the nurture sequence and gives recipients a 1-click out.
        headers: {
          "List-Unsubscribe": `<mailto:${FROM_EMAIL}?subject=Unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });
    if (!res.ok) {
      console.error("[agency-nurture] SendGrid returned", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[agency-nurture] send failed:", err);
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (CRON_SECRET) {
    const authz = request.headers.get("authorization") || "";
    if (authz !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 503 });
  }

  // Pull due applicants. Index agency_applications_nurture_idx makes
  // this cheap; the partial-index predicate already filters out
  // unsubscribed + completed rows.
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("agency_applications")
    .select("id, business_name, contact_name, email, industry, status, nurture_step, nurture_next_send_at, nurture_unsubscribed_at, nurture_completed_at")
    .lte("nurture_next_send_at", nowIso)
    .is("nurture_unsubscribed_at", null)
    .is("nurture_completed_at", null)
    .limit(100);

  if (error) {
    console.error("[agency-nurture] query failed:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const apps = (data || []) as App[];
  const results: Array<{ id: string; sent: boolean; step: number; reason?: string }> = [];

  for (const app of apps) {
    // If the applicant moved OFF dnq (Ben re-qualified them, they
    // re-applied with better numbers, etc.), kill the sequence.
    if (app.status !== "dnq") {
      await supabase
        .from("agency_applications")
        .update({ nurture_completed_at: new Date().toISOString() })
        .eq("id", app.id);
      results.push({ id: app.id, sent: false, step: app.nurture_step, reason: "status changed" });
      continue;
    }

    const stepNumber = (app.nurture_step || 0) + 1;
    const stepDef = NURTURE_STEPS.find((s) => s.step === stepNumber);
    if (!stepDef) {
      // Past the last step → mark complete.
      await supabase
        .from("agency_applications")
        .update({ nurture_completed_at: new Date().toISOString(), nurture_next_send_at: null })
        .eq("id", app.id);
      results.push({ id: app.id, sent: false, step: stepNumber, reason: "no more steps" });
      continue;
    }

    const firstName = firstNameOf(app.contact_name);
    const subject = stepDef.subject(firstName);
    const { text, html } = stepDef.body({
      firstName,
      businessName: app.business_name,
      industry: app.industry,
    });

    const sent = await sendNurtureEmail({ to: app.email, subject, text, html });

    // Advance state regardless of send success — repeated retries on
    // permanent SendGrid errors (bad address, etc.) would just stall
    // the queue. If a send fails the cron logs it; Ben can manually
    // reset nurture_step in the dashboard if needed.
    const next = nextSendForStep(stepNumber);
    const update: Record<string, unknown> = {
      nurture_step: stepNumber,
      nurture_next_send_at: next ? next.toISOString() : null,
    };
    if (!next) update.nurture_completed_at = new Date().toISOString();

    await supabase
      .from("agency_applications")
      .update(update)
      .eq("id", app.id);

    results.push({ id: app.id, sent, step: stepNumber });
  }

  return NextResponse.json({
    ok: true,
    processed: apps.length,
    results,
  });
}
