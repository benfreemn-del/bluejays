import { NextRequest, NextResponse } from "next/server";
import {
  clientLeadCounts,
  listClientLeads,
  type ClientLeadAudience,
  type ClientLeadFunnelStatus,
} from "@/lib/client-leads";

/**
 * GET /api/client-leads?client=zenith-sports[&audience=parent][&status=enrolled][&counts=1]
 *
 * - With `counts=1`, returns aggregated counts for the dashboard cards
 *   (total + breakdown by audience + breakdown by funnel status).
 * - Otherwise returns up to 200 leads, newest first, optionally
 *   filtered by audience or funnel status.
 *
 * Auth: middleware on /api/* gates this behind the dashboard cookie.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }

  if (searchParams.get("counts") === "1") {
    try {
      const counts = await clientLeadCounts(client);
      return NextResponse.json({ ok: true, ...counts });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "unknown" },
        { status: 500 },
      );
    }
  }

  const audience = searchParams.get("audience") as ClientLeadAudience | null;
  const status = searchParams.get("status") as ClientLeadFunnelStatus | null;
  try {
    const leads = await listClientLeads(client, {
      audience: audience ?? undefined,
      status: status ?? undefined,
    });
    return NextResponse.json({ ok: true, leads });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
