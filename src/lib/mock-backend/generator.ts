/**
 * mock-backend/generator.ts — produces a personalized mock-backend
 * dataset from audit metadata.
 *
 * Why this exists:
 *   Mock backends closed Tekky + ITC cold $10k each. Until today they
 *   were hand-installed per-prospect (~3-4 hr first install / ~30-45
 *   min thereafter). This module makes the data generic: pass
 *   { businessName, category, city, state } and get back a 30-lead
 *   pipeline + 8-affiliate seed list + 4 funnels + a map cluster
 *   centered on the prospect's claimed area.
 *
 *   Mounted at /audit/[id]/dashboard so EVERY audit-submitter sees a
 *   personalized backend within seconds of submitting — flips the
 *   mock backend from a sales-call closer to an audit-funnel hook.
 *
 *   v1 is intentionally category-agnostic with category-specific
 *   flavor where it doesn't hurt portability. Per-industry deep
 *   customization (electrician-specific Powerwall signals, etc.)
 *   stays in the per-client bespoke installs.
 *
 * Pure function. No I/O. Deterministic from the audit ID seed so the
 * same audit always produces the same mock data on every render.
 */

export type LeadStatus = "new" | "contacted" | "quote_sent" | "won" | "lost" | "follow_up";

export interface Lead {
  id: string;
  contactName: string;
  businessName: string | null;
  phone: string;
  email: string;
  city: string;
  status: LeadStatus;
  estimatedValue: number;
  score: number;
  signals: string[];
  createdAtDaysAgo: number;
  source: "google-ads" | "facebook" | "referral" | "organic" | "outbound";
}

export interface Affiliate {
  id: string;
  name: string;
  company: string;
  category: string;
  referralsLifetime: number;
  closedRevenueUsd: number;
  status: "active" | "warm" | "dormant";
  lastReferralDaysAgo: number;
}

export interface FunnelStep {
  label: string;
  reachPct: number;
}

export interface Funnel {
  id: string;
  name: string;
  audience: string;
  status: "running" | "paused";
  steps: FunnelStep[];
  weeklyLeads: number;
  weeklyCloses: number;
}

export interface MapMarker {
  city: string;
  lat: number;
  lng: number;
  leadCount: number;
  isHome: boolean;
}

export interface MockBackendData {
  business: {
    name: string;
    category: string;
    categoryLabel: string;
    city: string;
    state: string;
    accentHex: string;
  };
  overview: {
    leadsThisMonth: number;
    closedThisMonth: number;
    pipelineValueUsd: number;
    closeRatePct: number;
    avgTicketUsd: number;
    activeAffiliates: number;
  };
  leads: Lead[];
  affiliates: Affiliate[];
  funnels: Funnel[];
  map: {
    homeCity: string;
    markers: MapMarker[];
    centerLat: number;
    centerLng: number;
  };
}

interface GeneratorInput {
  auditId: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  electrician: "Residential & Commercial Electrical",
  plumber: "Residential & Commercial Plumbing",
  hvac: "Heating & Cooling Service",
  roofing: "Roofing & Storm Damage",
  landscaping: "Landscaping & Property Maintenance",
  "auto-repair": "Auto Repair & Service",
  dental: "Dental Practice",
  veterinary: "Veterinary Practice",
  salon: "Salon & Spa",
  "real-estate": "Real Estate Brokerage",
  "law-firm": "Law Firm",
  fitness: "Fitness Studio",
  restaurant: "Restaurant & Food Service",
  catering: "Catering & Events",
  photography: "Photography Studio",
  "general-contractor": "General Contractor",
  construction: "Construction",
  painting: "Painting Services",
  cleaning: "Cleaning Services",
  "pest-control": "Pest Control",
  "med-spa": "Medical Spa",
  "mfg-ag-equipment": "Agricultural Equipment Manufacturing",
  "mfg-sports-equipment": "Sports Equipment Manufacturing",
  "mfg-outdoor-gear": "Outdoor Gear Manufacturing",
  "mfg-apparel-kids": "Kids Apparel Manufacturing",
  "mfg-auto-parts": "Auto Parts Manufacturing",
  "mfg-food-bev": "Food & Beverage Manufacturing",
  "indie-author": "Indie Author / Series Creator",
  ecommerce: "Direct-to-Consumer Brand",
};

