// ─────────────────────────────────────────────────────────────────────────────
// mock-ops-data.ts — Mountain View operations backend, mock seed data.
//
// This is the data model behind the bespoke Mt View ops + profitability
// backend (visual-first phase — all data is realistic mock, no DB writes yet).
// When the UI is approved we promote these TYPES to Supabase tables 1:1 and
// swap the seed arrays for live queries. Keep the shapes DB-friendly.
//
// Full job-costing model (LMN / Aspire style):
//   route/job profit = revenue
//                    − crew wages (service time)
//                    − labor burden (taxes + workers-comp + insurance on wages)
//                    − drive cost (wages during drive + vehicle $/mile)
//                    − materials / equipment
//                    − overhead allocation (fixed monthly OH ÷ billable hours)
//                    − tax set-aside (% of pre-tax net)
//
// The math lives in profit-engine.ts — this file is pure data.
// ─────────────────────────────────────────────────────────────────────────────

/* ═════════════════════════ GLOBAL ASSUMPTIONS ═════════════════════════ */

export type OpsAssumptions = {
  /** Labor burden on top of base wage — employer payroll taxes (~10%),
   *  WA workers-comp for landscaping (~9%), GL + commercial-auto insurance
   *  allocation (~8%), PTO accrual. Landscaping runs hot here. */
  laborBurdenPct: number;
  /** Fixed monthly overhead the WHOLE company carries (design/install +
   *  maintenance both). Only the maintenance share is allocated to routes —
   *  the bigger install/design division carries the rest. */
  monthlyOverhead: OverheadLine[];
  /** Maintenance division's share of total company fixed overhead. The
   *  install/hardscape side is the larger division and carries ~2/3. */
  maintenanceOverheadSharePct: number;
  /** Owner tax set-aside on pre-tax net profit (federal + WA B&O). */
  taxSetAsidePct: number;
  /** Pay multiplier for overtime hours (e.g. 1.5 = time-and-a-half). */
  overtimeMultiplier: number;
};

export type OverheadLine = { label: string; monthlyUsd: number };

export const ASSUMPTIONS: OpsAssumptions = {
  laborBurdenPct: 0.31,
  monthlyOverhead: [
    { label: "Shop + yard lease", monthlyUsd: 1800 },
    { label: "Insurance (GL + commercial auto)", monthlyUsd: 1250 },
    { label: "Equipment loans + depreciation", monthlyUsd: 1400 },
    { label: "Software, phones, admin", monthlyUsd: 450 },
    { label: "Owner unbilled admin time", monthlyUsd: 2500 },
  ],
  maintenanceOverheadSharePct: 0.32,
  taxSetAsidePct: 0.2,
  overtimeMultiplier: 1.5,
};

/** Sum of fixed monthly overhead (whole company). */
export const MONTHLY_OVERHEAD_TOTAL = ASSUMPTIONS.monthlyOverhead.reduce(
  (s, l) => s + l.monthlyUsd,
  0,
);

/** Portion of company overhead allocated to the maintenance routes. */
export const MAINTENANCE_OVERHEAD_MONTHLY =
  MONTHLY_OVERHEAD_TOTAL * ASSUMPTIONS.maintenanceOverheadSharePct;

/** Weeks per month for converting weekly route data → monthly. */
export const WEEKS_PER_MONTH = 4.33;

/* ═════════════════════════ EMPLOYEES ═════════════════════════ */

export type PayType = "hourly" | "salary";

export type Employee = {
  id: string;
  name: string;
  role: string;
  payType: PayType;
  /** Hourly rate. For salaried, the effective hourly equivalent used in
   *  job-costing (annual salary ÷ 2080). */
  hourlyRate: number;
  /** Optional override on the global burden % (e.g. owner draw vs W-2). */
  burdenPctOverride?: number;
  crewId: string | null;
  tenureYears: number;
  phone: string;
  /** Whether this person's labor is billed against routes (field crew) or
   *  sits in overhead (owners' admin time). */
  billable: boolean;
  /** Overtime hours logged this week, paid at assumptions.overtimeMultiplier. */
  overtimeHoursWeekly: number;
};

