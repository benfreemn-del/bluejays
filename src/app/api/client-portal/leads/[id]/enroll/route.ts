import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { getClientLead } from "@/lib/client-leads";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/client-portal/leads/[id]/enroll
 *   body: { audience?: 'parent'|'coach'|'player'|'club' }
 *
 * Manually enrolls a lead into the client's funnel. Used when:
 *   - The lead came in mis-tagged (audience auto-detect returned null)
 *     → owner picks the right audience and kicks off the right funnel
 *   - The lead was set to 'paused' or 'not_enrolled' and the owner
 *     wants the system to start dripping them
 *
 * Sets funnel_status='enrolled', funnel_step=0, enrolled_at=now.
 * The funnel runner cron will pick it up on the next tick.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_AUDIENCES = ["parent", "coach", "player", "club"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const lead = await getClientLead(id);
  if (!lead || lead.client_slug !== owner.client_slug) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  let body: { audience?: string } = {};
  try {
    body = (await req.json().catch(() => ({}))) as typeof body;
  } catch {
    body = {};
  }

  const patch: Record<string, unknown> = {
    funnel_status: "enrolled",
    funnel_step: 0,
    enrolled_at: new Date().toISOString(),
  };
  if (body.audience && VALID_AUDIENCES.includes(body.audience)) {
    patch.audience_segment = body.audience;
  }

  try {
    const { data, error } = await getSupabase()
      .from("client_leads")
      .update(patch)
      .eq("id", lead.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, lead: data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
