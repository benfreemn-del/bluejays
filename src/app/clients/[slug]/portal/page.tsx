"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import FunnelVisualModal from "@/components/portal/FunnelVisualModal";
import CustomersTab from "@/components/portal/CustomersTab";
import AISkillsTab from "@/components/portal/AISkillsTab";

// Lazy-load the Leaflet maps — heavy + SSR-incompatible. Each tenant
// gets the map flavored to their business; we dynamic-import per slug.
const ItcMarketMap = nextDynamic(() => import("./itc-map.client"), {
  ssr: false,
  loading: () => (
    <div className="h-[640px] flex items-center justify-center text-slate-500 text-sm rounded-2xl border border-white/[0.06] bg-slate-900/40">
      Loading map…
    </div>
  ),
});

// Zenith / TEKKY soccer-town map — same Leaflet engine, soccer audiences.
// Lives at /dashboard/tekky-map historically; we embed it here so soccer
// scouting belongs to Zenith's owner portal, not the admin dashboard.
const ZenithSoccerMap = nextDynamic(
  () => import("@/app/dashboard/tekky-map/map.client"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[640px] flex items-center justify-center text-slate-500 text-sm rounded-2xl border border-white/[0.06] bg-slate-900/40">
        Loading map…
      </div>
    ),
  },
);

/**
 * /clients/[slug]/portal — the owner-facing dashboard.
 *
 * 4 tabs designed for an online-business owner (not a developer):
 *   - Overview   — the at-a-glance landing tab. Pipeline value, action
 *                  needed, recent activity, quick links.
 *   - Leads      — the working surface. Filter, search, status flips.
 *   - Insights   — the rich weekly report (was "Weekly Report" — renamed
 *                  to communicate ongoing analysis, not a one-off doc).
 *   - Account    — name, email, password, last login, plan visibility.
 *
 * Auth via the `client-portal-session` cookie. Self-bounces to login
 * if missing/invalid. All endpoints scope by cookie → owner.client_slug.
 */

type Owner = {
  id: string;
  client_slug: string;
  email: string;
  name: string | null;
  role: string;
  last_login_at: string | null;
};

type ClientLead = {
  id: string;
  audience_segment: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  intent: string | null;
  source: string | null;
  funnel_status: string;
  funnel_step: number | null;
  notes: string | null;
  raw_payload?: Record<string, unknown> | null;
  created_at: string;
  touch_count?: number;
  touch_channels?: string[];
};

type LeadsSummary = {
  total: number;
  contacted: number;
  uncontacted: number;
};

type ReplyDraft = {
  body: string;
  subject: string | null;
  channel: "email" | "sms" | "either";
  rationale: string;
};

type NotificationMode = "instant" | "digest" | "off";
type OwnerPrefs = {
  new_lead_email: NotificationMode;
  new_lead_sms: NotificationMode;
  digest_hour: number;
  digest_timezone: string;
};

type ShopifyState = {
  connected: boolean;
  status: string;
  store_url: string | null;
  metrics: {
    revenue_30d_cents?: number;
    revenue_7d_cents?: number;
    aov_cents?: number;
    orders_30d?: number;
    orders_7d?: number;
    top_product?: { name: string; units: number; revenue_cents: number };
    repeat_rate?: number;
  };
  cached_at: string | null;
};

type Subscription = {
  id: string;
  service: string;
  tier: string;
  status: string;
  monthly_price_usd: number | null;
  managed_by: string;
};

// Matches the WeeklyReport export from src/lib/client-reports.ts. Kept
// inline here so the portal isn't tightly coupled to lib types.
type Report = {
  period: { start: string; end: string };
  leads: {
    total: number;
    byAudience: Record<string, number>;
    bySource: Record<string, number>;
    byIntent: Record<string, number>;
    new_this_week: number;
    delta_vs_prior_week: number;
    pipeline_value_usd: number;
    weekly_trend: { week: string; count: number }[];
  };
  patterns: {
    by_hour: number[];
    by_day_of_week: number[];
    busiest_hour: number;
    busiest_day: number;
  };
  funnel: {
    enrolled: number;
    responded: number;
    converted: number;
    completed: number;
    response_rate_pct: number;
    conversion_rate_pct: number;
    avg_response_time_hours: number | null;
    top_template: { id: string; sends: number; replies: number; rate_pct: number } | null;
  };
  messages: {
    sent: number;
    failed: number;
    skipped: number;
    by_channel: Record<string, number>;
  };
  action_required: {
    id: string;
    name: string | null;
    audience: string | null;
    intent: string | null;
    days_since_response: number;
  }[];
  highlights: string[];
  next_actions: string[];
};

type Tab =
  | "overview"
  | "leads"
  | "activity"
  | "todo"
  | "budget"
  | "campaigns"
  | "funnels"
  | "map"
  | "insights"
  | "partners"
  | "customers"
  | "ai-skills"
  | "account";

type Campaign = {
  id: string;
  client_slug: string;
  name: string;
  subject: string;
  body: string;
  audience_filter: string[];
  lead_status_filter: string[];
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
  scheduled_for: string | null;
  sent_at: string | null;
  recipient_count: number;
  send_count: number;
  open_count: number;
  click_count: number;
  reply_count: number;
  bounce_count: number;
  created_at: string;
  updated_at: string;
};

type LeadMessage = {
  id: string;
  lead_id: string;
  client_slug: string;
  funnel_step: number | null;
  channel: "email" | "sms" | "voicemail";
  direction: "outbound" | "inbound";
  to_address: string | null;
  from_address: string | null;
  subject: string | null;
  body: string | null;
  template_id: string | null;
  status: string;
  provider: string | null;
  provider_id: string | null;
  error: string | null;
  sent_at: string;
};

type CampaignSend = {
  id: string;
  campaign_id: string;
  lead_id: string;
  to_email: string;
  rendered_subject: string;
  rendered_body: string;
  status: string;
  error: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  replied_at: string | null;
  created_at: string;
};

type BudgetItem = {
  id: string;
  label: string;
  description: string | null;
  amount_cents: number;
  recurring_monthly: boolean;
  charge_date: string;
  ended_on: string | null;
  category: string;
  vendor: string | null;
  notes: string | null;
  created_at: string;
};

type BudgetSummary = {
  thisMonthCents: number;
  monthlyRecurringCents: number;
  last12MonthsCents: number;
  byCategoryCents: Record<string, number>;
  itemCount: number;
};

type PortalTask = {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "blocked" | "done";
  priority: "urgent" | "high" | "medium" | "low";
  category: string;
  blocked_on: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  last_updated_by_owner_id: string | null;
};

type TasksSummary = {
  total: number;
  pending: number;
  in_progress: number;
  blocked: number;
  done: number;
};

const TASK_STATUS_COLOR: Record<string, string> = {
  pending: "bg-slate-700/40 text-slate-300",
  in_progress: "bg-blue-500/20 text-blue-300",
  blocked: "bg-rose-500/20 text-rose-300",
  done: "bg-emerald-500/20 text-emerald-300",
};

const TASK_PRIORITY_COLOR: Record<string, string> = {
  urgent: "bg-rose-500/20 text-rose-300",
  high: "bg-amber-500/20 text-amber-300",
  medium: "bg-slate-700/40 text-slate-400",
  low: "bg-slate-700/40 text-slate-500",
};

const STATUS_COLOR: Record<string, string> = {
  not_enrolled: "bg-slate-700/40 text-slate-300",
  enrolled: "bg-blue-500/20 text-blue-300",
  paused: "bg-amber-500/20 text-amber-300",
  responded: "bg-emerald-500/20 text-emerald-300",
  converted: "bg-emerald-500 text-white",
  completed: "bg-slate-700 text-slate-400",
  dismissed: "bg-slate-800 text-slate-500 line-through",
};

const AUDIENCE_EMOJI: Record<string, string> = {
  // Zenith Sports
  parent: "👪",
  coach: "🏟️",
  player: "⚽",
  club: "🏛️",
  unknown: "📥",
  // ITC Quick Attach
  hobbyist: "🚜",
  forester: "🌲",
  tym: "⚙️",
  hunter: "🦌",
  dealer: "🤝",
  community: "🏆",
};

/**
 * Resolve the right audience icon for a lead. Tries audience_segment
 * first, then derives from the `source` field (lp-hunter → 🦌) so
 * leads that came in before audience-tagging was wired still render
 * with the right emoji. Final fallback is the inbox icon.
 */
function audienceEmoji(audience: string | null | undefined, source?: string | null): string {
  if (audience && AUDIENCE_EMOJI[audience]) return AUDIENCE_EMOJI[audience];
  if (source) {
    const s = source.toLowerCase();
    if (s.includes("tym")) return AUDIENCE_EMOJI.tym;
    if (s.includes("hobbyist")) return AUDIENCE_EMOJI.hobbyist;
    if (s.includes("forester")) return AUDIENCE_EMOJI.forester;
    if (s.includes("hunter")) return AUDIENCE_EMOJI.hunter;
    if (s.includes("dealer")) return AUDIENCE_EMOJI.dealer;
    if (s.includes("community")) return AUDIENCE_EMOJI.community;
    if (s.includes("parent")) return AUDIENCE_EMOJI.parent;
    if (s.includes("coach")) return AUDIENCE_EMOJI.coach;
    if (s.includes("player")) return AUDIENCE_EMOJI.player;
    if (s.includes("club")) return AUDIENCE_EMOJI.club;
  }
  return AUDIENCE_EMOJI.unknown;
}

/**
 * Per-audience color tokens, mapped to the brand-voice doc's three
 * primary audiences (parent / coach / player) plus club + unknown
 * fallbacks. Used to color-code lead cards so an owner can scan the
 * pipeline at a glance — "we have a wave of parents this week" reads
 * instantly without parsing each card's audience badge.
 *
 *   parent → warm amber  (the "buyer for someone else" audience)
 *   coach  → cobalt blue (the "trust + authority" audience)
 *   player → lime green  (the "that's me on the field" audience)
 *   club   → violet      (B2B group buyers, premium tier)
 */
const AUDIENCE_COLOR: Record<
  string,
  { bg: string; ring: string; text: string; chip: string; accent: string }
> = {
  parent: {
    bg: "bg-amber-500/[0.06]",
    ring: "border-amber-500/30",
    text: "text-amber-200",
    chip: "bg-amber-500/15 text-amber-200 border border-amber-500/30",
    accent: "#f59e0b",
  },
  coach: {
    bg: "bg-blue-500/[0.06]",
    ring: "border-blue-500/30",
    text: "text-blue-200",
    chip: "bg-blue-500/15 text-blue-200 border border-blue-500/30",
    accent: "#1d4ed8",
  },
  player: {
    bg: "bg-lime-500/[0.06]",
    ring: "border-lime-500/30",
    text: "text-lime-200",
    chip: "bg-lime-500/15 text-lime-200 border border-lime-500/30",
    accent: "#a3e635",
  },
  club: {
    bg: "bg-violet-500/[0.06]",
    ring: "border-violet-500/30",
    text: "text-violet-200",
    chip: "bg-violet-500/15 text-violet-200 border border-violet-500/30",
    accent: "#8b5cf6",
  },
  unknown: {
    bg: "bg-slate-800/40",
    ring: "border-slate-700",
    text: "text-slate-300",
    chip: "bg-slate-700/40 text-slate-300 border border-slate-600",
    accent: "#94a3b8",
  },
};

/**
 * Per-audience filter-pill metadata. Drives the Category filter row in
 * LeadsTab. Covers every audience tag across all tenants (Zenith soccer,
 * ITC tractor, Laser Lakes, etc.) so a single LeadsTab handles all.
 *
 * activeChip = pill style when this audience is the active filter.
 */
const AUDIENCE_FILTER_META: Record<
  string,
  { emoji: string; label: string; activeChip: string }
> = {
  // Zenith Sports / TEKKY soccer audiences
  parent: { emoji: "👪", label: "Parents", activeChip: "bg-amber-500 border-amber-400 text-amber-950" },
  coach: { emoji: "🏟️", label: "Coaches", activeChip: "bg-blue-500 border-blue-400 text-white" },
  player: { emoji: "🥇", label: "Players", activeChip: "bg-lime-500 border-lime-400 text-lime-950" },
  club: { emoji: "🏟", label: "Clubs", activeChip: "bg-violet-500 border-violet-400 text-white" },
  // ITC Quick Attach tractor audiences
  dealer: { emoji: "🏪", label: "Dealers", activeChip: "bg-blue-500 border-blue-400 text-white" },
  tym: { emoji: "🚜", label: "TYM owners", activeChip: "bg-amber-500 border-amber-400 text-amber-950" },
  forester: { emoji: "🌲", label: "Foresters", activeChip: "bg-lime-500 border-lime-400 text-lime-950" },
  hunter: { emoji: "🦌", label: "Hunters", activeChip: "bg-rose-500 border-rose-400 text-white" },
  hobbyist: { emoji: "🏡", label: "Hobbyists", activeChip: "bg-emerald-500 border-emerald-400 text-emerald-950" },
  community: { emoji: "🤝", label: "Community", activeChip: "bg-violet-500 border-violet-400 text-white" },
  // Catch-all
  untagged: { emoji: "•", label: "Untagged", activeChip: "bg-slate-500 border-slate-400 text-white" },
  unknown: { emoji: "?", label: "Unknown", activeChip: "bg-slate-500 border-slate-400 text-white" },
};