const CATEGORY_ACCENTS: Record<string, string> = {
  electrician: "#f59e0b",
  plumber: "#0ea5e9",
  hvac: "#ef4444",
  roofing: "#a855f7",
  landscaping: "#22c55e",
  "auto-repair": "#dc2626",
  dental: "#06b6d4",
  veterinary: "#10b981",
  salon: "#ec4899",
  "real-estate": "#3b82f6",
  "law-firm": "#1e40af",
  fitness: "#84cc16",
  restaurant: "#f97316",
  catering: "#f97316",
  photography: "#a16207",
  "general-contractor": "#f59e0b",
  construction: "#facc15",
  painting: "#9333ea",
  cleaning: "#06b6d4",
  "pest-control": "#15803d",
  "med-spa": "#ec4899",
  "mfg-ag-equipment": "#84cc16",
  "mfg-sports-equipment": "#0ea5e9",
  "mfg-outdoor-gear": "#16a34a",
  "mfg-apparel-kids": "#ec4899",
  "mfg-auto-parts": "#dc2626",
  "mfg-food-bev": "#f59e0b",
  "indie-author": "#d4a853",
  ecommerce: "#8b5cf6",
};

const FIRST_NAMES = [
  "Sarah", "Michael", "Jennifer", "David", "Emily", "Robert", "Jessica", "James",
  "Ashley", "Christopher", "Amanda", "Matthew", "Lauren", "Joshua", "Megan",
  "Daniel", "Brittany", "Andrew", "Nicole", "Kevin", "Stephanie", "Brandon",
  "Rachel", "Justin", "Samantha", "Ryan", "Hannah", "William", "Madison", "Tyler",
];

const LAST_NAMES = [
  "Nguyen", "Martinez", "Anderson", "Thompson", "Garcia", "Wilson", "Rodriguez",
  "Brooks", "Foster", "Hayes", "Bennett", "Reed", "Cole", "Sullivan", "Holloway",
  "Pearson", "Cunningham", "Walsh", "Mendoza", "Webb", "Chen", "Patel", "Romero",
  "McCarthy", "Burke", "Erickson", "Schultz", "Hoffman", "Tran", "O'Brien",
];

const AFFILIATE_CATEGORIES_BY_VERTICAL: Record<string, string[]> = {
  electrician: ["Solar Installer", "HVAC Contractor", "General Contractor", "Real Estate Agent", "Insurance Adjuster", "Home Inspector"],
  plumber: ["General Contractor", "Real Estate Agent", "Property Manager", "Home Inspector", "HVAC Contractor", "Restoration Co."],
  hvac: ["Solar Installer", "Electrician", "General Contractor", "Property Manager", "Home Inspector", "Insurance Adjuster"],
  landscaping: ["General Contractor", "Real Estate Agent", "Property Manager", "Tree Service", "Pool Co.", "Pest Control"],
  roofing: ["Insurance Adjuster", "General Contractor", "Real Estate Agent", "Storm Restoration Co.", "Solar Installer", "Property Manager"],
  "auto-repair": ["Tow Service", "Used-Car Dealer", "Body Shop", "Insurance Adjuster", "Fleet Manager", "Driving School"],
  dental: ["Family Practice", "Insurance Broker", "Orthodontist", "Pediatrician", "Schools / PTA", "Med Spa"],
  veterinary: ["Pet Groomer", "Pet Boarding", "Dog Trainer", "Pet Photographer", "Animal Rescue", "Pet Supply Store"],
  "mfg-ag-equipment": ["Tractor Dealer", "Farm Co-op", "Implement Distributor", "Field Influencer", "Ag Trade Show", "County Extension Office"],
  "mfg-sports-equipment": ["Club Coach", "Camp Director", "Tournament Org.", "Sports Influencer", "Local Pro Shop", "School AD"],
  "mfg-outdoor-gear": ["Outfitter", "Guide Service", "Outdoor Retailer", "Pro Hunter / Angler", "Trade Show", "Online Influencer"],
  "indie-author": ["BookTok Influencer", "Goodreads Reviewer", "Indie Bookstore", "Audiobook Narrator", "Book-Box Subscription", "Convention Coordinator"],
  default: ["Referral Partner", "Trade Association", "Local Influencer", "Strategic Partner", "Industry Vendor", "Past Client"],
};

