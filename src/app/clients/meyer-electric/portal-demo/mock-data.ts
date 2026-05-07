/**
 * Mock data for the Meyer Electric demo backend.
 *
 * All data is FAKE — generated to look real for the "blow-Kyle's-socks-off"
 * demo. Numbers, names, addresses are deterministic but invented. NEVER
 * surface this data on the public Meyer Electric site or treat it as real
 * leads to outreach.
 *
 * Industry-research-backed signals encoded in the lead scoring:
 *   - Residential: property value > $500K, solar installed, home age,
 *     monthly electric bill ($300+), Tesla owner (Powerwall fit)
 *   - Commercial: sq footage > 5K, multi-property, age + warranty status,
 *     industry (medical/hospitality/restaurant = high-reliability demand)
 *   - Affiliate: referral-source quality, repeat referrer count, relationship
 *   - Urgency: recent county outage, storm event, code-compliance deadline
 *   - Seasonal: PNW peak storm season (November-March)
 */

/* ───────────────────────── TYPES ───────────────────────── */

export type LeadType =
  | "residential"
  | "commercial"
  | "property_mgmt"
  | "general_contractor"
  | "industrial";

export type LeadStatus =
  | "new"
  | "contacted"
  | "quote_sent"
  | "won"
  | "lost"
  | "follow_up";

export type Lead = {
  id: string;
  business_name: string | null;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  county: string;
  city: string;
  type: LeadType;
  status: LeadStatus;
  job_estimate: number;
  lead_score: number;
  signals: {
    powerwall_eligible: boolean;
    generator_eligible: boolean;
    repeat_customer: boolean;
    affiliate_source: string | null;
    urgency: "high" | "medium" | "low" | null;
    seasonal_peak: boolean;
    property_value?: number;
    has_solar?: boolean;
    home_age_yrs?: number;
    monthly_electric_bill?: number;
    sq_ft?: number;
    multi_property?: boolean;
  };
  created_at: string;
  last_touched_at: string;
  notes: string;
};

export type Affiliate = {
  id: string;
  name: string;
  company: string;
  category:
    | "solar_installer"
    | "hvac_contractor"
    | "general_contractor"
    | "real_estate"
    | "insurance_adjuster"
    | "property_manager"
    | "tesla_dealer"
    | "home_inspector";
  email: string;
  phone: string;
  referrals_lifetime: number;
  jobs_closed: number;
  closed_revenue: number;
  status: "active" | "warm" | "dormant";
  partner_since: string;
  last_referral_at: string;
};

export type RepeatCustomer = {
  id: string;
  business_name: string;
  industry:
    | "medical"
    | "hospitality"
    | "restaurant"
    | "winery"
    | "casino"
    | "property_mgmt"
    | "municipal"
    | "retail"
    | "industrial";
  primary_contact: string;
  phone: string;
  email: string;
  location: string;
  county: string;
  jobs_completed: number;
  lifetime_value: number;
  contract_status: "active" | "expiring_soon" | "lapsed";
  next_scheduled_at: string;
  notes: string;
};

export type FunnelStep = {
  step: number;
  label: string;
  channel: "email" | "sms" | "voicemail" | "call" | "site_visit";
  day_offset: number;
  conversion_pct: number;
};

export type Funnel = {
  id: string;
  name: string;
  audience: string;
  description: string;
  total_leads: number;
  total_won: number;
  conversion_rate: number;
  avg_job_value: number;
  steps: FunnelStep[];
};

/* ───────────────────────── WA COUNTIES ─────────────────────────
   Olympic Peninsula service area heaviest, fading outward. Score
   = synthetic "lead density" based on Meyer's actual coverage
   pattern from sequimelectrician.com. */

export type CountyData = {
  name: string;
  fips: string;
  lead_score: number; // 0-100, drives heatmap color
  active_leads: number;
  closed_jobs_ytd: number;
  avg_job_value: number;
  storms_30d: number; // recent weather → urgency signal
  // Approximate centroid lat/long for label placement on the SVG
  cx: number; // svg x % from left (0-100)
  cy: number; // svg y % from top (0-100)
  notes: string;
};

