"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * /clients/[slug]/portal — owner-facing dashboard.
 *
 * Scoped read+write on the owner's client_slug data. Sections:
 *   - Leads (read + status flips + notes)
 *   - Weekly report (read)
 *   - Account / change password
 *
 * Auth via the `client-portal-session` cookie. If missing/invalid,
 * redirects to /clients/[slug]/login.
 *
 * Intentionally NOT exposing ads/affiliates to owners by default —
 * those are operator-side surfaces while the funnel is being tuned.
 * Easy to add a tab if a client asks.
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

type Report = {
  leads: { total: number; new_this_week: number; delta_vs_prior_week: number };
  funnel: { responded: number; converted: number; response_rate_pct: number };
  highlights: string[];
  next_actions: string[];
} | null;

type Tab = "leads" | "reports" | "account";

const STATUS_COLOR: Record<string, string> = {
  not_enrolled: "bg-slate-700/40 text-slate-300",
  enrolled: "bg-blue-500/20 text-blue-300",
  paused: "bg-amber-500/20 text-amber-300",
  responded: "bg-emerald-500/20 text-emerald-300",
  converted: "bg-emerald-500 text-white",
  completed: "bg-slate-700 text-slate-400",
};

export default function PortalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [tab, setTab] = useState<Tab>("leads");
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [report, setReport] = useState<Report>(null);
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
          // Logged in but for a different client — redirect to their own
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

  /* Per-tab data fetchers — scoped to owner's slug by the cookie. */
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

  useEffect(() => {
    if (!owner) return;
    if (tab === "leads") loadLeads();
    if (tab === "reports") loadReport();
  }, [tab, owner, loadLeads, loadReport]);

  const updateLeadStatus = async (id: string, status: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, funnel_status: status } : l)),
    );
    await fetch(`/api/client-portal/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ funnel_status: status }),
    });
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

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-[#070a13]/85 border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <Link
            href={`/clients/${slug}`}
            className="text-xs text-slate-400 hover:text-white"
          >
            ← Back to site
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">
              {slug} <span className="text-slate-500 font-normal">/ portal</span>
            </h1>
            <div className="text-[11px] text-slate-500">
              Signed in as {owner.name || owner.email}
            </div>
          </div>
          <button
            onClick={logout}
            className="text-[11px] tracking-wider uppercase font-bold text-slate-400 hover:text-white border border-slate-700 px-2.5 py-1 rounded"
          >
            Sign out
          </button>
        </div>
        <nav className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-4 text-sm">
          {(["leads", "reports", "account"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-2.5 border-b-2 transition font-semibold ${
                tab === t
                  ? "border-blue-400 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {t === "leads" ? "Leads" : t === "reports" ? "Weekly Report" : "Account"}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 pb-32">
        {tab === "leads" && (
          <LeadsTab leads={leads} onStatus={updateLeadStatus} />
        )}
        {tab === "reports" && <ReportTab report={report} />}
        {tab === "account" && <AccountTab owner={owner} onLogout={logout} />}
      </main>
    </div>
  );
}

function LeadsTab({
  leads,
  onStatus,
}: {
  leads: ClientLead[];
  onStatus: (id: string, status: string) => void;
}) {
  if (leads.length === 0) {
    return (
      <div className="text-center text-slate-500 py-16 border border-dashed border-slate-800 rounded-lg">
        <div className="text-4xl mb-2">📥</div>
        <p>No leads yet — they&apos;ll appear here as they come in.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {leads.map((l) => (
        <article
          key={l.id}
          className="rounded-lg border border-slate-800 bg-slate-900/40 p-4"
        >
          <div className="flex items-start gap-3">
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
              <div className="mt-1 text-[11px] text-slate-400 flex flex-wrap gap-2">
                {l.email && (
                  <a
                    href={`mailto:${l.email}`}
                    className="hover:text-blue-300"
                  >
                    ✉ {l.email}
                  </a>
                )}
                {l.phone && (
                  <>
                    <a
                      href={`tel:${l.phone}`}
                      className="hover:text-blue-300"
                    >
                      ☎ {l.phone}
                    </a>
                    <a
                      href={`sms:${l.phone}`}
                      className="hover:text-blue-300"
                    >
                      💬 Text
                    </a>
                  </>
                )}
              </div>
              {l.intent && (
                <div className="mt-1 text-[12px] text-slate-300">
                  <span className="text-slate-500">Intent:</span> {l.intent}
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
                className={`text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded transition ${
                  l.funnel_status === s
                    ? STATUS_COLOR[s] + " cursor-default"
                    : "border border-slate-700 text-slate-500 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ReportTab({ report }: { report: Report }) {
  if (!report) {
    return (
      <div className="text-center text-slate-500 py-16">
        Loading report…
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Stat label="Total leads" value={report.leads.total} />
        <Stat label="New this week" value={report.leads.new_this_week} delta={report.leads.delta_vs_prior_week} />
        <Stat label="Responded" value={report.funnel.responded} suffix={`${report.funnel.response_rate_pct.toFixed(0)}%`} />
        <Stat label="Converted" value={report.funnel.converted} accent="emerald" />
      </div>

      {report.highlights.length > 0 && (
        <section>
          <h2 className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 mb-2">
            This week
          </h2>
          <ul className="space-y-1.5 text-sm">
            {report.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-slate-200">
                <span className="text-emerald-500">→</span>{h}
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.next_actions.length > 0 && (
        <section>
          <h2 className="text-[11px] uppercase tracking-wider font-bold text-amber-400 mb-2">
            Suggested next moves
          </h2>
          <ul className="space-y-1.5 text-sm">
            {report.next_actions.map((a) => (
              <li key={a} className="flex gap-2 text-slate-200">
                <span className="text-amber-400">→</span>{a}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AccountTab({
  owner,
  onLogout,
}: {
  owner: Owner;
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
            <div><span className="text-slate-500">Last login:</span> {new Date(owner.last_login_at).toLocaleString()}</div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-3">Change password</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={cur}
            onChange={(e) => setCur(e.target.value)}
            placeholder="Current password"
            autoComplete="current-password"
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

function Stat({
  label,
  value,
  delta,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  delta?: number;
  suffix?: string;
  accent?: "emerald";
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        accent === "emerald"
          ? "bg-emerald-950/40 border-emerald-500/30"
          : "bg-slate-900 border-slate-800"
      }`}
    >
      <div className="text-[10px] tracking-wider uppercase font-bold text-slate-400">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tighter">{value}</span>
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
        {delta !== undefined && (
          <span className={`text-[10px] font-bold ${delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {delta >= 0 ? "+" : ""}{delta}
          </span>
        )}
      </div>
    </div>
  );
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
