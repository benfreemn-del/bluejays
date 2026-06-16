// ─────────────────────────────────────────────────────────────────────────────
// profit-engine.ts — full job-costing math for the Mt View ops backend.
//
// Pure functions, no React, no I/O. The engine reads ONLY from the OpsDataset
// passed to createEngine() — never module globals — so identical code runs
// against the mock fallback OR live Supabase rows (assembled in ops-store.ts).
//
// The model (LMN / Aspire job-costing):
//
//   labor cost   = (service hrs) × (blended crew $/hr) × (1 + burden%)
//   drive cost   = (drive hrs)   × (blended crew $/hr) × (1 + burden%)   ← wages while driving
//                + (drive miles) × (vehicle $/mile)                       ← fuel + maintenance
//   materials    = per-visit disposal / mulch / consumables
//   overhead     = (service + drive hrs) × overhead $/hr                  ← maint share ÷ billable hrs
//   gross profit = revenue − labor − drive − materials
//   net (pre-tax)= gross − overhead
//   tax set-aside= net × taxSetAside%
//   take-home    = net − tax set-aside
// ─────────────────────────────────────────────────────────────────────────────

import {
  Crew,
  DailyRoute,
  Employee,
  OpsDataset,
  Property,
  RouteStop,
  Vehicle,
  vehicleCostPerMile,
} from "./mock-ops-data";

/* ═════════════════════════ EXPORTED RESULT TYPES ═════════════════════════ */

export type StopEconomics = {
  property: Property;
  serviceHours: number;
  driveHours: number;
  driveMiles: number;
  revenue: number;
  laborCost: number;
  driveCost: number;
  driveWageCost: number;
  vehicleCost: number;
  materials: number;
  overhead: number;
  grossProfit: number;
  netProfit: number;
  grossMarginPct: number;
  netMarginPct: number;
  revenuePerCrewHour: number;
};

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
  driveTimePct: number;
};

export type ProfitAndLoss = {
  revenue: number;
  laborCost: number;
  driveCost: number;
  materials: number;
  overtime: number;
  grossProfit: number;
  overhead: number;
  netProfit: number;
  taxSetAside: number;
  takeHome: number;
  serviceHours: number;
  driveHours: number;
  totalHours: number;
  driveMiles: number;
  grossMarginPct: number;
  netMarginPct: number;
  profitPerCrewHour: number;
};

export type CrewRouteLine = {
  routeId: string;
  day: string;
  stops: number;
  hours: number;
  revenue: number;
  cost: number;
  netProfit: number;
  netMarginPct: number;
};

export type CrewProfitability = {
  crew: Crew;
  members: Employee[];
  blendedWage: number;
  burdenedWage: number;
  weeklyRevenue: number;
  weeklyLaborCost: number;
  weeklyDriveCost: number;
  weeklyOvertimeCost: number;
  weeklyNetProfit: number;
  weeklyHours: number;
  netMarginPct: number;
  profitPerHour: number;
  /** What this crew actually ran — one line per route day. Empty for
   *  construction crews (project-based, no recurring routes yet). */
  routeBreakdown: CrewRouteLine[];
};

export type EmployeeCost = {
  employee: Employee;
  crew: Crew | null;
  burdenPct: number;
  burdenedHourly: number;
  weeklyHours: number;
  weeklyLaborCost: number;
  overtimeHours: number;
  overtimeCost: number;
};

export type CustomerProfitability = {
  property: Property;
  crew: Crew | null;
  perVisit: StopEconomics | null;
  monthlyRevenue: number;
  monthlyNetProfit: number;
  netMarginPct: number;
  losingMoney: boolean;
};

export type CrewPayroll = {
  crew: Crew;
  members: Employee[];
  clockedHours: number; // actual hours from the time clock
  plannedHours: number; // route hours (maintenance); 0 for construction
  laborCost: number; // burdened, from clocked hours
  hasClock: boolean;
};

/* ═════════════════════════ ENGINE FACTORY ═════════════════════════ */

export type OpsEngine = ReturnType<typeof createEngine>;

