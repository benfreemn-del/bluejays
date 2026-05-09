import { NextRequest, NextResponse } from "next/server";
import { setClientSnooze } from "@/lib/client-tasks";

/**
 * PUT /api/client-tasks/snooze
 *
 * Set or clear the snooze flag on a client job row. Used by the
 * neon-blue toggle on /dashboard/clients. Setting `snoozeUntil`
 * to null clears the snooze.
 *
 * Body: {
 *   client_slug: string,
 *   snoozeUntil: string (ISO) | null,
 *   reason?: string,    // 'interested_10k' | 'awaiting_decision' | etc.
 *   notes?: string,
 * }
 *
 * Auth: middleware on /api/* gates this behind the dashboard cookie.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(req: NextRequest) {
  let body: {
    client_slug?: string;
    snoozeUntil?: string | null;
    reason?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.client_slug || typeof body.client_slug !== "string") {
    return NextResponse.json(
      { ok: false, error: "client_slug required" },
      { status: 400 },
    );
  }

  // Validate the snoozeUntil ISO string if provided
  if (body.snoozeUntil != null) {
    const ts = Date.parse(body.snoozeUntil);
    if (!Number.isFinite(ts)) {
      return NextResponse.json(
        { ok: false, error: "snoozeUntil must be a valid ISO timestamp or null" },
        { status: 400 },
      );
    }
    if (ts < Date.now() - 60_000) {
      return NextResponse.json(
        { ok: false, error: "snoozeUntil cannot be in the past" },
        { status: 400 },
      );
    }
  }

  try {
    const meta = await setClientSnooze(body.client_slug, {
      snoozeUntil: body.snoozeUntil ?? null,
      reason: body.reason,
      notes: body.notes,
    });
    return NextResponse.json({ ok: true, meta });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
