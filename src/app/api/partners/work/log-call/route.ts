import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getCurrentPartner } from "@/lib/partner-auth";

/**
 * POST /api/partners/work/log-call
 *
 * Body: { prospectId, outcome, notes?, auditLinkSent?, bookingLinkSent? }
 *
 * Logs the call into partner_calls. If outcome === 'do_not_call',
 * also flips the prospect's status to 'do_not_call' so no other
 * partner ever calls them again (TCPA compliance).
 */

const ALLOWED_OUTCOMES = new Set([
  "no_answer",
  "voicemail",
  "wrong_number",
  "answered_not_interested",
  "answered_call_scheduled",
  "answered_preview_sent",
  "answered_audit_sent",
  "answered_callback",
  "do_not_call",
]);

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const partner = await getCurrentPartner();
  if (!partner) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  let body: {
    prospectId?: string;
    outcome?: string;
    notes?: string;
    auditLinkSent?: boolean;
    bookingLinkSent?: boolean;
    textSent?: boolean;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prospectId = (body.prospectId || "").trim();
  const outcome = (body.outcome || "").trim();
  if (!prospectId || !outcome) {
    return NextResponse.json(
      { error: "prospectId and outcome required" },
      { status: 400 },
    );
  }
  if (!ALLOWED_OUTCOMES.has(outcome)) {
    return NextResponse.json({ error: "Unknown outcome" }, { status: 400 });
  }

  const auditOrBookingSent = body.auditLinkSent || body.bookingLinkSent;
  const sentAt = auditOrBookingSent ? new Date().toISOString() : null;

  const baseNotes = (body.notes || "").trim();
  const notesWithFlags = [
    baseNotes,
    body.textSent ? "[text sent]" : "",
  ].filter(Boolean).join(" ").slice(0, 1000) || null;

  const { error } = await supabase.from("partner_calls").insert({
    partner_id: partner.id,
    prospect_id: prospectId,
    outcome,
    notes: notesWithFlags,
    audit_link_sent_at: sentAt,
  });
  if (error) {
    console.error("[partners/work/log-call] insert failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TCPA — when prospect says "take me off your list", flag at the
  // prospect level so NO partner can ever call them again. Conservative:
  // mark status='do_not_call' AND set scraped_data.dnc=true so legacy
  // queries that don't check status still see the flag.
  if (outcome === "do_not_call") {
    try {
      const { data: existing } = await supabase
        .from("prospects")
        .select("scraped_data")
        .eq("id", prospectId)
        .maybeSingle();
      const merged = {
        ...((existing as { scraped_data?: Record<string, unknown> } | null)?.scraped_data || {}),
        dnc: true,
        dncAt: new Date().toISOString(),
        dncBy: partner.code,
      };
      await supabase
        .from("prospects")
        .update({ status: "do_not_call", scraped_data: merged })
        .eq("id", prospectId);
    } catch (err) {
      console.warn("[partners/work/log-call] DNC flag failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