export function createEngine(data: OpsDataset) {
  const { assumptions, weeksPerMonth } = data;

  const monthlyOverheadTotal = assumptions.monthlyOverhead.reduce(
    (s, l) => s + l.monthlyUsd,
    0,
  );
  const maintenanceOverheadMonthly =
    monthlyOverheadTotal * assumptions.maintenanceOverheadSharePct;

  /* lookups */
  const employeeById = (id: string) => data.employees.find((e) => e.id === id);
  const crewById = (id: string) => data.crews.find((c) => c.id === id);
  const vehicleById = (id: string) => data.vehicles.find((v) => v.id === id);
  const propertyById = (id: string) => data.properties.find((p) => p.id === id);

  /* time clock: actual hours per employee from the weekly timesheet */
  const clockedByEmp: Record<string, number> = {};
  for (const t of data.timesheets) {
    clockedByEmp[t.employeeId] = (clockedByEmp[t.employeeId] ?? 0) + (t.hours || 0);
  }
  function employeeLoadedRate(e: Employee): number {
    const burden = e.burdenPctOverride ?? assumptions.laborBurdenPct;
    return e.hourlyRate * (1 + burden);
  }

  /* overtime: hours beyond the route, paid at the OT multiplier (burdened) */
  function employeeOvertimeCost(e: Employee): number {
    const burden = e.burdenPctOverride ?? assumptions.laborBurdenPct;
    return (e.overtimeHoursWeekly || 0) * e.hourlyRate * assumptions.overtimeMultiplier * (1 + burden);
  }
  function totalOvertimeCostWeekly(): number {
    return data.employees.reduce((s, e) => s + employeeOvertimeCost(e), 0);
  }

  /* crew rates */
  function crewBlendedWage(crew: Crew): number {
    return crew.memberIds.reduce((sum, id) => {
      const e = employeeById(id);
      return sum + (e ? e.hourlyRate : 0);
    }, 0);
  }
  function crewBurdenedWage(crew: Crew): number {
    return crew.memberIds.reduce((sum, id) => {
      const e = employeeById(id);
      if (!e) return sum;
      const burden = e.burdenPctOverride ?? assumptions.laborBurdenPct;
      return sum + e.hourlyRate * (1 + burden);
    }, 0);
  }

  /* overhead allocation */
  function routeTotalHours(route: DailyRoute): number {
    const stopHours = route.stops.reduce(
      (s, st) => s + (st.serviceMinutes + st.driveMinutes) / 60,
      0,
    );
    return stopHours + route.returnToShop.driveMinutes / 60;
  }
  function weeklyBillableHours(): number {
    return data.routes.reduce((sum, r) => sum + routeTotalHours(r), 0);
  }
  function overheadPerHour(): number {
    const monthlyBillable = weeklyBillableHours() * weeksPerMonth;
    if (monthlyBillable <= 0) return 0;
    return maintenanceOverheadMonthly / monthlyBillable;
  }

  /* stop economics */
  function stopEconomics(stop: RouteStop, crew: Crew): StopEconomics {
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
      property, serviceHours, driveHours, driveMiles: stop.driveMiles,
      revenue, laborCost, driveCost, driveWageCost, vehicleCost, materials, overhead,
      grossProfit, netProfit,
      grossMarginPct: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      netMarginPct: revenue > 0 ? (netProfit / revenue) * 100 : 0,
      revenuePerCrewHour: totalCrewHours > 0 ? revenue / totalCrewHours : 0,
    };
  }

  /* route economics */
  function routeEconomics(route: DailyRoute): RouteEconomics {
    const crew = crewById(route.crewId)!;
    const vehicle = vehicleById(crew.vehicleId)!;
    const burdenedWage = crewBurdenedWage(crew);
    const ohRate = overheadPerHour();

    const stops = route.stops.map((st) => stopEconomics(st, crew));

    let serviceHours = 0, driveHours = 0, driveMiles = 0, revenue = 0,
      laborCost = 0, driveCost = 0, materials = 0, overhead = 0;
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
      route, crew, stops, serviceHours, driveHours, totalHours, driveMiles,
      revenue, laborCost, driveCost, materials, overhead, grossProfit, netProfit,
      netMarginPct: revenue > 0 ? (netProfit / revenue) * 100 : 0,
      revenuePerHour: totalHours > 0 ? revenue / totalHours : 0,
      profitPerHour: totalHours > 0 ? netProfit / totalHours : 0,
      driveTimePct: totalHours > 0 ? (driveHours / totalHours) * 100 : 0,
    };
  }

  function allRouteEconomics(): RouteEconomics[] {
    return data.routes.map(routeEconomics);
  }

  /* P&L */
  function emptyPL(): ProfitAndLoss {
    return {
      revenue: 0, laborCost: 0, driveCost: 0, materials: 0, overtime: 0, grossProfit: 0,
      overhead: 0, netProfit: 0, taxSetAside: 0, takeHome: 0,
      serviceHours: 0, driveHours: 0, totalHours: 0, driveMiles: 0,
      grossMarginPct: 0, netMarginPct: 0, profitPerCrewHour: 0,
    };
  }
  function finalizePL(pl: ProfitAndLoss): ProfitAndLoss {
    pl.grossProfit = pl.revenue - pl.laborCost - pl.driveCost - pl.materials - pl.overtime;
    pl.netProfit = pl.grossProfit - pl.overhead;
    pl.taxSetAside = Math.max(0, pl.netProfit) * assumptions.taxSetAsidePct;
    pl.takeHome = pl.netProfit - pl.taxSetAside;
    pl.totalHours = pl.serviceHours + pl.driveHours;
    pl.grossMarginPct = pl.revenue > 0 ? (pl.grossProfit / pl.revenue) * 100 : 0;
    pl.netMarginPct = pl.revenue > 0 ? (pl.netProfit / pl.revenue) * 100 : 0;
    pl.profitPerCrewHour = pl.totalHours > 0 ? pl.netProfit / pl.totalHours : 0;
    return pl;
  }
  function weeklyProfitAndLoss(): ProfitAndLoss {
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
    pl.overtime = totalOvertimeCostWeekly();
    return finalizePL(pl);
  }
  function monthlyProfitAndLoss(): ProfitAndLoss {
    const w = weeklyProfitAndLoss();
    const pl = emptyPL();
    pl.revenue = w.revenue * weeksPerMonth;
    pl.laborCost = w.laborCost * weeksPerMonth;
    pl.driveCost = w.driveCost * weeksPerMonth;
    pl.materials = w.materials * weeksPerMonth;
    pl.overtime = w.overtime * weeksPerMonth;
    pl.overhead = maintenanceOverheadMonthly; // exact allocated figure
    pl.serviceHours = w.serviceHours * weeksPerMonth;
    pl.driveHours = w.driveHours * weeksPerMonth;
    pl.driveMiles = w.driveMiles * weeksPerMonth;
    return finalizePL(pl);
  }

  /* crew profitability */
  function crewProfitability(): CrewProfitability[] {
    const routes = allRouteEconomics();
    return data.crews.map((crew) => {
      const members = crew.memberIds
        .map((id) => employeeById(id))
        .filter((e): e is Employee => !!e);
      const crewRoutes = routes.filter((re) => re.crew.id === crew.id);

      let weeklyRevenue = 0, weeklyLaborCost = 0, weeklyDriveCost = 0,
        weeklyNetProfit = 0, weeklyHours = 0;
      const routeBreakdown: CrewRouteLine[] = [];
      for (const re of crewRoutes) {
        weeklyRevenue += re.revenue;
        weeklyLaborCost += re.laborCost;
        weeklyDriveCost += re.driveCost;
        weeklyNetProfit += re.netProfit;
        weeklyHours += re.totalHours;
        routeBreakdown.push({
          routeId: re.route.id,
          day: re.route.day,
          stops: re.stops.length,
          hours: re.totalHours,
          revenue: re.revenue,
          cost: re.revenue - re.netProfit,
          netProfit: re.netProfit,
          netMarginPct: re.netMarginPct,
        });
      }

      // Overtime is a crew-level cost on top of the route work.
      const weeklyOvertimeCost = members.reduce((s, m) => s + employeeOvertimeCost(m), 0);
      weeklyNetProfit -= weeklyOvertimeCost;

      return {
        crew, members,
        blendedWage: crewBlendedWage(crew),
        burdenedWage: crewBurdenedWage(crew),
        weeklyRevenue, weeklyLaborCost, weeklyDriveCost, weeklyOvertimeCost, weeklyNetProfit, weeklyHours,
        netMarginPct: weeklyRevenue > 0 ? (weeklyNetProfit / weeklyRevenue) * 100 : 0,
        profitPerHour: weeklyHours > 0 ? weeklyNetProfit / weeklyHours : 0,
        routeBreakdown,
      };
    });
  }

  /* employee cost */
  function employeeCosts(): EmployeeCost[] {
    const crewHours: Record<string, number> = {};
    for (const re of allRouteEconomics()) {
      crewHours[re.crew.id] = (crewHours[re.crew.id] ?? 0) + re.totalHours;
    }
    return data.employees.map((employee) => {
      const crew = employee.crewId ? crewById(employee.crewId) ?? null : null;
      const burdenPct = employee.burdenPctOverride ?? assumptions.laborBurdenPct;
      const burdenedHourly = employee.hourlyRate * (1 + burdenPct);
      const weeklyHours = crew && employee.billable ? crewHours[crew.id] ?? 0 : 0;
      return {
        employee, crew, burdenPct, burdenedHourly, weeklyHours,
        weeklyLaborCost: weeklyHours * burdenedHourly,
        overtimeHours: employee.overtimeHoursWeekly || 0,
        overtimeCost: employeeOvertimeCost(employee),
      };
    });
  }

  /* customer profitability */
  function customerProfitability(): CustomerProfitability[] {
    const byProperty: Record<string, { eco: StopEconomics; crew: Crew }> = {};
    for (const re of allRouteEconomics()) {
      for (const s of re.stops) byProperty[s.property.id] = { eco: s, crew: re.crew };
    }
    return data.properties.map((property) => {
      const hit = byProperty[property.id];
      const perVisit = hit?.eco ?? null;
      const crew = hit?.crew ?? null;
      // Modeled customers are all on the weekly route → weeksPerMonth visits.
      const monthlyRevenue = property.pricePerVisitUsd * weeksPerMonth;
      const monthlyNetProfit = perVisit ? perVisit.netProfit * weeksPerMonth : 0;
      return {
        property, crew, perVisit, monthlyRevenue, monthlyNetProfit,
        netMarginPct: monthlyRevenue > 0 ? (monthlyNetProfit / monthlyRevenue) * 100 : 0,
        losingMoney: perVisit ? perVisit.netProfit < 0 : false,
      };
    });
  }

  /* payroll from the time clock — per crew clocked hours + burdened cost.
   *  Maintenance crews also carry their planned route hours for variance. */
  function payroll(): CrewPayroll[] {
    const routeHoursByCrew: Record<string, number> = {};
    for (const re of allRouteEconomics()) {
      routeHoursByCrew[re.crew.id] = (routeHoursByCrew[re.crew.id] ?? 0) + re.totalHours;
    }
    return data.crews.map((crew) => {
      const members = crew.memberIds.map((id) => employeeById(id)).filter((e): e is Employee => !!e);
      let clockedHours = 0, laborCost = 0, hasClock = false;
      for (const m of members) {
        const h = clockedByEmp[m.id] ?? 0;
        if (m.id in clockedByEmp) hasClock = true;
        clockedHours += h;
        laborCost += h * employeeLoadedRate(m);
      }
      // planned PERSON-hours = route duration × crew size, to match clocked
      // hours (which are summed across people).
      const plannedHours = (routeHoursByCrew[crew.id] ?? 0) * members.length;
      return { crew, members, clockedHours, plannedHours, laborCost, hasClock };
    });
  }

  return {
    monthlyOverheadTotal,
    maintenanceOverheadMonthly,
    weeksPerMonth,
    crewBlendedWage,
    crewBurdenedWage,
    weeklyBillableHours,
    overheadPerHour,
    stopEconomics,
    routeEconomics,
    allRouteEconomics,
    weeklyProfitAndLoss,
    monthlyProfitAndLoss,
    crewProfitability,
    employeeCosts,
    customerProfitability,
    payroll,
  };
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