const FUNNEL_NAMES_BY_VERTICAL: Record<string, string[]> = {
  electrician: ["Powerwall Homeowner", "Generator Urgency", "Commercial Maintenance", "Affiliate Onboarding"],
  plumber: ["Emergency Service", "Re-pipe Lead", "Commercial Plumbing", "Affiliate Onboarding"],
  hvac: ["AC Heat-Wave Lead", "Annual Maintenance", "Commercial Account", "Affiliate Onboarding"],
  landscaping: ["Spring Cleanup", "Recurring Maintenance", "Large Project Quote", "Affiliate Onboarding"],
  roofing: ["Storm Damage", "Insurance Claim", "Replacement Quote", "Affiliate Onboarding"],
  "auto-repair": ["Check-Engine Lead", "Scheduled Maintenance", "Fleet Account", "Affiliate Onboarding"],
  dental: ["New Patient Cleaning", "Implant Consult", "Insurance Verify", "Affiliate Onboarding"],
  "mfg-ag-equipment": ["End-Buyer Direct", "Dealer Network", "Tradeshow Followup", "Affiliate Onboarding"],
  "mfg-sports-equipment": ["Parent Buyer", "Coach / Club Order", "Tournament Sponsorship", "Affiliate Onboarding"],
  "indie-author": ["Book #1 Awareness", "Audiobook Cross-Sell", "Newsletter Nurture", "Affiliate Onboarding"],
  default: ["New Inquiry Nurture", "Quote Followup", "Past Customer Reactivation", "Affiliate Onboarding"],
};

const CITY_COORDINATES: Record<string, [number, number]> = {
  Sequim: [48.0794, -123.1066],
  "Port Angeles": [48.1181, -123.4307],
  "Port Townsend": [48.1170, -122.7604],
  Seattle: [47.6062, -122.3321],
  Tacoma: [47.2529, -122.4443],
  Bellevue: [47.6101, -122.2015],
  Spokane: [47.6588, -117.4260],
  Portland: [45.5152, -122.6784],
  "San Francisco": [37.7749, -122.4194],
  "Los Angeles": [34.0522, -118.2437],
  "New York": [40.7128, -74.0060],
  Chicago: [41.8781, -87.6298],
  Austin: [30.2672, -97.7431],
  Dallas: [32.7767, -96.7970],
  Denver: [39.7392, -104.9903],
  Atlanta: [33.7490, -84.3880],
  Boston: [42.3601, -71.0589],
  Miami: [25.7617, -80.1918],
  Phoenix: [33.4484, -112.0740],
};

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function makeRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2147483648;
    return state / 2147483648;
  };
}

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)] as T;
}

function pickWeighted(rng: () => number, weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((s, w) => s + w, 0);
  let pick = rng() * total;
  for (const [key, weight] of Object.entries(weights)) {
    pick -= weight;
    if (pick <= 0) return key;
  }
  return Object.keys(weights)[0];
}

function formatPhone(rng: () => number): string {
  const area = 200 + Math.floor(rng() * 700);
  const mid = 100 + Math.floor(rng() * 900);
  const end = 1000 + Math.floor(rng() * 9000);
  return `(${area}) ${mid}-${end}`;
}

function signalsForCategory(category: string, rng: () => number): string[] {
  const signals: string[] = [];
  if (category.startsWith("mfg-")) {
    if (rng() < 0.5) signals.push("dealer-network match");
    if (rng() < 0.4) signals.push("tradeshow follow-up");
    if (rng() < 0.3) signals.push("repeat dealer order");
    if (rng() < 0.3) signals.push("influencer-driven inquiry");
  } else if (category === "indie-author") {
    if (rng() < 0.5) signals.push("read book #1");
    if (rng() < 0.4) signals.push("BookTok engagement");
    if (rng() < 0.3) signals.push("newsletter subscriber");
  } else if (category === "electrician") {
    if (rng() < 0.4) signals.push("Powerwall eligible");
    if (rng() < 0.3) signals.push("storm-event near");
    if (rng() < 0.3) signals.push("monthly bill > $300");
    if (rng() < 0.3) signals.push("solar installed");
  } else if (category === "roofing") {
    if (rng() < 0.5) signals.push("hail event in zip");
    if (rng() < 0.4) signals.push("insurance claim filed");
    if (rng() < 0.3) signals.push("roof age 18+ yrs");
  } else if (category === "dental") {
    if (rng() < 0.5) signals.push("PPO insurance verified");
    if (rng() < 0.4) signals.push("no dentist in 2+ yrs");
    if (rng() < 0.3) signals.push("emergency inquiry");
  } else if (category === "landscaping") {
    if (rng() < 0.5) signals.push("yard size 0.5+ acre");
    if (rng() < 0.4) signals.push("requested spring cleanup");
    if (rng() < 0.3) signals.push("recurring service interest");
  } else if (category === "hvac") {
    if (rng() < 0.5) signals.push("system age 12+ yrs");
    if (rng() < 0.4) signals.push("heat-wave forecast");
    if (rng() < 0.3) signals.push("emergency service");
  } else if (category === "real-estate") {
    if (rng() < 0.5) signals.push("pre-approved buyer");
    if (rng() < 0.4) signals.push("relocation");
    if (rng() < 0.3) signals.push("first-time buyer");
  } else {
    if (rng() < 0.5) signals.push("inquiry within 48 hrs");
    if (rng() < 0.3) signals.push("referred by past client");
  }
  if (rng() < 0.2) signals.push("Madie 60-sec callback");
  return signals;
}