export const EMPLOYEES: Employee[] = [
  { id: "e_tim", name: "Tim Hunsaker", role: "Owner · Design + Install Lead", payType: "salary", hourlyRate: 46, crewId: "c_install", tenureYears: 50, phone: "(253) 555-0111", billable: true, overtimeHoursWeekly: 0 },
  { id: "e_bonnie", name: "Bonnie Hunsaker", role: "Owner · Maintenance Director", payType: "salary", hourlyRate: 42, crewId: null, tenureYears: 38, phone: "(253) 555-0112", billable: false, overtimeHoursWeekly: 0 },
  { id: "e_marcus", name: "Marcus Vega", role: "Crew Lead · Maintenance", payType: "hourly", hourlyRate: 28, crewId: "c_maint", tenureYears: 5, phone: "(253) 555-0131", billable: true, overtimeHoursWeekly: 0 },
  { id: "e_diego", name: "Diego Morales", role: "Crew · Maintenance", payType: "hourly", hourlyRate: 22, crewId: "c_maint", tenureYears: 3, phone: "(253) 555-0132", billable: true, overtimeHoursWeekly: 0 },
  { id: "e_tyler", name: "Tyler Brooks", role: "Crew · Install", payType: "hourly", hourlyRate: 20, crewId: "c_install", tenureYears: 1, phone: "(253) 555-0133", billable: true, overtimeHoursWeekly: 0 },
  { id: "e_jose", name: "José Restrepo", role: "Crew Lead · Install + Hardscape", payType: "hourly", hourlyRate: 26, crewId: "c_install", tenureYears: 11, phone: "(253) 555-0134", billable: true, overtimeHoursWeekly: 0 },
  { id: "e_sam", name: "Sam Kowalski", role: "Crew · Install", payType: "hourly", hourlyRate: 24, crewId: "c_install", tenureYears: 2, phone: "(253) 555-0135", billable: true, overtimeHoursWeekly: 0 },
];

/* ═════════════════════════ VEHICLES ═════════════════════════ */

export type Vehicle = {
  id: string;
  name: string;
  /** Miles per gallon (truck + loaded trailer). */
  mpg: number;
  /** Pump price assumption ($/gal) — WA runs high. */
  fuelCostPerGal: number;
  /** Maintenance + tires + depreciation per mile (not fuel). */
  maintenancePerMile: number;
};

export const VEHICLES: Vehicle[] = [
  { id: "v_truck1", name: "Truck 1 — F-250 + 16' trailer", mpg: 11, fuelCostPerGal: 4.85, maintenancePerMile: 0.19 },
  { id: "v_truck2", name: "Truck 2 — RAM 2500 + dump trailer", mpg: 10.5, fuelCostPerGal: 4.85, maintenancePerMile: 0.21 },
];

/** Total vehicle operating cost per mile (fuel + maintenance). */
export function vehicleCostPerMile(v: Vehicle): number {
  return v.fuelCostPerGal / v.mpg + v.maintenancePerMile;
}

/* ═════════════════════════ CREWS ═════════════════════════ */

/** Which side of the business a crew works:
 *  - maintenance: runs recurring routes (route-based profit)
 *  - construction: runs projects/jobs (job-based profit, modeled later) */
export type CrewSide = "maintenance" | "construction";

export const SIDE_LABEL: Record<CrewSide, string> = {
  maintenance: "Maintenance",
  construction: "Construction",
};

export type Crew = {
  id: string;
  name: string;
  side: CrewSide;
  leadId: string;
  memberIds: string[];
  vehicleId: string;
  color: string; // map + UI accent
};

export const CREWS: Crew[] = [
  {
    id: "c_maint",
    name: "Bonnie's Maintenance Crew",
    side: "maintenance",
    leadId: "e_marcus",
    memberIds: ["e_marcus", "e_diego"],
    vehicleId: "v_truck1",
    color: "#15803d",
  },
  {
    id: "c_install",
    name: "Tim's Install + Hardscape Crew",
    side: "construction",
    leadId: "e_jose",
    memberIds: ["e_jose", "e_sam", "e_tyler", "e_tim"],
    vehicleId: "v_truck2",
    color: "#b45309",
  },
];

/* ═════════════════════════ CUSTOMERS / PROPERTIES ═════════════════════════ */

