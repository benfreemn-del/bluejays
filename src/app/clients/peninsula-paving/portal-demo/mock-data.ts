/**
 * Mock data for the Peninsula Paving portal demo. Pure fixtures — no
 * real customer information. Built for live sales-call demos so Ben
 * can show a paving prospect what the $10k AI System backend would
 * look like for THEIR business.
 *
 * Pattern carried over from meyer-electric/portal-demo/mock-data.ts.
 */

export type LeadStatus =
  | "new"
  | "contacted"
  | "estimating"
  | "scheduled"
  | "won"
  | "lost"
  | "ghosted";

export type LeadSource =
  | "Google Search"
  | "Google Maps"
  | "Facebook Ad"
  | "Word of Mouth"
  | "Yelp"
  | "Repeat Customer"
  | "Other";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  service: string;
  estValue: number;
  status: LeadStatus;
  source: LeadSource;
  score: number; // 0-100
  daysAgo: number;
  notes?: string;
  lat: number;
  lng: number;
};

// 24 fictional leads spread across the Olympic Peninsula. Coordinates
// approximate real Sequim/Port Angeles/Port Townsend / Forks etc so
// the map demo looks like real customer flow.
export const MOCK_LEADS: Lead[] = [
  {
    id: "L-001",
    name: "Daniel Krause",
    phone: "(360) 555-0142",
    email: "dkrause@example.com",
    city: "Sequim",
    service: "Residential Driveway Repave",
    estValue: 8400,
    status: "new",
    source: "Google Search",
    score: 92,
    daysAgo: 0,
    notes: "1,200 sq ft. Existing alligator cracking. Asking for full tear-out + replace.",
    lat: 48.0792,
    lng: -123.1028,
  },
  {
    id: "L-002",
    name: "Marisol Ortega",
    phone: "(360) 555-0871",
    email: "marisol.o@example.com",
    city: "Port Angeles",
    service: "Parking Lot Seal Coat + Striping",
    estValue: 14200,
    status: "estimating",
    source: "Google Maps",
    score: 88,
    daysAgo: 1,
    notes: "Restaurant — ~18 stall lot. Wants stripe refresh + ADA stall.",
    lat: 48.1181,
    lng: -123.4307,
  },
  {
    id: "L-003",
    name: "George Halvorsen",
    phone: "(360) 555-0233",
    city: "Port Townsend",
    service: "New Driveway Install",
    estValue: 11200,
    status: "scheduled",
    source: "Word of Mouth",
    score: 95,
    daysAgo: 2,
    notes: "Gravel-to-asphalt conversion. Schedule: late June window.",
    lat: 48.117,
    lng: -122.7604,
  },
  {
    id: "L-004",
    name: "Casey Wren",
    phone: "(360) 555-0455",
    email: "casey.wren@example.com",
    city: "Carlsborg",
    service: "Crack Filling + Seal Coat",
    estValue: 1850,
    status: "new",
    source: "Facebook Ad",
    score: 71,
    daysAgo: 0,
    notes: "Existing PP customer (2019). Asking for maintenance pass.",
    lat: 48.0833,
    lng: -123.2611,
  },
  {
    id: "L-005",
    name: "HOA — Diamond Point Estates",
    phone: "(360) 555-0666",
    email: "board@dpoint-hoa.example.com",
    city: "Diamond Point",
    service: "Shared Road Repave (HOA)",
    estValue: 48000,
    status: "estimating",
    source: "Repeat Customer",
    score: 97,
    daysAgo: 3,
    notes: "0.4 mi shared road. Last pass 2014. Approval at June board mtg.",
    lat: 48.0566,
    lng: -122.9461,
  },
  {
    id: "L-006",
    name: "Jenn Marquardt",
    phone: "(360) 555-0998",
    city: "Sequim",
    service: "Pothole Repair",
    estValue: 480,
    status: "won",
    source: "Google Maps",
    score: 62,
    daysAgo: 5,
    notes: "3 potholes in residential drive. Hot patch. Done same week.",
    lat: 48.084,
    lng: -123.087,
  },
  {
    id: "L-007",
    name: "Trent Boyd",
    phone: "(360) 555-0124",
    city: "Forks",
    service: "Commercial Lot Pave",
    estValue: 32000,
    status: "contacted",
    source: "Google Search",
    score: 84,
    daysAgo: 1,
    notes: "Small fleet yard. Needs sub-grade work first.",
    lat: 47.9501,
    lng: -124.3855,
  },
  {
    id: "L-008",
    name: "Nora Salgado",
    phone: "(360) 555-0312",
    city: "Joyce",
    service: "Driveway Repave",
    estValue: 6900,
    status: "new",
    source: "Google Maps",
    score: 79,
    daysAgo: 0,
    notes: "Steep grade. Will need careful sub-base. Estimate first.",
    lat: 48.166,
    lng: -123.797,
  },
  {
    id: "L-009",
    name: "Aaron Pfeffer",
    phone: "(360) 555-0775",
    city: "Quilcene",
    service: "Driveway Seal Coat",
    estValue: 1250,
    status: "scheduled",
    source: "Repeat Customer",
    score: 81,
    daysAgo: 4,
    notes: "On 5-yr maintenance cycle. Pre-summer slot.",
    lat: 47.823,
    lng: -122.872,
  },
  {
    id: "L-010",
    name: "Tasha Berenbaum",
    phone: "(360) 555-0420",
    email: "tasha@example.com",
    city: "Chimacum",
    service: "New Driveway + Drainage",
    estValue: 13500,
    status: "estimating",
    source: "Word of Mouth",
    score: 90,
    daysAgo: 2,
    notes: "Hillside lot. French drain + paving combined estimate.",
    lat: 48.022,
    lng: -122.776,
  },
  {
    id: "L-011",
    name: "Lou Vidal",
    phone: "(360) 555-0931",
    city: "Sequim",
    service: "Pothole Repair",
    estValue: 320,
    status: "ghosted",
    source: "Yelp",
    score: 38,
    daysAgo: 7,
    notes: "Auto-follow-up triggered Day 3 + Day 7. No response.",
    lat: 48.081,
    lng: -123.115,
  },
  {
    id: "L-012",
    name: "Mariel Quinn",
    phone: "(360) 555-0211",
    city: "Port Angeles",
    service: "Line Striping (Re-stripe)",
    estValue: 2400,
    status: "new",
    source: "Google Search",
    score: 76,
    daysAgo: 0,
    notes: "20-stall church lot. Annual refresh.",
    lat: 48.111,
    lng: -123.42,
  },
  {
    id: "L-013",
    name: "Brett Ingerson",
    phone: "(360) 555-0588",
    city: "Sequim",
    service: "Asphalt Removal",
    estValue: 4200,
    status: "contacted",
    source: "Google Maps",
    score: 73,
    daysAgo: 1,
    notes: "Concrete replacing asphalt. Demo only — concrete sub handles install.",
    lat: 48.087,
    lng: -123.099,
  },
  {
    id: "L-014",
    name: "Pepper Hollings",
    phone: "(360) 555-0717",
    city: "Dungeness",
    service: "Driveway Repave",
    estValue: 7600,
    status: "won",
    source: "Word of Mouth",
    score: 89,
    daysAgo: 9,
    notes: "Completed last week. Walked cure window.",
    lat: 48.149,
    lng: -123.118,
  },
  {
    id: "L-015",
    name: "Hank Drury",
    phone: "(360) 555-0143",
    city: "Sekiu",
    service: "Driveway Repair + Patch",
    estValue: 2800,
    status: "estimating",
    source: "Facebook Ad",
    score: 70,
    daysAgo: 2,
    notes: "Remote access. Travel surcharge applies.",
    lat: 48.263,
    lng: -124.299,
  },
  {
    id: "L-016",
    name: "Sequim Self Storage",
    phone: "(360) 555-0840",
    email: "ops@sequimselfstorage.example.com",
    city: "Sequim",
    service: "Lot Repave + Stripe",
    estValue: 38000,
    status: "estimating",
    source: "Google Search",
    score: 94,
    daysAgo: 3,
    notes: "Phased — repave half this season, half next. Owner walking lot 5/24.",
    lat: 48.078,
    lng: -123.106,
  },
  {
    id: "L-017",
    name: "Wendell Crane",
    phone: "(360) 555-0299",
    city: "Gardiner",
    service: "New Driveway",
    estValue: 9200,
    status: "new",
    source: "Word of Mouth",
    score: 86,
    daysAgo: 0,
    notes: "Long curved drive. Sub-grade needs work.",
    lat: 48.043,
    lng: -123.0,
  },
  {
    id: "L-018",
    name: "Mira Foulkes",
    phone: "(360) 555-0517",
    city: "Port Townsend",
    service: "Crack Sealing",
    estValue: 740,
    status: "won",
    source: "Repeat Customer",
    score: 78,
    daysAgo: 11,
    notes: "Quick fix. Done in a half-day.",
    lat: 48.115,
    lng: -122.764,
  },
  {
    id: "L-019",
    name: "Dale Whitt",
    phone: "(360) 555-0061",
    city: "Sequim",
    service: "Driveway Seal Coat",
    estValue: 1100,
    status: "contacted",
    source: "Google Maps",
    score: 67,
    daysAgo: 1,
    notes: "5-yr-old drive. Time for first seal.",
    lat: 48.082,
    lng: -123.094,
  },
  {
    id: "L-020",
    name: "Marina Cole",
    phone: "(360) 555-0838",
    city: "Sequim",
    service: "Driveway Repave",
    estValue: 8800,
    status: "lost",
    source: "Yelp",
    score: 54,
    daysAgo: 14,
    notes: "Lost on price — competitor underbid by $1.2k. AI loss-probe ran.",
    lat: 48.085,
    lng: -123.103,
  },
  {
    id: "L-021",
    name: "Blyn Tribal Center",
    phone: "(360) 555-0220",
    city: "Blyn",
    service: "Parking Lot Repave + Stripe",
    estValue: 52000,
    status: "estimating",
    source: "Other",
    score: 91,
    daysAgo: 4,
    notes: "Public RFP. Bid due 6/1.",
    lat: 48.018,
    lng: -122.989,
  },
  {
    id: "L-022",
    name: "Ginger Hartwell",
    phone: "(360) 555-0405",
    city: "Sequim",
    service: "Driveway Maintenance",
    estValue: 1450,
    status: "scheduled",
    source: "Repeat Customer",
    score: 80,
    daysAgo: 6,
    notes: "Recurring maintenance customer. 2nd visit this year.",
    lat: 48.082,
    lng: -123.087,
  },
  {
    id: "L-023",
    name: "Manny Toth",
    phone: "(360) 555-0712",
    city: "Carlsborg",
    service: "New Driveway",
    estValue: 7200,
    status: "new",
    source: "Facebook Ad",
    score: 74,
    daysAgo: 0,
    notes: "Came from Facebook ad creative #4 (sunset paving photo).",
    lat: 48.084,
    lng: -123.262,
  },
  {
    id: "L-024",
    name: "Frieda Lock",
    phone: "(360) 555-0181",
    city: "Port Angeles",
    service: "Seal Coat",
    estValue: 1300,
    status: "contacted",
    source: "Google Search",
    score: 69,
    daysAgo: 1,
    notes: "Residential. Pre-winter sealing window.",
    lat: 48.116,
    lng: -123.42,
  },
];