export const WA_COUNTIES: CountyData[] = [
  // Olympic Peninsula — Meyer's home turf, hottest density
  {
    name: "Clallam",
    fips: "53009",
    lead_score: 100,
    active_leads: 47,
    closed_jobs_ytd: 134,
    avg_job_value: 8400,
    storms_30d: 3,
    cx: 14,
    cy: 22,
    notes: "Home county — Sequim HQ. Highest outage frequency in WA, drives Powerwall + Generac demand.",
  },
  {
    name: "Jefferson",
    fips: "53031",
    lead_score: 86,
    active_leads: 31,
    closed_jobs_ytd: 78,
    avg_job_value: 9200,
    storms_30d: 2,
    cx: 22,
    cy: 32,
    notes: "Port Townsend, Chimacum. Affluent retiree market, premium installs.",
  },
  {
    name: "Kitsap",
    fips: "53035",
    lead_score: 72,
    active_leads: 22,
    closed_jobs_ytd: 51,
    avg_job_value: 7100,
    storms_30d: 2,
    cx: 32,
    cy: 36,
    notes: "Kingston, Poulsbo. Naval base contractors + ferry-served residential.",
  },
  {
    name: "Mason",
    fips: "53045",
    lead_score: 51,
    active_leads: 12,
    closed_jobs_ytd: 22,
    avg_job_value: 6800,
    storms_30d: 1,
    cx: 30,
    cy: 50,
    notes: "Hood Canal cabins + waterfront homes. Generator demand driven by remoteness.",
  },
  {
    name: "Grays Harbor",
    fips: "53027",
    lead_score: 40,
    active_leads: 8,
    closed_jobs_ytd: 15,
    avg_job_value: 5400,
    storms_30d: 4,
    cx: 18,
    cy: 50,
    notes: "Aberdeen + Hoquiam. High storm frequency — peak emergency-call season.",
  },
  {
    name: "Pierce",
    fips: "53053",
    lead_score: 32,
    active_leads: 6,
    closed_jobs_ytd: 11,
    avg_job_value: 6100,
    storms_30d: 1,
    cx: 42,
    cy: 50,
    notes: "Tacoma reach. Mostly affiliate-sourced (GC referrals from Olympic Peninsula clients).",
  },
  {
    name: "King",
    fips: "53033",
    lead_score: 18,
    active_leads: 3,
    closed_jobs_ytd: 4,
    avg_job_value: 9500,
    storms_30d: 1,
    cx: 46,
    cy: 38,
    notes: "Seattle. Out of standard radius — affiliate-only referrals, high-value Powerwall installs.",
  },
  {
    name: "Snohomish",
    fips: "53061",
    lead_score: 14,
    active_leads: 2,
    closed_jobs_ytd: 3,
    avg_job_value: 7800,
    storms_30d: 1,
    cx: 50,
    cy: 30,
    notes: "Out of typical reach — Tesla dealer affiliate referrals only.",
  },
  {
    name: "Skagit",
    fips: "53057",
    lead_score: 8,
    active_leads: 1,
    closed_jobs_ytd: 1,
    avg_job_value: 0,
    storms_30d: 0,
    cx: 50,
    cy: 22,
    notes: "Out of range. Cold.",
  },
  {
    name: "Island",
    fips: "53029",
    lead_score: 22,
    active_leads: 4,
    closed_jobs_ytd: 7,
    avg_job_value: 7600,
    storms_30d: 2,
    cx: 40,
    cy: 28,
    notes: "Whidbey Island ferry coverage — feasible Powerwall installs.",
  },
  {
    name: "Whatcom",
    fips: "53073",
    lead_score: 5,
    active_leads: 0,
    closed_jobs_ytd: 0,
    avg_job_value: 0,
    storms_30d: 0,
    cx: 56,
    cy: 14,
    notes: "Out of range. Cold.",
  },
];

/* ───────────────────────── MOCK LEADS GENERATOR ───────────────────────── */

const RESIDENTIAL_FIRST_NAMES = [
  "Mike", "Sarah", "Tom", "Jennifer", "Dave", "Karen", "Rick", "Linda",
  "John", "Susan", "Mark", "Patricia", "Bob", "Nancy", "Greg", "Kim",
  "Steve", "Donna", "Tim", "Cynthia", "Jim", "Elaine", "Mark", "Diane",
  "Carl", "Beverly", "Ed", "Joyce", "Howard", "Janet",
];
const LAST_NAMES = [
  "Anderson", "Johnson", "Miller", "Davis", "Wilson", "Brown", "Smith",
  "Taylor", "Thomas", "Hayes", "Clark", "Lewis", "Walker", "Hall",
  "Young", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams",
  "Baker", "Nelson", "Carter", "Mitchell", "Roberts", "Phillips",
];