function generateLeads(input: GeneratorInput, rng: () => number, count: number): Lead[] {
  const leads: Lead[] = [];
  const statusWeights: Record<LeadStatus, number> = {
    new: 0.32, contacted: 0.24, quote_sent: 0.18, follow_up: 0.12,
    won: 0.10, lost: 0.04,
  };
  const sourceWeights = {
    "google-ads": 0.22, facebook: 0.20, referral: 0.18,
    organic: 0.28, outbound: 0.12,
  };
  for (let i = 0; i < count; i += 1) {
    const first = pick(FIRST_NAMES, rng);
    const last = pick(LAST_NAMES, rng);
    const status = pickWeighted(rng, statusWeights) as LeadStatus;
    const source = pickWeighted(rng, sourceWeights) as Lead["source"];
    const baseScore = status === "won" ? 80 : status === "quote_sent" ? 75 : status === "new" ? 50 : 60;
    const score = Math.max(20, Math.min(99, baseScore + Math.floor(rng() * 30) - 12));
    const value = Math.floor(1500 + rng() * 12000);
    leads.push({
      id: `L-${(i + 1).toString().padStart(4, "0")}`,
      contactName: `${first} ${last}`,
      businessName: rng() < 0.35 ? `${last} ${pick(["Properties", "Holdings", "Group", "LLC", "& Co."], rng)}` : null,
      phone: formatPhone(rng),
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/'/g, "")}@${pick(["gmail.com", "yahoo.com", "outlook.com", "icloud.com"], rng)}`,
      city: input.city,
      status,
      estimatedValue: value,
      score,
      signals: signalsForCategory(input.category, rng),
      createdAtDaysAgo: Math.floor(rng() * 30),
      source,
    });
  }
  return leads.sort((a, b) => b.score - a.score);
}

function generateAffiliates(input: GeneratorInput, rng: () => number, count: number): Affiliate[] {
  const cats = AFFILIATE_CATEGORIES_BY_VERTICAL[input.category]
    ?? AFFILIATE_CATEGORIES_BY_VERTICAL["default"]!;
  const affiliates: Affiliate[] = [];
  for (let i = 0; i < count; i += 1) {
    const first = pick(FIRST_NAMES, rng);
    const last = pick(LAST_NAMES, rng);
    const category = pick(cats, rng);
    const referrals = Math.floor(1 + rng() * 18);
    const closeRate = 0.25 + rng() * 0.35;
    const closed = Math.floor(referrals * closeRate);
    const avgValue = 1500 + Math.floor(rng() * 6000);
    affiliates.push({
      id: `A-${(i + 1).toString().padStart(3, "0")}`,
      name: `${first} ${last}`,
      company: `${last} ${pick(["Group", "Co.", "& Partners", "LLC", "Services"], rng)}`,
      category,
      referralsLifetime: referrals,
      closedRevenueUsd: closed * avgValue,
      status: referrals >= 8 ? "active" : referrals >= 3 ? "warm" : "dormant",
      lastReferralDaysAgo: Math.floor(rng() * 90),
    });
  }
  return affiliates.sort((a, b) => b.referralsLifetime - a.referralsLifetime);
}

