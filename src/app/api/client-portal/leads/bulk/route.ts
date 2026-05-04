import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/client-portal/leads/bulk
 *   body: {
 *     ids: string[],
 *     action:
 *       | { kind: 'status', status: 'enrolled'|'paused'|'responded'|'converted' }
 *       | { kind: 'enroll' }            // funnel_status='enrolled' + step=0 + enrolled_at=now
 *       | { kind: 'log_contact', channel: 'email'|'sms'|'call' }
 *   }
 *
 * Mirrors the bluejays admin dashboard bulk-action toolbar pattern,
 * scoped per-client via cookie. Server-side enforces client_slug match
 * so an owner can't bulk-update another client's leads.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES = ["enrolled", "paused", "responded", "converted"];
const VALID_CHANNELS = ["email", "sms", "call"];

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  let body: { ids?: unknown; action?: Record<string, unknown> } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const ids = Array.isArray(body.ids)
    ? (body.ids as unknown[]).filter((v): v is string => typeof v === "string")
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: "ids required" }, { status: 400 });
  }
  if (ids.length > 200) {
    return NextResponse.json({ ok: false, error: "Too many leads at once (max 200)" }, { status: 400 });
  }
  const action = body.action;
  if (!action || typeof action.kind !== "string") {
    return NextResponse.json({ ok: false, error: "action required" }, { status: 400 });
  }

  const sb = getSupabase();

  // Always pre-fetch the leads to enforce client_slug isolation —
  // never trust the ids alone.
  const { data: leads, error: readErr } = await sb
    .from("client_leads")
    .select("id, client_slug, email, phone, funnel_status")
    .in("id", ids)
    .eq("client_slug", owner.client_slug);
  if (readErr) {
    return NextResponse.json({ ok: false, error: readErr.message }, { status: 500 });
  }
  const safeIds = (leads ?? []).map((l: { id: string }) => l.id);
  if (safeIds.length === 0) {
    return NextResponse.json({ ok: false, error: "No matching leads in your account" }, { status: 404 });
  }

  try {
    if (action.kind === "status") {
      const status = String(action.status || "");
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
      }
      const { error } = await sb
        .from("client_leads")
        .update({ funnel_status: status })
        .in("id", safeIds);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, updated: safeIds.length });
    }

    if (action.kind === "enroll") {
      const { error } = await sb
        .from("client_leads")
        .update({
          funnel_status: "enrolled",
          funnel_step: 0,
          enrolled_at: new Date().toISOString(),
        })
        .in("id", safeIds);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, updated: safeIds.length });
    }

    if (action.kind === "log_contact") {
      const channel = String(action.channel || "");
      if (!VALID_CHANNELS.includes(channel)) {
        return NextResponse.json({ ok: false, error: "Invalid channel" }, { status: 400 });
      }
      // Insert one client_lead_messages row per lead, then bump
      // last_contact_at and (if cold) flip to 'responded'. Same
      // semantics as the per-lead /log-contact route.
      type LR = { id: string; email: string | null; phone: string | null; funnel_status: string };
      const rows = (leads as LR[]).map((l) => ({
        lead_id: l.id,
        client_slug: owner.client_slug,
        funnel_step: null,
        channel,
        direction: "outbound",
        to_address:
          channel === "email"
            ? l.email
            : channel === "sms" || channel === "call"
              ? l.phone
              : null,
        from_address: owner.email,
        subject: channel === "email" ? "(manual log)" : null,
        body: `[bulk-logged ${channel}]`,
        template_id: "manual.owner-log.bulk",
        status: "sent",
        provider: "manual",
        logged_by_owner_id: owner.id,
      }));
      const { error: msgErr } = await sb.from("client_lead_messages").insert(rows);
      if (msgErr) throw new Error(msgErr.message);

      // Bump last_contact_at on every lead; flip not_enrolled → responded.
      const nowIso = new Date().toISOString();
      const coldIds = (leads as LR[])
        .filter((l) => l.funnel_status === "not_enrolled")
        .map((l) => l.id);
      if (coldIds.length > 0) {
        await sb
          .from("client_leads")
          .update({ last_contact_at: nowIso, funnel_status: "responded" })
          .in("id", coldIds);
      }
      const warmIds = (leads as LR[])
        .filter((l) => l.funnel_status !== "not_enrolled")
        .map((l) => l.id);
      if (warmIds.length > 0) {
        await sb
          .from("client_leads")
          .update({ last_contact_at: nowIso })
          .in("id", warmIds);
      }
      return NextResponse.json({ ok: true, updated: safeIds.length });
    }

    return NextResponse.json({ ok: false, error: "Unknown action.kind" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
