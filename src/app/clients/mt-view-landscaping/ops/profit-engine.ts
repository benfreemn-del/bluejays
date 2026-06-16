// ─────────────────────────────────────────────────────────────────────────────
// profit-engine.ts — full job-costing math for the Mt View ops backend.
//
// Pure functions, no React, no I/O. Everything reads from mock-ops-data.ts
// today; on DB wire-up the seed arrays become query results and this engine
// is untouched. That separation is the whole point.
//
// The model (LMN / Aspire job-costing):
//
//   labor cost   = (service hrs) × (blended crew $/hr) × (1 + burden%)
//   drive cost   = (drive hrs)   × (blended crew $/hr) × (1 + burden%)   ← wages while driving
//                + (drive miles) × (vehicle $/mile)                       ← fuel + maintenance
//   materials    = per-visit disposal / mulch / consumables
//   overhead     = (service + drive hrs) × overhead $/hr                  ← fixed OH ÷ billable hrs
//   gross profit = revenue − labor − drive − materials
//   net (pre-tax)= gross − overhead
//   tax set-aside= net × taxSetAside%
//   take-home    = net − tax set-aside
// ─────────────────────────────────────────────────────────────────────────────

import {
  ASSUMPTIONS,
  CREWS,
  Crew,
  DailyRoute,
  EMPLOYEES,
  Employee,
  MAINTENANCE_OVERHEAD_MONTHLY,
  PROPERTIES,
  Property,
  ROUTES,
  RouteStop,
  WEEKS_PER_MONTH,
  crewById,
  employeeById,
  propertyById,
  vehicleById,
  vehicleCostPerMile,
} from "./mock-ops-data";

/* ═════════════════════════ CREW RATE ═════════════════════════ */

/** Blended raw wage ($/hr) of every member on a crew — what one crew-hour
 *  of this team costs in base wages before burden. */
export function crewBlendedWage(crew: Crew): number {
  return crew.memberIds.reduce((sum, id) => {
    const e = employeeById(id);
    return sum + (e ? e.hourlyRate : 0);
  }, 0);
}

/** Blended wage including labor burden — the true cost of a crew-hour. */
export function crewBurdenedWage(crew: Crew): number {
  return crew.memberIds.reduce((sum, id) => {
    const e = employeeById(id);
    if (!e) return sum;
    const burden = e.burdenPctOverride ?? ASSUMPTIONS.laborBurdenPct;
    return sum + e.hourlyRate * (1 + burden);
  }, 0);
}

/* ═════════════════════════ OVERHEAD RATE ═════════════════════════ */

/** Total billable crew-hours per WEEK across every recurring route
 *  (service + drive). The denominator for overhead allocation. */
export function weeklyBillableHours(): number {
  return ROUTES.reduce((sum, r) => sum + routeTotalHours(r), 0);
}

/** Maintenance's share of fixed overhead spread across its billable
 *  crew-hours → $/hr. Every productive maintenance hour carries this slice
 *  of the shop, trucks, insurance, and owner admin time (the install/design
 *  division carries the rest of company overhead). */
export function overheadPerHour(): number {
  const monthlyBillable = weeklyBillableHours() * WEEKS_PER_MONTH;
  if (monthlyBillable <= 0) return 0;
  return MAINTENANCE_OVERHEAD_MONTHLY / monthlyBillable;
}

/* ═════════════════════════ STOP ECONOMICS ═════════════════════════ */

export type StopEconomics = {
  property: Property;
  serviceHours: number;
  driveHours: number;
  driveMiles: number;
  revenue: number;
  laborCost: number;
  driveCost: number; // drive wages + vehicle
  driveWageCost: number;
  vehicleCost: number;
  materials: number;
  overhead: number;
  grossProfit: number; // revenue − labor − drive − materials
  netProfit: number; // gross − overhead (pre-tax)
  grossMarginPct: number;
  netMarginPct: number;
  revenuePerCrewHour: number;
};

