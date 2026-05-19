import { NextRequest, NextResponse } from "next/server";
import { listClientLeads } from "@/lib/client-leads";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/clients/thrive-church-sequim/inbox
 *
 * Backs the Inbox tab on the Thrive Church portal-demo. Returns the most
 * recent client_leads rows for slug=thrive-church-sequim, mapped to the
 * InboxItem shape the portal UI already speaks.
 *
 * Auth: URL-as-secret + shared gate token (matches the portal's existing
 * password gate). Set `THRIVE_PORTAL_GATE` env var on Vercel; falls back
 * to the dev password "thrive2026" for local. Pass as `?gate=...` or
 * `x-thrive-gate: ...` header.
 *
 * Returns `{ ok: true, items: InboxItem[], usingDemoData: false }` on
 * success. The portal falls back to its bundled mock data when items
 * is empty so the sales-call demo still works pre-launch.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GATE = process.env.THRIVE_PORTAL_GATE || "thrive2026";
const SLUG = "thrive-church-sequim";
const MAX_ITEMS = 50; // Rule: paginate >100 lists at 50/page. v1 = 50 latest.

type InboxType = "connect" | "prayer" | "volunteer" | "verse" | "preschool";
type InboxStatus = "new" | "in-progress" | "replied" | "closed";

type InboxItem = {
  id: string;
  type: InboxType;
  name: string;
  email?: string;
  phone?: string;
  receivedAt: string;
  status: InboxStatus;
  preview: string;
  meta?: Record<string, string>;
  notes?: string;
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const gate =
    url.searchParams.get("gate") || request.headers.get("x-thrive-gate") || "";
  if (gate !== GATE) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, items: [], usingDemoData: true });
  }

  try {
    const leads = await listClientLeads(SLUG, { limit: MAX_ITEMS });
    const items: InboxItem[] = leads.map(mapLeadToInboxItem);
    return NextResponse.json({ ok: true, items, usingDemoData: false });
  } catch (err) {
    console.error("[thrive inbox] list failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load inbox" },
      { status: 500 },
    );
  }
}

function mapLeadToInboxItem(lead: {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  funnel_status: string;
  responded_at: string | null;
  raw_payload: Record<string, unknown>;
  notes: string | null;
  created_at: string;
}): InboxItem {
  const payload = lead.raw_payload || {};
  const formType = String(payload.form_type || "").toLowerCase();

  const type: InboxType =
    formType === "prayer_request"
      ? "prayer"
      : formType === "volunteer_quiz_result"
        ? "volunteer"
        : formType === "verse_subscribe"
          ? "verse"
          : "connect";

  const preview = buildPreview(payload);
  const meta = buildMeta(payload);
  const status = mapStatus(lead.funnel_status, lead.responded_at);

  return {
    id: lead.id,
    type,
    name: lead.name?.trim() || (type === "prayer" ? "Anonymous" : "—"),
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    receivedAt: formatReceivedAt(lead.created_at),
    status,
    preview,
    meta,
    notes: lead.notes ?? undefined,
  };
}

function buildPreview(payload: Record<string, unknown>): string {
  // Prefer the most descriptive field for the form type.
  const candidates = [
    payload.message,
    payload.prayer_request,
    payload.note,
    payload.next_step,
    payload.heard_about,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) {
      const t = c.trim();
      return t.length > 220 ? `${t.slice(0, 217)}…` : t;
    }
  }
  return "(no message)";
}

function buildMeta(
  payload: Record<string, unknown>,
): Record<string, string> | undefined {
  const fields: Array<[string, unknown, string]> = [
    ["visit_type", payload.visit_type, "When were you here"],
    ["bringing_kids", payload.bringing_kids, "Bringing kids"],
    ["heard_about", payload.heard_about, "Heard about us"],
    ["next_step", payload.next_step, "What's next"],
    ["keep_private", payload.keep_private, "Private"],
    ["follow_up_ok", payload.follow_up_ok, "Follow-up OK"],
  ];
  const out: Record<string, string> = {};
  for (const [, v, label] of fields) {
    if (typeof v === "string" && v.trim().length > 0) {
      out[label] = humanizeYesNo(v.trim());
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function humanizeYesNo(v: string): string {
  if (v === "yes") return "Yes";
  if (v === "no") return "No";
  return v;
}

function mapStatus(
  funnelStatus: string,
  respondedAt: string | null,
): InboxStatus {
  if (funnelStatus === "won" || funnelStatus === "lost") return "closed";
  if (funnelStatus === "responded" || respondedAt) return "in-progress";
  if (funnelStatus === "replied") return "replied";
  return "new";
}

function formatReceivedAt(iso: string): string {
  // Relative-day format that matches the mock data style:
  // "today · 9:14 am", "yesterday · 4:22 pm", "Mon · 2:14 pm", "May 12 · 10:30 am"
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const now = new Date();
  const sameDay = isSameLocalDay(d, now);
  const isYesterday = isSameLocalDay(
    d,
    new Date(now.getTime() - 24 * 60 * 60 * 1000),
  );
  const time = d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toLowerCase()
    .replace(/\s/g, " ");
  if (sameDay) return `today · ${time}`;
  if (isYesterday) return `yesterday · ${time}`;
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays < 7) {
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    return `${day} · ${time}`;
  }
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${date} · ${time}`;
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
