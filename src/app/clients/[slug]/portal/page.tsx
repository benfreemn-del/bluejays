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

type Tab = "overview" | "leads" | "insights" | "account";

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
  const [report, setReport] = useState<Report | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
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
    const j = (await r.json()) as { ok: boolean; leads?: ClientLead[] };
    if (j.ok && j.leads) setLeads(j.leads);
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

  // Overview tab needs leads + report + subs all at once.
  useEffect(() => {
    if (!owner) return;
    if (tab === "overview") {
      loadLeads();
      loadReport();
      loadSubs();
    }
    if (tab === "leads") loadLeads();
    if (tab === "insights") loadReport();
    if (tab === "account") loadSubs();
  }, [tab, owner, loadLeads, loadReport, loadSubs]);

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
            report={report}
            subs={subs}
            onSetTab={setTab}
            onLeadStatus={updateLeadStatus}
          />
        )}
        {tab === "leads" && (
          <LeadsTab leads={leads} onStatus={updateLeadStatus} />
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
  report,
  subs,
  onSetTab,
  onLeadStatus,
}: {
  slug: string;
  owner: Owner;
  leads: ClientLead[];
  report: Report | null;
  subs: Subscription[];
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
  if (!report) {
    return (
      <div className="text-center text-slate-500 py-16">Loading insights…</div>
    );
  }
  const maxTrend = Math.max(...report.leads.weekly_trend.map((w) => w.count), 1);
  const maxHour = Math.max(...report.patterns.by_hour, 1);
  const maxDay = Math.max(...report.patterns.by_day_of_week, 1);

  return (
    <div className="space-y-6">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">
        Period: {new Date(report.period.start).toDateString()} → {new Date(report.period.end).toDateString()}
      </div>

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

      {/* Weekly trend chart — last 13 weeks */}
      <section>
        <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2.5">
          Lead volume — last 13 weeks
        </h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-end gap-1 h-24">
            {report.leads.weekly_trend.map((w) => (
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
            <span>{report.leads.weekly_trend[0]?.week.slice(5)}</span>
            <span>{report.leads.weekly_trend[report.leads.weekly_trend.length - 1]?.week.slice(5)}</span>
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
  onStatus,
}: {
  leads: ClientLead[];
  onStatus: (id: string, status: string) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const filtered =
    filter === "all"
      ? leads
      : filter === "unread"
        ? leads.filter((l) => l.funnel_status === "responded" || l.funnel_status === "not_enrolled")
        : leads.filter((l) => l.funnel_status === filter);

  const counts = {
    all: leads.length,
    unread: leads.filter((l) => l.funnel_status === "responded" || l.funnel_status === "not_enrolled").length,
    enrolled: leads.filter((l) => l.funnel_status === "enrolled").length,
    converted: leads.filter((l) => l.funnel_status === "converted").length,
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[
          { id: "all", label: "All" },
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
        <div className="space-y-2">
          {filtered.map((l) => (
            <article
              key={l.id}
              className="rounded-lg border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">
                  {AUDIENCE_EMOJI[l.audience_segment ?? "unknown"] ?? "❓"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[15px]">
                      {l.name || "(no name)"}
                    </span>
                    {l.audience_segment && (
                      <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300">
                        {l.audience_segment}
                      </span>
                    )}
                    <span
                      className={`text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded ${STATUS_COLOR[l.funnel_status] ?? STATUS_COLOR.not_enrolled}`}
                    >
                      {l.funnel_status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                    {l.email && (
                      <a href={`mailto:${l.email}`} className="hover:text-blue-300">
                        ✉ {l.email}
                      </a>
                    )}
                    {l.phone && (
                      <>
                        <a href={`tel:${l.phone}`} className="hover:text-blue-300">
                          ☎ {l.phone}
                        </a>
                        <a href={`sms:${l.phone}`} className="hover:text-blue-300">
                          💬 Text
                        </a>
                      </>
                    )}
                    {l.source && (
                      <span className="text-slate-500">
                        from {SOURCE_LABEL[l.source] ?? l.source}
                      </span>
                    )}
                  </div>
                  {l.intent && (
                    <div className="mt-1.5 text-[12px] text-slate-300">
                      <span className="text-slate-500">Wants:</span> {l.intent}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 shrink-0">
                  {timeAgo(l.created_at)}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                {["enrolled", "paused", "responded", "converted"].map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatus(l.id, s)}
                    disabled={l.funnel_status === s}
                    className={`text-[10px] tracking-wider uppercase font-bold px-2 py-1 rounded transition ${
                      l.funnel_status === s
                        ? STATUS_COLOR[s] + " cursor-default"
                        : "border border-slate-700 text-slate-500 hover:text-white"
                    }`}
                  >
                    {s === "converted" ? "Won" : s}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
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
    <div className="space-y-8 max-w-md">
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
