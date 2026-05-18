/**
 * Mock data for the Lewis County Autism Coalition demo backend.
 *
 * Reference per-industry config: bluejays/docs/mock-backends/nonprofit.md
 *
 * CRITICAL FRAMING (per nonprofit.md):
 *   This is a NONPROFIT mock — "leads" are SUPPORTERS, "affiliates" are
 *   COMMUNITY PARTNERS, "deals" are SUSTAINED COMMITMENTS, "funnels" are
 *   ENGAGEMENT PIPELINES / DONOR JOURNEYS. Commercial language is BANNED
 *   in user-facing copy. We track REACH and IMPACT, not "revenue."
 *
 * All data is FAKE — invented LCAC-adjacent supporters in Lewis + Thurston
 * + Pierce + Cowlitz counties (LCAC's core WA service area). NEVER outreach
 * to anyone in this dataset. Names are deterministic placeholders.
 */

/* ───────────────────────── TYPES ───────────────────────── */

export type SupporterType =
  | "first_time"           // single touchpoint (newsletter / first event)
  | "repeat_attendee"      // 2+ events
  | "one_time_donor"       // single gift, not recurring
  | "volunteer_occasional" // single or seasonal shift
  | "recurring_donor"      // monthly auto-give
  | "sustained_volunteer"  // multi-month, multi-program
  | "caregiver_family"     // active program participant (LCAC services)
  | "partner_referrer"     // community partner who refers families
  | "major_gift_prospect"  // $1K+ history or LOI
  | "lapsed_donor";        // 12mo+ no activity

export type SupporterStatus =
  | "new"
  | "engaged"          // opened email / replied / RSVP'd
  | "in_program"       // actively receiving services
  | "monthly_giver"
  | "sustained"        // long-term engaged (12mo+ or volunteer 50+ hrs)
  | "lapsed"
  | "stewardship";     // major-gift relationship managed by ED

export type Supporter = {
  id: string;
  contact_name: string;
  household_name: string | null;
  email: string;
  phone: string | null;
  city: string;
  county: string;
  zip: string;
  type: SupporterType;
  status: SupporterStatus;
  /** Lifetime giving / volunteer-hours-equivalent USD value */
  lifetime_value: number;
  /** 0-100 supporter score per nonprofit.md formula */
  score: number;
  signals: {
    event_attendance_count: number;
    is_caregiver: boolean;
    is_monthly_donor: boolean;
    service_recipient_alum: boolean;
    affiliate_source: string | null;
    life_event_in_90d: boolean;
    volunteer_hours_ytd: number;
    grant_window_open?: boolean;
    local_zip_match: boolean;
  };
  joined_at: string;
  last_touched_at: string;
  notes: string;
};

export type CommunityPartner = {
  id: string;
  org_name: string;
  primary_contact: string;
  email: string;
  phone: string;
  category:
    | "school_district"
    | "healthcare_provider"
    | "county_state_agency"
    | "therapy_clinic"
    | "faith_community"
    | "family_nonprofit"
    | "law_enforcement"
    | "existing_supporter_referral";
  county: string;
  city: string;
  referrals_lifetime: number;
  families_served_from_refs: number;
  status: "active" | "warm" | "dormant" | "exploring";
  partnership_started_at: string;
  last_referral_at: string;
  notes: string;
};

export type RecurringDonor = {
  id: string;
  donor_name: string;
  household_name: string | null;
  email: string;
  monthly_amount_usd: number;
  total_given_ytd: number;
  total_given_lifetime: number;
  months_giving: number;
  giving_started_at: string;
  city: string;
  county: string;
  notes: string;
};

export type PipelineStep = {
  step: number;
  label: string;
  channel: "email" | "sms" | "call" | "in_person" | "event";
  day_offset: number;
  /** CUMULATIVE reach (% who reach this step) — monotonically non-increasing
   *  per CLAUDE.md Rule 74 + nonprofit.md framing. */
  reach_pct: number;
};

export type Pipeline = {
  id: string;
  name: string;
  audience: string;
  status: "running" | "paused";
  steps: PipelineStep[];
  total_in_pipeline: number;
  /** People who reached the final step in last 30d */
  recent_completions: number;
};

export type CountyMarker = {
  name: string;
  fips: string;
  /** % families known to LCAC vs. estimated need (0-100) */
  reach_score: number;
  active_families: number;
  active_supporters: number;
  active_partners: number;
  /** Map coordinate offsets (% within the WA-state svg) for visual placement */
  cx: number;
  cy: number;
  notes: string;
};

