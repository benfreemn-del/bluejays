import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/client-portal/activity-feed
 *
 * Unified real-time event log for the owner portal "Activity" tab.
 * Joins multiple operational tables into one time-sorted feed so the
 * owner can watch the system breathe in real time:
 *
 *   client_leads.created_at        → "Lead landed"
 *   client_lead_messages.sent_at   → "Outbound funnel touch" / "Reply received"
 *   client_email_sends.sent_at     → "Campaign sent to recipient"
 *   client_email_campaigns         → "Campaign launched / completed"
 *   system_costs.created_at        → "API call cost logged"
 *
 * All scoped to the cookie-authed owner's client_slug. Returns the
 * latest 100 events sorted newest-first.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ActivityKind =
  | "lead.captured"
  | "lead.audience_tagged"
  | "msg.outbound"
  | "msg.inbound"
  | "msg.skipped"
  | "campaign.send"
  | "campaign.opened"
  | "campaign.clicked"
  | "campaign.replied"
  | "campaign.bounced"
  | "campaign.status_change"
  | "cost.api_call";

export type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  timestamp: string;
  /** Headline shown as the row title. */
  title: string;
  /** Sub-text under the title — usually a target name + meta. */
  detail: string;
  /** Optional tag (audience badge, campaign name, etc.) */
  tag?: string;
  /** Optional cost number (USD) tied to the event. */
  costUsd?: number;
};

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, events: [] });
  }
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Not signed in" },
      { status: 401 },
    );
  }

  const slug = owner.client_slug;
  const sb = getSupabase();
  const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString();

  // Run the four queries in parallel — each scoped to the owner's slug.
  const [leadsRes, msgsRes, sendsRes, costsRes] = await Promise.all([
    sb
      .from("client_leads")
      .select("id, name, email, audience_segment, source, created_at")
      .eq("client_slug", slug)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(40),
    sb
      .from("client_lead_messages")
      .select(
        "id, lead_id, channel, direction, status, subject, sent_at, template_id, funnel_step",
      )
      .eq("client_slug", slug)
      .gte("sent_at", sinceIso)
      .order("sent_at", { ascending: false })
      .limit(40),
    sb
      .from("client_email_sends")
      .select(
        "id, campaign_id, to_email, status, rendered_subject, sent_at, opened_at, clicked_at, replied_at",
      )
      .eq("client_slug", slug)
      .gte("sent_at", sinceIso)
      .order("sent_at", { ascending: false })
      .limit(40),
    sb
      .from("system_costs")
      .select("id, service, action, cost_usd, created_at, metadata")
      .eq("client_slug", slug)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const events: ActivityEvent[] = [];

  // ── Leads ──
  for (const l of leadsRes.data ?? []) {
    events.push({
      id: `lead-${l.id}`,
      kind: "lead.captured",
      timestamp: l.created_at as string,
      title: `📥 Lead captured · ${l.name ?? "(no name)"}`,
      detail: `${l.email ?? "no email"} · via ${(l.source as string) ?? "unknown"}`,
      tag: (l.audience_segment as string) ?? undefined,
    });
  }

  // ── Lead messages ──
  for (const m of msgsRes.data ?? []) {
    const channelEmoji =
      m.channel === "email" ? "✉" : m.channel === "sms" ? "💬" : "🎙";
    if (m.direction === "inbound") {
      events.push({
        id: `msg-${m.id}`,
        kind: "msg.inbound",
        timestamp: m.sent_at as string,
        title: `${channelEmoji} Inbound reply received`,
        detail: (m.subject as string) ?? "(no subject)",
        tag: m.template_id ? `step ${m.funnel_step ?? 0}` : undefined,
      });
    } else if (m.status === "skipped") {
      events.push({
        id: `msg-${m.id}`,
        kind: "msg.skipped",
        timestamp: m.sent_at as string,
        title: `${channelEmoji} Funnel step skipped`,
        detail: (m.subject as string) ?? `step ${m.funnel_step ?? 0}`,
      });
    } else {
      events.push({
        id: `msg-${m.id}`,
        kind: "msg.outbound",
        timestamp: m.sent_at as string,
        title: `${channelEmoji} → Outbound funnel touch · ${m.status}`,
        detail: (m.subject as string) ?? `step ${m.funnel_step ?? 0}`,
        tag: (m.template_id as string) ?? undefined,
      });
    }
  }

  // ── Campaign sends ──
  for (const s of sendsRes.data ?? []) {
    if (s.replied_at) {
      events.push({
        id: `send-r-${s.id}`,
        kind: "campaign.replied",
        timestamp: s.replied_at as string,
        title: `↩ Campaign reply · ${s.to_email}`,
        detail: (s.rendered_subject as string) ?? "",
      });
    }
    if (s.clicked_at) {
      events.push({
        id: `send-c-${s.id}`,
        kind: "campaign.clicked",
        timestamp: s.clicked_at as string,
        title: `🖱 Campaign click · ${s.to_email}`,
        detail: (s.rendered_subject as string) ?? "",
      });
    }
    if (s.opened_at) {
      events.push({
        id: `send-o-${s.id}`,
        kind: "campaign.opened",
        timestamp: s.opened_at as string,
        title: `👁 Campaign open · ${s.to_email}`,
        detail: (s.rendered_subject as string) ?? "",
      });
    }
    if (s.sent_at) {
      events.push({
        id: `send-s-${s.id}`,
        kind: "campaign.send",
        timestamp: s.sent_at as string,
        title: `📧 Campaign sent · ${s.to_email}`,
        detail: (s.rendered_subject as string) ?? "",
        tag: s.status as string,
      });
    }
  }

  // ── Cost rows ──
  for (const c of costsRes.data ?? []) {
    events.push({
      id: `cost-${c.id}`,
      kind: "cost.api_call",
      timestamp: c.created_at as string,
      title: `💰 ${c.service} · ${c.action}`,
      detail: `$${Number(c.cost_usd).toFixed(4)}`,
      costUsd: Number(c.cost_usd),
    });
  }

  // Sort newest first + cap at 100.
  events.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  return NextResponse.json({ ok: true, events: events.slice(0, 100) });
}
