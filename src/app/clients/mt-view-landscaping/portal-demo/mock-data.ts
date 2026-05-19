// Mock data for Mt View owner portal demo. Realistic landscape-company
// records — Pacific Northwest names, real cities in King/Pierce/Snohomish
// counties, real Mt View service categories.

export type LeadStatus =
  | "new"
  | "contacted"
  | "site_visit"
  | "quoted"
  | "won"
  | "lost"
  | "in_route";

export type LeadService =
  | "design_install"
  | "hardscape"
  | "water_feature"
  | "irrigation"
  | "maintenance"
  | "lighting"
  | "consultation";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  service: LeadService;
  message: string;
  status: LeadStatus;
  receivedAt: string; // ISO
  estimatedValue?: number;
};

export const LEADS: Lead[] = [
  { id: "l1", name: "Sarah Whitmore", email: "swhitmore@example.com", phone: "(206) 555-0142", address: "4112 NE 65th St", city: "Seattle", service: "design_install", message: "Looking to redesign our front yard — about 3,000 sqft. We have an old lawn that needs to come out and want native plantings + a stone walkway.", status: "site_visit", receivedAt: "2026-05-17T14:30:00Z", estimatedValue: 18500 },
  { id: "l2", name: "Mark Chen", email: "mchen@example.com", phone: "(425) 555-0188", address: "1820 110th Ave NE", city: "Bellevue", service: "water_feature", message: "Interested in a small naturalistic pond + recirculating stream in our backyard. About 12x8 footprint.", status: "quoted", receivedAt: "2026-05-15T10:12:00Z", estimatedValue: 24000 },
  { id: "l3", name: "Patricia Kovacs", email: "pkovacs@example.com", phone: "(253) 555-0167", address: "8517 Bridgeport Way W", city: "Tacoma", service: "maintenance", message: "Need year-round maintenance for our 1/2 acre property. Was using a mow-and-go crew, want something more thoughtful.", status: "won", receivedAt: "2026-05-14T09:45:00Z", estimatedValue: 4200 },
  { id: "l4", name: "James Olafsson", email: "jolafsson@example.com", phone: "(360) 555-0123", address: "612 Pleasant Ave", city: "Auburn", service: "hardscape", message: "Have an old concrete patio that's cracking. Want to replace with paver patio + small fire pit. Probably 400 sqft.", status: "new", receivedAt: "2026-05-19T08:22:00Z", estimatedValue: 12000 },
  { id: "l5", name: "Maria Restrepo", email: "mrestrepo@example.com", phone: "(206) 555-0193", address: "3025 W Mercer Way", city: "Mercer Island", service: "design_install", message: "Full backyard redesign — currently a mess of overgrown shrubs. Want to start fresh with a real plan. Saw your Olano project on the site.", status: "site_visit", receivedAt: "2026-05-18T16:08:00Z", estimatedValue: 38000 },
  { id: "l6", name: "David Logan", email: "dlogan@example.com", phone: "(425) 555-0211", address: "455 NW Gilman Blvd", city: "Issaquah", service: "irrigation", message: "Our irrigation system is from the 90s and half the heads don't work. Need someone to assess + replace.", status: "contacted", receivedAt: "2026-05-16T11:30:00Z", estimatedValue: 6500 },
  { id: "l7", name: "Elizabeth Nakamura", email: "enakamura@example.com", phone: "(253) 555-0178", address: "1140 Highland Dr", city: "Bonney Lake", service: "lighting", message: "Want path lighting + accent lighting on the maple in our front yard. Husband wants something low-voltage and not tacky.", status: "quoted", receivedAt: "2026-05-13T13:55:00Z", estimatedValue: 4800 },
  { id: "l8", name: "Robert Castellanos", email: "rcastellanos@example.com", phone: "(206) 555-0234", address: "7220 Greenwood Ave N", city: "Seattle", service: "design_install", message: "New construction — builder finished the house but left the yard as bare dirt. Need full planting plan + irrigation.", status: "new", receivedAt: "2026-05-19T07:14:00Z", estimatedValue: 28000 },
  { id: "l9", name: "Wendy Wen", email: "wwen@example.com", phone: "(425) 555-0145", address: "3201 132nd Ave NE", city: "Bellevue", service: "consultation", message: "Just bought a house with established but neglected gardens. Want someone to walk through and tell us what to keep + what to remove.", status: "contacted", receivedAt: "2026-05-12T15:22:00Z" },
  { id: "l10", name: "Thomas Brennan", email: "tbrennan@example.com", phone: "(360) 555-0199", address: "918 Front St", city: "Lynnwood", service: "hardscape", message: "Tiered retaining wall — back of property is sloped and we want to terrace it for plantings.", status: "site_visit", receivedAt: "2026-05-11T10:08:00Z", estimatedValue: 16500 },
  { id: "l11", name: "Linda Park", email: "lpark@example.com", phone: "(425) 555-0257", address: "2700 NE 24th St", city: "Renton", service: "maintenance", message: "Want to add us to the maintenance route. Currently weekly mow only, looking for full care.", status: "in_route", receivedAt: "2026-04-28T09:11:00Z", estimatedValue: 3800 },
  { id: "l12", name: "Carlos Mendez", email: "cmendez@example.com", phone: "(206) 555-0282", address: "4516 Phinney Ave N", city: "Seattle", service: "design_install", message: "Side yard redesign. About 800 sqft. Currently grass + a sad rhododendron.", status: "lost", receivedAt: "2026-05-05T14:33:00Z" },
];