const COMMERCIAL_BIZ = [
  "Olympic Bay Properties LLC", "Cedars Hospitality Group", "Sequim Storage Co.",
  "Peninsula Property Management", "North Olympic Realty", "Discovery Bay Marina",
  "Olympic View Apartments", "Sunshine Coast Inn", "Lavender Valley B&B",
  "Cascadia Construction LLC", "Strait Side Industries", "Olympic Foods Distributing",
  "Peninsula Veterinary Center", "Sequim Family Dental", "North Coast Roofing",
  "Wave Property Group", "Olympic Outfitters", "Salish Sea Cellars",
  "Crescent Lake Lodge", "Three Crabs Restaurant", "Dungeness Spit Outfitters",
];

const COUNTY_CITY: Record<string, string[]> = {
  Clallam: ["Sequim", "Port Angeles", "Forks", "Clallam Bay", "Sekiu", "Joyce", "Carlsborg"],
  Jefferson: ["Port Townsend", "Chimacum", "Quilcene", "Port Hadlock", "Brinnon"],
  Kitsap: ["Kingston", "Poulsbo", "Bremerton", "Bainbridge Island", "Silverdale"],
  Mason: ["Shelton", "Belfair", "Hoodsport", "Lilliwaup"],
  "Grays Harbor": ["Aberdeen", "Hoquiam", "Ocean Shores"],
  Pierce: ["Tacoma", "Gig Harbor", "Puyallup"],
  King: ["Seattle", "Bellevue", "Issaquah"],
  Snohomish: ["Everett", "Edmonds", "Mukilteo"],
  Skagit: ["Mount Vernon", "Anacortes"],
  Island: ["Oak Harbor", "Coupeville", "Langley"],
  Whatcom: ["Bellingham"],
};

const STREET_NAMES = [
  "Cedar Lane", "Pine Ridge Rd", "Ocean View Dr", "Lakeshore Way",
  "Olympic Vista Pl", "Strait View Rd", "Mountain View Dr", "Lavender Ln",
  "Eagle Crest Way", "Heron Bay Rd", "Salmon Run Dr", "Whale Watch Pl",
  "Driftwood Way", "Madrona Ln", "Beach Cliff Rd", "Harbor View Dr",
];

const AFFILIATE_SOURCES = [
  "Sunpower Solar — Sequim",
  "Tesla Showroom — Bellevue",
  "Olympic HVAC Co.",
  "Peninsula General Construction",
  "Strait View Realty",
  "State Farm — Sequim",
  "Wave Property Mgmt",
  "Home Inspection Pros",
];

/* Deterministic pseudo-random — same seed gives same dataset every reload.
   Uses Linear Congruential Generator so we don't need a dependency. */
function seedRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function generatePhone(rng: () => number): string {
  // Olympic Peninsula area code = 360
  const exch = 200 + Math.floor(rng() * 700);
  const num = 1000 + Math.floor(rng() * 8999);
  return `(360) ${exch}-${num}`;
}

function daysAgo(rng: () => number, max: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(rng() * max));
  return d.toISOString();
}