/* ───────────────────────── COUNTIES (LCAC service area) ───────────────────────── */

export const WA_COUNTIES: CountyMarker[] = [
  {
    name: "Lewis", fips: "53041", reach_score: 96,
    active_families: 142, active_supporters: 386, active_partners: 18,
    cx: 22, cy: 56, notes: "LCAC home county. SDCC + SMART concentrated here.",
  },
  {
    name: "Thurston", fips: "53067", reach_score: 64,
    active_families: 88, active_supporters: 184, active_partners: 11,
    cx: 18, cy: 48, notes: "Growing adjacency. Olympia + Tumwater families regular at SDCC.",
  },
  {
    name: "Pierce", fips: "53053", reach_score: 38,
    active_families: 52, active_supporters: 108, active_partners: 7,
    cx: 24, cy: 40, notes: "Tacoma-area. Partnership opportunity with MultiCare.",
  },
  {
    name: "Cowlitz", fips: "53015", reach_score: 47,
    active_families: 39, active_supporters: 71, active_partners: 5,
    cx: 18, cy: 66, notes: "Longview / Kelso. Vision 2030 statewide cohort.",
  },
  {
    name: "Mason", fips: "53045", reach_score: 22,
    active_families: 14, active_supporters: 28, active_partners: 2,
    cx: 12, cy: 44, notes: "Rural. Underserved — Vision 2030 priority.",
  },
  {
    name: "Grays Harbor", fips: "53027", reach_score: 18,
    active_families: 11, active_supporters: 22, active_partners: 2,
    cx: 8, cy: 52, notes: "Aberdeen. SMART program candidates.",
  },
  {
    name: "Pacific", fips: "53049", reach_score: 9,
    active_families: 4, active_supporters: 9, active_partners: 1,
    cx: 6, cy: 60, notes: "Coastal. Distance is the gap.",
  },
  {
    name: "King", fips: "53033", reach_score: 12,
    active_families: 21, active_supporters: 56, active_partners: 4,
    cx: 28, cy: 36, notes: "Seattle-area. WA INCLUDE statewide cohort.",
  },
];

/* ───────────────────────── SUPPORTERS ───────────────────────── */

const FIRST_NAMES = [
  "Emma", "Jacob", "Olivia", "Noah", "Sophia", "Liam", "Ava", "Mason",
  "Isabella", "Lucas", "Mia", "Ethan", "Charlotte", "Aiden", "Amelia",
  "Sarah", "Michael", "Jennifer", "David", "Emily", "Robert", "Jessica",
  "James", "Ashley", "Brian", "Megan", "Daniel", "Brittany", "Andrew",
  "Stephanie", "Nicole", "Brandon", "Rachel", "Justin", "Samantha",
  "Maria", "Carlos", "Sofia", "Diego", "Camila",
];

const LAST_NAMES = [
  "Anderson", "Thompson", "Garcia", "Wilson", "Martinez", "Rodriguez",
  "Brooks", "Foster", "Hayes", "Bennett", "Reed", "Cole", "Sullivan",
  "Holloway", "Pearson", "Walsh", "Mendoza", "Webb", "Chen", "Patel",
  "Romero", "McCarthy", "Burke", "Erickson", "Schultz", "Hoffman",
  "Tran", "O'Brien", "Lopez", "Nguyen", "Larson", "Ortiz", "Whitlow",
];

const LEWIS_CITIES = ["Chehalis", "Centralia", "Napavine", "Toledo", "Winlock", "Onalaska", "Morton", "Mossyrock", "Pe Ell", "Vader", "Adna"];
const THURSTON_CITIES = ["Olympia", "Tumwater", "Lacey", "Yelm"];
const PIERCE_CITIES = ["Tacoma", "Puyallup", "Lakewood", "University Place", "Eatonville"];
const COWLITZ_CITIES = ["Longview", "Kelso", "Castle Rock", "Woodland"];

const CITY_TO_COUNTY: Record<string, string> = {};
for (const c of LEWIS_CITIES) CITY_TO_COUNTY[c] = "Lewis";
for (const c of THURSTON_CITIES) CITY_TO_COUNTY[c] = "Thurston";
for (const c of PIERCE_CITIES) CITY_TO_COUNTY[c] = "Pierce";
for (const c of COWLITZ_CITIES) CITY_TO_COUNTY[c] = "Cowlitz";