export type ServiceTier = "essentials" | "full_care" | "estate";

export const TIER_LABEL: Record<ServiceTier, string> = {
  essentials: "Essentials",
  full_care: "Full Care",
  estate: "Estate",
};

export type Property = {
  id: string;
  customer: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  tier: ServiceTier;
  /** Price billed per maintenance visit. */
  pricePerVisitUsd: number;
  /** Visits per month (drives monthly recurring revenue). */
  visitsPerMonth: number;
  /** Typical materials/disposal cost per visit (mulch top-ups, dump fees). */
  materialsPerVisitUsd: number;
  startedAt: string; // ISO — onboarding date
};

// Coordinates are approximate city centers + small per-stop jitter — good
// enough for the map visualization; real lat/lng geocodes on DB wire-up.
export const PROPERTIES: Property[] = [
  { id: "p_olano",     customer: "Olano Property",        address: "8240 168th Ave SE",   city: "Snohomish",     lat: 47.9112, lng: -122.0840, tier: "full_care",  pricePerVisitUsd: 165, visitsPerMonth: 4, materialsPerVisitUsd: 14, startedAt: "2019-04-02" },
  { id: "p_aquavista", customer: "Aquavista (Wilkins)",   address: "14520 Lake Hills Blvd", city: "Bellevue",    lat: 47.5821, lng: -122.1503, tier: "full_care",  pricePerVisitUsd: 175, visitsPerMonth: 4, materialsPerVisitUsd: 18, startedAt: "2021-06-15" },
  { id: "p_park",      customer: "Linda Park",            address: "2700 NE 24th St",     city: "Renton",        lat: 47.4990, lng: -122.1820, tier: "essentials", pricePerVisitUsd: 78,  visitsPerMonth: 4, materialsPerVisitUsd: 4,  startedAt: "2026-04-28" },
  { id: "p_kovacs",    customer: "Patricia Kovacs",       address: "8517 Bridgeport Way W", city: "Tacoma",      lat: 47.2098, lng: -122.5246, tier: "full_care",  pricePerVisitUsd: 148, visitsPerMonth: 4, materialsPerVisitUsd: 10, startedAt: "2026-05-14" },
  { id: "p_reynolds",  customer: "Reynolds Estate",       address: "11200 Hidden Valley Rd", city: "Bonney Lake", lat: 47.1820, lng: -122.1605, tier: "estate",     pricePerVisitUsd: 410, visitsPerMonth: 4, materialsPerVisitUsd: 36, startedAt: "2017-03-20" },
  { id: "p_henderson", customer: "Henderson Property",    address: "612 Sunrise Dr",      city: "Auburn",        lat: 47.3015, lng: -122.2210, tier: "essentials", pricePerVisitUsd: 72,  visitsPerMonth: 4, materialsPerVisitUsd: 4,  startedAt: "2023-05-11" },
  { id: "p_kirse",     customer: "Kirse Residence",       address: "9810 SE 195th Pl",    city: "Kent",          lat: 47.3790, lng: -122.2040, tier: "full_care",  pricePerVisitUsd: 158, visitsPerMonth: 4, materialsPerVisitUsd: 12, startedAt: "2020-07-08" },
  { id: "p_mckinley",  customer: "McKinley Property",     address: "418 16th Ave E",      city: "Seattle",       lat: 47.6230, lng: -122.3120, tier: "full_care",  pricePerVisitUsd: 162, visitsPerMonth: 4, materialsPerVisitUsd: 12, startedAt: "2018-09-01" },
  { id: "p_davies",    customer: "Davies Residence",      address: "2240 NW 80th St",     city: "Seattle",       lat: 47.6870, lng: -122.3850, tier: "essentials", pricePerVisitUsd: 76,  visitsPerMonth: 4, materialsPerVisitUsd: 4,  startedAt: "2022-08-19" },
  { id: "p_thompson",  customer: "Thompson Estate",       address: "5510 W Mercer Way",   city: "Mercer Island", lat: 47.5701, lng: -122.2410, tier: "estate",     pricePerVisitUsd: 460, visitsPerMonth: 4, materialsPerVisitUsd: 42, startedAt: "2016-05-30" },
  { id: "p_sato",      customer: "Sato Residence",        address: "1860 Olympic Blvd",   city: "Lynnwood",      lat: 47.8205, lng: -122.3020, tier: "full_care",  pricePerVisitUsd: 152, visitsPerMonth: 4, materialsPerVisitUsd: 11, startedAt: "2021-10-12" },
  { id: "p_branson",   customer: "Branson Garden",        address: "4225 218th Ave SE",   city: "Issaquah",      lat: 47.5300, lng: -122.0340, tier: "full_care",  pricePerVisitUsd: 168, visitsPerMonth: 4, materialsPerVisitUsd: 15, startedAt: "2019-11-05" },
  { id: "p_highland",  customer: "Highland Property",     address: "8920 35th Ave NE",    city: "Seattle",       lat: 47.6920, lng: -122.2870, tier: "essentials", pricePerVisitUsd: 70,  visitsPerMonth: 4, materialsPerVisitUsd: 3,  startedAt: "2024-04-22" },
  { id: "p_garrett",   customer: "Garrett Estate",        address: "210 W Highland Dr",   city: "Bothell",       lat: 47.7620, lng: -122.2055, tier: "estate",     pricePerVisitUsd: 360, visitsPerMonth: 4, materialsPerVisitUsd: 30, startedAt: "2018-06-14" },
  { id: "p_mancini",   customer: "Mancini Garden",        address: "7180 Madrona Lane",   city: "Federal Way",   lat: 47.3225, lng: -122.3120, tier: "full_care",  pricePerVisitUsd: 155, visitsPerMonth: 4, materialsPerVisitUsd: 12, startedAt: "2020-03-28" },
  { id: "p_brennan",   customer: "Brennan Property",      address: "918 Front St",        city: "Lynnwood",      lat: 47.8290, lng: -122.3050, tier: "full_care",  pricePerVisitUsd: 150, visitsPerMonth: 4, materialsPerVisitUsd: 11, startedAt: "2023-09-09" },
  { id: "p_patel",     customer: "Patel Residence",       address: "3309 56th Ave NE",    city: "Seattle",       lat: 47.6505, lng: -122.2740, tier: "essentials", pricePerVisitUsd: 80,  visitsPerMonth: 4, materialsPerVisitUsd: 4,  startedAt: "2022-05-17" },
  { id: "p_walsh",     customer: "Walsh Residence",       address: "1140 NE 95th St",     city: "Seattle",       lat: 47.6980, lng: -122.3150, tier: "full_care",  pricePerVisitUsd: 160, visitsPerMonth: 4, materialsPerVisitUsd: 12, startedAt: "2021-07-21" },
];