function generateLeads(count: number): Lead[] {
  const rng = seedRng(42);
  const leads: Lead[] = [];
  // Distribute leads by county according to lead_score (Olympic Peninsula heavy)
  const totalScore = WA_COUNTIES.reduce((s, c) => s + c.lead_score, 0);
  for (let i = 0; i < count; i++) {
    // Pick county weighted by lead_score
    let r = rng() * totalScore;
    let countyData = WA_COUNTIES[0];
    for (const c of WA_COUNTIES) {
      r -= c.lead_score;
      if (r <= 0) {
        countyData = c;
        break;
      }
    }
    const cities = COUNTY_CITY[countyData.name] || ["Unknown"];
    const city = pick(rng, cities);
    const typeRoll = rng();
    const leadType: LeadType =
      typeRoll < 0.55
        ? "residential"
        : typeRoll < 0.78
          ? "commercial"
          : typeRoll < 0.88
            ? "property_mgmt"
            : typeRoll < 0.96
              ? "general_contractor"
              : "industrial";

    const isResidential = leadType === "residential";
    const contactName = `${pick(rng, RESIDENTIAL_FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
    const businessName =
      isResidential ? null : pick(rng, COMMERCIAL_BIZ);

    // Property/business signals — drive lead scoring
    const propertyValue = isResidential
      ? 350000 + Math.floor(rng() * 1850000) // $350K-$2.2M (Olympic Peninsula range)
      : undefined;
    const hasSolar = isResidential ? rng() < 0.18 : false;
    const homeAge = isResidential ? Math.floor(rng() * 65) + 5 : undefined;
    const monthlyBill = isResidential
      ? 120 + Math.floor(rng() * 480) // $120-$600
      : undefined;
    const sqFt = !isResidential
      ? 1500 + Math.floor(rng() * 28000) // 1500-30000 sqft
      : undefined;
    const multiProperty = !isResidential && rng() < 0.32;

    // Powerwall fit: high property value + high bill + Tesla / solar interest
    const powerwallEligible = isResidential
      ? (propertyValue || 0) > 600000 && (monthlyBill || 0) > 250
      : rng() < 0.25;

    // Generator fit: rural county OR commercial OR multi-property
    const ruralCounties = ["Clallam", "Jefferson", "Mason", "Grays Harbor"];
    const generatorEligible =
      ruralCounties.includes(countyData.name) || !isResidential || rng() < 0.3;

    const repeatCustomer = !isResidential && rng() < 0.18;
    const affiliateSource =
      rng() < 0.32 ? pick(rng, AFFILIATE_SOURCES) : null;
    const urgencyRoll = rng();
    const urgency: "high" | "medium" | "low" | null =
      countyData.storms_30d >= 3 && urgencyRoll < 0.55
        ? "high"
        : urgencyRoll < 0.30
          ? "medium"
          : urgencyRoll < 0.65
            ? "low"
            : null;
    const month = new Date().getMonth();
    const seasonalPeak = month >= 10 || month <= 2; // Nov-Feb PNW storm season

    // Job estimate ranges based on type
    const jobEstimate = isResidential
      ? powerwallEligible
        ? 11500 + Math.floor(rng() * 8500) // Powerwall install: $11.5K-$20K
        : generatorEligible
          ? 5500 + Math.floor(rng() * 7500) // Generac: $5.5K-$13K
          : 800 + Math.floor(rng() * 4500) // service work: $800-$5.3K
      : leadType === "industrial"
        ? 25000 + Math.floor(rng() * 75000) // industrial: $25K-$100K
        : 4000 + Math.floor(rng() * 18000); // commercial: $4K-$22K

    // Lead score (0-100) — research-backed signals
    let score = 30; // base
    if (powerwallEligible) score += 15;
    if (generatorEligible) score += 12;
    if (repeatCustomer) score += 18;
    if (affiliateSource) score += 12;
    if (urgency === "high") score += 18;
    else if (urgency === "medium") score += 8;
    if (seasonalPeak) score += 6;
    if (multiProperty) score += 10;
    if (isResidential && (propertyValue || 0) > 1200000) score += 8;
    if (isResidential && hasSolar) score += 10;
    if (!isResidential && (sqFt || 0) > 10000) score += 7;
    score = Math.min(100, score);

    const statusRoll = rng();
    const status: LeadStatus =
      statusRoll < 0.30
        ? "new"
        : statusRoll < 0.55
          ? "contacted"
          : statusRoll < 0.72
            ? "follow_up"
            : statusRoll < 0.86
              ? "quote_sent"
              : statusRoll < 0.95
                ? "won"
                : "lost";

    const street = `${100 + Math.floor(rng() * 9000)} ${pick(rng, STREET_NAMES)}`;

    leads.push({
      id: `lead-${String(i + 1).padStart(4, "0")}`,
      business_name: businessName,
      contact_name: contactName,
      phone: generatePhone(rng),
      email:
        (isResidential
          ? contactName.toLowerCase().replace(" ", ".")
          : (businessName || "info").toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)
        ) + `@${isResidential ? "gmail.com" : "company.com"}`,
      address: `${street}, ${city}, WA`,
      county: countyData.name,
      city,
      type: leadType,
      status,
      job_estimate: jobEstimate,
      lead_score: score,
      signals: {
        powerwall_eligible: powerwallEligible,
        generator_eligible: generatorEligible,
        repeat_customer: repeatCustomer,
        affiliate_source: affiliateSource,
        urgency,
        seasonal_peak: seasonalPeak,
        property_value: propertyValue,
        has_solar: hasSolar,
        home_age_yrs: homeAge,
        monthly_electric_bill: monthlyBill,
        sq_ft: sqFt,
        multi_property: multiProperty,
      },
      created_at: daysAgo(rng, 90),
      last_touched_at: daysAgo(rng, 30),
      notes:
        urgency === "high"
          ? "Recent county outage — urgent response."
          : powerwallEligible
            ? "Powerwall consultation requested."
            : "",
    });
  }

  // Sort by score descending so the highest-quality leads land at the top
  leads.sort((a, b) => b.lead_score - a.lead_score);
  return leads;
}

/* ───────────────────────── MOCK AFFILIATES ───────────────────────── */

function generateAffiliates(): Affiliate[] {
  const rng = seedRng(123);
  const seeds = [
    { name: "Tom Reilly", company: "SunPower Solar — Sequim", category: "solar_installer" as const },
    { name: "Sarah Chen", company: "Tesla Showroom — Bellevue", category: "tesla_dealer" as const },
    { name: "Mike Thornton", company: "Olympic HVAC Co.", category: "hvac_contractor" as const },
    { name: "Rick Patel", company: "Cascadia Construction LLC", category: "general_contractor" as const },
    { name: "Linda Martinez", company: "North Olympic Realty", category: "real_estate" as const },
    { name: "David Kim", company: "State Farm Insurance — Sequim", category: "insurance_adjuster" as const },
    { name: "Jennifer Brooks", company: "Wave Property Mgmt", category: "property_manager" as const },
    { name: "Mark Sullivan", company: "Home Inspection Pros", category: "home_inspector" as const },
    { name: "Karen Lopez", company: "Strait View Realty", category: "real_estate" as const },
    { name: "Greg Hayes", company: "Peninsula General Construction", category: "general_contractor" as const },
    { name: "Susan Walsh", company: "Olympic Solar & Energy", category: "solar_installer" as const },
    { name: "James Park", company: "Tesla Owners Club — Olympic", category: "tesla_dealer" as const },
    { name: "Patricia Adams", company: "Allstate — Port Angeles", category: "insurance_adjuster" as const },
    { name: "Bob Nelson", company: "Sequim Property Management", category: "property_manager" as const },
    { name: "Amy Garcia", company: "RE/MAX Olympic Peninsula", category: "real_estate" as const },
    { name: "Chris Wong", company: "Northwest Solar Pros", category: "solar_installer" as const },
    { name: "Diane Mitchell", company: "Coastal HVAC", category: "hvac_contractor" as const },
    { name: "Tony Russo", company: "Russo & Sons Builders", category: "general_contractor" as const },
    { name: "Beth Carter", company: "Farmers Insurance — Sequim", category: "insurance_adjuster" as const },
    { name: "Henry Wu", company: "Bayside Realty", category: "real_estate" as const },
    { name: "Elaine Foster", company: "Olympic Peninsula Property Mgmt", category: "property_manager" as const },
    { name: "Steve Wright", company: "Whole House Inspections", category: "home_inspector" as const },
    { name: "Cindy Roberts", company: "Tesla Energy Partners", category: "tesla_dealer" as const },
    { name: "Carl Phillips", company: "Storm Brothers Construction", category: "general_contractor" as const },
    { name: "Donna Cox", company: "Peninsula Realty Group", category: "real_estate" as const },
    { name: "Edward Ramos", company: "Sun Coast Solar", category: "solar_installer" as const },
    { name: "Janet Brooks", company: "Coldwell Banker — Sequim", category: "real_estate" as const },
    { name: "Nathan Lee", company: "Northwest Climate Pros", category: "hvac_contractor" as const },
    { name: "Olivia Stone", company: "Liberty Mutual — Port Angeles", category: "insurance_adjuster" as const },
    { name: "Pete Murphy", company: "Murphy Home Inspections", category: "home_inspector" as const },
  ];
  return seeds.map((s, i) => {
    const refs = 2 + Math.floor(rng() * 28);
    const closed = Math.floor(refs * (0.35 + rng() * 0.45));
    return {
      id: `aff-${String(i + 1).padStart(3, "0")}`,
      name: s.name,
      company: s.company,
      category: s.category,
      email:
        s.name.toLowerCase().replace(" ", ".") +
        "@" +
        s.company
          .toLowerCase()
          .replace(/[^a-z]/g, "")
          .slice(0, 14) +
        ".com",
      phone: generatePhone(rng),
      referrals_lifetime: refs,
      jobs_closed: closed,
      closed_revenue: closed * (5500 + Math.floor(rng() * 7500)),
      status: refs > 15 ? "active" : refs > 6 ? "warm" : "dormant",
      partner_since: daysAgo(rng, 1200),
      last_referral_at: daysAgo(rng, 60),
    };
  });
}

/* ───────────────────────── MOCK REPEAT CUSTOMERS ───────────────────────── */

function generateRepeatCustomers(): RepeatCustomer[] {
  const rng = seedRng(456);
  const seeds = [
    { name: "Olympic Medical Center", industry: "medical" as const, contact: "Karen Whitfield, Facilities Director", location: "Sequim, WA", county: "Clallam" },
    { name: "7 Cedars Casino", industry: "casino" as const, contact: "Marcus Rivera, Operations VP", location: "Blyn, WA", county: "Clallam" },
    { name: "Olympic Lodge", industry: "hospitality" as const, contact: "Jane Holloway, GM", location: "Port Angeles, WA", county: "Clallam" },
    { name: "Sequim Bay Resort", industry: "hospitality" as const, contact: "Tom Albright, GM", location: "Sequim, WA", county: "Clallam" },
    { name: "Wave Property Mgmt (Multi-Site)", industry: "property_mgmt" as const, contact: "Jennifer Brooks", location: "Port Townsend, WA", county: "Jefferson" },
    { name: "City of Sequim — Public Works", industry: "municipal" as const, contact: "Mark Davidson, Director", location: "Sequim, WA", county: "Clallam" },
    { name: "Clallam County Public Works", industry: "municipal" as const, contact: "Patricia Yates, Asst. Director", location: "Port Angeles, WA", county: "Clallam" },
    { name: "Olympic Cellars Winery", industry: "winery" as const, contact: "Kathy Charlton, Owner", location: "Port Angeles, WA", county: "Clallam" },
    { name: "Wind Rose Cellars", industry: "winery" as const, contact: "David Volmut, Winemaker", location: "Sequim, WA", county: "Clallam" },
    { name: "Alder Wood Bistro", industry: "restaurant" as const, contact: "Chef Tracy Schaible", location: "Sequim, WA", county: "Clallam" },
    { name: "Dockside Grill", industry: "restaurant" as const, contact: "Greg Lewis, Owner", location: "Sequim, WA", county: "Clallam" },
    { name: "Olympic Outfitters Co.", industry: "retail" as const, contact: "Sarah Bennett, Owner", location: "Port Angeles, WA", county: "Clallam" },
    { name: "Discovery Bay Marina", industry: "industrial" as const, contact: "Frank Baker, Harbormaster", location: "Discovery Bay, WA", county: "Jefferson" },
    { name: "Three Crabs Restaurant", industry: "restaurant" as const, contact: "Anna Mitchell, Owner", location: "Sequim, WA", county: "Clallam" },
    { name: "Olympic Foods Distributing", industry: "industrial" as const, contact: "Phil Carmody, Plant Mgr", location: "Port Angeles, WA", county: "Clallam" },
  ];
  return seeds.map((s, i) => {
    const jobs = 4 + Math.floor(rng() * 22);
    const ltvBase = s.industry === "casino" ? 18000 : s.industry === "medical" ? 14000 : 8000;
    return {
      id: `cust-${String(i + 1).padStart(3, "0")}`,
      business_name: s.name,
      industry: s.industry,
      primary_contact: s.contact,
      phone: generatePhone(rng),
      email:
        s.contact.split(",")[0].toLowerCase().replace(" ", ".") +
        "@" +
        s.name
          .toLowerCase()
          .replace(/[^a-z]/g, "")
          .slice(0, 14) +
        ".com",
      location: s.location,
      county: s.county,
      jobs_completed: jobs,
      lifetime_value: jobs * (ltvBase + Math.floor(rng() * 6000)),
      contract_status:
        rng() < 0.65 ? "active" : rng() < 0.5 ? "expiring_soon" : "lapsed",
      next_scheduled_at: daysAgo(rng, -90), // future date
      notes:
        s.industry === "casino"
          ? "Quarterly maintenance + annual generator load test."
          : s.industry === "medical"
            ? "Critical-circuit + UPS scheduled checks."
            : "Standard annual contract.",
    };
  });
}

/* ───────────────────────── FUNNEL EXAMPLES ───────────────────────── */

export const FUNNELS: Funnel[] = [
  {
    id: "funnel-powerwall-homeowner",
    name: "Powerwall Homeowner",
    audience: "Homeowner · Tesla curious · $250+/mo electric bill",
    description:
      "Targets affluent residents whose electric bill + property value flag them as Powerwall ROI candidates. Hits hardest in winter (storm season + outage anxiety).",
    total_leads: 184,
    total_won: 47,
    conversion_rate: 25.5,
    avg_job_value: 13850,
    steps: [
      { step: 1, label: "Cold email — Powerwall ROI calc link", channel: "email", day_offset: 0, conversion_pct: 100 },
      { step: 2, label: "Calculator submit → site visit booking", channel: "site_visit", day_offset: 2, conversion_pct: 38 },
      { step: 3, label: "On-site quote (Powerwall + electrical eval)", channel: "site_visit", day_offset: 5, conversion_pct: 81 },
      { step: 4, label: "Follow-up — financing options + permits", channel: "email", day_offset: 8, conversion_pct: 64 },
      { step: 5, label: "Phone close + deposit", channel: "call", day_offset: 12, conversion_pct: 51 },
    ],
  },
  {
    id: "funnel-generator-storm",
    name: "Generator Backup — Storm Urgency",
    audience: "Rural residents · Recent outage · No backup",
    description:
      "Trigger-based on county-level outage events. Lead magnet: 'Is your home ready for the next outage?' quiz → sized recommendation → quote.",
    total_leads: 213,
    total_won: 68,
    conversion_rate: 31.9,
    avg_job_value: 8400,
    steps: [
      { step: 1, label: "Storm-trigger SMS — Generator readiness quiz", channel: "sms", day_offset: 0, conversion_pct: 100 },
      { step: 2, label: "Quiz submit → generator-size recommendation", channel: "email", day_offset: 0, conversion_pct: 71 },
      { step: 3, label: "Voicemail drop — 'Beat the next outage'", channel: "voicemail", day_offset: 2, conversion_pct: 48 },
      { step: 4, label: "Site visit + propane assessment", channel: "site_visit", day_offset: 5, conversion_pct: 67 },
      { step: 5, label: "Quote + install scheduled", channel: "call", day_offset: 9, conversion_pct: 55 },
    ],
  },
  {
    id: "funnel-commercial-maintenance",
    name: "Commercial Maintenance Contract",
    audience: "Commercial · Multi-property · Aging building",
    description:
      "Quarterly outreach to existing commercial customers due for code-compliance review or warranty expiry. Focus: contract renewal + upsell.",
    total_leads: 51,
    total_won: 32,
    conversion_rate: 62.7,
    avg_job_value: 12400,
    steps: [
      { step: 1, label: "Quarterly check-in email — facilities review", channel: "email", day_offset: 0, conversion_pct: 100 },
      { step: 2, label: "On-site walk-through + report", channel: "site_visit", day_offset: 7, conversion_pct: 88 },
      { step: 3, label: "Maintenance proposal + upsell options", channel: "email", day_offset: 10, conversion_pct: 76 },
      { step: 4, label: "Phone close + contract sign", channel: "call", day_offset: 14, conversion_pct: 78 },
    ],
  },
  {
    id: "funnel-affiliate-partner",
    name: "Affiliate Partner Onboarding",
    audience: "Solar / GC / HVAC / Real Estate referrers",
    description:
      "30-day onboarding sequence for new affiliate partners. Goal: first referral within 14 days, first close within 45 days.",
    total_leads: 30,
    total_won: 22,
    conversion_rate: 73.3,
    avg_job_value: 9100,
    steps: [
      { step: 1, label: "Welcome email — affiliate portal access", channel: "email", day_offset: 0, conversion_pct: 100 },
      { step: 2, label: "Phone call — referral process walkthrough", channel: "call", day_offset: 2, conversion_pct: 86 },
      { step: 3, label: "First-referral nudge", channel: "email", day_offset: 14, conversion_pct: 72 },
      { step: 4, label: "First-close commission payout", channel: "email", day_offset: 30, conversion_pct: 91 },
      { step: 5, label: "Quarterly partner review + revenue share", channel: "call", day_offset: 90, conversion_pct: 88 },
    ],
  },
];

/* ───────────────────────── EXPORTED DATASETS ───────────────────────── */

export const MOCK_LEADS: Lead[] = generateLeads(200);
export const MOCK_AFFILIATES: Affiliate[] = generateAffiliates();
export const MOCK_REPEAT_CUSTOMERS: RepeatCustomer[] = generateRepeatCustomers();
