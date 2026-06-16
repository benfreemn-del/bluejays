// ─────────────────────────────────────────────────────────────────────────────
// ops-store.ts — server-side reader that assembles an OpsDataset from the
// ops_* Supabase tables (migration 20260616_mtv_ops_backend.sql).
//
// Falls back to MOCK_DATASET whenever Supabase isn't configured, errors, or
// returns no rows — so the page renders identically in every environment.
// All math stays in profit-engine.ts; this module only shapes raw rows into
// the typed dataset the engine expects.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  MOCK_DATASET,
  type Crew,
  type DailyRoute,
  type Employee,
  type OpsAssumptions,
  type OpsDataset,
  type PayType,
  type Property,
  type RouteStop,
  type ServiceTier,
  type ShopInfo,
  type Vehicle,
} from "./mock-ops-data";

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? (n as number) : fallback;
};

/**
 * Read the full ops dataset for a client. Returns MOCK_DATASET on any failure
 * or when the tables are empty, so the UI never breaks.
 */
export async function readOpsDataset(slug: string): Promise<OpsDataset> {
  if (!isSupabaseConfigured()) return MOCK_DATASET;

  try {
    const sb = getSupabase();
    const [aRes, vRes, cRes, eRes, pRes, rRes, sRes] = await Promise.all([
      sb.from("ops_assumptions").select("*").eq("client_slug", slug).maybeSingle(),
      sb.from("ops_vehicles").select("*").eq("client_slug", slug),
      sb.from("ops_crews").select("*").eq("client_slug", slug),
      sb.from("ops_employees").select("*").eq("client_slug", slug).eq("active", true),
      sb.from("ops_properties").select("*").eq("client_slug", slug).eq("active", true),
      sb.from("ops_routes").select("*").eq("client_slug", slug).order("sort_order", { ascending: true }),
      sb.from("ops_route_stops").select("*").eq("client_slug", slug).order("seq", { ascending: true }),
    ]);

    const aRow = aRes.data as Record<string, unknown> | null;
    const vRows = (vRes.data ?? []) as Record<string, unknown>[];
    const cRows = (cRes.data ?? []) as Record<string, unknown>[];
    const eRows = (eRes.data ?? []) as Record<string, unknown>[];
    const pRows = (pRes.data ?? []) as Record<string, unknown>[];
    const rRows = (rRes.data ?? []) as Record<string, unknown>[];
    const sRows = (sRes.data ?? []) as Record<string, unknown>[];

    // No seed for this slug → fall back to mock so the page still renders.
    if (!aRow || eRows.length === 0 || pRows.length === 0 || rRows.length === 0) {
      return MOCK_DATASET;
    }

    const employees: Employee[] = eRows.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      role: String(r.role ?? ""),
      payType: (String(r.pay_type ?? "hourly") as PayType),
      hourlyRate: num(r.hourly_rate),
      burdenPctOverride: r.burden_pct_override == null ? undefined : num(r.burden_pct_override),
      crewId: r.crew_id == null ? null : String(r.crew_id),
      tenureYears: num(r.tenure_years),
      phone: String(r.phone ?? ""),
      billable: r.billable !== false,
      overtimeHoursWeekly: num(r.overtime_hours_weekly),
    }));

    const vehicles: Vehicle[] = vRows.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      mpg: num(r.mpg, 12),
      fuelCostPerGal: num(r.fuel_cost_per_gal, 4.85),
      maintenancePerMile: num(r.maintenance_per_mile, 0.18),
    }));

    const crews: Crew[] = cRows.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      side: r.side === "construction" ? "construction" : "maintenance",
      leadId: String(r.lead_id ?? ""),
      memberIds: employees.filter((e) => e.crewId === String(r.id)).map((e) => e.id),
      vehicleId: String(r.vehicle_id ?? ""),
      color: String(r.color ?? "#15803d"),
    }));

    const properties: Property[] = pRows.map((r) => ({
      id: String(r.id),
      customer: String(r.customer ?? ""),
      address: String(r.address ?? ""),
      city: String(r.city ?? ""),
      lat: num(r.lat),
      lng: num(r.lng),
      tier: (String(r.tier ?? "full_care") as ServiceTier),
      pricePerVisitUsd: num(r.price_per_visit_usd),
      visitsPerMonth: num(r.visits_per_month, 4),
      materialsPerVisitUsd: num(r.materials_per_visit_usd),
      startedAt: r.started_at ? String(r.started_at) : "",
    }));

    // Group stops by route, preserving the seq order from the query.
    const stopsByRoute: Record<string, RouteStop[]> = {};
    for (const r of sRows) {
      const routeId = String(r.route_id);
      (stopsByRoute[routeId] ??= []).push({
        propertyId: String(r.property_id),
        serviceMinutes: num(r.service_minutes),
        driveMinutes: num(r.drive_minutes),
        driveMiles: num(r.drive_miles),
      });
    }

    const routes: DailyRoute[] = rRows.map((r) => ({
      id: String(r.id),
      day: String(r.day) as DailyRoute["day"],
      crewId: String(r.crew_id ?? ""),
      stops: stopsByRoute[String(r.id)] ?? [],
      returnToShop: {
        driveMinutes: num(r.return_drive_minutes),
        driveMiles: num(r.return_drive_miles),
      },
    }));

    const overheadLines = Array.isArray(aRow.overhead_lines)
      ? (aRow.overhead_lines as { label: string; monthlyUsd: number }[])
      : [];

    const assumptions: OpsAssumptions = {
      laborBurdenPct: num(aRow.labor_burden_pct, 0.31),
      monthlyOverhead: overheadLines,
      maintenanceOverheadSharePct: num(aRow.maintenance_overhead_share_pct, 0.32),
      taxSetAsidePct: num(aRow.tax_set_aside_pct, 0.2),
      overtimeMultiplier: num(aRow.overtime_multiplier, 1.5),
    };

    const shop: ShopInfo = {
      name: String(aRow.shop_name ?? MOCK_DATASET.shop.name),
      address: String(aRow.shop_address ?? MOCK_DATASET.shop.address),
      city: String(aRow.shop_city ?? MOCK_DATASET.shop.city),
      lat: num(aRow.shop_lat, MOCK_DATASET.shop.lat),
      lng: num(aRow.shop_lng, MOCK_DATASET.shop.lng),
    };

    return {
      assumptions,
      weeksPerMonth: num(aRow.weeks_per_month, 4.33),
      shop,
      vehicles,
      crews,
      employees,
      properties,
      routes,
    };
  } catch (err) {
    console.error("[ops-store] readOpsDataset failed, using mock:", err);
    return MOCK_DATASET;
  }
}