export function propertyById(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}

/* ═════════════════════════ ROUTES + STOPS ═════════════════════════ */

export type RouteStop = {
  propertyId: string;
  /** On-site service minutes for this visit. */
  serviceMinutes: number;
  /** Drive leg FROM the previous stop (or the shop, for stop #1) TO here. */
  driveMinutes: number;
  driveMiles: number;
};

export type DailyRoute = {
  id: string;
  day: "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  crewId: string;
  stops: RouteStop[];
  /** Drive leg from the last stop back to the shop (closes the loop). */
  returnToShop: { driveMinutes: number; driveMiles: number };
};

// Weekly recurring maintenance routes for Bonnie's crew (Tue/Wed/Fri).
// Thursday is the install crew's flex/project day (no maintenance loop).
export const ROUTES: DailyRoute[] = [
  {
    // South Sound cluster — Auburn / Renton / Kent / Federal Way / Tacoma,
    // closing on the Bonney Lake estate (the long outlier of the day).
    id: "r_tue",
    day: "Tuesday",
    crewId: "c_maint",
    stops: [
      { propertyId: "p_henderson", serviceMinutes: 40,  driveMinutes: 8,  driveMiles: 4.5 },
      { propertyId: "p_park",      serviceMinutes: 45,  driveMinutes: 16, driveMiles: 9.2 },
      { propertyId: "p_kirse",     serviceMinutes: 60,  driveMinutes: 13, driveMiles: 7.0 },
      { propertyId: "p_mancini",   serviceMinutes: 60,  driveMinutes: 15, driveMiles: 8.4 },
      { propertyId: "p_kovacs",    serviceMinutes: 90,  driveMinutes: 18, driveMiles: 11.5 },
      { propertyId: "p_reynolds",  serviceMinutes: 120, driveMinutes: 26, driveMiles: 16.8 },
    ],
    returnToShop: { driveMinutes: 22, driveMiles: 14.0 },
  },
  {
    // Seattle core — tight in-city cluster. Only the first leg up from the
    // Auburn shop is long; everything inside the city is short hops.
    id: "r_wed",
    day: "Wednesday",
    crewId: "c_maint",
    stops: [
      { propertyId: "p_mckinley", serviceMinutes: 50, driveMinutes: 30, driveMiles: 19.0 },
      { propertyId: "p_davies",   serviceMinutes: 40, driveMinutes: 14, driveMiles: 6.1 },
      { propertyId: "p_highland", serviceMinutes: 35, driveMinutes: 9,  driveMiles: 3.8 },
      { propertyId: "p_patel",    serviceMinutes: 40, driveMinutes: 8,  driveMiles: 3.2 },
      { propertyId: "p_walsh",    serviceMinutes: 55, driveMinutes: 7,  driveMiles: 2.9 },
    ],
    returnToShop: { driveMinutes: 32, driveMiles: 22.0 },
  },
  {
    // Eastside + North — Bellevue / Mercer Is / Issaquah / Bothell / Lynnwood /
    // Snohomish. Spread-out and estate-heavy: the day to watch for thin margins.
    id: "r_fri",
    day: "Friday",
    crewId: "c_maint",
    stops: [
      { propertyId: "p_aquavista", serviceMinutes: 60,  driveMinutes: 28, driveMiles: 18.0 },
      { propertyId: "p_thompson",  serviceMinutes: 150, driveMinutes: 12, driveMiles: 5.5 },
      { propertyId: "p_branson",   serviceMinutes: 70,  driveMinutes: 16, driveMiles: 9.3 },
      { propertyId: "p_garrett",   serviceMinutes: 90,  driveMinutes: 26, driveMiles: 17.0 },
      { propertyId: "p_sato",      serviceMinutes: 55,  driveMinutes: 14, driveMiles: 8.1 },
      { propertyId: "p_brennan",   serviceMinutes: 65,  driveMinutes: 6,  driveMiles: 2.2 },
      { propertyId: "p_olano",     serviceMinutes: 75,  driveMinutes: 18, driveMiles: 11.0 },
    ],
    returnToShop: { driveMinutes: 34, driveMiles: 24.0 },
  },
];