const ZIP_BY_CITY: Record<string, string> = {
  Chehalis: "98532", Centralia: "98531", Napavine: "98565", Toledo: "98591",
  Winlock: "98596", Onalaska: "98570", Morton: "98356", Mossyrock: "98564",
  Olympia: "98501", Tumwater: "98512", Lacey: "98503", Yelm: "98597",
  Tacoma: "98401", Puyallup: "98371", Lakewood: "98499",
  Longview: "98632", Kelso: "98626", "Castle Rock": "98611",
};

const PARTNER_SOURCES = [
  "existing supporter referral", "Centralia School District", "Toledo School District",
  "Providence Centralia", "WA DSHS DDA", "Lewis County Sheriff",
  "Valley View Health", "Big Brothers Big Sisters", "Salvation Army",
  null, null, null, null, // bias toward unknown/direct
];

function deterministicRng(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  let s = Math.abs(h) || 42;
  return () => {
    s = (s * 1664525 + 1013904223) % 2147483648;
    return s / 2147483648;
  };
}

const rng = deterministicRng("LCAC-mock-v1");

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)] as T;
}

function formatPhone(): string {
  return `(360) ${100 + Math.floor(rng() * 900)}-${1000 + Math.floor(rng() * 9000)}`;
}

function maybe<T>(prob: number, value: T): T | null {
  return rng() < prob ? value : null;
}

function generateSupporter(i: number): Supporter {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const cityPool = rng() < 0.6 ? LEWIS_CITIES : rng() < 0.6 ? THURSTON_CITIES : rng() < 0.5 ? PIERCE_CITIES : COWLITZ_CITIES;
  const city = pick(cityPool);
  const county = CITY_TO_COUNTY[city] || "Lewis";

  const typeWeights: Array<[SupporterType, number]> = [
    ["first_time", 28], ["repeat_attendee", 16], ["one_time_donor", 14],
    ["volunteer_occasional", 10], ["recurring_donor", 8], ["sustained_volunteer", 8],
    ["caregiver_family", 8], ["partner_referrer", 4], ["major_gift_prospect", 2], ["lapsed_donor", 2],
  ];
  const totalWeight = typeWeights.reduce((s, [, w]) => s + w, 0);
  let pickType: SupporterType = "first_time";
  let pickPoint = rng() * totalWeight;
  for (const [t, w] of typeWeights) {
    pickPoint -= w;
    if (pickPoint <= 0) { pickType = t; break; }
  }

  const is_monthly_donor = pickType === "recurring_donor" || (rng() < 0.15 && pickType !== "lapsed_donor");
  const is_caregiver = pickType === "caregiver_family" || rng() < 0.18;
  const service_recipient_alum = is_caregiver || rng() < 0.08;
  const event_attendance_count = pickType === "first_time" ? 1 : pickType === "lapsed_donor" ? 0 : 1 + Math.floor(rng() * (pickType === "sustained_volunteer" ? 12 : 6));
  const volunteer_hours_ytd = pickType === "sustained_volunteer" ? 30 + Math.floor(rng() * 80) : pickType === "volunteer_occasional" ? Math.floor(rng() * 18) : 0;
  const local_zip_match = county === "Lewis" || (county === "Thurston" && rng() < 0.6);

  let score = 30;
  if (event_attendance_count >= 4) score += 22;
  if (is_monthly_donor) score += 20;
  if (rng() < 0.35) score += 18;
  if (volunteer_hours_ytd >= 20) score += 16;
  if (is_caregiver) score += 14;
  if (service_recipient_alum) score += 12;
  if (local_zip_match) score += 10;
  if (rng() < 0.25) score += 8;
  score = Math.max(15, Math.min(99, score + Math.floor(rng() * 6) - 3));

  const statusMap: Record<SupporterType, SupporterStatus> = {
    first_time: "new",
    repeat_attendee: "engaged",
    one_time_donor: "engaged",
    volunteer_occasional: "engaged",
    recurring_donor: "monthly_giver",
    sustained_volunteer: "sustained",
    caregiver_family: "in_program",
    partner_referrer: "sustained",
    major_gift_prospect: "stewardship",
    lapsed_donor: "lapsed",
  };

  const ltvByType: Record<SupporterType, number> = {
    first_time: 0, repeat_attendee: 50, one_time_donor: 175, volunteer_occasional: 240,
    recurring_donor: 720, sustained_volunteer: 1800, caregiver_family: 0,
    partner_referrer: 0, major_gift_prospect: 6000, lapsed_donor: 90,
  };

  return {
    id: `S-${(i + 1).toString().padStart(4, "0")}`,
    contact_name: `${first} ${last}`,
    household_name: maybe(0.4, `${last} household`),
    email: `${first.toLowerCase()}.${last.toLowerCase().replace(/'/g, "")}@${pick(["gmail.com", "yahoo.com", "outlook.com", "icloud.com"])}`,
    phone: rng() < 0.85 ? formatPhone() : null,
    city, county, zip: ZIP_BY_CITY[city] || "98532",
    type: pickType,
    status: statusMap[pickType],
    lifetime_value: ltvByType[pickType] + Math.floor(rng() * 220),
    score,
    signals: {
      event_attendance_count,
      is_caregiver,
      is_monthly_donor,
      service_recipient_alum,
      affiliate_source: pick(PARTNER_SOURCES),
      life_event_in_90d: rng() < 0.18,
      volunteer_hours_ytd,
      grant_window_open: pickType === "major_gift_prospect" ? rng() < 0.55 : undefined,
      local_zip_match,
    },
    joined_at: new Date(Date.now() - Math.floor(rng() * 365) * 86_400_000).toISOString(),
    last_touched_at: new Date(Date.now() - Math.floor(rng() * 45) * 86_400_000).toISOString(),
    notes: "",
  };
}