function generateFunnels(input: GeneratorInput, rng: () => number): Funnel[] {
  const names = FUNNEL_NAMES_BY_VERTICAL[input.category]
    ?? FUNNEL_NAMES_BY_VERTICAL["default"]!;
  const audiences = ["New prospects", "Warm leads", "Past customers", "Affiliate partners"];
  const stepTemplates: Array<[string, number][]> = [
    [["Reached", 100], ["Opened email", 64], ["Clicked CTA", 38], ["Booked call", 18], ["Closed", 9]],
    [["Touched", 100], ["Replied", 42], ["Quoted", 26], ["Closed", 12]],
    [["Sent SMS", 100], ["Read", 78], ["Booked", 24], ["Closed", 11]],
    [["Reached", 100], ["Acknowledged", 60], ["Active", 28], ["Producing referrals", 14]],
  ];
  return names.map((name, i) => {
    const stepDef = stepTemplates[i % stepTemplates.length]!;
    const steps: FunnelStep[] = stepDef.map(([label, reach]) => ({
      label, reachPct: Math.max(1, reach + Math.floor(rng() * 6) - 3),
    }));
    let lastReach = 100;
    for (const step of steps) {
      step.reachPct = Math.min(step.reachPct, lastReach);
      lastReach = step.reachPct;
    }
    const weeklyLeads = Math.floor(8 + rng() * 22);
    const weeklyCloses = Math.max(1, Math.floor(weeklyLeads * (steps[steps.length - 1]!.reachPct / 100)));
    return {
      id: `F-${i + 1}`,
      name,
      audience: audiences[i] ?? "Custom segment",
      status: rng() < 0.85 ? "running" : "paused",
      steps,
      weeklyLeads,
      weeklyCloses,
    };
  });
}

function generateMap(input: GeneratorInput, rng: () => number, leads: Lead[]): MockBackendData["map"] {
  const homeCoord = CITY_COORDINATES[input.city] ?? [47.6062, -122.3321];
  const homeCity = input.city;
  const nearbyCities = Object.entries(CITY_COORDINATES)
    .filter(([city]) => city !== homeCity)
    .map(([city, coord]) => ({
      city,
      distance: Math.hypot(coord[0] - homeCoord[0], coord[1] - homeCoord[1]),
      coord,
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);

  const markers: MapMarker[] = [
    { city: homeCity, lat: homeCoord[0], lng: homeCoord[1], leadCount: Math.floor(leads.length * 0.45), isHome: true },
    ...nearbyCities.map((n) => ({
      city: n.city, lat: n.coord[0], lng: n.coord[1],
      leadCount: Math.max(1, Math.floor(leads.length * (0.1 + rng() * 0.15))),
      isHome: false,
    })),
  ];

  return {
    homeCity,
    markers,
    centerLat: homeCoord[0],
    centerLng: homeCoord[1],
  };
}

export function generateMockBackend(input: GeneratorInput): MockBackendData {
  const seed = hashSeed(input.auditId);
  const rng = makeRng(seed);

  const leads = generateLeads(input, rng, 30);
  const affiliates = generateAffiliates(input, rng, 8);
  const funnels = generateFunnels(input, rng);
  const map = generateMap(input, rng, leads);

  const closedThisMonth = leads.filter((l) => l.status === "won").length;
  const inPipeline = leads.filter((l) => l.status !== "lost" && l.status !== "won");
  const pipelineValueUsd = inPipeline.reduce((sum, l) => sum + l.estimatedValue, 0);
  const totalAttempted = leads.filter((l) => l.status !== "new").length || 1;
  const closeRatePct = Math.round((closedThisMonth / totalAttempted) * 100);
  const avgTicketUsd = Math.round(
    leads.reduce((sum, l) => sum + l.estimatedValue, 0) / leads.length,
  );
  const activeAffiliates = affiliates.filter((a) => a.status === "active").length;

  return {
    business: {
      name: input.businessName,
      category: input.category,
      categoryLabel: CATEGORY_LABELS[input.category] ?? input.category,
      city: input.city,
      state: input.state,
      accentHex: CATEGORY_ACCENTS[input.category] ?? "#84cc16",
    },
    overview: {
      leadsThisMonth: leads.length,
      closedThisMonth,
      pipelineValueUsd,
      closeRatePct,
      avgTicketUsd,
      activeAffiliates,
    },
    leads,
    affiliates,
    funnels,
    map,
  };
}