/** Full per-stop job cost for one maintenance visit. */
export function stopEconomics(stop: RouteStop, crew: Crew): StopEconomics {
  const property = propertyById(stop.propertyId)!;
  const vehicle = vehicleById(crew.vehicleId)!;
  const burdenedWage = crewBurdenedWage(crew);

  const serviceHours = stop.serviceMinutes / 60;
  const driveHours = stop.driveMinutes / 60;

  const revenue = property.pricePerVisitUsd;
  const laborCost = serviceHours * burdenedWage;
  const driveWageCost = driveHours * burdenedWage;
  const vehicleCost = stop.driveMiles * vehicleCostPerMile(vehicle);
  const driveCost = driveWageCost + vehicleCost;
  const materials = property.materialsPerVisitUsd;
  const overhead = (serviceHours + driveHours) * overheadPerHour();

  const grossProfit = revenue - laborCost - driveCost - materials;
  const netProfit = grossProfit - overhead;
  const totalCrewHours = serviceHours + driveHours;

  return {
    property,
    serviceHours,
    driveHours,
    driveMiles: stop.driveMiles,
    revenue,
    laborCost,
    driveCost,
    driveWageCost,
    vehicleCost,
    materials,
    overhead,
    grossProfit,
    netProfit,
    grossMarginPct: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    netMarginPct: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    revenuePerCrewHour: totalCrewHours > 0 ? revenue / totalCrewHours : 0,
  };
}

/* ═════════════════════════ ROUTE ECONOMICS ═════════════════════════ */

export type RouteEconomics = {
  route: DailyRoute;
  crew: Crew;
  stops: StopEconomics[];
  serviceHours: number;
  driveHours: number;
  totalHours: number;
  driveMiles: number;
  revenue: number;
  laborCost: number;
  driveCost: number;
  materials: number;
  overhead: number;
  grossProfit: number;
  netProfit: number;
  netMarginPct: number;
  revenuePerHour: number;
  profitPerHour: number;
  /** % of the crew's day spent driving vs serving — windshield time. */
  driveTimePct: number;
};

export function routeTotalHours(route: DailyRoute): number {
  const stopHours = route.stops.reduce(
    (s, st) => s + (st.serviceMinutes + st.driveMinutes) / 60,
    0,
  );
  return stopHours + route.returnToShop.driveMinutes / 60;
}

export function routeEconomics(route: DailyRoute): RouteEconomics {
  const crew = crewById(route.crewId)!;
  const vehicle = vehicleById(crew.vehicleId)!;
  const burdenedWage = crewBurdenedWage(crew);
  const ohRate = overheadPerHour();

  const stops = route.stops.map((st) => stopEconomics(st, crew));

  // Stop-level rollup
  let serviceHours = 0,
    driveHours = 0,
    driveMiles = 0,
    revenue = 0,
    laborCost = 0,
    driveCost = 0,
    materials = 0,
    overhead = 0;

  for (const s of stops) {
    serviceHours += s.serviceHours;
    driveHours += s.driveHours;
    driveMiles += s.driveMiles;
    revenue += s.revenue;
    laborCost += s.laborCost;
    driveCost += s.driveCost;
    materials += s.materials;
    overhead += s.overhead;
  }

  // Return-to-shop leg: unbillable drive wages + vehicle + overhead, no revenue
  const returnHours = route.returnToShop.driveMinutes / 60;
  const returnWage = returnHours * burdenedWage;
  const returnVehicle = route.returnToShop.driveMiles * vehicleCostPerMile(vehicle);
  driveHours += returnHours;
  driveMiles += route.returnToShop.driveMiles;
  driveCost += returnWage + returnVehicle;
  overhead += returnHours * ohRate;

  const totalHours = serviceHours + driveHours;
  const grossProfit = revenue - laborCost - driveCost - materials;
  const netProfit = grossProfit - overhead;

  return {
    route,
    crew,
    stops,
    serviceHours,
    driveHours,
    totalHours,
    driveMiles,
    revenue,
    laborCost,
    driveCost,
    materials,
    overhead,
    grossProfit,
    netProfit,
    netMarginPct: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    revenuePerHour: totalHours > 0 ? revenue / totalHours : 0,
    profitPerHour: totalHours > 0 ? netProfit / totalHours : 0,
    driveTimePct: totalHours > 0 ? (driveHours / totalHours) * 100 : 0,
  };
}

export function allRouteEconomics(): RouteEconomics[] {
  return ROUTES.map(routeEconomics);
}

/* ═════════════════════════ WEEKLY / MONTHLY P&L ═════════════════════════ */