export const SUPPORTERS: Supporter[] = Array.from({ length: 150 }, (_, i) => generateSupporter(i))
  .sort((a, b) => b.score - a.score);

/* ───────────────────────── COMMUNITY PARTNERS ───────────────────────── */

const PARTNER_DEFS: Array<{ org: string; cat: CommunityPartner["category"]; city: string; county: string }> = [
  { org: "Centralia School District", cat: "school_district", city: "Centralia", county: "Lewis" },
  { org: "Chehalis School District", cat: "school_district", city: "Chehalis", county: "Lewis" },
  { org: "Toledo School District", cat: "school_district", city: "Toledo", county: "Lewis" },
  { org: "Providence Centralia Hospital", cat: "healthcare_provider", city: "Centralia", county: "Lewis" },
  { org: "Valley View Health Center", cat: "healthcare_provider", city: "Chehalis", county: "Lewis" },
  { org: "WA DSHS DDA — SW Region", cat: "county_state_agency", city: "Olympia", county: "Thurston" },
  { org: "Lewis County Public Health", cat: "county_state_agency", city: "Chehalis", county: "Lewis" },
  { org: "Lewis County Sheriff's Office", cat: "law_enforcement", city: "Chehalis", county: "Lewis" },
  { org: "Cascade Mental Health Care", cat: "therapy_clinic", city: "Centralia", county: "Lewis" },
  { org: "Community Foundation of SW WA", cat: "family_nonprofit", city: "Vancouver", county: "Clark" },
  { org: "Big Brothers Big Sisters of SW WA", cat: "family_nonprofit", city: "Vancouver", county: "Clark" },
  { org: "Salvation Army Centralia Corps", cat: "family_nonprofit", city: "Centralia", county: "Lewis" },
  { org: "Lewis County Hispanic Affairs", cat: "family_nonprofit", city: "Chehalis", county: "Lewis" },
  { org: "Tumwater School District", cat: "school_district", city: "Tumwater", county: "Thurston" },
  { org: "Mary Bridge Children's Hospital", cat: "healthcare_provider", city: "Tacoma", county: "Pierce" },
  { org: "Cowlitz County School Coalition", cat: "school_district", city: "Longview", county: "Cowlitz" },
  { org: "Lewis County Superior Court", cat: "law_enforcement", city: "Chehalis", county: "Lewis" },
  { org: "Word of Life Church", cat: "faith_community", city: "Centralia", county: "Lewis" },
  { org: "Riverside Fire Authority", cat: "law_enforcement", city: "Chehalis", county: "Lewis" },
  { org: "Wraparound Therapy Group", cat: "therapy_clinic", city: "Olympia", county: "Thurston" },
];

