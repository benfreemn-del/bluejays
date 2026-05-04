"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

type Tab = "overview" | "leads" | "todo" | "insights" | "account";

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
};

const AUDIENCE_EMOJI: Record<string, string> = {
  parent: "👪",
  coach: "🏟️",
  player: "⚽",
  club: "🏛️",
  unknown: "❓",
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
    if (tab === "insights") loadReport();
    if (tab === "account") loadSubs();
  }, [tab, owner, loadLeads, loadReport, loadSubs, loadTasks]);

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
              { id: "todo", label: "To-Do", emoji: "✅" },
              { id: "insights", label: "Insights", emoji: "📊" },
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
        {tab === "insights" && <InsightsTab report={report} />}
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
            value={report ? `$${Math.round(report.leads.pipeline_value_usd)}` : "—"}
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
                <span className="text-xl">{AUDIENCE_EMOJI[l.audience ?? "unknown"] ?? "❓"}</span>
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
                <span className="text-xl">{AUDIENCE_EMOJI[l.audience_segment ?? "unknown"] ?? "❓"}</span>
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

      {/* QUICK LINKS */}
      <section>
        <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2.5">
          Quick links
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickLink href={`/clients/${slug}`} icon="🌐" label="Your site" />
          <QuickLink href={`/clients/${slug}/build-your-player`} icon="🎮" label="Build Your Player" />
          <QuickLink href={`/clients/${slug}/training-guide`} icon="📘" label="Coach guide" />
          <QuickLink href={`/clients/${slug}/shop`} icon="🛒" label="Shop" />
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

function InsightsTab({ report }: { report: Report | null }) {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [shopify, setShopify] = useState<ShopifyState | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/client-portal/shopify");
      const j = (await r.json().catch(() => ({}))) as ShopifyState & { ok?: boolean };
      if (j.ok) setShopify(j);
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

      {/* Headline grid */}
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
          value={`$${Math.round(report.leads.pipeline_value_usd)}`}
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

  const filtered =
    filter === "all"
      ? leads
      : filter === "unread"
        ? leads.filter((l) => l.funnel_status === "responded" || l.funnel_status === "not_enrolled")
        : filter === "uncontacted"
          ? leads.filter((l) => (l.touch_count ?? 0) === 0)
          : leads.filter((l) => l.funnel_status === filter);

  const counts = {
    all: leads.length,
    uncontacted: summary?.uncontacted ?? leads.filter((l) => (l.touch_count ?? 0) === 0).length,
    unread: leads.filter((l) => l.funnel_status === "responded" || l.funnel_status === "not_enrolled").length,
    enrolled: leads.filter((l) => l.funnel_status === "enrolled").length,
    converted: leads.filter((l) => l.funnel_status === "converted").length,
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[
          { id: "all", label: "All" },
          { id: "uncontacted", label: "Uncontacted" },
          { id: "unread", label: "Needs attention" },
          { id: "enrolled", label: "In funnel" },
          { id: "converted", label: "Won" },
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

  return (
    <article
      className={`rounded-lg border bg-slate-900/40 transition ${
        selected ? "border-blue-400/60 ring-1 ring-blue-400/30" : "border-slate-800"
      }`}
    >
      <div className="flex items-start gap-2 p-4">
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
          {AUDIENCE_EMOJI[lead.audience_segment ?? "unknown"] ?? "❓"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[15px]">
              {lead.name || "(no name)"}
            </span>
            {lead.audience_segment && (
              <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300">
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

          {/* Status flips + manual enroll */}
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
            {lead.funnel_status !== "enrolled" && (
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
                      {s.managed_by === "bluejays" ? "Managed by BlueJays" : "Owned by you"}
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
  accent?: "slate" | "blue" | "emerald" | "amber" | "violet";
}) {
  const colors: Record<string, string> = {
    slate: "bg-slate-900 border-slate-800",
    blue: "bg-blue-950/40 border-blue-500/30",
    emerald: "bg-emerald-950/40 border-emerald-500/30",
    amber: "bg-amber-950/40 border-amber-500/30",
    violet: "bg-violet-950/40 border-violet-500/30",
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

/* ─────────────────────────── HELPERS ─────────────────────────── */

function humanizeSlug(slug: string): string {
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
