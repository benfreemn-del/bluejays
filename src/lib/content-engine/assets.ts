/**
 * content-engine/assets.ts — searchable b-roll asset manifest.
 *
 * Every BlueJays surface that's screen-record-friendly at vertical 9:16.
 * The brief generator looks up matching surfaces by tag when building
 * b-roll cues; later (phase 3) a headless-chrome capture cron will
 * pre-render 5-10s mp4s for each.
 *
 * Update rules:
 *   · Add a new entry whenever a new BlueJays surface ships
 *   · Tag aggressively — any term Ben might say in a script
 *   · Surface must work at vertical 9:16 (most do; check first)
 */

export type BrollCaptureMode =
  | "scroll-down"
  | "hold-3s"
  | "terminal"
  | "screenshot";

export type BrollAuth =
  | "admin"
  | "client-zenith"
  | "client-itc"
  | "client-oit"
  | "none"
  | "external";

export interface BrollAsset {
  id: string;
  url: string;
  label: string;
  description: string;
  tags: string[];
  auth: BrollAuth;
  captureMode: BrollCaptureMode;
}

export const BROLL_ASSETS: BrollAsset[] = [
  // Internal dashboard surfaces
  {
    id: "dash-overview",
    url: "/dashboard",
    label: "Operator dashboard · home",
    description: "Top-of-funnel pipeline + agency tabs + recent activity",
    tags: ["dashboard", "overview", "pipeline", "operator"],
    auth: "admin",
    captureMode: "scroll-down",
  },
  {
    id: "dash-spending",
    url: "/spending",
    label: "Spending dashboard · per-tenant cost",
    description: "Real ops cost rolled up + per-tenant filter dropdown",
    tags: ["spending", "costs", "attribution", "roi", "per-tenant"],
    auth: "admin",
    captureMode: "hold-3s",
  },
  {
    id: "dash-spending-tenant",
    url: "/spending?client=zenith-sports",
    label: "Spending · Zenith filter",
    description: "Per-tenant cost view — for 'we track every dollar' b-roll",
    tags: ["spending", "attribution", "zenith", "per-client"],
    auth: "admin",
    captureMode: "hold-3s",
  },
  {
    id: "dash-clients",
    url: "/dashboard/clients",
    label: "Operator · client roster",
    description: "Every active tenant with green/red/yellow open status lights",
    tags: ["clients", "roster", "tenants", "multi-tenant"],
    auth: "admin",
    captureMode: "hold-3s",
  },
  {
    id: "dash-script",
    url: "/dashboard/script",
    label: "Madie sales script",
    description: "Hormozi-aligned partner script with branching flow",
    tags: ["script", "sales", "madie", "cold-call", "hormozi"],
    auth: "admin",
    captureMode: "scroll-down",
  },
  {
    id: "dash-all-tasks",
    url: "/dashboard/all-tasks",
    label: "Master to-do",
    description: "Everything Ben owes across every tenant — single pane",
    tags: ["tasks", "todo", "master-list", "organization"],
    auth: "admin",
    captureMode: "scroll-down",
  },
  {
    id: "dash-ai-bots",
    url: "/dashboard/ai-bots",
    label: "AI bot fleet",
    description: "Every running bot/cron + its wired-in status",
    tags: ["ai", "bots", "automation", "crons"],
    auth: "admin",
    captureMode: "scroll-down",
  },
  {
    id: "dash-tekky-map",
    url: "/dashboard/tekky-map",
    label: "Lead-discovery map · Tekky",
    description: "Geographic affiliate-target candidates across MLS metros",
    tags: ["map", "leads", "discovery", "zenith", "tekky", "soccer"],
    auth: "admin",
    captureMode: "hold-3s",
  },
  {
    id: "dash-content",
    url: "/dashboard/content",
    label: "Morning content brief",
    description: "The content engine itself — meta b-roll for 'i built a tool that ___'",
    tags: ["content", "brief", "meta", "build-in-public"],
    auth: "admin",
    captureMode: "scroll-down",
  },

  // Per-tenant portals (sample data)
  {
    id: "portal-zenith-overview",
    url: "/clients/zenith-sports/portal?tab=overview",
    label: "Zenith portal · overview",
    description: "Owner dashboard with pipeline value + audience emojis",
    tags: ["portal", "owner", "zenith", "overview", "demo"],
    auth: "client-zenith",
    captureMode: "hold-3s",
  },
  {
    id: "portal-zenith-leads",
    url: "/clients/zenith-sports/portal?tab=leads",
    label: "Zenith portal · leads",
    description: "Audience-tagged lead list with filter chips",
    tags: ["portal", "leads", "zenith", "audience-filter"],
    auth: "client-zenith",
    captureMode: "scroll-down",
  },
  {
    id: "portal-zenith-ads",
    url: "/clients/zenith-sports/portal?tab=ads",
    label: "Zenith portal · ads tab v2",
    description: "Hormozi 70/20/10 platform squares with creative grid",
    tags: ["portal", "ads", "hormozi", "creative", "70-20-10"],
    auth: "client-zenith",
    captureMode: "hold-3s",
  },
  {
    id: "portal-itc-overview",
    url: "/clients/itc-quick-attach/portal?tab=overview",
    label: "ITC portal · overview",
    description: "Tractor accessory tenant with 6-segment audiences",
    tags: ["portal", "itc", "tractor", "manufacturer", "6-audience"],
    auth: "client-itc",
    captureMode: "hold-3s",
  },
  {
    id: "portal-oit-overview",
    url: "/clients/olympic-inspections/portal?tab=overview",
    label: "OIT portal · overview",
    description: "Inspection-services tenant with calendar + affiliates",
    tags: ["portal", "oit", "inspection", "calendar", "affiliates"],
    auth: "client-oit",
    captureMode: "hold-3s",
  },
  {
    id: "portal-budget-tab",
    url: "/clients/zenith-sports/portal?tab=budget",
    label: "Portal · Budget tab + ops-cost banner",
    description: "The 'your BlueJays ops cost · last 30 days' emerald banner",
    tags: ["portal", "budget", "ops-cost", "attribution", "transparency"],
    auth: "client-zenith",
    captureMode: "hold-3s",
  },

  // Public sites
  {
    id: "pub-bluejays",
    url: "https://www.bluejayportfolio.com",
    label: "BlueJays public homepage",
    description: "Marketing site + hero pitch",
    tags: ["public", "marketing", "bluejays", "home"],
    auth: "none",
    captureMode: "scroll-down",
  },
  {
    id: "pub-cut-my-agency",
    url: "https://www.bluejayportfolio.com/cut-my-agency",
    label: "Cut-my-agency landing page",
    description: "Hero + agency-cost calculator",
    tags: ["landing", "agency", "cut", "calculator", "lead-magnet"],
    auth: "none",
    captureMode: "hold-3s",
  },
  {
    id: "pub-audit",
    url: "https://www.bluejayportfolio.com/audit",
    label: "Free audit form",
    description: "30-second site audit lead magnet",
    tags: ["audit", "lead-magnet", "free", "form"],
    auth: "none",
    captureMode: "hold-3s",
  },
  {
    id: "pub-sites-oit",
    url: "https://www.olympicinspections.com",
    label: "Olympic Inspections public site",
    description: "Live tenant homepage",
    tags: ["public", "oit", "inspection", "tenant-site"],
    auth: "none",
    captureMode: "scroll-down",
  },
  {
    id: "pub-sites-zenith",
    url: "/clients/zenith-sports",
    label: "Zenith Sports public site",
    description: "Live tenant homepage with TEKKY ball CTA",
    tags: ["public", "zenith", "soccer", "tenant-site", "tekky"],
    auth: "none",
    captureMode: "scroll-down",
  },
  {
    id: "pub-sites-itc",
    url: "/clients/itc-quick-attach",
    label: "ITC Quick Attach public site",
    description: "Live tenant homepage with tractor product grid",
    tags: ["public", "itc", "tractor", "tenant-site"],
    auth: "none",
    captureMode: "scroll-down",
  },

  // Build-in-public terminal sources
  {
    id: "terminal-git-log",
    url: "terminal://git-log",
    label: "Terminal · git log",
    description: "Recent commit stream — record locally with quicktime + iterm",
    tags: ["terminal", "git", "commits", "ship-log", "build-in-public"],
    auth: "none",
    captureMode: "terminal",
  },
  {
    id: "terminal-deploy",
    url: "terminal://vercel-deploy",
    label: "Terminal · vercel deploy",
    description: "Live deploy log scrolling — high-quality build-in-public b-roll",
    tags: ["terminal", "deploy", "vercel", "ship", "build-in-public"],
    auth: "none",
    captureMode: "terminal",
  },
  {
    id: "terminal-cron-fire",
    url: "terminal://cron-output",
    label: "Terminal · cron fire",
    description: "Cron job stdout — iteration engine, partner scout, etc.",
    tags: ["terminal", "cron", "automation", "fire"],
    auth: "none",
    captureMode: "terminal",
  },

  // External SaaS (existing screenshots)
  {
    id: "ext-stripe-checkout",
    url: "external://stripe",
    label: "Stripe checkout receipt",
    description: "Recent close screenshot for 'client paid $X' proof",
    tags: ["stripe", "payment", "close", "proof", "money"],
    auth: "external",
    captureMode: "screenshot",
  },
  {
    id: "ext-sendgrid-stats",
    url: "external://sendgrid",
    label: "SendGrid send stats",
    description: "Email engagement stats screenshot",
    tags: ["sendgrid", "email", "stats", "deliverability"],
    auth: "external",
    captureMode: "screenshot",
  },
  {
    id: "ext-twilio-sms",
    url: "external://twilio",
    label: "Twilio SMS log",
    description: "Outbound SMS log screenshot",
    tags: ["twilio", "sms", "log", "automation"],
    auth: "external",
    captureMode: "screenshot",
  },
];

/**
 * Search the manifest by free-form tag terms. Returns assets ranked by
 * how many tags match, ties broken by id stability.
 */
export function findAssets(query: string, limit = 5): BrollAsset[] {
  const terms = query
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.replace(/[^a-z0-9-]/g, ""))
    .filter((t) => t.length >= 3);
  if (terms.length === 0) return [];
  const scored: Array<{ asset: BrollAsset; score: number }> = [];
  for (const a of BROLL_ASSETS) {
    let score = 0;
    for (const t of terms) {
      if (a.tags.some((tag) => tag.includes(t))) score += 3;
      if (a.label.toLowerCase().includes(t)) score += 2;
      if (a.description.toLowerCase().includes(t)) score += 1;
    }
    if (score > 0) scored.push({ asset: a, score });
  }
  return scored
    .sort((x, y) => y.score - x.score || x.asset.id.localeCompare(y.asset.id))
    .slice(0, limit)
    .map((s) => s.asset);
}

/** Look up an asset by id (for the brief b-roll cue rendering). */
export function getAssetById(id: string): BrollAsset | undefined {
  return BROLL_ASSETS.find((a) => a.id === id);
}
