import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/clients/mt-view-landscaping/ops/mutate
 *
 * Single write endpoint for the Mt View operations backend. Body:
 *   { entity, op: "upsert" | "delete", row }
 *
 * Every write is hard-scoped to client_slug = "mt-view-landscaping" server-
 * side — the client can't write another tenant's rows even by forging the
 * payload. App-shaped field names (camelCase) are mapped to DB columns here
 * so the UI never has to know the column layout.
 *
 * Password-gated UI only (cookie bj_mtv_ops_unlocked); this is an internal
 * operator tool, not a public surface. Validation rejects unknown entities,
 * bad ids, and missing required fields with a 400 (never a raw PG 500).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SLUG = "mt-view-landscaping";
const ID_RE = /^[a-z0-9_-]{1,48}$/i;

type Entity =
  | "employees"
  | "vehicles"
  | "crews"
  | "properties"
  | "routes"
  | "route_stops"
  | "assumptions";

const TABLE: Record<Entity, string> = {
  employees: "ops_employees",
  vehicles: "ops_vehicles",
  crews: "ops_crews",
  properties: "ops_properties",
  routes: "ops_routes",
  route_stops: "ops_route_stops",
  assumptions: "ops_assumptions",
};

const ID_PREFIX: Record<Entity, string> = {
  employees: "e",
  vehicles: "v",
  crews: "c",
  properties: "p",
  routes: "r",
  route_stops: "s",
  assumptions: "a",
};

type FieldDef = { col: string; type: "string" | "number" | "bool" | "numberOrNull" | "json" };

// app field (camelCase) → DB column + coercion. Only listed fields are
// written — anything else in the payload is ignored.
const FIELDS: Record<Entity, Record<string, FieldDef>> = {
  employees: {
    name: { col: "name", type: "string" },
    role: { col: "role", type: "string" },
    payType: { col: "pay_type", type: "string" },
    hourlyRate: { col: "hourly_rate", type: "number" },
    burdenPctOverride: { col: "burden_pct_override", type: "numberOrNull" },
    crewId: { col: "crew_id", type: "string" },
    tenureYears: { col: "tenure_years", type: "number" },
    phone: { col: "phone", type: "string" },
    billable: { col: "billable", type: "bool" },
    active: { col: "active", type: "bool" },
  },
  vehicles: {
    name: { col: "name", type: "string" },
    mpg: { col: "mpg", type: "number" },
    fuelCostPerGal: { col: "fuel_cost_per_gal", type: "number" },
    maintenancePerMile: { col: "maintenance_per_mile", type: "number" },
  },
  crews: {
    name: { col: "name", type: "string" },
    leadId: { col: "lead_id", type: "string" },
    vehicleId: { col: "vehicle_id", type: "string" },
    color: { col: "color", type: "string" },
  },
  properties: {
    customer: { col: "customer", type: "string" },
    address: { col: "address", type: "string" },
    city: { col: "city", type: "string" },
    lat: { col: "lat", type: "numberOrNull" },
    lng: { col: "lng", type: "numberOrNull" },
    tier: { col: "tier", type: "string" },
    pricePerVisitUsd: { col: "price_per_visit_usd", type: "number" },
    visitsPerMonth: { col: "visits_per_month", type: "number" },
    materialsPerVisitUsd: { col: "materials_per_visit_usd", type: "number" },
    startedAt: { col: "started_at", type: "string" },
    active: { col: "active", type: "bool" },
  },
  routes: {
    day: { col: "day", type: "string" },
    crewId: { col: "crew_id", type: "string" },
    returnDriveMinutes: { col: "return_drive_minutes", type: "number" },
    returnDriveMiles: { col: "return_drive_miles", type: "number" },
    sortOrder: { col: "sort_order", type: "number" },
  },
  route_stops: {
    routeId: { col: "route_id", type: "string" },
    propertyId: { col: "property_id", type: "string" },
    seq: { col: "seq", type: "number" },
    serviceMinutes: { col: "service_minutes", type: "number" },
    driveMinutes: { col: "drive_minutes", type: "number" },
    driveMiles: { col: "drive_miles", type: "number" },
  },
  assumptions: {
    laborBurdenPct: { col: "labor_burden_pct", type: "number" },
    maintenanceOverheadSharePct: { col: "maintenance_overhead_share_pct", type: "number" },
    taxSetAsidePct: { col: "tax_set_aside_pct", type: "number" },
    overheadLines: { col: "overhead_lines", type: "json" },
    weeksPerMonth: { col: "weeks_per_month", type: "number" },
  },
};

