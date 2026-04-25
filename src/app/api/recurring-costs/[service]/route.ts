/**
 * PATCH  /api/recurring-costs/[service] — update an existing row
 * DELETE /api/recurring-costs/[service] — end the subscription (active=false + ended_on)
 *
 * Patchable fields: monthlyCostUsd, notes, metadata, active, displayName, category.
 *
 * The DELETE handler does NOT hard-delete — it preserves history by
 * marking active=false and stamping ended_on. To hard-delete a row,
 * use the Supabase dashboard.
 *
 * Auth-gated via middleware (admin-only).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  updateRecurringCost,
  endRecurringCost,
  type UpdateRecurringCostPatch,
} from "@/lib/recurring-costs";

const ALLOWED_KEYS: Array<keyof UpdateRecurringCostPatch> = [
  "monthlyCostUsd",
  "notes",
  "metadata",
  "active",
  "displayName",
  "category",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params;
  if (!service) {
    return NextResponse.json({ error: "service param required" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: UpdateRecurringCostPatch = {};
  for (const key of ALLOWED_KEYS) {
    if (key in body) {
      (patch as Record<string, unknown>)[key] = body[key];
    }
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No patchable fields supplied" }, { status: 400 });
  }
  if (patch.monthlyCostUsd !== undefined) {
    if (!Number.isFinite(patch.monthlyCostUsd) || patch.monthlyCostUsd < 0) {
      return NextResponse.json(
        { error: "monthlyCostUsd must be a non-negative number" },
        { status: 400 }
      );
    }
  }

  try {
    await updateRecurringCost(service, patch);
    return NextResponse.json({ ok: true, service });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params;
  if (!service) {
    return NextResponse.json({ error: "service param required" }, { status: 400 });
  }

  // Optional ?endedOn=YYYY-MM-DD override
  const url = new URL(request.url);
  const endedOnRaw = url.searchParams.get("endedOn");
  const endedOn = endedOnRaw ? new Date(endedOnRaw) : undefined;
  if (endedOnRaw && (endedOn === undefined || isNaN(endedOn.getTime()))) {
    return NextResponse.json({ error: "endedOn must be a valid ISO date" }, { status: 400 });
  }

  try {
    await endRecurringCost(service, endedOn);
    return NextResponse.json({ ok: true, service, endedOn: (endedOn ?? new Date()).toISOString().slice(0, 10) });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
