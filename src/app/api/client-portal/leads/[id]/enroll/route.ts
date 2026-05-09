import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { getClientLead } from "@/lib/client-leads";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/client-portal/leads/[id]/enroll
 *
 * Body shapes accepted (legacy + multi-funnel both supported):
 *   { audience?: 'parent'|'coach'|'player'|'club' }   — single-funnel legacy
 *   { funnels?: string[] }                            — multi-funnel (preferred)
 *
 * When `funnels` is provided AND non-empty:
 *   - First entry becomes the primary `audience_segment`
 *   - Full array is stored in `enrolled_funnels` so the runner can
 *     drive every funnel concurrently
 *
 * When only `audience` is provided (legacy callers):
 *   - Sets audience_segment + enrolled_funnels=[audience]
 *
 * When neither is provided:
 *   - Just flips funnel_status='enrolled' + step=0 against the lead's
 *     existing audience_segment (true legacy path, preserved).
 *
 * Sets funnel_status='enrolled', funnel_step=0, enrolled_at=now.
 * The funnel runner cron picks up enrolled leads on the next tick.
 *
 * Per Ben spec 2026-05-10: multi-funnel applies to ALL client backends,
 * now and forever — universal enrollment shape, not per-tenant.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Locked enum for the legacy `audience` field — prevents typos. The
// `funnels` field is open-ended (any string) because new clients
// (Pro tier, future tenants) define their own funnel segment IDs.
const VALID_AUDIENCES = ["parent", "coach", "player", "club"];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid lead id" }, { status: 400 });
  }
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const lead = await getClientLead(id);
  if (!lead || lead.client_slug !== owner.client_slug) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  let body: { audience?: string; funnels?: unknown } = {};
  try {
    body = (await req.json().catch(() => ({}))) as typeof body;
  } catch {
    body = {};
  }

  // Sanitize the funnels array — strings only, max 10, dedup, trim.
  const funnels: string[] = Array.isArray(body.funnels)
    ? Array.from(
        new Set(
          (body.funnels as unknown[])
            .filter((v): v is string => typeof v === "string")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && s.length <= 50),
        ),
      ).slice(0, 10)
    : [];

  const patch: Record<string, unknown> = {
    funnel_status: "enrolled",
    funnel_step: 0,
    enrolled_at: new Date().toISOString(),
  };

  if (funnels.length > 0) {
    // Multi-funnel path — preferred shape going forward.
    patch.enrolled_funnels = funnels;
    // First entry becomes the primary audience for back-compat with
    // any existing audience-based filtering / display logic.
    patch.audience_segment = funnels[0];
  } else if (body.audience && VALID_AUDIENCES.includes(body.audience)) {
    // Legacy single-audience path — also writes to enrolled_funnels
    // so the data shape stays consistent for the runner.
    patch.audience_segment = body.audience;
    patch.enrolled_funnels = [body.audience];
  } else if (lead.audience_segment) {
    // Neither provided but the lead already has an audience — backfill
    // enrolled_funnels with it so the runner can drive that funnel.
    patch.enrolled_funnels = [lead.audience_segment];
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