const SOURCE_LABEL: Record<string, string> = {
  "main-inquiry-form": "Contact form",
  "email-capture": "Email capture",
  "lead-gen-builder": "Build Your Player",
  "missed-call-text": "Missed call",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PortalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [leadsSummary, setLeadsSummary] = useState<LeadsSummary | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [tasks, setTasks] = useState<PortalTask[]>([]);
  const [tasksSummary, setTasksSummary] = useState<TasksSummary | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  /* Identity check on load. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch("/api/client-portal/me");
      if (cancelled) return;
      if (r.status === 401) {
        router.replace(`/clients/${slug}/login`);
        return;
      }
      const j = (await r.json()) as { ok: boolean; owner?: Owner };
      if (j.ok && j.owner) {
        if (j.owner.client_slug !== slug) {
          router.replace(`/clients/${j.owner.client_slug}/portal`);
          return;
        }
        setOwner(j.owner);
      } else {
        router.replace(`/clients/${slug}/login`);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, router]);

  // Per-tab data fetchers.
  const loadLeads = useCallback(async () => {
    const r = await fetch(`/api/client-portal/leads`);
    const j = (await r.json()) as {
      ok: boolean;
      leads?: ClientLead[];
      summary?: LeadsSummary;
    };
    if (j.ok && j.leads) setLeads(j.leads);
    if (j.ok && j.summary) setLeadsSummary(j.summary);
  }, []);
  const loadReport = useCallback(async () => {
    const r = await fetch(`/api/client-portal/report`);
    const j = (await r.json()) as { ok: boolean; report?: Report };
    if (j.ok && j.report) setReport(j.report);
  }, []);
  const loadSubs = useCallback(async () => {
    const r = await fetch(`/api/client-portal/subscriptions`);
    const j = (await r.json()) as { ok: boolean; subscriptions?: Subscription[] };
    if (j.ok && j.subscriptions) setSubs(j.subscriptions);
  }, []);
  const loadTasks = useCallback(async () => {
    const r = await fetch(`/api/client-portal/tasks`);
    const j = (await r.json()) as {
      ok: boolean;
      tasks?: PortalTask[];
      summary?: TasksSummary;
    };
    if (j.ok && j.tasks) setTasks(j.tasks);
    if (j.ok && j.summary) setTasksSummary(j.summary);
  }, []);
  const loadBudget = useCallback(async () => {
    const r = await fetch(`/api/client-portal/budget`);
    const j = (await r.json()) as {
      ok: boolean;
      items?: BudgetItem[];
      summary?: BudgetSummary;
    };
    if (j.ok && j.items) setBudgetItems(j.items);
    if (j.ok && j.summary) setBudgetSummary(j.summary);
  }, []);
  const loadCampaigns = useCallback(async () => {
    const r = await fetch(`/api/client-portal/campaigns`);
    const j = (await r.json()) as { ok: boolean; campaigns?: Campaign[] };
    if (j.ok && j.campaigns) setCampaigns(j.campaigns);
  }, []);

  // Overview tab needs leads + report + subs + tasks all at once.
  useEffect(() => {
    if (!owner) return;
    if (tab === "overview") {
      loadLeads();
      loadReport();
      loadSubs();
      loadTasks();
    }
    if (tab === "leads") loadLeads();
    if (tab === "todo") loadTasks();
    if (tab === "budget") loadBudget();
    if (tab === "campaigns") {
      loadCampaigns();
      loadLeads();
    }
    if (tab === "insights") loadReport();
    if (tab === "account") loadSubs();
  }, [
    tab,
    owner,
    loadLeads,
    loadReport,
    loadSubs,
    loadTasks,
    loadBudget,
    loadCampaigns,
  ]);

  const updateLeadStatus = async (id: string, status: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, funnel_status: status } : l)),
    );
    await fetch(`/api/client-portal/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ funnel_status: status }),
    });
    loadLeads();
    if (tab === "overview") loadReport();
  };

  const logout = async () => {
    await fetch("/api/client-portal/logout", { method: "POST" });
    router.push(`/clients/${slug}`);
  };

  if (loading || !owner) {
    return (
      <div className="min-h-screen bg-[#070a13] flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  const businessName = humanizeSlug(owner.client_slug);

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100">
      {/* HEADER — branded, role-aware */}
      <header className="sticky top-0 z-20 backdrop-blur bg-[#070a13]/85 border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href={`/clients/${slug}`}
            className="text-[11px] tracking-[0.22em] uppercase font-bold text-slate-400 hover:text-white"
          >
            ← Site
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">
              {businessName}{" "}
              <span className="text-slate-500 font-normal">/ Owner Portal</span>
            </h1>
            <div className="text-[11px] text-slate-500">
              Welcome back, {owner.name?.split(" ")[0] || owner.email.split("@")[0]}
            </div>
          </div>
          <button
            onClick={logout}
            className="text-[11px] tracking-wider uppercase font-bold text-slate-400 hover:text-white border border-slate-700 px-2.5 py-1 rounded"
          >
            Sign out
          </button>
        </div>
        {/* TAB BAR */}
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 flex gap-1 sm:gap-2 text-sm overflow-x-auto">
          {(
            [
              { id: "overview", label: "Overview", emoji: "🏠" },
              { id: "leads", label: "Leads", emoji: "📥" },
              { id: "activity", label: "Activity", emoji: "⚡" },
              { id: "todo", label: "To-Do", emoji: "✅" },
              { id: "budget", label: "Budget", emoji: "💰" },
              { id: "campaigns", label: "Campaigns", emoji: "📧" },
              { id: "funnels", label: "Funnels", emoji: "🎯" },
              { id: "map", label: "Map", emoji: "🗺️" },
              { id: "insights", label: "Insights", emoji: "📊" },
              ...(slug === "itc-quick-attach" || slug === "zenith-sports"
                ? [{ id: "partners" as Tab, label: "Sales Portal", emoji: "🤝" }]
                : []),
              ...(slug === "laser-lakes"
                ? [{ id: "customers" as Tab, label: "Customers", emoji: "🪵" }]
                : []),
              // 🧠 AI Skills tab — AI-package buyers only. See CLAUDE.md
              // "Client Tenant Status" table for who's gated in/out.
              ...(slug === "itc-quick-attach" || slug === "zenith-sports"
                ? [{ id: "ai-skills" as Tab, label: "AI Skills", emoji: "🧠" }]
                : []),
              { id: "account", label: "Account", emoji: "⚙️" },
            ] as { id: Tab; label: string; emoji: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-2.5 px-3 sm:px-4 border-b-2 transition font-semibold flex items-center gap-1.5 whitespace-nowrap ${
                tab === t.id
                  ? "border-blue-400 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-base">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-32">
        {tab === "overview" && (
          <OverviewTab
            slug={slug}
            owner={owner}
            leads={leads}
            leadsSummary={leadsSummary}
            report={report}
            subs={subs}
            tasks={tasks}
            tasksSummary={tasksSummary}
            onSetTab={setTab}
            onLeadStatus={updateLeadStatus}
          />
        )}
        {tab === "leads" && (
          <LeadsTab
            leads={leads}
            summary={leadsSummary}
            onStatus={updateLeadStatus}
            onMutate={loadLeads}
          />
        )}
        {tab === "todo" && (
          <TodoTab
            tasks={tasks}
            summary={tasksSummary}
            onMutate={loadTasks}
          />
        )}
        {tab === "budget" && (
          <BudgetTab
            items={budgetItems}
            summary={budgetSummary}
            onMutate={loadBudget}
          />
        )}
        {tab === "campaigns" && (
          <CampaignsTab
            slug={slug}
            campaigns={campaigns}
            leads={leads}
            onMutate={loadCampaigns}
          />
        )}
        {tab === "funnels" && (
          <FunnelsTab slug={slug} leads={leads} />
        )}
        {tab === "map" && <MapTab slug={slug} />}
        {tab === "activity" && <ActivityTab />}
        {tab === "insights" && <InsightsTab slug={slug} report={report} leads={leads} />}
        {tab === "partners" &&
          (slug === "itc-quick-attach" || slug === "zenith-sports") && (
            <PartnersTab slug={slug} />
          )}
        {tab === "customers" && slug === "laser-lakes" && (
          <CustomersTab slug={slug} />
        )}
        {tab === "ai-skills" &&
          (slug === "itc-quick-attach" || slug === "zenith-sports") && (
            <AISkillsTab slug={slug} onJumpToTab={(t) => setTab(t as Tab)} />
          )}
        {tab === "account" && (
          <AccountTab owner={owner} subs={subs} onLogout={logout} />
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────── OVERVIEW TAB ─────────────────────────── */

function OverviewTab({
  slug,
  owner,
  leads,
  leadsSummary,
  report,
  subs,
  tasks,
  tasksSummary,
  onSetTab,
  onLeadStatus,
}: {
  slug: string;
  owner: Owner;
  leads: ClientLead[];
  leadsSummary: LeadsSummary | null;
  report: Report | null;
  subs: Subscription[];
  tasks: PortalTask[];
  tasksSummary: TasksSummary | null;
  onSetTab: (t: Tab) => void;
  onLeadStatus: (id: string, status: string) => void;
}) {
  const recentLeads = leads.slice(0, 5);
  const newSinceLastLogin = owner.last_login_at
    ? leads.filter((l) => new Date(l.created_at) > new Date(owner.last_login_at!)).length
    : leads.length;

  return (
    <div className="space-y-6">
      {/* New-since-last-login banner */}
      {newSinceLastLogin > 0 && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-950/40 p-4 flex items-center gap-3">
          <span className="text-2xl">📥</span>
          <div className="flex-1">
            <div className="font-bold">
              {newSinceLastLogin} new lead{newSinceLastLogin === 1 ? "" : "s"} since you last signed in
            </div>
            <div className="text-[12px] text-slate-400">
              {owner.last_login_at
                ? `Last visit: ${new Date(owner.last_login_at).toLocaleString()}`
                : "First visit"}
            </div>
          </div>
          <button
            onClick={() => onSetTab("leads")}
            className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold px-3 py-1.5 rounded"
          >
            View leads
          </button>
        </div>
      )}

      {/* DEMO LEAD INJECTOR — fires a synthetic lead through the entire
           pipeline so an owner (or a sales-call prospect) can watch the
           system breathe in real time: form submit → audience tag → AI
           reply draft → owner alert → portal Lead row. */}
      <SampleLeadButton slug={slug} />

      {/* HEADLINE STATS — what an online-business owner cares about */}
      <section>
        <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2.5">
          The numbers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCard
            label="Total leads"
            value={report?.leads.total ?? leads.length}
            sub={`${report?.leads.new_this_week ?? 0} this week`}
            accent="blue"
          />
          <StatCard
            label="Pipeline value"
            value={`$${Math.round(estimatePipelineValueUsd(leads, report?.leads.pipeline_value_usd ?? 0, slug)).toLocaleString()}`}
            sub="estimated"
            accent="emerald"
          />
          <StatCard
            label="Conversion rate"
            value={report ? `${report.funnel.conversion_rate_pct.toFixed(1)}%` : "—"}
            sub={`${report?.funnel.converted ?? 0} converted`}
            accent="amber"
          />
          <StatCard
            label="Avg reply time"
            value={
              report?.funnel.avg_response_time_hours !== null && report?.funnel.avg_response_time_hours !== undefined
                ? formatHours(report.funnel.avg_response_time_hours)
                : "—"
            }
            sub="from first send"
            accent="violet"
          />
        </div>
      </section>

      {/* OUTREACH PROGRESS — bluejays-style "contacted vs not" pulse */}
      {leadsSummary && leadsSummary.total > 0 && (
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
              Outreach
            </h2>
            <button
              onClick={() => onSetTab("leads")}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Open leads →
            </button>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black tracking-tighter text-emerald-300">
              {leadsSummary.contacted}
            </span>
            <span className="text-sm text-slate-400">
              of {leadsSummary.total} contacted
            </span>
            {leadsSummary.uncontacted > 0 && (
              <span className="ml-auto text-[11px] tracking-wider uppercase font-bold text-amber-300">
                {leadsSummary.uncontacted} waiting
              </span>
            )}
          </div>
          <div className="h-2 bg-slate-800 rounded mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded"
              style={{
                width: `${(leadsSummary.contacted / leadsSummary.total) * 100}%`,
              }}
            />
          </div>
        </section>
      )}

      {/* ACTION ITEMS FROM BEN — open client-action tasks (top 3) */}
      {tasksSummary && tasksSummary.pending + tasksSummary.in_progress + tasksSummary.blocked > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-blue-300 flex items-center gap-2">
              ✅ Action items from Ben · {tasksSummary.pending + tasksSummary.in_progress + tasksSummary.blocked}
            </h2>
            <button
              onClick={() => onSetTab("todo")}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Open to-do →
            </button>
          </div>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.status !== "done")
              .slice(0, 3)
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSetTab("todo")}
                  className="w-full text-left rounded-lg border border-blue-500/20 bg-blue-950/15 p-3 flex items-center gap-3 hover:bg-blue-950/30 transition"
                >
                  <span className="text-lg">
                    {t.status === "blocked" ? "🚫" : t.status === "in_progress" ? "⏳" : "○"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{t.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {t.priority !== "medium" && (
                        <span className="uppercase font-bold tracking-wider mr-2">{t.priority}</span>
                      )}
                      {t.notes ? `📝 ${t.notes.slice(0, 60)}…` : t.category}
                    </div>
                  </div>
                  <span className="text-blue-300 text-xs">→</span>
                </button>
              ))}
          </div>
        </section>
      )}

      {/* ACTION REQUIRED — the most important part of the dashboard */}
      {report && report.action_required.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-amber-400 flex items-center gap-2">
              ⚠ Action required · {report.action_required.length}
            </h2>
            <button
              onClick={() => onSetTab("leads")}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Open all leads →
            </button>
          </div>
          <div className="space-y-2">
            {report.action_required.slice(0, 3).map((l) => (
              <div
                key={l.id}
                className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 flex items-start gap-3"
              >
                <span className="text-xl">{audienceEmoji(l.audience)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{l.name || "(no name)"}</div>
                  <div className="text-[11px] text-slate-400">
                    {l.intent ?? "—"} · responded {l.days_since_response}d ago
                  </div>
                </div>
                <button
                  onClick={() => onLeadStatus(l.id, "converted")}
                  className="text-[10px] tracking-wider uppercase font-bold text-emerald-300 hover:text-white border border-emerald-700/50 px-2 py-1 rounded"
                >
                  Mark won
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LEAD SOURCES + AUDIENCE BREAKDOWN — two side-by-side panels */}
      {report && (Object.keys(report.leads.bySource).length > 0 || Object.keys(report.leads.byAudience).length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.keys(report.leads.bySource).length > 0 && (
            <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-3">
                Where leads come from
              </h3>
              <BarList data={report.leads.bySource} labelMap={SOURCE_LABEL} />
            </section>
          )}
          {Object.keys(report.leads.byAudience).length > 0 && (
            <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-3">
                Who they are
              </h3>
              <BarList
                data={report.leads.byAudience}
                emojiMap={AUDIENCE_EMOJI}
              />
            </section>
          )}
        </div>
      )}

      {/* RECENT LEADS */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
            Recent leads
          </h2>
          <button
            onClick={() => onSetTab("leads")}
            className="text-[11px] text-slate-400 hover:text-white"
          >
            View all →
          </button>
        </div>
        {recentLeads.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-slate-500">
            No leads yet. They&apos;ll appear here as they come in.
          </div>
        ) : (
          <div className="space-y-2">
            {recentLeads.map((l) => (
              <div
                key={l.id}
                className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 flex items-center gap-3"
              >
                <span className="text-xl">{audienceEmoji(l.audience_segment, l.source)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{l.name || "(no name)"}</span>
                    <span className={`text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded ${STATUS_COLOR[l.funnel_status]}`}>
                      {l.funnel_status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {l.intent ?? "—"} · {timeAgo(l.created_at)}
                  </div>
                </div>
                {l.email && (
                  <a href={`mailto:${l.email}`} className="text-blue-300 hover:text-blue-200 text-xs">
                    ✉
                  </a>
                )}
                {l.phone && (
                  <a href={`sms:${l.phone}`} className="text-blue-300 hover:text-blue-200 text-xs">
                    💬
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* QUICK LINKS — per-slug. Each tenant gets the URLs that
           actually live on their stack. */}
      <section>
        <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2.5">
          Quick links
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickLinksFor(slug).map((q) => (
            <QuickLink
              key={q.label}
              href={q.href}
              icon={q.icon}
              label={q.label}
            />
          ))}
        </div>
      </section>

      {/* SUBSCRIPTION SUMMARY */}
      {subs.length > 0 && (
        <section>
          <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2.5">
            Your AI plan
          </h2>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex items-center gap-3 flex-wrap">
            {subs
              .filter((s) => s.status === "active" || s.status === "trialing")
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-800/60 text-sm"
                >
                  <span className="capitalize font-semibold">{s.service}</span>
                  <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {s.tier}
                  </span>
                  {s.monthly_price_usd !== null && s.monthly_price_usd > 0 && (
                    <span className="text-[11px] text-slate-400">
                      ${s.monthly_price_usd}/mo
                    </span>
                  )}
                </div>
              ))}
            <button
              onClick={() => onSetTab("account")}
              className="ml-auto text-[11px] text-slate-400 hover:text-white"
            >
              Manage →
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

/* ─────────────────────────── INSIGHTS TAB ─────────────────────────── */

function InsightsTab({
  slug,
  report,
  leads,
}: {
  slug?: string;
  report: Report | null;
  leads?: ClientLead[];
}) {
  // We accept leads optionally so per-tenant deal-value overrides can
  // surface here too. Falls through to the report's server-computed
  // value when leads aren't loaded.
  const pipelineValueUsd = leads
    ? estimatePipelineValueUsd(leads, report?.leads.pipeline_value_usd ?? 0, slug)
    : report?.leads.pipeline_value_usd ?? 0;
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [shopify, setShopify] = useState<ShopifyState | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<{
    thisMonthCents: number;
    monthlyRecurringCents: number;
    byCategoryCents: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/client-portal/shopify");
      const j = (await r.json().catch(() => ({}))) as ShopifyState & { ok?: boolean };
      if (j.ok) setShopify(j);
    })();
    (async () => {
      const r = await fetch("/api/client-portal/budget");
      const j = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        summary?: {
          thisMonthCents: number;
          monthlyRecurringCents: number;
          byCategoryCents: Record<string, number>;
        };
      };
      if (j.ok && j.summary) setBudgetSummary(j.summary);
    })();
  }, []);

  if (!report) {
    return (
      <div className="text-center text-slate-500 py-16">Loading insights…</div>
    );
  }
  // Filter weekly_trend client-side based on range. Backend report is
  // weekly-anchored already, so date ranges below ~7d gracefully fall
  // back to showing the full 13-week trend.
  const trendByRange =
    range === "all"
      ? report.leads.weekly_trend
      : report.leads.weekly_trend.slice(
          range === "7d" ? -1 : range === "30d" ? -4 : -13,
        );
  const maxTrend = Math.max(...trendByRange.map((w) => w.count), 1);
  const maxHour = Math.max(...report.patterns.by_hour, 1);
  const maxDay = Math.max(...report.patterns.by_day_of_week, 1);

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-[11px] uppercase tracking-wider text-slate-500">
          Period: {new Date(report.period.start).toDateString()} → {new Date(report.period.end).toDateString()}
        </div>
        <div className="flex gap-1">
          {(
            [
              { id: "7d", label: "7d" },
              { id: "30d", label: "30d" },
              { id: "90d", label: "90d" },
              { id: "all", label: "All" },
            ] as const
          ).map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded border transition ${
                range === r.id
                  ? "bg-blue-500 border-blue-400 text-white"
                  : "border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shopify revenue strip */}
      <ShopifyStrip shopify={shopify} />

      {/* Headline grid · row 1 — pipeline outcomes */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard
          label="Total leads"
          value={report.leads.total}
          sub={`+${report.leads.new_this_week} this week`}
          accent="blue"
        />
        <StatCard
          label="Conversion rate"
          value={`${report.funnel.conversion_rate_pct.toFixed(1)}%`}
          sub={`${report.funnel.converted} converted`}
          accent="emerald"
        />
        <StatCard
          label="Pipeline value"
          value={`$${Math.round(pipelineValueUsd).toLocaleString()}`}
          sub="estimated"
          accent="amber"
        />
        <StatCard
          label="Avg reply time"
          value={
            report.funnel.avg_response_time_hours !== null
              ? formatHours(report.funnel.avg_response_time_hours)
              : "—"
          }
          sub="from first send"
          accent="violet"
        />
      </section>

      {/* Headline grid · row 2 — marketing efficiency
          Computed mix of REAL (reply rate, deal size, messages sent)
          and PLACEHOLDER (CPC, CPL — populate when ad accounts get
          wired). Honest "ad data pending" hint where data isn't there. */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(() => {
          const adSpendCents =
            (budgetSummary?.byCategoryCents?.["ads"] ?? 0) +
            (budgetSummary?.byCategoryCents?.["ad-spend"] ?? 0) +
            (budgetSummary?.byCategoryCents?.["meta-ads"] ?? 0) +
            (budgetSummary?.byCategoryCents?.["google-ads"] ?? 0);
          const totalSpendCents = budgetSummary?.thisMonthCents ?? 0;
          const newThisWeek = report.leads.new_this_week;
          // Approximate clicks from leads (assumes ~12% lead-rate from clicks)
          const estimatedClicks = newThisWeek > 0 ? Math.round(newThisWeek / 0.12) : 0;
          const cpc =
            adSpendCents > 0 && estimatedClicks > 0
              ? `$${(adSpendCents / 100 / estimatedClicks).toFixed(2)}`
              : "—";
          const cpl =
            totalSpendCents > 0 && newThisWeek > 0
              ? `$${(totalSpendCents / 100 / newThisWeek).toFixed(2)}`
              : "—";
          const replyRate =
            report.messages.sent > 0
              ? `${((report.funnel.responded / report.messages.sent) * 100).toFixed(1)}%`
              : "—";
          const avgDeal =
            report.funnel.converted > 0
              ? `$${Math.round(pipelineValueUsd / report.funnel.converted).toLocaleString()}`
              : "—";

          return (
            <>
              <StatCard
                label="Cost per click"
                value={cpc}
                sub={
                  cpc === "—" ? "Connect ad accounts" : "weekly · est"
                }
                accent="rose"
              />
              <StatCard
                label="Cost per lead"
                value={cpl}
                sub={
                  cpl === "—" ? "Awaiting spend data" : "this month"
                }
                accent="rose"
              />
              <StatCard
                label="Reply rate"
                value={replyRate}
                sub={
                  replyRate === "—"
                    ? "No sends yet"
                    : `${report.funnel.responded} of ${report.messages.sent}`
                }
                accent="sky"
              />
              <StatCard
                label="Avg deal size"
                value={avgDeal}
                sub={
                  avgDeal === "—"
                    ? "No closes yet"
                    : `from ${report.funnel.converted} closed`
                }
                accent="emerald"
              />
            </>
          );
        })()}
      </section>

      {/* Weekly trend chart */}
      <section>
        <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2.5">
          Lead volume — {range === "all" ? "all weeks" : `last ${range}`}
        </h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-end gap-1 h-24">
            {trendByRange.map((w) => (
              <div
                key={w.week}
                className="flex-1 flex flex-col items-center justify-end gap-1 group"
                title={`${w.week} · ${w.count} leads`}
              >
                <div className="text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition">
                  {w.count}
                </div>
                <div
                  className="w-full bg-blue-500/40 rounded-t group-hover:bg-blue-500"
                  style={{ height: `${(w.count / maxTrend) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-2">
            <span>{trendByRange[0]?.week.slice(5)}</span>
            <span>{trendByRange[trendByRange.length - 1]?.week.slice(5)}</span>
          </div>
        </div>
      </section>

      {/* Time patterns — when leads come in */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2">
            Leads by hour (UTC)
          </h3>
          <div className="flex items-end gap-0.5 h-20">
            {report.patterns.by_hour.map((c, h) => (
              <div
                key={h}
                className={`flex-1 rounded-t transition ${h === report.patterns.busiest_hour ? "bg-emerald-400" : "bg-slate-700"}`}
                style={{ height: `${(c / maxHour) * 100}%` }}
                title={`${h}:00 — ${c} leads`}
              />
            ))}
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            Busiest: <span className="text-emerald-300 font-bold">{report.patterns.busiest_hour}:00 UTC</span>
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2">
            Leads by day
          </h3>
          <div className="flex items-end gap-1 h-20">
            {report.patterns.by_day_of_week.map((c, d) => (
              <div
                key={d}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={`w-full rounded-t transition ${d === report.patterns.busiest_day ? "bg-emerald-400" : "bg-slate-700"}`}
                  style={{ height: `${(c / maxDay) * 100}%` }}
                  title={`${DAY_NAMES[d]} — ${c} leads`}
                />
                <div className="text-[9px] text-slate-500">{DAY_NAMES[d]}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            Busiest: <span className="text-emerald-300 font-bold">{DAY_NAMES[report.patterns.busiest_day]}</span>
          </div>
        </div>
      </section>

      {/* Sources + audiences */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-3">
            Top lead sources
          </h3>
          <BarList data={report.leads.bySource} labelMap={SOURCE_LABEL} />
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-3">
            Audience mix
          </h3>
          <BarList data={report.leads.byAudience} emojiMap={AUDIENCE_EMOJI} />
        </div>
      </section>

      {/* Funnel + messaging */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-3">
            Funnel performance
          </h3>
          <div className="space-y-2 text-sm">
            <FunnelStage label="In funnel" value={report.funnel.enrolled} max={report.leads.total} color="blue" />
            <FunnelStage label="Responded" value={report.funnel.responded} max={report.leads.total} color="emerald" />
            <FunnelStage label="Converted" value={report.funnel.converted} max={report.leads.total} color="amber" />
          </div>
          {report.funnel.top_template && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs">
              <div className="text-slate-500">Top performing template</div>
              <div className="font-mono text-slate-300 mt-1">{report.funnel.top_template.id}</div>
              <div className="text-emerald-300 mt-1">
                {report.funnel.top_template.rate_pct.toFixed(1)}% reply rate · {report.funnel.top_template.replies}/{report.funnel.top_template.sends} sends
              </div>
            </div>
          )}
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-3">
            Messages this week
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Mini label="Sent" value={report.messages.sent} accent="blue" />
            <Mini label="Failed" value={report.messages.failed} accent="rose" />
            <Mini label="Skipped" value={report.messages.skipped} accent="amber" />
          </div>
          <div className="space-y-1 text-xs">
            {Object.entries(report.messages.by_channel).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-500 capitalize">{k}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights + next moves */}
      {report.highlights.length > 0 && (
        <section className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4">
          <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-emerald-400 mb-2">
            ✓ This week
          </h3>
          <ul className="space-y-1.5 text-sm text-slate-200">
            {report.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="text-emerald-400">→</span>{h}
              </li>
            ))}
          </ul>
        </section>
      )}
      {report.next_actions.length > 0 && (
        <section className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4">
          <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-amber-400 mb-2">
            → Suggested next moves
          </h3>
          <ul className="space-y-1.5 text-sm text-slate-200">
            {report.next_actions.map((a) => (
              <li key={a} className="flex gap-2">
                <span className="text-amber-400">→</span>{a}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ─────────────────────────── LEADS TAB ─────────────────────────── */

function LeadsTab({
  leads,
  summary,
  onStatus,
  onMutate,
}: {
  leads: ClientLead[];
  summary: LeadsSummary | null;
  onStatus: (id: string, status: string) => void;
  onMutate: () => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const clearSelection = () => setSelected(new Set());

  const bulkAction = async (
    action: Record<string, unknown>,
    confirmText: string,
  ) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`${confirmText} ${ids.length} lead${ids.length === 1 ? "" : "s"}?`)) return;
    setBulkBusy(true);
    const r = await fetch("/api/client-portal/leads/bulk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids, action }),
    });
    setBulkBusy(false);
    if (r.ok) {
      clearSelection();
      onMutate();
    } else {
      const j = await r.json().catch(() => ({}));
      alert(j.error || "Bulk update failed.");
    }
  };

  // Active leads = everything except dismissed. The dismissed filter
  // shows ONLY dismissed (so an owner can restore a mistaken dismiss).
  // All other filters apply on top of "active" (i.e. they implicitly
  // exclude dismissed) so the pipeline stays clean.
  const activeLeads = leads.filter((l) => l.funnel_status !== "dismissed");
  const stageFiltered =
    filter === "all"
      ? activeLeads
      : filter === "dismissed"
        ? leads.filter((l) => l.funnel_status === "dismissed")
        : filter === "unread"
          ? activeLeads.filter(
              (l) => l.funnel_status === "responded" || l.funnel_status === "not_enrolled",
            )
          : filter === "uncontacted"
            ? activeLeads.filter((l) => (l.touch_count ?? 0) === 0)
            : activeLeads.filter((l) => l.funnel_status === filter);

  // Second filter axis — audience / category. Cuts across funnel stages
  // so an owner can see e.g. "all Coach leads regardless of stage" or
  // "all Won leads who came in as Players".
  const filtered =
    audienceFilter === "all"
      ? stageFiltered
      : audienceFilter === "untagged"
        ? stageFiltered.filter((l) => !l.audience_segment)
        : stageFiltered.filter((l) => l.audience_segment === audienceFilter);

  // Audiences present in the data — drives the filter pill row. Only
  // surfaces this row if 2+ audience tags exist (otherwise the filter
  // adds zero signal). Counts are computed against stageFiltered so they
  // reflect the currently-selected stage filter.
  const audienceCounts = new Map<string, number>();
  for (const l of stageFiltered) {
    const key = l.audience_segment ?? "untagged";
    audienceCounts.set(key, (audienceCounts.get(key) ?? 0) + 1);
  }
  const audienceOptions = Array.from(audienceCounts.entries())
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  const showAudienceRow = audienceOptions.length >= 2;

  const counts = {
    all: activeLeads.length,
    uncontacted:
      summary?.uncontacted ??
      activeLeads.filter((l) => (l.touch_count ?? 0) === 0).length,
    unread: activeLeads.filter(
      (l) => l.funnel_status === "responded" || l.funnel_status === "not_enrolled",
    ).length,
    enrolled: activeLeads.filter((l) => l.funnel_status === "enrolled").length,
    converted: activeLeads.filter((l) => l.funnel_status === "converted").length,
    dismissed: leads.filter((l) => l.funnel_status === "dismissed").length,
  };

  return (
    <div>
      {/* Funnel-stage filter (where they are in the journey) */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold shrink-0 hidden sm:inline">
          Stage
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "All" },
            { id: "uncontacted", label: "Uncontacted" },
            { id: "unread", label: "Needs attention" },
            { id: "enrolled", label: "In funnel" },
            { id: "converted", label: "Won" },
            { id: "dismissed", label: "Dismissed" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
                filter === f.id
                  ? "bg-blue-500 border-blue-400 text-white"
                  : "border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {f.label} · {counts[f.id as keyof typeof counts]}
            </button>
          ))}
        </div>
      </div>

      {/* Audience / category filter — orthogonal to stage. Only renders
          when 2+ audiences exist in the current stage filter (otherwise
          adds no signal and just clutters the UI). */}
      {showAudienceRow && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold shrink-0 hidden sm:inline">
            Category
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setAudienceFilter("all")}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
                audienceFilter === "all"
                  ? "bg-blue-500 border-blue-400 text-white"
                  : "border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              All audiences · {stageFiltered.length}
            </button>
            {audienceOptions.map(([aud, n]) => {
              const meta = AUDIENCE_FILTER_META[aud] ?? AUDIENCE_FILTER_META.unknown;
              const isActive = audienceFilter === aud;
              return (
                <button
                  key={aud}
                  onClick={() => setAudienceFilter(aud)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition inline-flex items-center gap-1 ${
                    isActive
                      ? `${meta.activeChip}`
                      : "border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>{meta.label} · {n}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!showAudienceRow && <div className="mb-4" />}

      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-16 border border-dashed border-slate-800 rounded-lg">
          <div className="text-4xl mb-2">📥</div>
          <p>No leads in this filter.</p>
        </div>
      ) : (
        <>
          {/* Bulk action toolbar — same pattern as TodoTab + admin */}
          {selected.size > 0 && (
            <div className="sticky top-[110px] z-10 mb-3 rounded-lg border border-blue-500/40 bg-blue-950/80 backdrop-blur p-3 flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-bold text-blue-200 mr-2">
                {selected.size} selected
              </span>
              <BulkBtn
                label="🏆 Mark won"
                disabled={bulkBusy}
                onClick={() => bulkAction({ kind: "status", status: "converted" }, "Mark won on")}
              />
              <BulkBtn
                label="💬 Mark responded"
                disabled={bulkBusy}
                onClick={() => bulkAction({ kind: "status", status: "responded" }, "Mark responded on")}
              />
              <BulkBtn
                label="▶ Start funnel"
                disabled={bulkBusy}
                onClick={() => bulkAction({ kind: "enroll" }, "Enroll in funnel for")}
              />
              <BulkBtn
                label="⏸ Pause"
                disabled={bulkBusy}
                onClick={() => bulkAction({ kind: "status", status: "paused" }, "Pause funnel on")}
              />
              <BulkBtn
                label="✕ Dismiss"
                disabled={bulkBusy}
                tone="amber"
                onClick={() =>
                  bulkAction(
                    { kind: "status", status: "dismissed" },
                    "Dismiss (hide from active views)",
                  )
                }
              />
              <span className="text-slate-600 mx-1">|</span>
              <BulkBtn
                label="✉ Log email"
                disabled={bulkBusy}
                onClick={() => bulkAction({ kind: "log_contact", channel: "email" }, "Log email touch on")}
              />
              <BulkBtn
                label="☎ Log call"
                disabled={bulkBusy}
                onClick={() => bulkAction({ kind: "log_contact", channel: "call" }, "Log call touch on")}
              />
              <BulkBtn
                label="💬 Log text"
                disabled={bulkBusy}
                onClick={() => bulkAction({ kind: "log_contact", channel: "sms" }, "Log text touch on")}
              />
              <button
                onClick={clearSelection}
                className="ml-auto text-[10px] font-bold text-slate-400 hover:text-white"
              >
                Clear ✕
              </button>
            </div>
          )}

          {/* Select-all helper */}
          <div className="flex items-center gap-2 mb-2 text-[11px] text-slate-500">
            <button
              onClick={() =>
                selected.size === filtered.length
                  ? clearSelection()
                  : setSelected(new Set(filtered.map((l) => l.id)))
              }
              className="font-bold text-slate-400 hover:text-white border border-slate-700 px-2 py-0.5 rounded"
            >
              {selected.size === filtered.length && filtered.length > 0
                ? "Clear all"
                : "Select all visible"}
            </button>
            <span>· {filtered.length} shown</span>
          </div>

          <div className="space-y-2">
            {filtered.map((l) => (
              <LeadCard
                key={l.id}
                lead={l}
                selected={selected.has(l.id)}
                onToggleSelect={() => toggleSelect(l.id)}
                onStatus={onStatus}
                onMutate={onMutate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────── BUDGET TAB ─────────────────────────── */

const BUDGET_CATEGORIES = [
  { id: "site", label: "Site / Build", emoji: "🌐" },
  { id: "ai-system", label: "AI System", emoji: "🤖" },
  { id: "ad-spend", label: "Ad Spend", emoji: "📣" },
  { id: "communication", label: "SMS / Email / Voice", emoji: "📞" },
  { id: "tools", label: "Tools & SaaS", emoji: "🛠️" },
  { id: "marketing", label: "Marketing / Print", emoji: "🖨️" },
  { id: "other", label: "Other", emoji: "💼" },
];

function fmtMoney(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: dollars >= 1000 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return cents < 0 ? `-${formatted}` : formatted;
}

function BudgetTab({
  items,
  summary,
  onMutate,
}: {
  items: BudgetItem[];
  summary: BudgetSummary | null;
  onMutate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "recurring" | "onetime">("all");

  const filtered =
    filter === "all"
      ? items
      : filter === "recurring"
        ? items.filter((i) => i.recurring_monthly)
        : items.filter((i) => !i.recurring_monthly);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-1">Budget &amp; investment</h2>
        <p className="text-[12px] text-slate-500 leading-relaxed max-w-xl">
          Track every dollar you&apos;re putting into your site + AI system,
          ad spend, tools, marketing. Add custom items any time.
          Recurring items roll up into your monthly total automatically.
        </p>
      </div>

      {/* Summary tiles */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCard
            label="This month"
            value={fmtMoney(summary.thisMonthCents)}
            sub={`${summary.itemCount} items`}
            accent="emerald"
          />
          <StatCard
            label="Monthly recurring"
            value={fmtMoney(summary.monthlyRecurringCents)}
            sub="MRR / spend"
            accent="blue"
          />
          <StatCard
            label="Last 12 months"
            value={fmtMoney(summary.last12MonthsCents)}
            sub="rolling total"
            accent="amber"
          />
          <StatCard
            label="Largest category"
            value={
              Object.entries(summary.byCategoryCents).sort(
                (a, b) => b[1] - a[1],
              )[0]?.[0] ?? "—"
            }
            sub={
              Object.entries(summary.byCategoryCents).sort(
                (a, b) => b[1] - a[1],
              )[0]
                ? fmtMoney(
                    Object.entries(summary.byCategoryCents).sort(
                      (a, b) => b[1] - a[1],
                    )[0]![1],
                  ) + " over 12mo"
                : ""
            }
            accent="violet"
          />
        </div>
      )}

      {/* Category breakdown bar */}
      {summary && Object.keys(summary.byCategoryCents).length > 0 && (
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-3">
            Breakdown · last 12 months
          </h3>
          <BarList
            data={summary.byCategoryCents}
            labelMap={Object.fromEntries(
              BUDGET_CATEGORIES.map((c) => [c.id, `${c.emoji} ${c.label}`]),
            )}
          />
        </section>
      )}

      {/* Filter chips + Add button */}
      <div className="flex gap-1.5 items-center flex-wrap">
        {[
          { id: "all", label: "All" },
          { id: "recurring", label: "Recurring" },
          { id: "onetime", label: "One-time" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
              filter === f.id
                ? "bg-blue-500 border-blue-400 text-white"
                : "border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setShowForm((x) => !x)}
          className="ml-auto text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded"
        >
          {showForm ? "× Cancel" : "+ Add line item"}
        </button>
      </div>

      {/* Inline new-item form */}
      {showForm && (
        <BudgetForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            onMutate();
          }}
        />
      )}

      {/* Item list */}
      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-16 border border-dashed border-slate-800 rounded-lg">
          <div className="text-4xl mb-2">💰</div>
          <p>
            {filter === "all"
              ? "No budget items yet. Add your first to start tracking."
              : "No items in this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((it) => (
            <BudgetRow key={it.id} item={it} onMutate={onMutate} />
          ))}
        </div>
      )}
    </div>
  );
}

function BudgetForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState(""); // dollars as string for nicer UX
  const [recurring, setRecurring] = useState(false);
  const [category, setCategory] = useState("tools");
  const [vendor, setVendor] = useState("");
  const [chargeDate, setChargeDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!label.trim()) {
      setErr("Label is required.");
      return;
    }
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!Number.isFinite(amountCents)) {
      setErr("Amount must be a number.");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/client-portal/budget", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        label: label.trim(),
        amount_cents: amountCents,
        recurring_monthly: recurring,
        category,
        vendor: vendor.trim() || null,
        charge_date: chargeDate,
        notes: notes.trim() || null,
      }),
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setBusy(false);
    if (j.ok) {
      onSaved();
    } else {
      setErr(j.error || "Couldn't save.");
    }
  };

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 block mb-1">
            Label
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Twilio SMS · Meta ad spend · Yard signs"
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm placeholder:text-slate-600"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 block mb-1">
            Amount (USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="49.00"
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm tabular-nums"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 block mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm"
          >
            {BUDGET_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 block mb-1">
            Vendor (optional)
          </label>
          <input
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="Twilio, Meta, Vistaprint..."
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm placeholder:text-slate-600"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 block mb-1">
            Charge date
          </label>
          <input
            type="date"
            value={chargeDate}
            onChange={(e) => setChargeDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            Recurring every month
          </label>
        </div>
      </div>
      <div>
        <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 block mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Account ID, plan name, anything you want to remember..."
          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm placeholder:text-slate-600"
        />
      </div>
      {err && <div className="text-rose-400 text-[11px]">{err}</div>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={busy}
          className="text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save item"}
        </button>
        <button
          onClick={onClose}
          className="text-[11px] font-bold text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function BudgetRow({
  item,
  onMutate,
}: {
  item: BudgetItem;
  onMutate: () => void;
}) {
  const cat = BUDGET_CATEGORIES.find((c) => c.id === item.category);
  const [busy, setBusy] = useState(false);
  const onDelete = async () => {
    if (!confirm(`Delete "${item.label}"? This can't be undone.`)) return;
    setBusy(true);
    await fetch(`/api/client-portal/budget/${item.id}`, { method: "DELETE" });
    setBusy(false);
    onMutate();
  };
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 flex items-center gap-3">
      <span className="text-2xl shrink-0">{cat?.emoji ?? "💼"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[14px]">{item.label}</span>
          {item.recurring_monthly && (
            <span className="text-[9px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
              monthly
            </span>
          )}
          {item.vendor && (
            <span className="text-[10px] text-slate-500">· {item.vendor}</span>
          )}
        </div>
        <div className="text-[11px] text-slate-500">
          {new Date(item.charge_date).toLocaleDateString()} · {cat?.label ?? item.category}
        </div>
        {item.notes && (
          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.notes}</div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="text-[15px] font-black text-white tabular-nums">
          {fmtMoney(item.amount_cents)}
          {item.recurring_monthly && (
            <span className="text-[10px] text-slate-500 font-normal"> /mo</span>
          )}
        </div>
        <button
          onClick={onDelete}
          disabled={busy}
          className="text-[10px] text-slate-500 hover:text-rose-400 transition disabled:opacity-50"
        >
          {busy ? "..." : "delete"}
        </button>
      </div>
    </article>
  );
}

/* ─────────────────────────── TO-DO TAB ─────────────────────────── */

function TodoTab({
  tasks,
  summary,
  onMutate,
}: {
  tasks: PortalTask[];
  summary: TasksSummary | null;
  onMutate: () => void;
}) {
  const [filter, setFilter] = useState<"open" | "all" | "done">("open");
  // Selection model — checkboxes select for bulk actions; they DO NOT
  // mark done. This mirrors the bluejays admin dashboard pattern so
  // owners can change many tasks at once and never accidentally
  // complete one with a stray click.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const filtered =
    filter === "all"
      ? tasks
      : filter === "done"
        ? tasks.filter((t) => t.status === "done")
        : tasks.filter((t) => t.status !== "done");

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const selectAllVisible = () => setSelected(new Set(filtered.map((t) => t.id)));
  const clearSelection = () => setSelected(new Set());

  const bulkApply = async (
    patch: { status?: PortalTask["status"]; owner?: "ben" },
    confirmText: string,
  ) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`${confirmText} ${ids.length} task${ids.length === 1 ? "" : "s"}?`)) return;
    setBulkBusy(true);
    const r = await fetch("/api/client-portal/tasks/bulk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids, patch }),
    });
    setBulkBusy(false);
    if (r.ok) {
      clearSelection();
      onMutate();
    } else {
      const j = await r.json().catch(() => ({}));
      alert(j.error || "Bulk update failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-1">Your to-do list</h2>
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Things we need from you to get the AI system fully turned on. Tap a
          task to expand, check the box to select multiple, then use the
          bulk-action bar to change them in one go. You and your co-founder
          share this list.
        </p>
      </div>

      {summary && summary.total > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <Mini label="Open" value={summary.pending + summary.in_progress + summary.blocked} accent="amber" />
          <Mini label="In progress" value={summary.in_progress} accent="blue" />
          <Mini label="Blocked" value={summary.blocked} accent="rose" />
          <Mini label="Done" value={summary.done} accent="emerald" />
        </div>
      )}

      <div className="flex gap-1.5 items-center flex-wrap">
        {[
          { id: "open", label: "Open" },
          { id: "done", label: "Done" },
          { id: "all", label: "All" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id as typeof filter); clearSelection(); }}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
              filter === f.id
                ? "bg-blue-500 border-blue-400 text-white"
                : "border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
        {filtered.length > 0 && (
          <button
            onClick={selected.size === filtered.length ? clearSelection : selectAllVisible}
            className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 hover:text-white"
          >
            {selected.size === filtered.length ? "Clear all" : "Select all visible"}
          </button>
        )}
      </div>

      {/* Bulk action toolbar — mirrors bluejays admin */}
      {selected.size > 0 && (
        <div className="sticky top-[110px] z-10 rounded-lg border border-blue-500/40 bg-blue-950/80 backdrop-blur p-3 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-bold text-blue-200 mr-2">
            {selected.size} selected
          </span>
          <BulkBtn
            label="✓ Mark done"
            disabled={bulkBusy}
            onClick={() => bulkApply({ status: "done" }, "Mark done on")}
          />
          <BulkBtn
            label="⏳ In progress"
            disabled={bulkBusy}
            onClick={() => bulkApply({ status: "in_progress" }, "Set in-progress on")}
          />
          <BulkBtn
            label="🚫 Blocked"
            disabled={bulkBusy}
            onClick={() => bulkApply({ status: "blocked" }, "Set blocked on")}
          />
          <BulkBtn
            label="○ Pending"
            disabled={bulkBusy}
            onClick={() => bulkApply({ status: "pending" }, "Reset to pending on")}
          />
          <span className="text-slate-600 mx-1">|</span>
          <BulkBtn
            label="↩ Send back to Ben"
            disabled={bulkBusy}
            tone="amber"
            onClick={() => bulkApply({ owner: "ben" }, "Hand back to Ben for")}
          />
          <button
            onClick={clearSelection}
            className="ml-auto text-[10px] font-bold text-slate-400 hover:text-white"
          >
            Clear ✕
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-16 border border-dashed border-slate-800 rounded-lg">
          <div className="text-4xl mb-2">🎉</div>
          <p>{filter === "open" ? "Nothing on your plate. Nice work." : "No tasks here."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              selected={selected.has(t.id)}
              onToggleSelect={() => toggleSelect(t.id)}
              onMutate={onMutate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BulkBtn({
  label,
  onClick,
  disabled,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "amber";
}) {
  const colors =
    tone === "amber"
      ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40"
      : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-[11px] font-bold px-2.5 py-1.5 rounded border ${colors} transition disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

function TaskCard({
  task,
  selected,
  onToggleSelect,
  onMutate,
}: {
  task: PortalTask;
  selected: boolean;
  onToggleSelect: () => void;
  onMutate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const setStatus = async (status: PortalTask["status"]) => {
    setSavingStatus(status);
    setMsg(null);
    const r = await fetch(`/api/client-portal/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setSavingStatus(null);
    if (j.ok) {
      onMutate();
    } else {
      setMsg(j.error || "Couldn't update.");
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    setMsg(null);
    const r = await fetch(`/api/client-portal/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setSavingNotes(false);
    if (j.ok) {
      setMsg("Saved — Ben will see it.");
      onMutate();
      setTimeout(() => setMsg(null), 2200);
    } else {
      setMsg(j.error || "Couldn't save.");
    }
  };

  return (
    <article
      className={`rounded-lg border bg-slate-900/40 transition ${
        selected ? "border-blue-400/60 ring-1 ring-blue-400/30" : "border-slate-800"
      }`}
    >
      {/* Checkbox = SELECTION ONLY. It does NOT mark done — that
          would let a stray click "complete" a task. To mark done, use
          the explicit button inside the expanded card OR the
          "Mark done" bulk action above. */}
      <div className="p-4 flex items-start gap-3">
        <label
          className="mt-1 cursor-pointer select-none"
          onClick={(e) => e.stopPropagation()}
          title="Select for bulk actions"
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 accent-blue-500 cursor-pointer"
            aria-label={`Select task ${task.title}`}
          />
        </label>
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          className="flex-1 min-w-0 text-left flex items-start gap-3 hover:opacity-90 transition"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-semibold text-[15px] ${task.status === "done" ? "line-through text-slate-500" : ""}`}
              >
                {task.title}
              </span>
              <span
                className={`text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded ${TASK_STATUS_COLOR[task.status]}`}
              >
                {task.status.replace("_", " ")}
              </span>
              {task.priority !== "medium" && task.priority !== "low" && (
                <span
                  className={`text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded ${TASK_PRIORITY_COLOR[task.priority]}`}
                >
                  {task.priority}
                </span>
              )}
            </div>
            {task.notes && !expanded && (
              <div className="text-[11px] text-amber-300 mt-1 truncate">
                📝 {task.notes}
              </div>
            )}
          </div>
          <span className="text-slate-600 text-[10px] shrink-0 mt-1">
            {expanded ? "▴" : "▾"}
          </span>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 p-4 space-y-3">
          {task.description && (
            <pre className="text-[12px] leading-relaxed text-slate-300 whitespace-pre-wrap font-sans bg-slate-950/40 border border-slate-800 rounded p-3">
              {task.description}
            </pre>
          )}

          {/* Status flips + send-back */}
          <div>
            <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 block mb-1.5">
              Mark progress
            </label>
            <div className="flex flex-wrap gap-1 items-center">
              {(["pending", "in_progress", "blocked", "done"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  disabled={task.status === s || savingStatus !== null}
                  className={`text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded transition ${
                    task.status === s
                      ? TASK_STATUS_COLOR[s] + " cursor-default"
                      : "border border-slate-700 text-slate-500 hover:text-white"
                  } ${savingStatus === s ? "opacity-60" : ""}`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
              <button
                onClick={async () => {
                  if (!confirm("Hand this task back to Ben? It'll disappear from your to-do.")) return;
                  setSavingStatus("ben");
                  await fetch(`/api/client-portal/tasks/${task.id}`, {
                    method: "PATCH",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ owner: "ben" }),
                  });
                  setSavingStatus(null);
                  onMutate();
                }}
                disabled={savingStatus !== null}
                className="ml-auto text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded border border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition disabled:opacity-50"
                title="If you can't do this, send it back to Ben."
              >
                ↩ Send back to Ben
              </button>
            </div>
          </div>

          {/* Notes — used to paste in Pixel IDs, Clarity IDs, etc. */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
                Reply / paste here
              </label>
              {msg && (
                <span className="text-[10px] text-emerald-400">{msg}</span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Paste in the Clarity Project ID, Pixel ID, or any reply you want Ben to see."
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm placeholder:text-slate-600 focus:border-slate-600 outline-none"
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes || notes === (task.notes ?? "")}
              className="mt-2 text-[11px] font-bold bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded disabled:opacity-50"
            >
              {savingNotes ? "Saving…" : "Send to Ben"}
            </button>
          </div>

          {task.completed_at && (
            <div className="text-[10px] text-slate-500">
              ✓ Completed {new Date(task.completed_at).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ─────────────────────────── LEAD CARD ─────────────────────────── */

/**
 * LeadTimeline — funnel-step + touchpoint history for one lead. Renders
 * every client_lead_messages row (outbound funnel sends + inbound replies)
 * as a vertical timeline, plus a header strip showing current funnel
 * step / status.
 */
function LeadTimeline({
  timeline,
  funnelStatus,
  funnelStep,
}: {
  timeline: LeadMessage[] | null;
  funnelStatus: string;
  funnelStep: number | null;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
          Funnel timeline
        </span>
        <span className="text-[10px] text-slate-500">
          {funnelStep !== null ? `Step ${funnelStep} · ` : ""}
          <span
            className={`font-bold ${
              STATUS_COLOR[funnelStatus]
                ? STATUS_COLOR[funnelStatus].split(" ")[1]
                : "text-slate-300"
            }`}
          >
            {funnelStatus.replace(/_/g, " ")}
          </span>
        </span>
      </div>
      {timeline === null ? (
        <p className="text-[11px] text-slate-500 italic py-2 text-center">
          Loading touchpoints…
        </p>
      ) : timeline.length === 0 ? (
        <p className="text-[11px] text-slate-500 italic py-2 text-center">
          No touches yet. Enroll the lead to start the funnel.
        </p>
      ) : (
        <ol className="space-y-2 relative pl-4">
          {/* Vertical rail */}
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-1.5 w-px bg-slate-700"
          />
          {timeline.map((m) => {
            const isInbound = m.direction === "inbound";
            const dotColor = isInbound
              ? "bg-emerald-400"
              : m.status === "sent" || m.status === "delivered"
                ? "bg-blue-400"
                : m.status === "failed" || m.status === "bounced"
                  ? "bg-rose-400"
                  : m.status === "skipped"
                    ? "bg-slate-500"
                    : "bg-amber-400";
            const channelEmoji =
              m.channel === "email" ? "✉" : m.channel === "sms" ? "💬" : "🎙";
            return (
              <li key={m.id} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[10px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${dotColor}`}
                />
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-white">
                    {channelEmoji} {isInbound ? "← inbound" : "→ outbound"}
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      m.status === "sent" || m.status === "delivered" || m.status === "replied"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : m.status === "failed" || m.status === "bounced"
                          ? "bg-rose-500/20 text-rose-300"
                          : m.status === "skipped"
                            ? "bg-slate-700/40 text-slate-400"
                            : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {m.status}
                  </span>
                  {m.funnel_step !== null && (
                    <span className="text-[9px] uppercase tracking-wider text-slate-500">
                      step {m.funnel_step}
                    </span>
                  )}
                  {m.template_id && (
                    <span className="text-[9px] text-slate-500 font-mono">
                      {m.template_id}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 ml-auto">
                    {timeAgo(m.sent_at)}
                  </span>
                </div>
                {m.subject && (
                  <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                    {m.subject}
                  </p>
                )}
                {m.body && (
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                    {m.body}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function LeadCard({
  lead,
  selected,
  onToggleSelect,
  onStatus,
  onMutate,
}: {
  lead: ClientLead;
  selected: boolean;
  onToggleSelect: () => void;
  onStatus: (id: string, status: string) => void;
  onMutate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesMsg, setNotesMsg] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReplyDraft | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [draftErr, setDraftErr] = useState<string | null>(null);
  const [ownerCtx, setOwnerCtx] = useState("");
  const [copied, setCopied] = useState(false);
  const [logging, setLogging] = useState<string | null>(null);
  const [logMsg, setLogMsg] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [timeline, setTimeline] = useState<LeadMessage[] | null>(null);

  // Lazy-load the touchpoint timeline when the card expands.
  useEffect(() => {
    if (!expanded || timeline !== null) return;
    let cancelled = false;
    fetch(`/api/client-portal/leads/${lead.id}`)
      .then((r) => r.json())
      .then((j: { ok: boolean; messages?: LeadMessage[] }) => {
        if (!cancelled && j.ok) setTimeline(j.messages ?? []);
      })
      .catch(() => {
        if (!cancelled) setTimeline([]);
      });
    return () => {
      cancelled = true;
    };
  }, [expanded, lead.id, timeline]);

  const logContact = async (channel: "email" | "sms" | "call") => {
    setLogging(channel);
    setLogMsg(null);
    const r = await fetch(`/api/client-portal/leads/${lead.id}/log-contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channel }),
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setLogging(null);
    if (j.ok) {
      setLogMsg(`✓ ${channel} logged`);
      onMutate();
      setTimeout(() => setLogMsg(null), 1800);
    } else {
      setLogMsg(j.error || "Couldn't log.");
    }
  };

  const enrollInFunnel = async () => {
    if (!confirm("Start the automated funnel for this lead?")) return;
    setEnrolling(true);
    const r = await fetch(`/api/client-portal/leads/${lead.id}/enroll`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setEnrolling(false);
    if (j.ok) onMutate();
    else alert(j.error || "Couldn't enroll.");
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    setNotesMsg(null);
    const r = await fetch(`/api/client-portal/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setSavingNotes(false);
    setNotesMsg(j.ok ? "Saved." : j.error || "Couldn't save.");
    setTimeout(() => setNotesMsg(null), 2000);
    if (j.ok) onMutate(); // refresh the parent list so the 📝 note badge appears
  };

  const draftReply = async () => {
    setDrafting(true);
    setDraftErr(null);
    setDraft(null);
    const r = await fetch("/api/client-portal/ai-reply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lead_id: lead.id, owner_context: ownerCtx || undefined }),
    });
    const j = (await r.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      draft?: ReplyDraft;
      upgrade_required?: boolean;
    };
    setDrafting(false);
    if (j.ok && j.draft) {
      setDraft(j.draft);
    } else {
      setDraftErr(
        j.upgrade_required
          ? "AI replies need a Claude subscription. Email Ben to enable."
          : j.error || "Draft failed.",
      );
    }
  };

  const copyDraft = async () => {
    if (!draft) return;
    await navigator.clipboard.writeText(draft.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Audience-driven theming — left accent strip + soft tint so the
  // pipeline reads color-coded at a glance.
  const audKey = (lead.audience_segment ?? "unknown") as keyof typeof AUDIENCE_COLOR;
  const aud = AUDIENCE_COLOR[audKey] ?? AUDIENCE_COLOR.unknown;
  const isDismissed = lead.funnel_status === "dismissed";

  return (
    <article
      className={`relative rounded-lg border transition overflow-hidden ${
        selected
          ? "border-blue-400/60 ring-1 ring-blue-400/30"
          : `${aud.ring}`
      } ${aud.bg} ${isDismissed ? "opacity-50" : ""}`}
    >
      {/* Left audience accent strip — 4px color bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-1"
        style={{ background: aud.accent }}
      />
      <div className="flex items-start gap-2 p-4 pl-5">
        {/* Checkbox = SELECT for bulk actions. Lives outside the
            expand-button so a stray click on the row never selects
            (or worse, mutates) the lead. */}
        <label
          className="mt-1.5 cursor-pointer select-none shrink-0"
          onClick={(e) => e.stopPropagation()}
          title="Select for bulk actions"
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 accent-blue-500 cursor-pointer"
            aria-label={`Select lead ${lead.name ?? lead.email ?? ""}`}
          />
        </label>
      <button
        onClick={() => setExpanded((x) => !x)}
        className="flex-1 min-w-0 text-left flex items-start gap-3 hover:opacity-95 transition"
      >
        <span className="text-2xl mt-0.5">
          {audienceEmoji(lead.audience_segment, lead.source)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[15px]">
              {lead.name || "(no name)"}
            </span>
            {lead.audience_segment && (
              <span
                className={`text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded ${aud.chip}`}
              >
                {lead.audience_segment}
              </span>
            )}
            <span
              className={`text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded ${STATUS_COLOR[lead.funnel_status] ?? STATUS_COLOR.not_enrolled}`}
            >
              {lead.funnel_status.replace("_", " ")}
            </span>
            {lead.notes && (
              <span className="text-[10px] tracking-wider uppercase font-bold text-amber-300">
                📝 note
              </span>
            )}
            {(lead.touch_count ?? 0) > 0 ? (
              <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                ✓ contacted · {lead.touch_count}
              </span>
            ) : (
              <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                · uncontacted
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
            {lead.email && <span>✉ {lead.email}</span>}
            {lead.phone && <span>☎ {lead.phone}</span>}
            {lead.source && (
              <span className="text-slate-500">
                from {SOURCE_LABEL[lead.source] ?? lead.source}
              </span>
            )}
          </div>
          {lead.intent && (
            <div className="mt-1.5 text-[12px] text-slate-300">
              <span className="text-slate-500">Wants:</span> {lead.intent}
            </div>
          )}
        </div>
        <div className="text-[10px] text-slate-500 shrink-0 flex flex-col items-end gap-1">
          <span>{timeAgo(lead.created_at)}</span>
          <span className="text-slate-600">{expanded ? "▴" : "▾"}</span>
        </div>
      </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 p-4 space-y-4">
          {/* Funnel-step timeline — every outbound + inbound message linked
              to this lead, in order. Loaded lazily on expand. Proves to
              the owner that every step is tracked. */}
          <LeadTimeline
            timeline={timeline}
            funnelStatus={lead.funnel_status}
            funnelStep={lead.funnel_step}
          />

          {/* Contact + log — clicking opens the native handler AND records
              the touch in client_lead_messages so the "Contacted" stat
              counts it. Tap "Just log it" to record without opening
              email/SMS app (e.g. when you've already reached out). */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
                Contact &amp; log
              </label>
              {logMsg && (
                <span className="text-[10px] text-emerald-400">{logMsg}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  onClick={() => logContact("email")}
                  className="text-[11px] font-bold border border-slate-700 px-2.5 py-1.5 rounded hover:bg-slate-800"
                >
                  ✉ Email {logging === "email" && "…"}
                </a>
              )}
              {lead.phone && (
                <>
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={() => logContact("call")}
                    className="text-[11px] font-bold border border-slate-700 px-2.5 py-1.5 rounded hover:bg-slate-800"
                  >
                    ☎ Call {logging === "call" && "…"}
                  </a>
                  <a
                    href={`sms:${lead.phone}`}
                    onClick={() => logContact("sms")}
                    className="text-[11px] font-bold border border-slate-700 px-2.5 py-1.5 rounded hover:bg-slate-800"
                  >
                    💬 Text {logging === "sms" && "…"}
                  </a>
                </>
              )}
            </div>
            <div className="flex gap-1 mt-2">
              <span className="text-[10px] text-slate-500 self-center mr-1">
                Just log it:
              </span>
              {lead.email && (
                <button
                  onClick={() => logContact("email")}
                  disabled={logging !== null}
                  className="text-[10px] font-bold text-slate-400 hover:text-white border border-slate-700 px-2 py-0.5 rounded disabled:opacity-50"
                >
                  ✉ email
                </button>
              )}
              {lead.phone && (
                <>
                  <button
                    onClick={() => logContact("call")}
                    disabled={logging !== null}
                    className="text-[10px] font-bold text-slate-400 hover:text-white border border-slate-700 px-2 py-0.5 rounded disabled:opacity-50"
                  >
                    ☎ call
                  </button>
                  <button
                    onClick={() => logContact("sms")}
                    disabled={logging !== null}
                    className="text-[10px] font-bold text-slate-400 hover:text-white border border-slate-700 px-2 py-0.5 rounded disabled:opacity-50"
                  >
                    💬 text
                  </button>
                </>
              )}
            </div>
            {(lead.touch_channels?.length ?? 0) > 0 && (
              <div className="mt-2 text-[10px] text-slate-500">
                History: {lead.touch_count} touch{lead.touch_count === 1 ? "" : "es"}{" "}
                ({lead.touch_channels?.join(", ")})
              </div>
            )}
          </div>

          {/* Status flips + manual enroll + dismiss */}
          <div className="flex flex-wrap gap-1 items-center">
            {["enrolled", "paused", "responded", "converted"].map((s) => (
              <button
                key={s}
                onClick={() => onStatus(lead.id, s)}
                disabled={lead.funnel_status === s}
                className={`text-[10px] tracking-wider uppercase font-bold px-2 py-1 rounded transition ${
                  lead.funnel_status === s
                    ? STATUS_COLOR[s] + " cursor-default"
                    : "border border-slate-700 text-slate-500 hover:text-white"
                }`}
              >
                {s === "converted" ? "Won" : s}
              </button>
            ))}
            {/* Dismiss — for spam / bot submissions / not-a-real-lead.
                Doesn't delete; just hides from the active filter set
                so the pipeline stays clean. Restoreable via the All
                or Dismissed filter. */}
            <button
              onClick={() => {
                if (
                  confirm(
                    "Dismiss this lead? It'll be hidden from active filters but the record stays in your DB and you can restore it via the Dismissed filter.",
                  )
                ) {
                  onStatus(lead.id, "dismissed");
                }
              }}
              disabled={lead.funnel_status === "dismissed"}
              className={`text-[10px] tracking-wider uppercase font-bold px-2 py-1 rounded transition ${
                lead.funnel_status === "dismissed"
                  ? STATUS_COLOR.dismissed + " cursor-default"
                  : "border border-rose-500/40 text-rose-300 hover:bg-rose-500/15"
              }`}
              title="Hide spam / not-a-real-lead from active views"
            >
              ✕ Dismiss
            </button>
            {lead.funnel_status !== "enrolled" && lead.funnel_status !== "dismissed" && (
              <button
                onClick={enrollInFunnel}
                disabled={enrolling}
                className="ml-auto text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-400 text-white disabled:opacity-60"
                title="Kick off the automated email/SMS sequence for this lead."
              >
                {enrolling ? "Enrolling…" : "▶ Start funnel"}
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
                Your notes
              </label>
              {notesMsg && (
                <span className="text-[10px] text-emerald-400">{notesMsg}</span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Called Tuesday — said he'd think about it. Follow up Friday."
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm placeholder:text-slate-600 focus:border-slate-600 outline-none"
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes || notes === (lead.notes ?? "")}
              className="mt-2 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded disabled:opacity-50"
            >
              {savingNotes ? "Saving…" : "Save note"}
            </button>
          </div>

          {/* AI reply draft */}
          <div className="rounded-md border border-violet-500/20 bg-violet-950/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-violet-300">
                ✨ Draft a reply with Claude
              </div>
              {draft && (
                <button
                  onClick={copyDraft}
                  className="text-[10px] font-bold border border-violet-500/40 text-violet-200 px-2 py-0.5 rounded hover:bg-violet-500/20"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            {!draft && (
              <>
                <input
                  value={ownerCtx}
                  onChange={(e) => setOwnerCtx(e.target.value)}
                  placeholder="Optional: extra context (e.g. 'they called yesterday')"
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-[12px] placeholder:text-slate-600 outline-none mb-2"
                />
                <button
                  onClick={draftReply}
                  disabled={drafting}
                  className="text-[11px] font-bold bg-violet-500 hover:bg-violet-400 text-white px-3 py-1.5 rounded disabled:opacity-60"
                >
                  {drafting ? "Drafting…" : "Generate draft"}
                </button>
              </>
            )}
            {draftErr && (
              <div className="text-[11px] text-rose-300 mt-1">{draftErr}</div>
            )}
            {draft && (
              <div className="space-y-2">
                {draft.subject && (
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Subject:</span>{" "}
                    <span className="font-semibold text-slate-200">
                      {draft.subject}
                    </span>
                  </div>
                )}
                <div className="text-[11px] text-slate-500">
                  Channel: <span className="text-slate-300">{draft.channel}</span>
                </div>
                <pre className="text-[13px] leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/60 border border-slate-800 rounded p-3">
                  {draft.body}
                </pre>
                {draft.rationale && (
                  <div className="text-[10px] text-slate-500 italic">
                    Why: {draft.rationale}
                  </div>
                )}
                <button
                  onClick={() => {
                    setDraft(null);
                    setOwnerCtx("");
                  }}
                  className="text-[10px] text-slate-500 hover:text-white underline"
                >
                  Generate a different draft
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/* ─────────────────────────── ACCOUNT TAB ─────────────────────────── */

function AccountTab({
  owner,
  subs,
  onLogout,
}: {
  owner: Owner;
  subs: Subscription[];
  onLogout: () => void;
}) {
  const [prefs, setPrefs] = useState<OwnerPrefs | null>(null);
  const [prefsMsg, setPrefsMsg] = useState<string | null>(null);
  const [shopify, setShopify] = useState<ShopifyState | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/client-portal/preferences");
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; preferences?: OwnerPrefs };
      if (j.ok && j.preferences) setPrefs(j.preferences);
    })();
    (async () => {
      const r = await fetch("/api/client-portal/shopify");
      const j = (await r.json().catch(() => ({}))) as ShopifyState & { ok?: boolean };
      if (j.ok) setShopify(j);
    })();
  }, []);

  const updatePrefs = async (patch: Partial<OwnerPrefs>) => {
    if (!prefs) return;
    const optimistic = { ...prefs, ...patch };
    setPrefs(optimistic);
    setPrefsMsg(null);
    const r = await fetch("/api/client-portal/preferences", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = (await r.json().catch(() => ({}))) as {
      ok?: boolean;
      preferences?: OwnerPrefs;
      error?: string;
    };
    if (j.ok && j.preferences) {
      setPrefs(j.preferences);
      setPrefsMsg("Saved.");
      setTimeout(() => setPrefsMsg(null), 1500);
    } else {
      setPrefsMsg(j.error || "Couldn't save.");
    }
  };

  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) {
      setMsg({ kind: "err", text: "New password must be at least 8 characters." });
      return;
    }
    if (next !== confirm) {
      setMsg({ kind: "err", text: "Passwords don't match." });
      return;
    }
    setSubmitting(true);
    const r = await fetch("/api/client-portal/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword: cur, newPassword: next }),
    });
    const j = (await r.json()) as { ok: boolean; error?: string };
    setSubmitting(false);
    if (j.ok) {
      setMsg({ kind: "ok", text: "Password updated." });
      setCur(""); setNext(""); setConfirm("");
    } else {
      setMsg({ kind: "err", text: j.error || "Couldn't update password." });
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      <section>
        <h2 className="text-sm font-bold mb-3">Your account</h2>
        <div className="space-y-1 text-sm">
          <div><span className="text-slate-500">Name:</span> {owner.name || "—"}</div>
          <div><span className="text-slate-500">Email:</span> {owner.email}</div>
          <div><span className="text-slate-500">Role:</span> {owner.role}</div>
          {owner.last_login_at && (
            <div>
              <span className="text-slate-500">Last login:</span>{" "}
              {new Date(owner.last_login_at).toLocaleString()}
            </div>
          )}
        </div>
      </section>

      {subs.length > 0 && (
        <section>
          <h2 className="text-sm font-bold mb-3">Active subscriptions</h2>
          <div className="space-y-2 text-sm">
            {subs
              .filter((s) => s.status === "active" || s.status === "trialing")
              .map((s) => (
                <div
                  key={s.id}
                  className="border border-slate-800 bg-slate-900/40 rounded p-3 flex items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="font-semibold capitalize">
                      {s.service} <span className="text-slate-400 font-normal text-[12px]">· {s.tier}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {s.managed_by === "bluejays" ? "Managed for you" : "Owned by you"}
                    </div>
                  </div>
                  <div className="text-right">
                    {s.monthly_price_usd !== null && (
                      <div className="text-sm font-bold">
                        {s.monthly_price_usd === 0 ? "Free" : `$${s.monthly_price_usd}/mo`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            <p className="text-[11px] text-slate-500 mt-2">
              To upgrade or change your plan, email{" "}
              <a href="mailto:bluejaycontactme@gmail.com" className="text-blue-400 hover:underline">
                bluejaycontactme@gmail.com
              </a>
            </p>
          </div>
        </section>
      )}

      {/* NOTIFICATION PREFERENCES */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">Notifications</h2>
          {prefsMsg && (
            <span className="text-[11px] text-emerald-400">{prefsMsg}</span>
          )}
        </div>
        {!prefs ? (
          <div className="text-[11px] text-slate-500">Loading…</div>
        ) : (
          <div className="space-y-4 border border-slate-800 bg-slate-900/40 rounded p-4">
            <PrefRow
              label="New lead emails"
              hint="Get an email the moment a lead lands, a once-a-day digest, or nothing."
              value={prefs.new_lead_email}
              onChange={(v) => updatePrefs({ new_lead_email: v })}
            />
            <PrefRow
              label="New lead texts"
              hint="Same — but to your phone. (Requires Twilio on your plan.)"
              value={prefs.new_lead_sms}
              onChange={(v) => updatePrefs({ new_lead_sms: v })}
            />
            {(prefs.new_lead_email === "digest" || prefs.new_lead_sms === "digest") && (
              <div className="pt-2 border-t border-slate-800">
                <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
                  Digest hour ({prefs.digest_timezone})
                </label>
                <select
                  value={prefs.digest_hour}
                  onChange={(e) => updatePrefs({ digest_hour: Number(e.target.value) })}
                  className="mt-1.5 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {h === 0 ? "12:00 AM" : h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SHOPIFY CONNECTION */}
      <section>
        <h2 className="text-sm font-bold mb-3">Connect your Shopify store</h2>
        {shopify?.connected ? (
          <div className="border border-emerald-500/30 bg-emerald-950/20 rounded p-4 text-sm space-y-1">
            <div className="font-semibold text-emerald-300">
              ✓ Connected
            </div>
            <div className="text-[12px] text-slate-400">{shopify.store_url}</div>
            {shopify.cached_at && (
              <div className="text-[11px] text-slate-500">
                Last sync: {new Date(shopify.cached_at).toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          <div className="border border-slate-800 bg-slate-900/40 rounded p-4 space-y-2 text-sm">
            <div className="font-semibold">Pull revenue + AOV into your dashboard</div>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              Hook up your Shopify store and we&apos;ll surface your revenue,
              average order value, top product, and repeat-customer rate
              right alongside your leads — so you can see which campaigns
              are actually moving sales.
            </p>
            <div className="text-[11px] text-amber-300">
              When you&apos;re ready, email{" "}
              <a href="mailto:bluejaycontactme@gmail.com" className="underline">
                bluejaycontactme@gmail.com
              </a>{" "}
              and Ben will turn this on for you.
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold mb-3">Change password</h2>
        <form onSubmit={submit} className="space-y-3" autoComplete="off">
          <input
            type="password"
            value={cur}
            onChange={(e) => setCur(e.target.value)}
            placeholder="Current password"
            autoComplete="off"
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-md px-4 py-2.5 text-sm"
          />
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="New password (8+ chars)"
            autoComplete="new-password"
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-md px-4 py-2.5 text-sm"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-md px-4 py-2.5 text-sm"
          />
          {msg && (
            <div className={`text-xs ${msg.kind === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
              {msg.text}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm py-2.5 px-4 rounded-md disabled:opacity-60"
          >
            {submitting ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>

      <button
        onClick={onLogout}
        className="text-xs text-rose-400 hover:text-rose-300 underline"
      >
        Sign out
      </button>
    </div>
  );
}

/* ─────────────────────────── ATOMS ─────────────────────────── */

function StatCard({
  label,
  value,
  sub,
  accent = "slate",
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: "slate" | "blue" | "emerald" | "amber" | "violet" | "rose" | "sky";
}) {
  const colors: Record<string, string> = {
    slate: "bg-slate-900 border-slate-800",
    blue: "bg-blue-950/40 border-blue-500/30",
    emerald: "bg-emerald-950/40 border-emerald-500/30",
    amber: "bg-amber-950/40 border-amber-500/30",
    violet: "bg-violet-950/40 border-violet-500/30",
    rose: "bg-rose-950/40 border-rose-500/30",
    sky: "bg-sky-950/40 border-sky-500/30",
  };
  return (
    <div className={`rounded-lg border p-3 sm:p-4 ${colors[accent]}`}>
      <div className="text-[10px] tracking-wider uppercase font-bold text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl sm:text-3xl font-black tracking-tighter">
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-slate-500 mt-0.5 truncate">{sub}</div>
      )}
    </div>
  );
}

function Mini({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: number;
  accent?: "slate" | "blue" | "emerald" | "amber" | "rose";
}) {
  const colors: Record<string, string> = {
    slate: "bg-slate-800",
    blue: "bg-blue-950/60 border-blue-500/30",
    emerald: "bg-emerald-950/60 border-emerald-500/30",
    amber: "bg-amber-950/60 border-amber-500/30",
    rose: "bg-rose-950/60 border-rose-500/30",
  };
  return (
    <div className={`rounded p-2 text-center border border-slate-800 ${colors[accent]}`}>
      <div className="text-lg font-black tracking-tighter">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  );
}

function BarList({
  data,
  labelMap,
  emojiMap,
}: {
  data: Record<string, number>;
  labelMap?: Record<string, string>;
  emojiMap?: Record<string, string>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return (
    <div className="space-y-2">
      {entries.map(([k, v]) => {
        const pct = (v / total) * 100;
        return (
          <div key={k}>
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                {emojiMap?.[k] && <span>{emojiMap[k]}</span>}
                {labelMap?.[k] ?? k}
              </span>
              <span className="text-slate-500 tabular-nums">
                {v} <span className="text-slate-600">·</span> {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded">
              <div
                className="h-full bg-blue-500 rounded transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FunnelStage({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: "blue" | "emerald" | "amber";
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const colors: Record<string, string> = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  };
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500 tabular-nums">
          {value} <span className="text-slate-600">·</span> {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded">
        <div className={`h-full ${colors[color]} rounded`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg border border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900 p-3 flex items-center gap-2 transition text-sm"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-semibold truncate">{label}</span>
    </a>
  );
}

function ShopifyStrip({ shopify }: { shopify: ShopifyState | null }) {
  if (!shopify) return null;
  if (!shopify.connected) {
    return (
      <section className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-4 flex items-center gap-3">
        <span className="text-2xl">🛒</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold">Connect Shopify for live revenue</div>
          <div className="text-[11px] text-slate-500">
            See revenue, AOV, top product, and repeat-rate alongside your leads.
            Email Ben to flip it on.
          </div>
        </div>
        <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500">
          Not connected
        </span>
      </section>
    );
  }
  const m = shopify.metrics;
  const dollars = (cents?: number) =>
    cents === undefined ? "—" : `$${Math.round(cents / 100).toLocaleString()}`;
  return (
    <section>
      <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2.5 flex items-center gap-2">
        🛒 Shopify · last 30 days
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Revenue 30d" value={dollars(m.revenue_30d_cents)} sub={`${m.orders_30d ?? 0} orders`} accent="emerald" />
        <StatCard label="Revenue 7d" value={dollars(m.revenue_7d_cents)} sub={`${m.orders_7d ?? 0} orders`} accent="blue" />
        <StatCard label="AOV" value={dollars(m.aov_cents)} sub="per order" accent="amber" />
        <StatCard
          label="Repeat rate"
          value={m.repeat_rate !== undefined ? `${Math.round(m.repeat_rate * 100)}%` : "—"}
          sub={m.top_product ? `Top: ${m.top_product.name}` : "second-time buyers"}
          accent="violet"
        />
      </div>
    </section>
  );
}

function PrefRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: NotificationMode;
  onChange: (v: NotificationMode) => void;
}) {
  const opts: { id: NotificationMode; label: string }[] = [
    { id: "instant", label: "Instant" },
    { id: "digest", label: "Daily digest" },
    { id: "off", label: "Off" },
  ];
  return (
    <div>
      <div className="text-sm font-semibold">{label}</div>
      {hint && <div className="text-[11px] text-slate-500 mb-2">{hint}</div>}
      <div className="flex gap-1">
        {opts.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`flex-1 text-[11px] font-bold py-1.5 rounded border transition ${
              value === o.id
                ? "bg-blue-500 border-blue-400 text-white"
                : "border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── CAMPAIGNS TAB ─────────────────────────── */

const CAMPAIGN_STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-700/40 text-slate-300",
  scheduled: "bg-blue-500/20 text-blue-300",
  sending: "bg-amber-500/20 text-amber-300",
  sent: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-rose-500/20 text-rose-300",
};

// Per-slug audience filter set. Zenith uses parent/coach/player/club;
// ITC uses hobbyist/forester/tym/hunter/dealer/community. New clients
// fall through to the "unknown only" set until their audiences are mapped.
const AUDIENCE_OPTIONS_BY_SLUG: Record<string, string[]> = {
  "zenith-sports": ["parent", "coach", "player", "club", "unknown"],
  "itc-quick-attach": [
    "hobbyist",
    "forester",
    "tym",
    "hunter",
    "dealer",
    "community",
  ],
};
function audienceOptionsFor(slug: string): string[] {
  return AUDIENCE_OPTIONS_BY_SLUG[slug] ?? ["unknown"];
}

const LEAD_STATUS_OPTIONS = [
  "not_enrolled",
  "enrolled",
  "paused",
  "responded",
  "converted",
  "completed",
];

type CampaignToast = {
  type: "success" | "error" | "info";
  message: string;
};

type CampaignConfirm = {
  title: string;
  body?: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

function CampaignsTab({
  slug,
  campaigns,
  leads,
  onMutate,
}: {
  slug: string;
  campaigns: Campaign[];
  leads: ClientLead[];
  onMutate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<CampaignToast | null>(null);
  const [pendingConfirm, setPendingConfirm] =
    useState<CampaignConfirm | null>(null);

  // Auto-dismiss toast after 5s.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(id);
  }, [toast]);

  const notify = useCallback(
    (t: CampaignToast) => setToast(t),
    [],
  );
  const askConfirm = useCallback(
    (c: CampaignConfirm) => setPendingConfirm(c),
    [],
  );

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div
          role="status"
          className={`fixed top-20 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-2xl backdrop-blur ${
            toast.type === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-100"
              : toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100"
                : "bg-slate-900/90 border-slate-700 text-slate-100"
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg leading-none">
              {toast.type === "error"
                ? "⚠️"
                : toast.type === "success"
                  ? "✅"
                  : "ℹ️"}
            </span>
            <div className="flex-1 text-sm">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white text-xs"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {pendingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              {pendingConfirm.title}
            </h3>
            {pendingConfirm.body && (
              <p className="text-sm text-slate-400 mb-4">
                {pendingConfirm.body}
              </p>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setPendingConfirm(null)}
                className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const c = pendingConfirm;
                  setPendingConfirm(null);
                  await c.onConfirm();
                }}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-white ${
                  pendingConfirm.destructive
                    ? "bg-rose-500 hover:bg-rose-400"
                    : "bg-emerald-500 hover:bg-emerald-400"
                }`}
              >
                {pendingConfirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight mb-1">
              Email campaigns
            </h2>
            <p className="text-sm text-slate-400">
              Blast filtered subsets of your leads with merge-tag-aware
              templates. Track opens, clicks, replies.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white whitespace-nowrap"
          >
            {showForm ? "Cancel" : "+ New campaign"}
          </button>
        </div>
        {showForm && (
          <CampaignForm
            slug={slug}
            leads={leads}
            onDone={() => {
              setShowForm(false);
              onMutate();
            }}
            notify={notify}
            askConfirm={askConfirm}
          />
        )}
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] divide-y divide-white/[0.06]">
        {campaigns.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            No campaigns yet. Create your first to reach your audience.
          </div>
        )}
        {campaigns.map((c) => (
          <CampaignRow
            key={c.id}
            campaign={c}
            isOpen={openId === c.id}
            onToggle={() => setOpenId(openId === c.id ? null : c.id)}
            onMutate={onMutate}
            notify={notify}
            askConfirm={askConfirm}
          />
        ))}
      </div>
    </div>
  );
}

function CampaignForm({
  slug,
  leads,
  onDone,
  notify,
  askConfirm,
}: {
  slug: string;
  leads: ClientLead[];
  onDone: () => void;
  notify: (t: CampaignToast) => void;
  askConfirm: (c: CampaignConfirm) => void;
}) {
  const audienceOptions = audienceOptionsFor(slug);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(
    "Hi {{first_name}},\n\n[your message here]\n\n— TEKKY",
  );
  const [audSel, setAudSel] = useState<string[]>([]);
  const [statusSel, setStatusSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  // Live preview of recipient count.
  const livePreview = leads.filter((l) => {
    if (!l.email) return false;
    if (
      audSel.length > 0 &&
      !audSel.includes(l.audience_segment ?? "unknown")
    )
      return false;
    if (statusSel.length > 0 && !statusSel.includes(l.funnel_status))
      return false;
    return true;
  });

  const saveDraft = async (): Promise<{
    ok: boolean;
    campaign?: Campaign;
  }> => {
    const r = await fetch("/api/client-portal/campaigns", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        subject,
        body,
        audience_filter: audSel,
        lead_status_filter: statusSel,
      }),
    });
    const j = (await r.json()) as {
      ok: boolean;
      campaign?: Campaign;
      error?: string;
    };
    if (!j.ok || !j.campaign) {
      notify({ type: "error", message: j.error || "Failed to save" });
      return { ok: false };
    }
    return { ok: true, campaign: j.campaign };
  };

  const onSaveClick = async () => {
    if (!name || !subject || !body) {
      notify({
        type: "error",
        message: "Name, subject, and body are required.",
      });
      return;
    }
    setBusy(true);
    const j = await saveDraft();
    setBusy(false);
    if (j.ok) {
      notify({ type: "success", message: "Draft saved." });
      onDone();
    }
  };

  const onSendClick = () => {
    if (!name || !subject || !body) {
      notify({
        type: "error",
        message: "Name, subject, and body are required.",
      });
      return;
    }
    askConfirm({
      title: `Send to ${livePreview.length} recipient${livePreview.length === 1 ? "" : "s"}?`,
      body: "This saves the campaign and fires real emails. Can't be undone.",
      confirmLabel: "Send now",
      onConfirm: async () => {
        setBusy(true);
        const j = await saveDraft();
        if (!j.ok || !j.campaign) {
          setBusy(false);
          return;
        }
        const sr = await fetch(
          `/api/client-portal/campaigns/${j.campaign.id}/send`,
          { method: "POST" },
        );
        const sj = (await sr.json()) as {
          ok: boolean;
          sent?: number;
          failed?: number;
          error?: string;
        };
        setBusy(false);
        if (!sj.ok) {
          notify({ type: "error", message: sj.error || "Send failed" });
        } else {
          notify({
            type: "success",
            message: `Sent ${sj.sent ?? 0} · failed ${sj.failed ?? 0}`,
          });
        }
        onDone();
      },
    });
  };

  const toggleArr = (arr: string[], v: string, set: (a: string[]) => void) => {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  return (
    <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
      <div>
        <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
          Internal name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Spring camp announcement v2"
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
        />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
          Subject line
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Hey {{first_name}} — quick TEKKY question"
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
        />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
          Body — supports{" "}
          <code className="text-blue-300">{"{{first_name}}"}</code>{" "}
          <code className="text-blue-300">{"{{audience}}"}</code>{" "}
          <code className="text-blue-300">{"{{intent}}"}</code>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 font-mono"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1.5">
            Audience filter (empty = all)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {audienceOptions.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleArr(audSel, a, setAudSel)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded border transition ${
                  audSel.includes(a)
                    ? "bg-blue-500 border-blue-400 text-white"
                    : "border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {AUDIENCE_EMOJI[a] || ""} {a}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1.5">
            Lead status filter (empty = all)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LEAD_STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleArr(statusSel, s, setStatusSel)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded border transition ${
                  statusSel.includes(s)
                    ? "bg-blue-500 border-blue-400 text-white"
                    : "border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <span className="text-xs text-slate-400">
          Will reach{" "}
          <span className="font-bold text-white">{livePreview.length}</span>{" "}
          lead{livePreview.length === 1 ? "" : "s"}
        </span>
        <div className="flex-1" />
        <button
          disabled={busy}
          onClick={onSaveClick}
          className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          disabled={busy || livePreview.length === 0}
          onClick={onSendClick}
          className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-50"
        >
          {busy ? "…" : "Send now"}
        </button>
      </div>
    </div>
  );
}

function CampaignRow({
  campaign,
  isOpen,
  onToggle,
  onMutate,
  notify,
  askConfirm,
}: {
  campaign: Campaign;
  isOpen: boolean;
  onToggle: () => void;
  onMutate: () => void;
  notify: (t: CampaignToast) => void;
  askConfirm: (c: CampaignConfirm) => void;
}) {
  const [sends, setSends] = useState<CampaignSend[]>([]);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      const r = await fetch(`/api/client-portal/campaigns/${campaign.id}`);
      const j = (await r.json()) as {
        ok: boolean;
        sends?: CampaignSend[];
        live_recipient_count?: number;
      };
      if (cancelled) return;
      if (j.ok) {
        setSends(j.sends ?? []);
        setLiveCount(j.live_recipient_count ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, campaign.id]);

  const sendNow = () => {
    askConfirm({
      title: `Send "${campaign.name}" now?`,
      body: "Fires real emails to current recipients. Can't be undone.",
      confirmLabel: "Send now",
      onConfirm: async () => {
        setBusy(true);
        const r = await fetch(
          `/api/client-portal/campaigns/${campaign.id}/send`,
          { method: "POST" },
        );
        const j = (await r.json()) as {
          ok: boolean;
          sent?: number;
          failed?: number;
          error?: string;
        };
        setBusy(false);
        if (!j.ok) {
          notify({ type: "error", message: j.error || "Send failed" });
        } else {
          notify({
            type: "success",
            message: `Sent ${j.sent ?? 0} · failed ${j.failed ?? 0}`,
          });
        }
        onMutate();
      },
    });
  };

  const remove = () => {
    askConfirm({
      title: `Delete "${campaign.name}"?`,
      body: "This can't be undone.",
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: async () => {
        const r = await fetch(`/api/client-portal/campaigns/${campaign.id}`, {
          method: "DELETE",
        });
        if (!r.ok) {
          notify({ type: "error", message: "Couldn't delete." });
          return;
        }
        notify({ type: "success", message: "Campaign deleted." });
        onMutate();
      },
    });
  };

  const canSend = campaign.status === "draft" || campaign.status === "scheduled";
  const canDelete = campaign.status !== "sending" && campaign.status !== "sent";

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-slate-800/40 transition flex items-center gap-3"
      >
        <span className="text-base">📧</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white truncate">
              {campaign.name}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${CAMPAIGN_STATUS_COLOR[campaign.status]}`}
            >
              {campaign.status}
            </span>
          </div>
          <div className="text-xs text-slate-500 truncate mt-0.5">
            {campaign.subject}
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-500 whitespace-nowrap">
          <div>
            {campaign.send_count} sent · {campaign.open_count} opens
          </div>
          <div>
            {campaign.click_count} clicks · {campaign.reply_count} replies
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 bg-slate-950/40">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <Stat label="Recipients" value={String(campaign.recipient_count)} />
            <Stat label="Sent" value={String(campaign.send_count)} />
            <Stat label="Opens" value={String(campaign.open_count)} />
            <Stat label="Replies" value={String(campaign.reply_count)} />
          </div>
          {liveCount !== null && canSend && (
            <div className="text-xs text-slate-400">
              Will reach{" "}
              <span className="font-bold text-white">{liveCount}</span> lead
              {liveCount === 1 ? "" : "s"} based on current filters.
            </div>
          )}
          <div className="text-xs text-slate-300 whitespace-pre-wrap rounded-lg bg-slate-900 border border-slate-800 p-3 max-h-48 overflow-auto">
            {campaign.body}
          </div>
          {sends.length > 0 && (
            <div className="rounded-lg border border-slate-800 divide-y divide-slate-800 max-h-64 overflow-auto">
              {sends.slice(0, 50).map((s) => (
                <div
                  key={s.id}
                  className="px-3 py-2 text-[11px] flex items-center gap-2"
                >
                  <span className="font-mono text-slate-300 truncate flex-1">
                    {s.to_email}
                  </span>
                  <span
                    className={`font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      s.status === "sent" || s.status === "delivered"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : s.status === "opened" || s.status === "clicked"
                          ? "bg-blue-500/20 text-blue-300"
                          : s.status === "replied"
                            ? "bg-violet-500/20 text-violet-300"
                            : s.status === "failed" || s.status === "bounced"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-slate-700/40 text-slate-400"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            {canSend && (
              <button
                onClick={sendNow}
                disabled={busy}
                className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-50"
              >
                {busy ? "…" : "Send now"}
              </button>
            )}
            {canDelete && (
              <button
                onClick={remove}
                className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="text-base font-bold text-white">{value}</div>
    </div>
  );
}

/* ─────────────────────────── FUNNELS TAB ─────────────────────────── */

/**
 * Per-client list of audience-segmented lead-magnet landing pages + their
 * live capture stats. Currently configured for itc-quick-attach (six
 * segments). Other clients see an empty-state pointing at the segment
 * config helper.
 *
 * Each card links out to the public LP at /clients/{slug}/lp/{seg} so
 * the owner can preview it. The lead count comes from filtering the
 * already-loaded `leads` array by audience_segment.
 */
type FunnelStep = {
  day: number;
  /**
   * Touchpoint channel. Each channel maps to a different sender path
   * in the funnel engine:
   *   email     → SendGrid (transactional + drip)
   *   sms       → Twilio outbound text
   *   voicemail → Slybroadcast / Drop Cowboy ringless voicemail
   *   postcard  → Lob direct-mail with AI-generated artwork +
   *               personalized copy (tractor brand / hunting season /
   *               coach + drill card / etc.)
   */
  channel: "email" | "sms" | "voicemail" | "postcard";
  label: string;
};

type FunnelDef = {
  segment: string;
  audienceTag: ClientLead["audience_segment"];
  emoji: string;
  title: string;
  pitch: string;
  cardClass: string;
  accentText: string;
  /**
   * Touchpoint sequence. Same 4-step shape across all six segments
   * (Day 0 lead-magnet delivery → Day 3 product feature → Day 7
   * upsell → Day 14 community/loyalty). Different content per segment.
   */
  steps: FunnelStep[];
  /**
   * Optional explicit path for the landing page. When omitted we
   * default to `/clients/{slug}/lp/{segment}`. Zenith uses bespoke
   * paths (e.g. /build-your-player) so each funnel sets its own.
   */
  landingPath?: string;
};

const ITC_FUNNELS: FunnelDef[] = [
  {
    segment: "dream-tractor",
    audienceTag: null,
    emoji: "🚜",
    title: "Build Your Dream Tractor",
    pitch:
      "Interactive configurator quiz. Live SVG tractor updates with each pick. Routes lead to the right segment automatically.",
    cardClass: "border-amber-400/50 bg-amber-400/[0.07]",
    accentText: "text-amber-200",
    steps: [
      { day: 0, channel: "email", label: "Custom build sheet PDF (their picks)" },
      { day: 0, channel: "sms", label: "Owner instant alert (Jake)" },
      { day: 1, channel: "sms", label: "Lead confirmation + Jake's cell" },
      { day: 3, channel: "voicemail", label: "Jake personal review · ringless VM" },
      { day: 7, channel: "email", label: "Routes into segment-specific funnel" },
    ],
    landingPath: "/lp/dream-tractor",
  },
  {
    segment: "tym",
    audienceTag: "tym",
    emoji: "⚙️",
    title: "TYM Owner Hub",
    pitch:
      "Brand-owner accessory hub. Sticker pack on signup. T474 + T264 + T234 fit guide.",
    cardClass: "border-amber-500/30 bg-amber-500/[0.05]",
    accentText: "text-amber-300",
    steps: [
      { day: 0, channel: "email", label: "Welcome + sticker pack confirmation" },
      { day: 2, channel: "sms", label: "Sticker shipping update + tracking" },
      { day: 5, channel: "email", label: "T474 review reel (28 owners)" },
      {
        day: 10,
        channel: "postcard",
        label: "AI postcard · their TYM model + matched accessories",
      },
      { day: 14, channel: "email", label: "Toolbox bundle upsell" },
    ],
  },
  {
    segment: "hobbyist",
    audienceTag: "hobbyist",
    emoji: "🚜",
    title: "Sub-Compact First-Year Setup",
    pitch: "12-item PDF checklist for new owners. Top of funnel.",
    cardClass: "border-emerald-500/30 bg-emerald-500/[0.05]",
    accentText: "text-emerald-300",
    steps: [
      { day: 0, channel: "email", label: "12-item checklist PDF delivery" },
      { day: 3, channel: "email", label: "Brush guard 101 video" },
      { day: 5, channel: "sms", label: "Quick check-in · need help with anything?" },
      { day: 10, channel: "voicemail", label: "Friendly Jake VM · winter-prep nudge" },
      { day: 14, channel: "email", label: "SawBoss intro + winter-prep tips" },
    ],
  },
  {
    segment: "forester",
    audienceTag: "forester",
    emoji: "🌲",
    title: "Forester Gear List",
    pitch: "SawBoss + Chainbox pro setup. Higher AOV.",
    cardClass: "border-lime-500/30 bg-lime-500/[0.05]",
    accentText: "text-lime-300",
    steps: [
      { day: 0, channel: "email", label: "1-acre clearing gear PDF" },
      { day: 2, channel: "voicemail", label: "Jake VM · saw your inquiry, quick Q" },
      { day: 4, channel: "sms", label: "SawBoss mounting walkthrough video link" },
      { day: 8, channel: "email", label: "Chainbox cross-sell + bulk discount" },
      {
        day: 14,
        channel: "postcard",
        label: "AI postcard · acreage-matched pro setup recap",
      },
    ],
  },
  {
    segment: "hunter",
    audienceTag: "hunter",
    emoji: "🦌",
    title: "Hunter Install Guide",
    pitch: "Gun-mount install + safety tips. Seasonal bundle.",
    cardClass: "border-rose-500/30 bg-rose-500/[0.05]",
    accentText: "text-rose-300",
    steps: [
      { day: 0, channel: "email", label: "Install + safety guide PDF" },
      { day: 2, channel: "sms", label: "Mount + LED + canvas bundle text quote" },
      { day: 5, channel: "email", label: "Brush guard cross-sell (scouting trails)" },
      { day: 10, channel: "voicemail", label: "Pre-season urgency VM · season cutoff" },
      {
        day: 14,
        channel: "postcard",
        label: "AI postcard · season checklist + state hunting dates",
      },
    ],
  },
  {
    segment: "dealer",
    audienceTag: "dealer",
    emoji: "🤝",
    title: "Dealer Wholesale ROI",
    pitch: "Interactive ROI calc. B2B greenfield channel.",
    cardClass: "border-blue-500/30 bg-blue-500/[0.05]",
    accentText: "text-blue-300",
    steps: [
      { day: 0, channel: "email", label: "Custom ROI report (24h SLA)" },
      { day: 0, channel: "sms", label: "Owner SMS: high-volume dealer alert" },
      { day: 1, channel: "voicemail", label: "B2B intro VM · wholesale rep" },
      { day: 3, channel: "email", label: "Wholesale price sheet + bestsellers" },
      {
        day: 7,
        channel: "postcard",
        label: "AI dealer kit · printed catalog + sample order form",
      },
      { day: 14, channel: "email", label: "Sample shipment offer + onboarding call" },
    ],
  },
  {
    segment: "community",
    audienceTag: "community",
    emoji: "🏆",
    title: "Submit Your Build",
    pitch: "Operator of the month — UGC + email-list growth.",
    cardClass: "border-violet-500/30 bg-violet-500/[0.05]",
    accentText: "text-violet-300",
    steps: [
      { day: 0, channel: "email", label: "Photo submission instructions" },
      { day: 7, channel: "email", label: "Newsletter intro + last winner" },
      { day: 14, channel: "email", label: "Selection + spotlight notification" },
      {
        day: 21,
        channel: "postcard",
        label: "AI postcard · featured-build keepsake card (winners)",
      },
      { day: 30, channel: "email", label: "Recurring monthly newsletter" },
    ],
  },
];

/**
 * Zenith Sports / TEKKY funnels. Each funnel maps to a real page
 * already live on the showcase site:
 *   - /clients/zenith-sports/build-your-player → audience=player
 *   - /clients/zenith-sports/training-guide    → audience=coach
 *   - /clients/zenith-sports/camps             → audience=parent
 *   - /clients/zenith-sports/shop              → general / no audience
 */
const ZENITH_FUNNELS: FunnelDef[] = [
  {
    segment: "build-your-player",
    audienceTag: "player",
    emoji: "🎮",
    title: "Build Your Player",
    pitch:
      "Player-facing configurator. Pick traits + style → personalized challenge prescription.",
    cardClass: "border-lime-500/30 bg-lime-500/[0.05]",
    accentText: "text-lime-300",
    steps: [
      { day: 0, channel: "email", label: "Personalized challenge PDF (their picks)" },
      { day: 2, channel: "sms", label: "Today's drill video link · text-to-watch" },
      { day: 5, channel: "email", label: "Drill-of-the-day reel + leaderboard" },
      { day: 7, channel: "sms", label: "TEKKY ball nudge · parent share-link" },
      {
        day: 14,
        channel: "postcard",
        label: "AI postcard · player progress card + sticker keepsake",
      },
    ],
    landingPath: "/build-your-player",
  },
  {
    segment: "training-guide",
    audienceTag: "coach",
    emoji: "📘",
    title: "Coach Training Guide",
    pitch: "Free PDF playbook for club coaches. Lead magnet + free club demo upsell.",
    cardClass: "border-blue-500/30 bg-blue-500/[0.05]",
    accentText: "text-blue-300",
    steps: [
      { day: 0, channel: "email", label: "Coach guide PDF" },
      { day: 2, channel: "voicemail", label: "Caleb VM · saw you grabbed the guide" },
      { day: 5, channel: "email", label: "Free club demo offer + drill bundle" },
      { day: 10, channel: "sms", label: "SMS demo confirmation + calendar link" },
      {
        day: 14,
        channel: "postcard",
        label: "AI coach kit · laminated drill cards mailed",
      },
    ],
    landingPath: "/training-guide",
  },
  {
    segment: "camps",
    audienceTag: "parent",
    emoji: "👪",
    title: "Camps Finder",
    pitch:
      "Parent-facing camp directory + email-capture. Highest-volume top-of-funnel.",
    cardClass: "border-amber-500/30 bg-amber-500/[0.05]",
    accentText: "text-amber-300",
    steps: [
      { day: 0, channel: "email", label: "Camp recommendations matched to age" },
      { day: 2, channel: "sms", label: "Sign-up reminder · 2-tap RSVP" },
      { day: 5, channel: "email", label: "TEKKY ball intro (off-season prep)" },
      { day: 10, channel: "sms", label: "Player Challenge invite for the kid" },
      { day: 14, channel: "email", label: "Pre-season checklist + gear bundle" },
    ],
    landingPath: "/camps",
  },
  {
    segment: "shop",
    audienceTag: null,
    emoji: "🛒",
    title: "Shop · TEKKY Ball",
    pitch:
      "Direct shop entry. Catches mid-funnel buyers ready to convert.",
    cardClass: "border-violet-500/30 bg-violet-500/[0.05]",
    accentText: "text-violet-300",
    steps: [
      { day: 0, channel: "email", label: "Cart-abandon recovery (if applicable)" },
      { day: 1, channel: "sms", label: "SMS recovery · 2-tap return-to-cart" },
      { day: 3, channel: "email", label: "TEKKY drill add-ons" },
      { day: 7, channel: "sms", label: "Free-shipping nudge text" },
      { day: 14, channel: "email", label: "Replenish + apparel upsell" },
    ],
    landingPath: "/shop",
  },
];

const FUNNELS_BY_SLUG: Record<string, FunnelDef[]> = {
  "itc-quick-attach": ITC_FUNNELS,
  "zenith-sports": ZENITH_FUNNELS,
};

function FunnelsTab({
  slug,
  leads,
}: {
  slug: string;
  leads: ClientLead[];
}) {
  const funnels = FUNNELS_BY_SLUG[slug] ?? [];
  const [openFunnelSegment, setOpenFunnelSegment] = useState<string | null>(
    null,
  );
  const openFunnel =
    funnels.find((f) => f.segment === openFunnelSegment) ?? null;
  const openSegLeads = openFunnel
    ? leads.filter((l) => l.audience_segment === openFunnel.audienceTag)
    : [];
  const openCounts = {
    total: openSegLeads.length,
    newCount: openSegLeads.filter((l) => l.funnel_status === "not_enrolled")
      .length,
    enrolledCount: openSegLeads.filter((l) => l.funnel_status === "enrolled")
      .length,
    wonCount: openSegLeads.filter((l) =>
      ["responded", "converted", "completed"].includes(l.funnel_status),
    ).length,
  };
  const openLandingUrl = openFunnel
    ? openFunnel.landingPath
      ? `/clients/${slug}${openFunnel.landingPath}`
      : `/clients/${slug}/lp/${openFunnel.segment}`
    : "";

  if (funnels.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-8 text-center">
        <h2 className="text-lg font-bold mb-2">No segment funnels yet</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          We&apos;ll wire your audience-specific lead-magnet landing pages here
          once we&apos;ve mapped your customer segments.
        </p>
      </div>
    );
  }

  const totalLeads = leads.filter((l) =>
    funnels.some((f) => f.audienceTag === l.audience_segment),
  ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight mb-1">
              Audience funnels
            </h2>
            <p className="text-sm text-slate-400">
              Each card is a live lead-capture page tuned to one customer
              segment. Click <span className="text-amber-300 font-bold">View page</span>{" "}
              to preview the public version.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Total captured
            </div>
            <div className="text-2xl font-black text-amber-300">
              {totalLeads}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        {funnels.map((f) => {
          const tag = f.audienceTag;
          const segLeads = leads.filter((l) => l.audience_segment === tag);
          const newCount = segLeads.filter((l) => l.funnel_status === "not_enrolled").length;
          const enrolledCount = segLeads.filter((l) => l.funnel_status === "enrolled").length;
          // "Won" rolls up everyone past the active-funnel stage: replied,
          // closed, or graduated through the lifecycle.
          const wonCount = segLeads.filter((l) =>
            ["responded", "converted", "completed"].includes(l.funnel_status),
          ).length;
          const lpUrl = f.landingPath
            ? `/clients/${slug}${f.landingPath}`
            : `/clients/${slug}/lp/${f.segment}`;
          return (
            <div
              key={f.segment}
              className={`rounded-2xl border p-5 ${f.cardClass}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{f.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{f.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {f.pitch}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${f.accentText}`}>
                  {f.segment}
                </span>
              </div>

              {/* Multi-channel touchpoint flow visualization. Variable
                  step count per audience (4–6 typical) — grid auto-sizes. */}
              <div className="mb-3">
                <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500 mb-1.5">
                  Touchpoint sequence
                </div>
                <ol
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(f.steps.length, 6)}, minmax(0, 1fr))`,
                  }}
                >
                  {f.steps.map((s, i) => {
                    const channelLabel =
                      s.channel === "email"
                        ? "✉ email"
                        : s.channel === "sms"
                          ? "💬 sms"
                          : s.channel === "voicemail"
                            ? "🎙 vm"
                            : "📮 mail";
                    return (
                      <li
                        key={i}
                        className={`relative rounded-md bg-black/30 border border-white/[0.04] px-1.5 py-1.5`}
                      >
                        <div
                          className={`text-[10px] font-black ${f.accentText} mb-0.5`}
                        >
                          D{s.day}
                        </div>
                        <div className="text-[9px] text-slate-500 mb-0.5 whitespace-nowrap">
                          {channelLabel}
                        </div>
                        <div
                          className="text-[10px] text-slate-300 leading-tight line-clamp-2"
                          title={s.label}
                        >
                          {s.label}
                        </div>
                        {i < f.steps.length - 1 && (
                          <span
                            aria-hidden
                            className={`absolute top-1/2 -right-[2.5px] -translate-y-1/2 ${f.accentText} text-[10px]`}
                          >
                            ▶
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="grid grid-cols-4 gap-1.5 mb-3 text-center">
                <div className="rounded-md bg-black/30 px-1.5 py-1">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Total
                  </div>
                  <div className="text-sm font-black text-white">
                    {segLeads.length}
                  </div>
                </div>
                <div className="rounded-md bg-black/30 px-1.5 py-1">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    New
                  </div>
                  <div className="text-sm font-black text-blue-300">
                    {newCount}
                  </div>
                </div>
                <div className="rounded-md bg-black/30 px-1.5 py-1">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Active
                  </div>
                  <div className="text-sm font-black text-amber-300">
                    {enrolledCount}
                  </div>
                </div>
                <div className="rounded-md bg-black/30 px-1.5 py-1">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Won
                  </div>
                  <div className="text-sm font-black text-emerald-300">
                    {wonCount}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpenFunnelSegment(f.segment)}
                  className="flex-1 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/15 bg-slate-900/70 hover:border-amber-400/50 hover:bg-slate-800 text-amber-200 text-center transition-colors"
                >
                  View funnel
                </button>
                <a
                  href={lpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-center`}
                >
                  View landing page ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-4 text-xs text-slate-500 italic">
        Each funnel posts to <code className="text-slate-300">/api/clients/inquire</code>{" "}
        with the audience tag pre-set. Leads land in the Leads tab tagged
        automatically — no manual sorting.
      </div>

      <FunnelVisualModal
        isOpen={openFunnelSegment !== null}
        onClose={() => setOpenFunnelSegment(null)}
        funnel={
          openFunnel
            ? {
                segment: openFunnel.segment,
                audienceTag: String(openFunnel.audienceTag ?? ""),
                emoji: openFunnel.emoji,
                title: openFunnel.title,
                pitch: openFunnel.pitch,
                accentText: openFunnel.accentText,
                steps: openFunnel.steps,
              }
            : null
        }
        counts={openCounts}
        landingUrl={openLandingUrl}
      />
    </div>
  );
}

/* ─────────────────────────── HELPERS ─────────────────────────── */

/**
 * Estimate pipeline value from the loaded leads. Prefers explicit
 * `deal_value_usd` set in raw_payload (e.g. dealer ROI form). For
 * clients in `AUDIENCE_DEFAULT_OPTIN_SLUGS`, falls back to per-audience
 * default deal sizes when the lead has no explicit value. Other clients
 * use the server-computed value untouched (avoids inflating Zenith's
 * pipeline number with synthetic defaults).
 */
const AUDIENCE_DEFAULT_DEAL_USD: Record<string, number> = {
  hobbyist: 250,
  forester: 600,
  tym: 400,
  hunter: 350,
  dealer: 3600,
  community: 100,
};

// Only clients in this set get the per-audience-default fallback.
// Others rely on the server-computed value to avoid surprise
// inflation of historical numbers.
const AUDIENCE_DEFAULT_OPTIN_SLUGS = new Set(["itc-quick-attach"]);

function estimatePipelineValueUsd(
  leads: ClientLead[],
  fallback: number,
  clientSlug?: string,
): number {
  if (!leads || leads.length === 0) return fallback;

  // Count explicit deal values regardless of slug — these are user-set
  // and always trustworthy.
  const inPipeline = leads.filter((l) =>
    ["enrolled", "responded", "converted", "completed"].includes(l.funnel_status),
  );
  let explicitSum = 0;
  let leadsNeedingDefault = 0;
  for (const l of inPipeline) {
    const explicit = Number(l.raw_payload?.["deal_value_usd"] ?? 0);
    if (explicit > 0) {
      explicitSum += explicit;
    } else {
      leadsNeedingDefault++;
    }
  }

  // If this client opted into the audience-default fallback, layer those
  // estimates in for leads without explicit values.
  if (clientSlug && AUDIENCE_DEFAULT_OPTIN_SLUGS.has(clientSlug)) {
    let defaultSum = 0;
    for (const l of inPipeline) {
      const explicit = Number(l.raw_payload?.["deal_value_usd"] ?? 0);
      if (explicit > 0) continue;
      const seg = l.audience_segment ?? "unknown";
      defaultSum += AUDIENCE_DEFAULT_DEAL_USD[seg] ?? 0;
    }
    return Math.max(explicitSum + defaultSum, fallback);
  }

  // Default behavior (Zenith, etc.): explicit-only sum or server fallback,
  // whichever is bigger.
  return leadsNeedingDefault === 0 && explicitSum > 0
    ? Math.max(explicitSum, fallback)
    : fallback;
}

/* ─────────────────────────── SAMPLE LEAD BUTTON ─────────────────────────── */
/**
 * One-click "watch the system run end-to-end" demo. Fires a synthetic
 * lead through the real /api/clients/inquire pipeline:
 *   1. Audience tag (detectAudience) routes the lead to a segment
 *   2. client_leads row inserted
 *   3. Owner alert (SMS + email) fires
 *   4. AI inbound responder eligible to draft a reply
 *   5. Portal Leads tab refreshes to show the new entry
 *
 * Per-slug payload templates so the demo lead matches the tenant's
 * actual customer mix (an ITC demo lead asks about a TYM brush guard;
 * a Zenith demo lead is a soccer parent).
 */
type SampleLeadPayload = Record<string, unknown> & {
  name: string;
  email: string;
  intent?: string;
  source?: string;
  message?: string;
};

const SAMPLE_LEADS_BY_SLUG: Record<string, SampleLeadPayload> = {
  "itc-quick-attach": {
    name: "Live Demo · Forester (auto-generated)",
    email: `demo-live-${Date.now()}@itcquickattach.example`,
    intent: "SawBoss + Chainbox quote for 2-acre clearing job",
    source: "lp-forester",
    lp: "forester",
    message:
      "Running a Kioti CK2610. Saw won't stay put on the bar in transit. Need the SawBoss + Chainbox combo.",
    acreage: "2",
  },
  "zenith-sports": {
    name: "Live Demo · Soccer Parent (auto-generated)",
    email: `demo-live-${Date.now()}@zenithsports.example`,
    intent: "Camp Finder",
    source: "email-capture",
    message:
      "Looking for a TEKKY ball + summer camp options for my U10 player.",
    role: "parent",
  },
};

function SampleLeadButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const fire = async () => {
    setBusy(true);
    setMsg(null);
    const tmpl = SAMPLE_LEADS_BY_SLUG[slug] ?? {
      name: "Live Demo Lead (auto-generated)",
      email: `demo-live-${Date.now()}@example.com`,
      intent: "Demo run",
      source: "demo-button",
      message: "This is a synthetic lead generated by the demo button.",
    };
    // Inject a unique-ish email each time so the dedup-by-email path
    // doesn't merge two demo runs in a row into one row.
    const payload = {
      slug,
      ...tmpl,
      email: tmpl.email.replace("@", `+${Date.now()}@`),
    };
    try {
      const r = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await r.json()) as { ok: boolean; leadId?: string; error?: string };
      if (!j.ok) {
        setMsg(`⚠ ${j.error || "Demo lead failed"}`);
        setBusy(false);
        return;
      }
      setMsg("✅ Lead injected — flowing through the pipeline. Refreshing…");
      // Give the UI a beat to read the message, then bounce to Leads.
      setTimeout(() => {
        router.refresh();
        setBusy(false);
        setMsg("✅ Lead live in the Leads tab. AI responder + owner alert fired.");
      }, 1200);
    } catch (err) {
      setMsg(
        `⚠ Network error: ${err instanceof Error ? err.message : "unknown"}`,
      );
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-amber-500/40 bg-amber-500/[0.06] p-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300 font-bold">
            ✨ Demo: watch the system run
          </p>
          <p className="text-sm text-amber-50/80 mt-1">
            One click fires a synthetic lead through the real pipeline —
            audience tag, AI reply draft, owner alert, lead drop. Lands in
            your Leads tab in under 5 seconds.
          </p>
        </div>
        <button
          onClick={fire}
          disabled={busy}
          className="text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 whitespace-nowrap"
        >
          {busy ? "Running…" : "▶ Inject demo lead"}
        </button>
      </div>
      {msg && (
        <p className={`mt-2 text-xs ${msg.startsWith("⚠") ? "text-rose-300" : "text-emerald-300"}`}>
          {msg}
        </p>
      )}
    </section>
  );
}

/* ─────────────────────────── ACTIVITY TAB ─────────────────────────── */
/**
 * Real-time event feed showing the system breathing — captures, AI
 * touches, campaign opens/clicks, cost rows. Polls /api/client-portal/
 * activity-feed every 6 seconds while the tab is open. Designed for
 * sales-call demos: clicking a tab, watching events stream in,
 * understanding the operational depth at a glance.
 */
type ActivityEvent = {
  id: string;
  kind: string;
  timestamp: string;
  title: string;
  detail: string;
  tag?: string;
  costUsd?: number;
};

const ACTIVITY_KIND_COLOR: Record<string, string> = {
  "lead.captured": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "lead.audience_tagged": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "msg.outbound": "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "msg.inbound": "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "msg.skipped": "bg-slate-700/40 text-slate-400 border-slate-600",
  "campaign.send": "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "campaign.opened": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "campaign.clicked": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "campaign.replied": "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "campaign.bounced": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  "cost.api_call": "bg-slate-700/40 text-slate-300 border-slate-600",
};

function ActivityTab() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [lastFetched, setLastFetched] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (paused) return;
      try {
        const r = await fetch("/api/client-portal/activity-feed");
        const j = (await r.json()) as { ok: boolean; events?: ActivityEvent[] };
        if (!cancelled && j.ok && j.events) {
          setEvents(j.events);
          setLastFetched(Date.now());
        }
      } catch {
        // swallow — keep showing the last good snapshot
      }
      if (!cancelled) setLoading(false);
    };
    tick();
    const id = setInterval(tick, 6000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [paused]);

  // Compute summary counts for the header strip.
  const counts = {
    leads: events.filter((e) => e.kind === "lead.captured").length,
    aiTouches: events.filter((e) =>
      ["msg.outbound", "msg.inbound"].includes(e.kind),
    ).length,
    campaignSends: events.filter((e) => e.kind === "campaign.send").length,
    apiCalls: events.filter((e) => e.kind === "cost.api_call").length,
    totalCost: events
      .filter((e) => typeof e.costUsd === "number")
      .reduce((s, e) => s + (e.costUsd ?? 0), 0),
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold tracking-tight mb-1">
              ⚡ AI activity feed
            </h2>
            <p className="text-sm text-slate-400">
              Real-time stream of every captured lead, AI reply, campaign send,
              and API call across your account. Updates every 6 seconds.
            </p>
          </div>
          <button
            onClick={() => setPaused((v) => !v)}
            className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border whitespace-nowrap ${
              paused
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
            }`}
          >
            {paused ? "▶ Resume live" : "❚❚ Pause"}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
          <ActivityCounter label="Leads" value={counts.leads} accent="emerald" />
          <ActivityCounter
            label="AI touches"
            value={counts.aiTouches}
            accent="blue"
          />
          <ActivityCounter
            label="Campaign sends"
            value={counts.campaignSends}
            accent="blue"
          />
          <ActivityCounter
            label="API calls"
            value={counts.apiCalls}
            accent="slate"
          />
          <ActivityCounter
            label="Cost (30d)"
            value={`$${counts.totalCost.toFixed(2)}`}
            accent="amber"
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-3">
          {paused
            ? "Paused — live feed will resume on click."
            : `Last refresh: ${
                lastFetched
                  ? new Date(lastFetched).toLocaleTimeString()
                  : "—"
              } · live polling`}
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06]">
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading activity…
          </p>
        ) : events.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No activity in the last 30 days yet. Try the{" "}
            <span className="text-amber-300 font-bold">
              ▶ Inject demo lead
            </span>{" "}
            button on the Overview tab to see the system run end-to-end.
          </p>
        ) : (
          <ol className="divide-y divide-white/[0.04]">
            {events.map((e) => (
              <li
                key={e.id}
                className="px-4 py-2.5 flex items-start gap-3 hover:bg-slate-800/30 transition"
              >
                <span className="text-[10px] text-slate-500 w-20 flex-shrink-0 font-mono mt-0.5">
                  {timeAgo(e.timestamp)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-white truncate">
                      {e.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        ACTIVITY_KIND_COLOR[e.kind] ??
                        "bg-slate-700/40 text-slate-300 border-slate-600"
                      }`}
                    >
                      {e.kind.replace(".", "·")}
                    </span>
                    {e.tag && (
                      <span className="text-[9px] uppercase tracking-wider text-amber-300 font-bold">
                        {e.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {e.detail}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function ActivityCounter({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: "emerald" | "blue" | "amber" | "slate";
}) {
  const accentClass = {
    emerald: "text-emerald-300",
    blue: "text-blue-300",
    amber: "text-amber-300",
    slate: "text-slate-300",
  }[accent];
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={`text-xl font-black ${accentClass}`}>{value}</div>
    </div>
  );
}

/* ─────────────────────────── PARTNERS TAB (ITC) ─────────────────────────── */
/**
 * In-portal recruitment hub for ITC's commission sales program. Surfaces
 * the public partners landing page + the audience-branched script viewer
 * as quick-launch cards so Jake (or anyone he hands the portal to) can
 * jump straight to the recruit pitch or the script library without
 * remembering the URLs.
 */
/**
 * Per-tenant Sales Portal config. Each client gets their own audiences,
 * payout copy, contact email, and accent palette. Adding a new client to
 * the program is one config block + the underlying script library.
 */
const PARTNERS_CONFIG: Record<
  string,
  {
    title: string;
    tagline: string;
    audiences: { emoji: string; label: string; payout: string }[];
    audienceScriptCount: number;
    contactEmail: string;
    cap: number;
    accent: "amber" | "lime";
  }
> = {
  "itc-quick-attach": {
    title: "ITC Partner Program",
    tagline:
      "Commission sales reps + warm-referrer partners. Six audience scripts, one workspace. Paid Venmo or Zelle within 7 days.",
    audiences: [
      { emoji: "🏪", label: "Dealer / wholesale", payout: "$250 / signed" },
      { emoji: "🚜", label: "TYM owner", payout: "$50 / close" },
      { emoji: "🌲", label: "Professional forester", payout: "$50 / close" },
      { emoji: "🎯", label: "Hunter / outdoorsman", payout: "$50 / close" },
      { emoji: "🏡", label: "Hobbyist · first-year", payout: "$50 / close" },
      { emoji: "🤝", label: "Existing customer · referral", payout: "Toolbox kit" },
    ],
    audienceScriptCount: 6,
    contactEmail: "partners@itcquickattach.com",
    cap: 12,
    accent: "amber",
  },
  "zenith-sports": {
    title: "Zenith / TEKKY Partner Program",
    tagline:
      "Coaches, clubs, parents, camps. Four audience scripts, soccer-tuned. Paid Venmo or Zelle within 7 days.",
    audiences: [
      { emoji: "🥅", label: "Coach affiliate", payout: "$25 / ball + $100 / package" },
      { emoji: "🏟️", label: "Club / academy wholesale", payout: "$30-40 / ball margin" },
      { emoji: "👨‍👩‍👧", label: "Parent referrer", payout: "$20 / referred sale" },
      { emoji: "🏕️", label: "Camp / academy director", payout: "Co-branded box · $30/ball" },
    ],
    audienceScriptCount: 4,
    contactEmail: "partners@zenithsports.org",
    cap: 25,
    accent: "lime",
  },
};

function PartnersTab({ slug }: { slug: string }) {
  const cfg = PARTNERS_CONFIG[slug] ?? PARTNERS_CONFIG["itc-quick-attach"];
  const audiences = cfg.audiences;
  const isLime = cfg.accent === "lime";
  const accentBg = isLime ? "amber-100" : "amber-100"; // text — handled inline below
  // Tailwind safelist hint for the per-accent classes used below:
  // amber-100 amber-200/70 amber-200 amber-300 amber-400 amber-500 amber-500/15
  // amber-500/20 amber-500/30 amber-500/40 amber-900/15 amber-950 amber-950/10 amber-950/40
  // lime-100 lime-200/70 lime-200 lime-300 lime-400 lime-500 lime-500/15
  // lime-500/20 lime-500/30 lime-500/40 lime-900/15 lime-950 lime-950/10 lime-950/40
  void accentBg;

  // Per-accent palette atoms — kept inline so Tailwind JIT picks them up.
  const palette = isLime
    ? {
        heroBg:
          "bg-gradient-to-br from-lime-950/40 via-lime-900/15 to-slate-900/60",
        heroBorder: "border-lime-500/20",
        heroHeading: "text-lime-100",
        heroBody: "text-lime-200/70",
        primaryBtn: "bg-lime-500 hover:bg-lime-400 text-lime-950",
        secondaryBtn:
          "border-lime-500/30 bg-slate-900/50 hover:bg-slate-800 text-lime-200",
        statPillTone: "amber" as const, // keep amber for "scripts count" so it pops
        cardBorder: "border-lime-500/15",
        cardBg: "bg-lime-950/10",
        cardHover: "hover:border-lime-500/40",
        cardLabel: "text-lime-100",
        accentText: "text-lime-300",
        accentTextHover: "hover:text-lime-200",
      }
    : {
        heroBg:
          "bg-gradient-to-br from-amber-950/40 via-amber-900/15 to-slate-900/60",
        heroBorder: "border-amber-500/20",
        heroHeading: "text-amber-100",
        heroBody: "text-amber-200/70",
        primaryBtn: "bg-amber-500 hover:bg-amber-400 text-amber-950",
        secondaryBtn:
          "border-amber-500/30 bg-slate-900/50 hover:bg-slate-800 text-amber-200",
        statPillTone: "amber" as const,
        cardBorder: "border-amber-500/15",
        cardBg: "bg-amber-950/10",
        cardHover: "hover:border-amber-500/40",
        cardLabel: "text-amber-100",
        accentText: "text-amber-300",
        accentTextHover: "hover:text-amber-200",
      };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className={`rounded-2xl ${palette.heroBg} border ${palette.heroBorder} p-6`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h2 className={`text-2xl font-black tracking-tight ${palette.heroHeading} mb-1`}>
              {cfg.title}
            </h2>
            <p className={`text-sm ${palette.heroBody} max-w-xl leading-relaxed`}>
              {cfg.tagline}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link
              href={`/clients/${slug}/partners`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg ${palette.primaryBtn} text-center transition-colors`}
            >
              View partner page ↗
            </Link>
            <Link
              href={`/clients/${slug}/partners/script`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border ${palette.secondaryBtn} text-center transition-colors`}
            >
              Open script library ↗
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5">
          <StatPill
            label="Audience scripts"
            value={String(cfg.audienceScriptCount)}
            tone={palette.statPillTone}
          />
          <StatPill label="Channels per script" value="5" tone="emerald" />
          <StatPill label="Partner cap" value={String(cfg.cap)} tone="slate" />
        </div>
      </div>

      {/* Audience cards */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">
            {cfg.audienceScriptCount} audience scripts
          </h3>
          <Link
            href={`/clients/${slug}/partners/script`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[11px] uppercase tracking-wider font-bold ${palette.accentText} ${palette.accentTextHover}`}
          >
            Open library →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {audiences.map((a) => (
            <div
              key={a.label}
              className={`rounded-xl border ${palette.cardBorder} ${palette.cardBg} p-3 ${palette.cardHover} transition-colors`}
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl shrink-0 leading-none">{a.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${palette.cardLabel} leading-tight mb-1 truncate`}>
                    {a.label}
                  </p>
                  <p className="text-[11px] text-emerald-300/90 font-bold tabular-nums">
                    {a.payout}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick start */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
        <h3 className="text-sm font-bold tracking-tight text-white uppercase mb-3">
          How to onboard a rep
        </h3>
        <ol className="space-y-2.5 text-sm text-slate-300">
          <Step n={1}>
            Send them the partner page link:{" "}
            <code className={`${palette.accentText} bg-black/30 px-1.5 py-0.5 rounded text-xs`}>
              /clients/{slug}/partners
            </code>
          </Step>
          <Step n={2}>
            They email{" "}
            <span className={palette.accentText}>{cfg.contactEmail}</span> with a one-paragraph application.
          </Step>
          <Step n={3}>
            You approve them, hand them the script library URL:{" "}
            <code className={`${palette.accentText} bg-black/30 px-1.5 py-0.5 rounded text-xs`}>
              /clients/{slug}/partners/script
            </code>
          </Step>
          <Step n={4}>
            They pick the audience tag for each prospect, the matching script
            auto-loads, and they dial.
          </Step>
        </ol>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-4 text-xs text-slate-500 italic leading-relaxed">
        Lightweight by design. Reps apply via email, you approve, hand them
        the script library URL — no extra software for them to learn. When
        you scale past 10 reps, a full in-app workspace (auto-assigned
        prospects, outcome tracking, payout dashboard) is one config flag
        away.
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "slate" | "emerald" | "amber";
}) {
  const toneCls: Record<typeof tone, string> = {
    slate: "text-white",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
  };
  return (
    <div className="rounded-md bg-black/30 border border-white/5 px-3 py-2 text-center">
      <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">
        {label}
      </div>
      <div className={`text-lg font-black tabular-nums ${toneCls[tone]}`}>
        {value}
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-xs">
        {n}
      </span>
      <span className="leading-relaxed pt-0.5">{children}</span>
    </li>
  );
}

/* ─────────────────────────── MAP TAB ─────────────────────────── */
/**
 * Per-tenant market map. Each tenant gets a map flavored to their
 * customer mix — ITC sees the tractor-market map, Zenith sees the
 * soccer-town map. Other clients see an empty state until we wire
 * their data.
 */
function MapTab({ slug }: { slug: string }) {
  if (slug === "itc-quick-attach") {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
          <h2 className="text-lg font-bold tracking-tight mb-1">
            Tractor-market map
          </h2>
          <p className="text-sm text-slate-400">
            County-level US map with population-sized city bullets. Toggle
            audience layers (Dealers / TYM owners / Foresters / Hunters /
            Sub-compact owners) — concrete data sources for each are queued.
            Currently showing verified pins: ITC HQ + Cascade Tractor Supply.
          </p>
        </div>
        <ItcMarketMap />
      </div>
    );
  }
  if (slug === "zenith-sports") {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
          <h2 className="text-lg font-bold tracking-tight mb-1">
            Soccer-market map
          </h2>
          <p className="text-sm text-slate-400">
            Population-sized US city bullets + curated soccer-town overlay
            (verified MLS host cities). Click a city to scout audience-scoped
            leads (parents / coaches / players).
          </p>
        </div>
        <ZenithSoccerMap />
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-8 text-center">
      <h2 className="text-lg font-bold mb-2">Market map coming</h2>
      <p className="text-sm text-slate-400 max-w-md mx-auto">
        Per-tenant geographic targeting wires up on a per-client basis.
      </p>
    </div>
  );
}

// Per-slug Overview "Quick links" rail. Each entry = one tile. Each
// tenant gets the four links that actually map to their business —
// e.g. ITC's segment-specific lead-magnet pages, Zenith's player
// builder + training guide.
type QuickLinkDef = { href: string; icon: string; label: string };
const QUICK_LINKS_BY_SLUG: Record<string, (slug: string) => QuickLinkDef[]> = {
  "zenith-sports": (slug) => [
    { href: `/clients/${slug}`, icon: "🌐", label: "Your site" },
    { href: `/clients/${slug}/build-your-player`, icon: "🎮", label: "Build Your Player" },
    { href: `/clients/${slug}/training-guide`, icon: "📘", label: "Coach guide" },
    { href: `/clients/${slug}/shop`, icon: "🛒", label: "Shop" },
  ],
  "itc-quick-attach": (slug) => [
    { href: `/clients/${slug}/lp/dream-tractor`, icon: "🚜", label: "Dream tractor" },
    { href: `/clients/${slug}/lp/tym`, icon: "⚙️", label: "TYM owners" },
    { href: `/clients/${slug}/lp/dealer`, icon: "🤝", label: "Dealer ROI" },
    { href: "https://itcquickattach.com", icon: "🛒", label: "ITC shop" },
  ],
};

function quickLinksFor(slug: string): QuickLinkDef[] {
  const fn = QUICK_LINKS_BY_SLUG[slug];
  if (fn) return fn(slug);
  // Fallback: just a "your site" link for new clients we haven't
  // configured yet.
  return [{ href: `/clients/${slug}`, icon: "🌐", label: "Your site" }];
}

// Per-slug branding overrides for headers / display. Keeps the title-case
// fallback for new clients while giving us pixel-correct names for existing
// ones (e.g. "ITC Quick Attach" — not "Itc Quick Attach").
const SLUG_DISPLAY_NAME: Record<string, string> = {
  "itc-quick-attach": "ITC Quick Attach",
  "zenith-sports": "Zenith Sports",
  "hector-landscaping": "Hector Landscaping",
  "ps-reiki": "PS Reiki",
  "heale-counseling": "Heale Counseling",
  "lewis-county-autism": "Lewis County Autism Coalition",
  "mountain-view-landscape": "Mountain View Landscape",
  "pine-and-particle": "Pine & Particle",
};

function humanizeSlug(slug: string): string {
  if (SLUG_DISPLAY_NAME[slug]) return SLUG_DISPLAY_NAME[slug];
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}
