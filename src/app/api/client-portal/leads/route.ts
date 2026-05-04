import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { listClientLeads } from "@/lib/client-leads";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/client-portal/leads
 *
 * Returns the owner's leads PLUS a per-lead contact summary so the
 * portal can show "✓ contacted (3 touches)" without an N+1 fetch.
 * Cookie-scoped — owners can't read another client's data.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Not signed in" },
      { status: 401 },
    );
  }
  try {
    const leads = await listClientLeads(owner.client_slug);

    // One round-trip to count outbound touches per lead. Mirrors the
    // bluejays "have we contacted them yet?" pattern.
    const touchCounts: Record<string, { count: number; channels: Set<string> }> = {};
    if (leads.length > 0) {
      const ids = leads.map((l) => l.id);
      const { data: msgs } = await getSupabase()
        .from("client_lead_messages")
        .select("lead_id, channel")
        .in("lead_id", ids)
        .eq("direction", "outbound")
        .in("status", ["sent", "delivered", "replied"]);
      for (const m of (msgs ?? []) as { lead_id: string; channel: string }[]) {
        const t = touchCounts[m.lead_id] ?? { count: 0, channels: new Set<string>() };
        t.count += 1;
        t.channels.add(m.channel);
        touchCounts[m.lead_id] = t;
      }
    }
    const enriched = leads.map((l) => ({
      ...l,
      touch_count: touchCounts[l.id]?.count ?? 0,
      touch_channels: Array.from(touchCounts[l.id]?.channels ?? []),
    }));
    const contactedCount = Object.keys(touchCounts).length;

    return NextResponse.json({
      ok: true,
      leads: enriched,
      summary: {
        total: leads.length,
        contacted: contactedCount,
        uncontacted: leads.length - contactedCount,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