/* ═════════════════════════ LOOKUPS ═════════════════════════ */

export function employeeById(id: string): Employee | undefined {
  return EMPLOYEES.find((e) => e.id === id);
}
export function crewById(id: string): Crew | undefined {
  return CREWS.find((c) => c.id === id);
}
export function vehicleById(id: string): Vehicle | undefined {
  return VEHICLES.find((v) => v.id === id);
}

export type ShopInfo = {
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
};

/** The shop / yard origin — start + end of every route loop. */
export const SHOP: ShopInfo = {
  name: "Mt View Shop + Yard",
  address: "2800 Auburn Way N",
  city: "Auburn",
  lat: 47.3225,
  lng: -122.2285,
};

/* ═════════════════════════ DATASET ═════════════════════════ */

/**
 * The complete input the profit engine needs. The engine reads ONLY from a
 * dataset — never module globals — so the same code runs against this mock
 * fallback OR live Supabase rows (assembled in ops-store.ts).
 */
export type OpsDataset = {
  assumptions: OpsAssumptions;
  weeksPerMonth: number;
  shop: ShopInfo;
  vehicles: Vehicle[];
  crews: Crew[];
  employees: Employee[];
  properties: Property[];
  routes: DailyRoute[];
};

/** Mock fallback dataset — used when Supabase isn't configured or returns
 *  no rows. Mirrors the seeded production data. */
export const MOCK_DATASET: OpsDataset = {
  assumptions: ASSUMPTIONS,
  weeksPerMonth: WEEKS_PER_MONTH,
  shop: SHOP,
  vehicles: VEHICLES,
  crews: CREWS,
  employees: EMPLOYEES,
  properties: PROPERTIES,
  routes: ROUTES,
};