// Status display order + counts helper
export const STATUS_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "estimating",
  "scheduled",
  "won",
  "lost",
  "ghosted",
];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  estimating: "Estimating",
  scheduled: "Scheduled",
  won: "Won",
  lost: "Lost",
  ghosted: "Ghosted",
};

export const STATUS_COLOR: Record<LeadStatus, string> = {
  new: "#ea580c",        // copper — hot
  contacted: "#fb923c",  // amber
  estimating: "#facc15", // yellow
  scheduled: "#22c55e",  // green
  won: "#10b981",        // emerald
  lost: "#94a3b8",       // slate
  ghosted: "#64748b",    // darker slate
};

// 5 mock AI skills surfaced as "available" on the AI Skills tab.
export const AI_SKILLS = [
  {
    id: "missed-call",
    name: "Missed-Call Auto-Texter",
    on: true,
    body: "Every call to (360) 477-7015 that we miss gets an instant SMS back to the caller within 8 seconds. They can book a site walk or text us back. Recovered 4 leads this month.",
    monthRecovered: 4,
  },
  {
    id: "review-funnel",
    name: "5-Star Review Funnel",
    on: true,
    body: "After a job lands, the customer gets a text. 5-star ratings go straight to Google. Anything below goes to your inbox (NEVER public). Last 30 days: 7 new 5-star reviews.",
    monthRecovered: 7,
  },
  {
    id: "ai-reply",
    name: "AI First-Response Bot",
    on: true,
    body: "Inbound email and DMs get a first-draft reply within 90 seconds. You approve before send. Trained on YOUR voice — plain, honest, no jargon.",
    monthRecovered: 19,
  },
  {
    id: "loss-probe",
    name: "Loss Reason Capture",
    on: true,
    body: "When a quote loses, the AI asks the prospect why (price / timing / didn't pick us / other). Reasons feed back into the pricing + scheduling strategy.",
    monthRecovered: 3,
  },
  {
    id: "seasonal-rebook",
    name: "Seal-Coat Rebook Loop",
    on: false,
    body: "PRO TIER — Every customer on a 3-5 year seal-coat cycle gets auto-texted in the rebook window. Smooths summer scheduling. (Available on the $499/mo Hyperloop Elite tier.)",
    monthRecovered: 0,
  },
];

// Per-month KPI counts. Drives the Overview tiles.
export const KPIS = {
  newLeadsLast30: 24,
  estValueLast30: 304_320, // sum of estValue across leads above
  callsRecoveredLast30: 4,
  reviewsLast30: 7,
  aiRepliesLast30: 19,
  jobsWonLast30: 3,
  conversionPct: 38,
};