export type Task = {
  id: string;
  title: string;
  due: string; // ISO date
  assignee: "Tim" | "Bonnie" | "Crew";
  priority: "high" | "med" | "low";
  done: boolean;
};

export const TASKS: Task[] = [
  { id: "t1", title: "Site walk with Sarah Whitmore (Seattle, design+install)", due: "2026-05-21", assignee: "Tim", priority: "high", done: false },
  { id: "t2", title: "Send quote to Mark Chen (Bellevue water feature)", due: "2026-05-20", assignee: "Tim", priority: "high", done: false },
  { id: "t3", title: "Finish Williams retaining wall — top course + caps", due: "2026-05-22", assignee: "Crew", priority: "high", done: false },
  { id: "t4", title: "Irrigation startup at Olano property (route Tuesday)", due: "2026-05-26", assignee: "Bonnie", priority: "med", done: false },
  { id: "t5", title: "Order pavers for Olafsson project (need 4 pallets)", due: "2026-05-23", assignee: "Tim", priority: "med", done: false },
  { id: "t6", title: "Call David Logan back re: irrigation assessment", due: "2026-05-20", assignee: "Bonnie", priority: "med", done: true },
  { id: "t7", title: "Spring fertilization — Route 3 (Wednesday)", due: "2026-05-27", assignee: "Crew", priority: "low", done: false },
];

export type RouteStop = {
  id: string;
  customer: string;
  address: string;
  city: string;
  service: string;
  estMinutes: number;
  notes?: string;
};

export type DailyRoute = {
  day: "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  crew: "Tim's Crew" | "Bonnie's Crew";
  totalStops: number;
  estHours: number;
  stops: RouteStop[];
};

export const ROUTES: DailyRoute[] = [
  {
    day: "Tuesday",
    crew: "Bonnie's Crew",
    totalStops: 7,
    estHours: 7.5,
    stops: [
      { id: "r1", customer: "Olano Property", address: "8240 168th Ave SE", city: "Snohomish", service: "Full Care · Mow + bed work", estMinutes: 75, notes: "Irrigation startup due — check zones 4 + 6" },
      { id: "r2", customer: "Aquavista (Wilkins)", address: "14520 Lake Hills Blvd", city: "Bellevue", service: "Full Care · Mow + pond check", estMinutes: 60, notes: "Pump pressure was low last week — re-check" },
      { id: "r3", customer: "Linda Park", address: "2700 NE 24th St", city: "Renton", service: "Essentials · Mow + edge", estMinutes: 45 },
      { id: "r4", customer: "Patricia Kovacs", address: "8517 Bridgeport Way W", city: "Tacoma", service: "Full Care · Mow + spring cleanup", estMinutes: 90, notes: "First service after onboarding — Tim should drop by" },
      { id: "r5", customer: "Reynolds Estate", address: "11200 Hidden Valley Rd", city: "Bonney Lake", service: "Estate · Full walkthrough + mow + bed work", estMinutes: 120 },
      { id: "r6", customer: "Henderson Property", address: "612 Sunrise Dr", city: "Auburn", service: "Essentials · Mow + edge", estMinutes: 40 },
      { id: "r7", customer: "Kirse Residence", address: "9810 SE 195th Pl", city: "Kent", service: "Full Care · Mow + bed work + lighting check", estMinutes: 60 },
    ],
  },
  {
    day: "Wednesday",
    crew: "Bonnie's Crew",
    totalStops: 6,
    estHours: 6,
    stops: [
      { id: "r8", customer: "McKinley Property", address: "418 16th Ave E", city: "Seattle", service: "Full Care · Mow + spring fertilization", estMinutes: 50 },
      { id: "r9", customer: "Davies Residence", address: "2240 NW 80th St", city: "Seattle", service: "Essentials · Mow + edge", estMinutes: 40 },
      { id: "r10", customer: "Thompson Estate", address: "5510 W Mercer Way", city: "Mercer Island", service: "Estate · Full crew rotation", estMinutes: 150, notes: "Bonnie walks with owner — quarterly review" },
      { id: "r11", customer: "Sato Residence", address: "1860 Olympic Blvd", city: "Lynnwood", service: "Full Care · Mow + bed work", estMinutes: 55 },
      { id: "r12", customer: "Branson Garden", address: "4225 218th Ave SE", city: "Issaquah", service: "Full Care · Mow + pruning", estMinutes: 70 },
      { id: "r13", customer: "Highland Property", address: "8920 35th Ave NE", city: "Seattle", service: "Essentials · Mow", estMinutes: 35 },
    ],
  },
  {
    day: "Thursday",
    crew: "Tim's Crew",
    totalStops: 0,
    estHours: 8,
    stops: [],
  },
  {
    day: "Friday",
    crew: "Bonnie's Crew",
    totalStops: 5,
    estHours: 5.5,
    stops: [
      { id: "r14", customer: "Garrett Estate", address: "210 W Highland Dr", city: "Bothell", service: "Estate · Quarterly walkthrough + mow", estMinutes: 90 },
      { id: "r15", customer: "Mancini Garden", address: "7180 Madrona Lane", city: "Federal Way", service: "Full Care · Mow + bed work", estMinutes: 60 },
      { id: "r16", customer: "Brennan Property", address: "918 Front St", city: "Lynnwood", service: "Full Care · Mow + spring cleanup", estMinutes: 65 },
      { id: "r17", customer: "Patel Residence", address: "3309 56th Ave NE", city: "Seattle", service: "Essentials · Mow + edge", estMinutes: 40 },
      { id: "r18", customer: "Walsh Residence", address: "1140 NE 95th St", city: "Seattle", service: "Full Care · Mow + bed work", estMinutes: 55 },
    ],
  },
];

