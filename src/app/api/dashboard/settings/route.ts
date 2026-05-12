import { NextRequest, NextResponse } from "next/server";
import { listSettings, setSetting } from "@/lib/system-settings";

/**
 * GET   /api/dashboard/settings        — list every key/value
 * PATCH /api/dashboard/settings        — body { key, value } → upsert
 *
 * Owner-only (gated by /api/dashboard middleware prefix).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await listSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(req: NextRequest) {
  if (req.cookies.get("bj_role")?.value !== "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  let body: { key?: string; value?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  if (!body.key) {
    return NextResponse.json({ ok: false, error: "key required" }, { status: 400 });
  }
  try {
    await setSetting(body.key, body.value);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
