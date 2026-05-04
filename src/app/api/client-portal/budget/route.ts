import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import {
  computeBudgetSummary,
  createBudgetItem,
  listBudgetItems,
} from "@/lib/client-budget";

/**
 * GET  /api/client-portal/budget   → list line items + computed summary
 * POST /api/client-portal/budget   → add a new line item
 *
 * Cookie-scoped per-client. Owners can only see/edit their own client.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  try {
    const items = await listBudgetItems(owner.client_slug);
    const summary = computeBudgetSummary(items);
    return NextResponse.json({ ok: true, items, summary });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.label || typeof body.amount_cents !== "number") {
    return NextResponse.json(
      { ok: false, error: "label + amount_cents required" },
      { status: 400 },
    );
  }
  try {
    const item = await createBudgetItem({
      clientSlug: owner.client_slug,
      ownerId: owner.id,
      patch: {
        label: String(body.label).slice(0, 200),
        description:
          typeof body.description === "string" ? body.description.slice(0, 1000) : null,
        amount_cents: Math.round(Number(body.amount_cents)),
        recurring_monthly: !!body.recurring_monthly,
        charge_date:
          typeof body.charge_date === "string"
            ? body.charge_date
            : new Date().toISOString().slice(0, 10),
        ended_on: typeof body.ended_on === "string" ? body.ended_on : null,
        category: typeof body.category === "string" ? body.category : "other",
        vendor: typeof body.vendor === "string" ? body.vendor.slice(0, 200) : null,
        notes: typeof body.notes === "string" ? body.notes.slice(0, 2000) : null,
      },
    });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
