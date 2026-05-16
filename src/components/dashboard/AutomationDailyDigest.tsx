"use client";

import { useEffect, useState } from "react";

/**
 * AutomationDailyDigest — overview-tab roll-up of everything the
 * BlueJays automation did in the last 24 hours.
 *
 * Reads from two sources:
 *   · cron_heartbeats — every successful cron run logs here
 *     (replies/process, customer-watchdog, funnel/run, oit-partner-scout,
 *      heygen-poll, etc.)
 *   · agent_signals — bot-to-bot handoff events with severity tags
 *
 * Surfaces a simple list: cron name, last run time, status, count of
 * actions taken. Keeps Ben's dashboard honest about what's actually
 * automated vs aspirational — if a cron hasn't pinged in 48 hours its
 * row goes red.
 */

type CronRow = {
  cron_name: string;
  last_run: string;
  count_24h: number;
  status: string;
  metadata: Record<string, unknown> | null;
};

type SignalSummary = {
  source: string;
  kind: string;
  severity: string;
  total_24h: number;
};

type DigestPayload = {
  ok: boolean;
  crons: CronRow[];
  signals: SignalSummary[];
  fetchedAt: string;
};

// Friendly-name + emoji + 1-line "what it does" so a non-engineer
// reading the dashboard knows what each cron is actually for.
const CRON_META: Record<string, { emoji: string; label: string; what: string }> = {
  funnel_run: {
    emoji: "📨",
    label: "Funnel runner",
    what: "Sends scheduled drip emails + SMS across every client funnel",
  },
  client_funnels_run: {
    emoji: "📬",
    label: "Per-client funnels",
    what: "Hourly per-client cadence dispatcher",
  },
  customer_watchdog: {
    emoji: "🚨",
    label: "Customer watchdog",
    what: "Anomaly detection across active clients",
  },
  digest: {
    emoji: "📊",
    label: "Daily digest",
    what: "Morning SMS recap with pipeline + alerts",
  },
  replies_process: {
    emoji: "✉️",
    label: "Reply processor",
    what: "Routes inbound replies to AI responder + per-client funnels",
  },
  onboarding_reminders: {
    emoji: "📅",
    label: "Onboarding reminders",
    what: "30-day setup-drip for new clients",
  },
  campaigns_scheduled: {
    emoji: "📆",
    label: "Scheduled campaigns",
    what: "Fires per-client campaigns on their owner-set times",
  },
  ai_package_welcome: {
    emoji: "🎁",
    label: "AI package welcome",
    what: "5-email arc for $10,000 closes",
  },
  win_loss_survey: {
    emoji: "📋",
    label: "Win-loss survey",
    what: "Post-decision survey to closed prospects",
  },
  heygen_poll: {
    emoji: "🎬",
    label: "HeyGen poll",
    what: "Polls HeyGen for personalized-video render status",
  },
  oit_partner_scout: {
    emoji: "🗺️",
    label: "OIT partner scout",
    what: "Weekly Olympic Peninsula affiliate-target discovery",
  },
  watchdog_run: {
    emoji: "🐕",
    label: "Cron heartbeat watchdog",
    what: "Detects silent crons — pings Ben if anything goes dark",
  },
  hyperloop_run: {
    emoji: "🔬",
    label: "Hyperloop A/B",
    what: "Wilson-CI A/B engine — promotes winners, kills losers",
  },
  audit_followup: {
    emoji: "📈",
    label: "Audit follow-up",
    what: "Re-engages prospects who got an audit but never replied",
  },
  postcard_cron: {
    emoji: "📮",
    label: "Postcards",
    what: "Lob mail step inside multi-channel funnels",
  },
  agency_backlog: {
    emoji: "🏢",
    label: "Agency backlog",
    what: "Replatforms agency-replacement prospects",
  },
  agency_nurture: {
    emoji: "📩",
    label: "Agency nurture",
    what: "Long-cycle nurture for pre-AI-package agency prospects",
  },
  cutover_smoke_test: {
    emoji: "🔍",
    label: "Cutover smoke test",
    what: "Validates new-domain DNS after every client cutover",
  },
  zenith_drill_of_week: {
    emoji: "⚽",
    label: "Zenith drill of the week",
    what: "Weekly soccer-drill content drop",
  },
  client_reports: {
    emoji: "📰",
    label: "Client weekly digest",
    what: "Per-client Monday-morning report",
  },
  client_hyperloop_run: {
    emoji: "🧪",
    label: "Per-client Hyperloop",
    what: "A/B winners promoted into client funnels",
  },
  auto_scout: {
    emoji: "🌐",
    label: "Auto scout",
    what: "Daily ICP-match prospect discovery",
  },
  nps_send: {
    emoji: "⭐",
    label: "NPS survey",
    what: "Periodic customer satisfaction pulse",
  },
  test_cohort_postcard: {
    emoji: "✉️",
    label: "Test cohort postcard",
    what: "A/B test postcards within active cohorts",
  },
  review_blast: {
    emoji: "🌟",
    label: "Review blast",
    what: "30-days-happy review-request to closed clients",
  },
  audit_postcard: {
    emoji: "📬",
    label: "Audit postcard",
    what: "Physical mailer for warm-but-cold-feet audit prospects",
  },
  referral_send: {
    emoji: "🤝",
    label: "Referral nudge",
    what: "Asks happy customers for the next referral",
  },
  reports_monthly: {
    emoji: "📅",
    label: "Monthly reports",
    what: "Per-client monthly performance roll-up",
  },
  billing_check_upcoming_renewals: {
    emoji: "💳",
    label: "Renewal alert",
    what: "Pings owners 14 days before subscription renewals",
  },
  billing_retry_failed_sends: {
    emoji: "🔁",
    label: "Failed-send retry",
    what: "Re-tries SendGrid/Twilio sends that errored",
  },
  billing_check_domain_renewals: {
    emoji: "🌐",
    label: "Domain renewal",
    what: "Watches Namecheap registrations for upcoming expiries",
  },
};