export type Review = {
  id: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  source: "google" | "private";
  text: string;
};

export const REVIEWS: Review[] = [
  { id: "rv1", name: "Cody H", rating: 5, date: "2026-04-12", source: "google", text: "If you're considering any type of landscaping or lawn maintenance, I can't recommend Mountain View enough. Expert team, seamless process." },
  { id: "rv2", name: "Jay Freeman", rating: 5, date: "2026-04-08", source: "google", text: "On time, kind and did an amazing job. Could not be happier with the outcome and customer service — restored my faith in contracting work out." },
  { id: "rv3", name: "Jennifer Cline", rating: 5, date: "2026-03-22", source: "google", text: "Always amazing — helped us fix our sprinkler system. Tim & Bonnie are the best!" },
  { id: "rv4", name: "Karen Walters", rating: 5, date: "2026-03-15", source: "google", text: "We've used Mountain View for over a decade. Bonnie's crew is reliable, the design work is thoughtful, they actually answer the phone." },
  { id: "rv5", name: "Michael Brennan", rating: 5, date: "2026-03-04", source: "google", text: "Tim designed our backyard from scratch. Five years later it looks better than the day it was installed. The maintenance route is the unfair advantage." },
  { id: "rv6", name: "(Private — Linda P.)", rating: 4, date: "2026-04-28", source: "private", text: "Service is great. One small thing — crew showed up 20 minutes late last week. Not a big deal but wanted to mention it." },
  { id: "rv7", name: "(Private — Mark R.)", rating: 3, date: "2026-03-30", source: "private", text: "Quality of mowing was inconsistent this month — felt like a different crew showed up two of the four weeks. Bonnie called me back same day to discuss." },
];

export type Activity = {
  id: string;
  ts: string;
  kind: "lead" | "review" | "route" | "task" | "renewal";
  text: string;
};

export const RECENT_ACTIVITY: Activity[] = [
  { id: "a1", ts: "2 hours ago", kind: "lead", text: "New lead: James Olafsson — Auburn — Hardscape (~$12k)" },
  { id: "a2", ts: "this morning", kind: "lead", text: "New lead: Robert Castellanos — Seattle — Design+Install (~$28k)" },
  { id: "a3", ts: "yesterday", kind: "review", text: "5-star Google review from Cody H landed publicly" },
  { id: "a4", ts: "yesterday", kind: "task", text: "Bonnie completed: Spring fertilization on Tuesday route" },
  { id: "a5", ts: "2 days ago", kind: "route", text: "Olano property: irrigation zones 4 + 6 flagged for re-check" },
  { id: "a6", ts: "3 days ago", kind: "renewal", text: "Patricia Kovacs onboarded onto Full Care route" },
  { id: "a7", ts: "4 days ago", kind: "review", text: "Private 4-star feedback from Linda P. — crew was 20 min late" },
];

export type Stats = {
  leadsThisMonth: number;
  pipelineValue: number;
  maintenanceCustomers: number;
  monthlyRecurring: number;
  routeStops: number;
  reviewsAvg: number;
  reviewsCount: number;
  uncontacted: number;
};

export const STATS: Stats = {
  leadsThisMonth: 18,
  pipelineValue: 187300,
  maintenanceCustomers: 47,
  monthlyRecurring: 8420,
  routeStops: 23, // across all 4 active route days this week
  reviewsAvg: 5.0,
  reviewsCount: 14,
  uncontacted: 2,
};

export const SERVICE_LABELS: Record<LeadService, string> = {
  design_install: "Design + Install",
  hardscape: "Hardscape",
  water_feature: "Water Feature",
  irrigation: "Irrigation",
  maintenance: "Maintenance",
  lighting: "Lighting",
  consultation: "Consultation",
};