export type ProfitAndLoss = {
  revenue: number;
  laborCost: number;
  driveCost: number;
  materials: number;
  grossProfit: number;
  overhead: number;
  netProfit: number; // pre-tax
  taxSetAside: number;
  takeHome: number; // net − tax set-aside
  serviceHours: number;
  driveHours: number;
  totalHours: number;
  driveMiles: number;
  grossMarginPct: number;
  netMarginPct: number;
  profitPerCrewHour: number;
};

function emptyPL(): ProfitAndLoss {
  return {
    revenue: 0, laborCost: 0, driveCost: 0, materials: 0, grossProfit: 0,
    overhead: 0, netProfit: 0, taxSetAside: 0, takeHome: 0,
    serviceHours: 0, driveHours: 0, totalHours: 0, driveMiles: 0,
    grossMarginPct: 0, netMarginPct: 0, profitPerCrewHour: 0,
  };
}

/** Weekly P&L = sum of all recurring routes (one pass of each route). */
export function weeklyProfitAndLoss(): ProfitAndLoss {
  const pl = emptyPL();
  for (const re of allRouteEconomics()) {
    pl.revenue += re.revenue;
    pl.laborCost += re.laborCost;
    pl.driveCost += re.driveCost;
    pl.materials += re.materials;
    pl.overhead += re.overhead;
    pl.serviceHours += re.serviceHours;
    pl.driveHours += re.driveHours;
    pl.driveMiles += re.driveMiles;
  }
  return finalizePL(pl);
}

/** Monthly P&L — weekly × weeks/month. Overhead is already monthly-anchored
 *  via the per-hour allocation, so this scales cleanly. */
export function monthlyProfitAndLoss(): ProfitAndLoss {
  const w = weeklyProfitAndLoss();
  const pl = emptyPL();
  pl.revenue = w.revenue * WEEKS_PER_MONTH;
  pl.laborCost = w.laborCost * WEEKS_PER_MONTH;
  pl.driveCost = w.driveCost * WEEKS_PER_MONTH;
  pl.materials = w.materials * WEEKS_PER_MONTH;
  pl.overhead = MAINTENANCE_OVERHEAD_MONTHLY; // exact allocated figure
  pl.serviceHours = w.serviceHours * WEEKS_PER_MONTH;
  pl.driveHours = w.driveHours * WEEKS_PER_MONTH;
  pl.driveMiles = w.driveMiles * WEEKS_PER_MONTH;
  return finalizePL(pl);
}

function finalizePL(pl: ProfitAndLoss): ProfitAndLoss {
  pl.grossProfit = pl.revenue - pl.laborCost - pl.driveCost - pl.materials;
  pl.netProfit = pl.grossProfit - pl.overhead;
  pl.taxSetAside = Math.max(0, pl.netProfit) * ASSUMPTIONS.taxSetAsidePct;
  pl.takeHome = pl.netProfit - pl.taxSetAside;
  pl.totalHours = pl.serviceHours + pl.driveHours;
  pl.grossMarginPct = pl.revenue > 0 ? (pl.grossProfit / pl.revenue) * 100 : 0;
  pl.netMarginPct = pl.revenue > 0 ? (pl.netProfit / pl.revenue) * 100 : 0;
  pl.profitPerCrewHour = pl.totalHours > 0 ? pl.netProfit / pl.totalHours : 0;
  return pl;
}

/* ═════════════════════════ CREW PROFITABILITY ═════════════════════════ */

export type CrewProfitability = {
  crew: Crew;
  members: Employee[];
  blendedWage: number;
  burdenedWage: number;
  weeklyRevenue: number;
  weeklyLaborCost: number;
  weeklyDriveCost: number;
  weeklyNetProfit: number;
  weeklyHours: number;
  netMarginPct: number;
  profitPerHour: number;
};