function metaFor(name: string) {
  return (
    CRON_META[name] || {
      emoji: "⚙️",
      label: name.replace(/_/g, " "),
      what: "",
    }
  );
}

function formatRelative(iso: string): string {
  const t = Date.parse(iso);
  if (!t) return "—";
  const ms = Date.now() - t;
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export default function AutomationDailyDigest({
  clientSlug,
}: {
  /** When set, filters cron + signal data to one tenant. Used in the
   *  per-client portal so each owner sees what the AI did for THEIR
   *  business — not Ben's whole BlueJays system. */
  clientSlug?: string;
} = {}) {
  const [data, setData] = useState<DigestPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = clientSlug
          ? `/api/automation-digest?clientSlug=${encodeURIComponent(clientSlug)}`
          : "/api/automation-digest";
        const r = await fetch(url, { credentials: "include" });
        if (!r.ok) return;
        const j = (await r.json()) as DigestPayload;
        if (!cancelled) setData(j);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientSlug]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-violet-500/20 bg-slate-900/40 p-5">
        <p className="text-sm text-slate-500">Loading automation digest…</p>
      </section>
    );
  }

  const crons = data?.crons ?? [];
  const signals = data?.signals ?? [];

  // Per-tenant view: if nothing happened for this client in the last
  // 24h, hide the card entirely instead of rendering a sad empty
  // state. Owner overview stays clean. Ben's BlueJays-wide view
  // (no clientSlug) always renders even when empty so silent crons
  // are catchable.
  if (clientSlug && crons.length === 0 && signals.length === 0) {
    return null;
  }
  const totalActions = crons.reduce((s, c) => s + (c.count_24h ?? 0), 0);
  const stalled = crons.filter((c) => {
    const t = Date.parse(c.last_run);
    return !t || Date.now() - t > 48 * 60 * 60 * 1000;
  });

  // Default: show top 5; "Show all" toggles full list.
  const visibleCrons = expanded ? crons : crons.slice(0, 5);

  return (
    <section className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-950/30 via-slate-900/50 to-slate-900/60 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300 mb-1">
            {clientSlug
              ? "Your AI · last 24 hours"
              : "Automation · last 24 hours"}
          </p>
          <h2 className="text-lg font-bold text-white">
            {clientSlug
              ? "🤖 What your AI did today"
              : "🤖 What ran today"}
          </h2>
        </div>
        <div className="text-right text-[12px] text-slate-400">
          <div>
            <strong className="text-white">{crons.length}</strong> crons fired ·{" "}
            <strong className="text-white">{totalActions}</strong> actions
          </div>
          {stalled.length > 0 && (
            <div className="text-rose-300">
              {stalled.length} stalled (&gt;48h)
            </div>
          )}
        </div>
      </div>

      {crons.length === 0 ? (
        <p className="text-sm text-slate-500 italic">
          No cron heartbeats logged in the last 24 hours. Either the
          deployment is fresh or the watchdog should be alerting.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {visibleCrons.map((c) => {
            const m = metaFor(c.cron_name);
            const t = Date.parse(c.last_run);
            const stale = !t || Date.now() - t > 48 * 60 * 60 * 1000;
            return (
              <li
                key={c.cron_name}
                className={`flex items-center gap-3 rounded-md px-3 py-2 ${
                  stale
                    ? "bg-rose-950/30 border border-rose-500/30"
                    : "bg-slate-900/50 border border-white/5"
                }`}
              >
                <span className="text-lg leading-none">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">
                      {m.label}
                    </span>
                    {c.count_24h > 1 && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-violet-200 bg-violet-500/15 border border-violet-500/30 px-1.5 py-0.5 rounded">
                        ×{c.count_24h}
                      </span>
                    )}
                    {stale && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-rose-200">
                        stalled
                      </span>
                    )}
                  </div>
                  {m.what && (
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {m.what}
                    </p>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 shrink-0 tabular-nums">
                  {formatRelative(c.last_run)}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {crons.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-[11px] uppercase tracking-wider font-bold text-violet-300 hover:text-white"
        >
          {expanded
            ? `Hide ${crons.length - 5} more`
            : `Show all ${crons.length}`}
        </button>
      )}

      {signals.length > 0 && (
        <>
          <p className="mt-5 mb-2 text-[10px] uppercase tracking-[0.18em] font-bold text-slate-400">
            Bot-to-bot signals
          </p>
          <ul className="grid grid-cols-2 gap-1.5 text-[11px]">
            {signals.slice(0, 8).map((s) => (
              <li
                key={`${s.source}-${s.kind}`}
                className="flex items-center justify-between rounded bg-slate-900/40 border border-white/5 px-2.5 py-1.5"
              >
                <span className="text-slate-300 truncate">
                  {s.source} → {s.kind}
                </span>
                <span className="text-violet-300 font-bold tabular-nums">
                  ×{s.total_24h}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