const REQUIRED: Record<Entity, string[]> = {
  employees: ["name"],
  vehicles: ["name"],
  crews: ["name"],
  properties: ["customer"],
  routes: ["day"],
  route_stops: ["routeId", "propertyId"],
  assumptions: [],
};

function coerce(def: FieldDef, v: unknown): unknown {
  switch (def.type) {
    case "number": {
      const n = typeof v === "string" ? parseFloat(v) : (v as number);
      return Number.isFinite(n) ? n : 0;
    }
    case "numberOrNull": {
      if (v === null || v === "" || v === undefined) return null;
      const n = typeof v === "string" ? parseFloat(v) : (v as number);
      return Number.isFinite(n) ? n : null;
    }
    case "bool":
      return v === true || v === "true";
    case "json":
      return v ?? [];
    default:
      return v == null ? "" : String(v);
  }
}

function genId(prefix: string): string {
  // short, url-safe, collision-unlikely at this scale
  const rand = Math.abs(Math.floor((Date.now() % 1e9) ^ (performance.now() * 1000))).toString(36);
  return `${prefix}_${rand}${(Date.now() % 36 ** 2).toString(36)}`;
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Database not configured." }, { status: 503 });
  }

  let body: { entity?: string; op?: string; row?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const entity = body.entity as Entity;
  const op = body.op;
  const row = body.row ?? {};

  if (!entity || !(entity in TABLE)) {
    return NextResponse.json({ ok: false, error: "Unknown entity." }, { status: 400 });
  }
  if (op !== "upsert" && op !== "delete") {
    return NextResponse.json({ ok: false, error: "Unknown op." }, { status: 400 });
  }

  const table = TABLE[entity];
  const sb = getSupabase();

  // ── DELETE ─────────────────────────────────────────────
  if (op === "delete") {
    const id = String(row.id ?? "");
    if (!ID_RE.test(id)) {
      return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
    }
    const { error } = await sb.from(table).delete().eq("id", id).eq("client_slug", SLUG);
    if (error) {
      console.error(`[ops mutate] delete ${entity} failed:`, error.message);
      return NextResponse.json({ ok: false, error: "Delete failed." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id });
  }

  // ── UPSERT ─────────────────────────────────────────────
  const fields = FIELDS[entity];
  const record: Record<string, unknown> = { client_slug: SLUG };

  for (const [appKey, def] of Object.entries(fields)) {
    if (appKey in row) record[def.col] = coerce(def, row[appKey]);
  }

  // required-field check (only on create — identified by absence of id,
  // except assumptions which is keyed by client_slug)
  const incomingId = row.id != null ? String(row.id) : "";
  const isCreate = entity !== "assumptions" && !incomingId;
  if (isCreate) {
    const missing = REQUIRED[entity].filter((k) => !row[k] || String(row[k]).trim() === "");
    if (missing.length) {
      return NextResponse.json({ ok: false, error: `Missing required: ${missing.join(", ")}` }, { status: 400 });
    }
  }

  let result;
  if (entity === "assumptions") {
    // one row per client, keyed by client_slug
    record.updated_at = new Date().toISOString();
    result = await sb.from(table).upsert(record, { onConflict: "client_slug" }).select().maybeSingle();
  } else if (incomingId) {
    if (!ID_RE.test(incomingId)) {
      return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
    }
    result = await sb.from(table).update(record).eq("id", incomingId).eq("client_slug", SLUG).select().maybeSingle();
  } else {
    record.id = genId(ID_PREFIX[entity]);
    result = await sb.from(table).insert(record).select().maybeSingle();
  }

  if (result.error) {
    console.error(`[ops mutate] upsert ${entity} failed:`, result.error.message);
    return NextResponse.json({ ok: false, error: "Save failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, row: result.data });
}
