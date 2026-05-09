import { NextRequest, NextResponse } from "next/server";
import { setClientJobMeta } from "@/lib/client-tasks";

/**
 * PATCH /api/client-jobs-meta
 *
 * Update category + tier on a client's job-meta row. Used by the
 * /dashboard/clients inline editor. Pipeline stage is NOT settable
 * here — it lives on prospects.pipeline_stage and gets edited via
 * /api/prospects/[id] from the sales-pipeline page.
 *
 * Body: {
 *   client_slug: string,
 *   category?: string | null,    // explicit null clears
 *   tier?: string | null,        // explicit null clears
 * }
 *
 * Auth: middleware on /api/* gates this behind the dashboard cookie.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_TIERS = new Set(["standard", "custom", "fullsystem", "friend-rate"]);

export async function PATCH(req: NextRequest) {
  let body: { client_slug?: string; category?: string | null; tier?: string | null };
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

  // Basic sanity: tier is constrained to the locked enum, category is
  // free-text but trimmed + length-capped.
  const patch: { category?: string | null; tier?: string | null } = {};
  if (body.category !== undefined) {
    if (body.category === null) patch.category = null;
    else if (typeof body.category === "string") {
      const trimmed = body.category.trim().slice(0, 50);
      patch.category = trimmed || null;
    } else {
      return NextResponse.json(
        { ok: false, error: "category must be string or null" },
        { status: 400 },
      );
    }
  }
  if (body.tier !== undefined) {
    if (body.tier === null) patch.tier = null;
    else if (typeof body.tier === "string" && VALID_TIERS.has(body.tier)) {
      patch.tier = body.tier;
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: `tier must be null or one of: ${Array.from(VALID_TIERS).join(", ")}`,
        },
        { status: 400 },
      );
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: false, error: "no fields to update — pass category and/or tier" },
      { status: 400 },
    );
  }

  try {
    const meta = await setClientJobMeta(body.client_slug, patch);
    return NextResponse.json({ ok: true, meta });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