export const PARTNERS: CommunityPartner[] = PARTNER_DEFS.map((def, i) => {
  const refs = 2 + Math.floor(rng() * 22);
  const familiesServed = Math.floor(refs * (0.35 + rng() * 0.4));
  const status: CommunityPartner["status"] = refs >= 12 ? "active" : refs >= 5 ? "warm" : refs >= 2 ? "exploring" : "dormant";
  return {
    id: `P-${(i + 1).toString().padStart(3, "0")}`,
    org_name: def.org,
    primary_contact: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    email: `referrals@${def.org.toLowerCase().replace(/[^a-z]/g, "").slice(0, 14)}.org`,
    phone: formatPhone(),
    category: def.cat,
    city: def.city, county: def.county,
    referrals_lifetime: refs,
    families_served_from_refs: familiesServed,
    status,
    partnership_started_at: new Date(Date.now() - (300 + Math.floor(rng() * 800)) * 86_400_000).toISOString(),
    last_referral_at: new Date(Date.now() - Math.floor(rng() * 120) * 86_400_000).toISOString(),
    notes: "",
  };
}).sort((a, b) => b.referrals_lifetime - a.referrals_lifetime);

/* ───────────────────────── RECURRING DONORS ───────────────────────── */

const DONOR_AMOUNTS = [10, 15, 25, 25, 25, 50, 50, 50, 100, 100, 250, 500];

export const RECURRING_DONORS: RecurringDonor[] = Array.from({ length: 14 }, (_, i) => {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const city = pick([...LEWIS_CITIES, ...THURSTON_CITIES]);
  const county = CITY_TO_COUNTY[city] || "Lewis";
  const monthly = pick(DONOR_AMOUNTS);
  const months = 3 + Math.floor(rng() * 60);
  return {
    id: `D-${(i + 1).toString().padStart(3, "0")}`,
    donor_name: `${first} ${last}`,
    household_name: maybe(0.5, `${last} household`),
    email: `${first.toLowerCase()}.${last.toLowerCase().replace(/'/g, "")}@gmail.com`,
    monthly_amount_usd: monthly,
    total_given_ytd: monthly * Math.min(months, 12),
    total_given_lifetime: monthly * months,
    months_giving: months,
    giving_started_at: new Date(Date.now() - months * 30 * 86_400_000).toISOString(),
    city, county,
    notes: months >= 24 ? "Long-time sustainer — annual thank-you handoff" : "",
  };
}).sort((a, b) => b.total_given_lifetime - a.total_given_lifetime);

/* ───────────────────────── PIPELINES (funnels reframed) ───────────────────────── */

export const PIPELINES: Pipeline[] = [
  {
    id: "PL-01",
    name: "New Supporter Onboarding",
    audience: "First-time newsletter / event sign-ups",
    status: "running",
    steps: [
      { step: 1, label: "Joined newsletter / event RSVP", channel: "email", day_offset: 0, reach_pct: 100 },
      { step: 2, label: "Day 1 — welcome + LCAC story share", channel: "email", day_offset: 1, reach_pct: 68 },
      { step: 3, label: "Day 7 — invite to next event", channel: "email", day_offset: 7, reach_pct: 42 },
      { step: 4, label: "Day 14 — gentle ask: would you give once?", channel: "email", day_offset: 14, reach_pct: 26 },
      { step: 5, label: "First gift / event attendance", channel: "in_person", day_offset: 30, reach_pct: 16 },
    ],
    total_in_pipeline: 48,
    recent_completions: 8,
  },
  {
    id: "PL-02",
    name: "One-Time Donor → Recurring",
    audience: "Made a single gift in last 90 days",
    status: "running",
    steps: [
      { step: 1, label: "Single gift received", channel: "email", day_offset: 0, reach_pct: 100 },
      { step: 2, label: "Thank-you within 24 hrs (handwritten card or video)", channel: "email", day_offset: 1, reach_pct: 92 },
      { step: 3, label: "Day 30 — impact story (what your gift did)", channel: "email", day_offset: 30, reach_pct: 60 },
      { step: 4, label: "Day 60 — invite to monthly giving", channel: "email", day_offset: 60, reach_pct: 28 },
      { step: 5, label: "Monthly giver active", channel: "email", day_offset: 90, reach_pct: 14 },
    ],
    total_in_pipeline: 22,
    recent_completions: 3,
  },
  {
    id: "PL-03",
    name: "Volunteer Onboarding",
    audience: "Interest form / event sign-up",
    status: "running",
    steps: [
      { step: 1, label: "Interest form submitted", channel: "email", day_offset: 0, reach_pct: 100 },
      { step: 2, label: "Orientation invite + background-check info", channel: "email", day_offset: 2, reach_pct: 72 },
      { step: 3, label: "Orientation attended", channel: "in_person", day_offset: 14, reach_pct: 48 },
      { step: 4, label: "First shift completed", channel: "in_person", day_offset: 30, reach_pct: 32 },
      { step: 5, label: "Sustained (4+ shifts)", channel: "in_person", day_offset: 120, reach_pct: 18 },
    ],
    total_in_pipeline: 31,
    recent_completions: 6,
  },
  {
    id: "PL-04",
    name: "Community Partner Activation",
    audience: "Schools / clinics / agencies receiving handoff invitations",
    status: "running",
    steps: [
      { step: 1, label: "Initial outreach (ED → partner contact)", channel: "email", day_offset: 0, reach_pct: 100 },
      { step: 2, label: "Intro call / SDCC tour", channel: "call", day_offset: 14, reach_pct: 60 },
      { step: 3, label: "MOU / referral-pathway agreement", channel: "email", day_offset: 45, reach_pct: 32 },
      { step: 4, label: "First family referral", channel: "email", day_offset: 90, reach_pct: 22 },
      { step: 5, label: "Sustained partnership (3+ referrals)", channel: "email", day_offset: 180, reach_pct: 14 },
    ],
    total_in_pipeline: 9,
    recent_completions: 2,
  },
];

