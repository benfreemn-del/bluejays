/**
 * GET  /api/recurring-costs              — list (defaults to active=true)
 * POST /api/recurring-costs              — create a new recurring cost row
 *
 * Query params on GET:
 *   ?includeInactive=true                — return ended subscriptions too
 *
 * POST body (JSON):
 *   {
 *     service:        string  (required, unique slug — e.g. "supabase")
 *     displayName:    string  (required)
 *     category:       string  (required, "database" | "hosting" | "email" | etc)
 *     monthlyCostUsd: number  (required)
 *     notes?:         string
 *     metadata?:      object
 *     startedOn?:     ISO date string (defaults to today)
 *   }
 *
 * Auth-gated via middleware (admin-only).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  addRecurringCost,
  getActiveRecurringCosts,
  getAllRecurringCosts,
  type AddRecurringCostInput,
} from "@/lib/recurring-costs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const includeInactive = url.searchParams.get("includeInactive") === "true";

  try {
    const rows = includeInactive
      ? await getAllRecurringCosts()
      : await getActiveRecurringCosts();
    return NextResponse.json({ recurringCosts: rows });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const service = typeof body.service === "string" ? body.service.trim() : "";
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const monthlyCostUsd = typeof body.monthlyCostUsd === "number" ? body.monthlyCostUsd : Number(body.monthlyCostUsd);

  if (!service) {
    return NextResponse.json({ error: "service is required" }, { status: 400 });
  }
  if (!displayName) {
    return NextResponse.json({ error: "displayName is required" }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }
  if (!Number.isFinite(monthlyCostUsd) || monthlyCostUsd < 0) {
    return NextResponse.json(
      { error: "monthlyCostUsd must be a non-negative number" },
      { status: 400 }
    );
  }

  const input: AddRecurringCostInput = {
    service,
    displayName,
    category,
    monthlyCostUsd,
  };
  if (typeof body.notes === "string") input.notes = body.notes;
  if (body.metadata && typeof body.metadata === "object") {
    input.metadata = body.metadata as Record<string, unknown>;
  }
  if (typeof body.startedOn === "string") input.startedOn = body.startedOn;

  try {
    const row = await addRecurringCost(input);
    return NextResponse.json({ recurringCost: row }, { status: 201 });
  } catch (err) {
    const message = (err as Error).message || "Insert failed";
    // Likely unique-violation on (service)
    if (/duplicate|unique/i.test(message)) {
      return NextResponse.json(
        { error: `A recurring cost with service="${service}" already exists. Use PATCH /api/recurring-costs/${service} to update it.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