export function crewProfitability(): CrewProfitability[] {
  return CREWS.map((crew) => {
    const members = crew.memberIds
      .map((id) => employeeById(id))
      .filter((e): e is Employee => !!e);
    const routes = allRouteEconomics().filter((re) => re.crew.id === crew.id);

    let weeklyRevenue = 0, weeklyLaborCost = 0, weeklyDriveCost = 0,
      weeklyNetProfit = 0, weeklyHours = 0;
    for (const re of routes) {
      weeklyRevenue += re.revenue;
      weeklyLaborCost += re.laborCost;
      weeklyDriveCost += re.driveCost;
      weeklyNetProfit += re.netProfit;
      weeklyHours += re.totalHours;
    }

    return {
      crew,
      members,
      blendedWage: crewBlendedWage(crew),
      burdenedWage: crewBurdenedWage(crew),
      weeklyRevenue,
      weeklyLaborCost,
      weeklyDriveCost,
      weeklyNetProfit,
      weeklyHours,
      netMarginPct: weeklyRevenue > 0 ? (weeklyNetProfit / weeklyRevenue) * 100 : 0,
      profitPerHour: weeklyHours > 0 ? weeklyNetProfit / weeklyHours : 0,
    };
  });
}

/* ═════════════════════════ EMPLOYEE COST ═════════════════════════ */

export type EmployeeCost = {
  employee: Employee;
  crew: Crew | null;
  burdenPct: number;
  burdenedHourly: number;
  weeklyHours: number; // hours on routes this week (crew total hours)
  weeklyLaborCost: number; // this employee's burdened cost for those hours
};

export function employeeCosts(): EmployeeCost[] {
  const crewHours: Record<string, number> = {};
  for (const re of allRouteEconomics()) {
    crewHours[re.crew.id] = (crewHours[re.crew.id] ?? 0) + re.totalHours;
  }
  return EMPLOYEES.map((employee) => {
    const crew = employee.crewId ? crewById(employee.crewId) ?? null : null;
    const burdenPct = employee.burdenPctOverride ?? ASSUMPTIONS.laborBurdenPct;
    const burdenedHourly = employee.hourlyRate * (1 + burdenPct);
    const weeklyHours = crew && employee.billable ? crewHours[crew.id] ?? 0 : 0;
    return {
      employee,
      crew,
      burdenPct,
      burdenedHourly,
      weeklyHours,
      weeklyLaborCost: weeklyHours * burdenedHourly,
    };
  });
}

/* ═════════════════════════ CUSTOMER PROFITABILITY ═════════════════════════ */

export type CustomerProfitability = {
  property: Property;
  crew: Crew | null;
  perVisit: StopEconomics | null;
  monthlyRevenue: number;
  monthlyNetProfit: number;
  netMarginPct: number;
  losingMoney: boolean;
};

/** Per-customer profitability, found by locating each property's stop on
 *  whichever route serves it. */
export function customerProfitability(): CustomerProfitability[] {
  // index stop economics by propertyId
  const byProperty: Record<string, { eco: StopEconomics; crew: Crew }> = {};
  for (const re of allRouteEconomics()) {
    for (const s of re.stops) {
      byProperty[s.property.id] = { eco: s, crew: re.crew };
    }
  }

  return PROPERTIES.map((property) => {
    const hit = byProperty[property.id];
    const perVisit = hit?.eco ?? null;
    const crew = hit?.crew ?? null;
    // Modeled customers are all on the weekly route → WEEKS_PER_MONTH visits.
    // Using the same factor as the P&L keeps the two tabs' monthly totals in
    // lockstep (a per-property visitsPerMonth override comes with DB wire-up).
    const monthlyRevenue = property.pricePerVisitUsd * WEEKS_PER_MONTH;
    const monthlyNetProfit = perVisit ? perVisit.netProfit * WEEKS_PER_MONTH : 0;
    return {
      property,
      crew,
      perVisit,
      monthlyRevenue,
      monthlyNetProfit,
      netMarginPct: monthlyRevenue > 0 ? (monthlyNetProfit / monthlyRevenue) * 100 : 0,
      losingMoney: perVisit ? perVisit.netProfit < 0 : false,
    };
  });
}

/* ═════════════════════════ FORMAT HELPERS ═════════════════════════ */

export function usd(n: number, opts?: { cents?: boolean }): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts?.cents ? 2 : 0,
    maximumFractionDigits: opts?.cents ? 2 : 0,
  });
}

export function pct(n: number): string {
  return `${n >= 0 ? "" : "−"}${Math.abs(n).toFixed(1)}%`;
}

export function hrs(n: number): string {
  return `${n.toFixed(1)}h`;
}