/* ───────────────────────── UPCOMING EVENTS ───────────────────────── */

export const UPCOMING_EVENTS: Array<{
  id: string;
  name: string;
  date_iso: string;
  city: string;
  rsvp_count: number;
  capacity: number;
  type: "coalition" | "program" | "fundraiser" | "training" | "community";
}> = [
  { id: "E-01", name: "Coalition Meeting — June", date_iso: "2026-06-25", city: "Chehalis", rsvp_count: 34, capacity: 60, type: "coalition" },
  { id: "E-02", name: "Summer Sensory Camp Week 1", date_iso: "2026-07-08", city: "Centralia", rsvp_count: 18, capacity: 20, type: "program" },
  { id: "E-03", name: "BMX Show Fundraiser", date_iso: "2026-07-20", city: "Napavine", rsvp_count: 142, capacity: 400, type: "fundraiser" },
  { id: "E-04", name: "Parent Empowerment Workshop", date_iso: "2026-08-03", city: "Chehalis", rsvp_count: 22, capacity: 30, type: "training" },
  { id: "E-05", name: "Court Support Training (PD office partnership)", date_iso: "2026-08-15", city: "Chehalis", rsvp_count: 11, capacity: 25, type: "training" },
  { id: "E-06", name: "Coalition Meeting — September", date_iso: "2026-09-24", city: "Chehalis", rsvp_count: 8, capacity: 60, type: "coalition" },
];

/* ───────────────────────── ROLLUP STATS ───────────────────────── */

const monthlyRecurringTotal = RECURRING_DONORS.reduce((s, d) => s + d.monthly_amount_usd, 0);
const supporters30dNew = SUPPORTERS.filter((s) => Date.now() - new Date(s.joined_at).getTime() < 30 * 86_400_000).length;
const sustainedCount = SUPPORTERS.filter((s) => s.status === "sustained" || s.status === "monthly_giver" || s.status === "stewardship").length;
const familiesInProgram = SUPPORTERS.filter((s) => s.signals.is_caregiver || s.status === "in_program").length;

export const OVERVIEW_STATS = {
  totalSupporters: SUPPORTERS.length,
  newSupporters30d: supporters30dNew,
  sustainedSupporters: sustainedCount,
  familiesInProgram,
  monthlyRecurringUsd: monthlyRecurringTotal,
  totalGivenYtdUsd: RECURRING_DONORS.reduce((s, d) => s + d.total_given_ytd, 0) + 18_400, // one-time gifts YTD
  activePartners: PARTNERS.filter((p) => p.status === "active").length,
  countiesReached: WA_COUNTIES.filter((c) => c.reach_score > 5).length,
  upcomingEvents: UPCOMING_EVENTS.length,
  totalVolunteerHoursYtd: SUPPORTERS.reduce((s, x) => s + x.signals.volunteer_hours_ytd, 0),
};
