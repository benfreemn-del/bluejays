"use client";

/**
 * /dashboard/agency — review queue for agency_applications.
 *
 * Solves "the apply funnel is firing into a void" — Ben needs a
 * single screen that surfaces every applicant, ages out the ones
 * waiting > 24h, and lets him update status + notes inline so the
 * audit trail lives in the DB rather than his inbox.
 *
 * Status lifecycle:
 *   new       — needs Ben's manual review
 *   qualified — auto-passed the form's qualifying gate; Ben should
 *               confirm + send Calendly link if not already booked
 *   called    — strategy call completed
 *   won       — paid → corresponding agency_customers row exists
 *   lost      — said no on call OR ghosted
 *   dnq       — auto-declined (didn't meet hard thresholds)
 *
 * Auth: middleware enforces admin-password cookie on /dashboard/*.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

type Status = "new" | "qualified" | "called" | "won" | "lost" | "dnq";

type MeetingOutcome = "no_show" | "declined" | "interested" | "closed";

type Application = {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  industry: string | null;
  what_they_sell: string | null;
  avg_customer_value_cents: number | null;
  monthly_revenue_cents: number | null;
  current_close_rate_per_month: number | null;
  ideal_customer: string | null;
  current_marketing: string | null;
  budget_confirmed: boolean;
  success_criteria: string | null;
  status: Status;
  notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  applied_at: string;
  // BAM-FAM outcome tracking (Hormozi backend review A3, 2026-05-16).
  // All nullable until the prospect moves through each stage.
  calendly_sent_at: string | null;
  meeting_booked_at: string | null;
  meeting_completed_at: string | null;
  meeting_outcome: MeetingOutcome | null;
  bamfam_notes: string | null;
};

const MEETING_OUTCOMES: Array<{ key: MeetingOutcome; label: string; color: string }> = [
  { key: "no_show", label: "No show", color: "bg-slate-500/15 border-slate-500/40 text-slate-400" },
  { key: "declined", label: "Declined", color: "bg-rose-500/15 border-rose-500/40 text-rose-300" },
  { key: "interested", label: "Interested", color: "bg-amber-500/15 border-amber-500/40 text-amber-300" },
  { key: "closed", label: "Closed", color: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" },
];

const STATUS_FILTERS: Array<{ key: Status | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "new", label: "New (needs review)" },
  { key: "qualified", label: "Qualified" },
  { key: "called", label: "Called" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
  { key: "dnq", label: "DNQ" },
];

const STATUS_COLORS: Record<Status, string> = {
  new: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  qualified: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
  called: "bg-sky-500/15 border-sky-500/40 text-sky-300",
  won: "bg-violet-500/15 border-violet-500/40 text-violet-300",
  lost: "bg-rose-500/15 border-rose-500/40 text-rose-300",
  dnq: "bg-slate-500/15 border-slate-500/40 text-slate-400",
};

function fmtMoney(cents: number | null): string {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toLocaleString()}`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

export default function AgencyDashboardPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<Status | "all">("new");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/agency-applications?status=${filter}&limit=300`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || `Load failed (${res.status})`);
      setApps(json.applications || []);
      setCounts(json.counts || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  // Aging warnings — applicants in 'new' status for >24h are a Ben-SLA
  // problem. The apply form promises "1 business day reply." Highlight
  // the offenders so they don't slip.
  const agingNew = useMemo(
    () => apps.filter((a) => a.status === "new" && hoursSince(a.applied_at) > 24).length,
    [apps],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Agency Applications</h1>
              <p className="text-sm text-slate-400 mt-1">
                $10,000 AI Marketing System review queue
              </p>
            </div>
            {agingNew > 0 && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm">
                <span className="text-amber-400 font-bold">{agingNew}</span>
                <span className="text-amber-200/80"> applications waiting &gt; 24h</span>
              </div>
            )}
          </div>
        </header>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.key
                  ? "bg-violet-500/20 border-violet-500/50 text-violet-200"
                  : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-slate-500">{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 mb-4">
            {error}
          </div>
        )}

        {loading && <p className="text-slate-500 text-sm">Loading…</p>}

        {!loading && apps.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="text-slate-400">No applications in this view.</p>
          </div>
        )}

        <div className="space-y-4">
          {apps.map((app) => (
            <ApplicationCard key={app.id} app={app} onChanged={load} />
          ))}
        </div>
      </div>
    </main>
  );
}

function ApplicationCard({ app, onChanged }: { app: Application; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(app.notes || "");
  const [bamfamNotes, setBamfamNotes] = useState(app.bamfam_notes || "");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  async function update(
    next: Partial<{
      status: Status;
      notes: string;
      calendly_sent_at: string | null;
      meeting_booked_at: string | null;
      meeting_completed_at: string | null;
      meeting_outcome: MeetingOutcome | null;
      bamfam_notes: string;
    }>,
  ) {
    setSaving(true);
    setSaveErr("");
    try {
      const res = await fetch(`/api/dashboard/agency-applications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id, ...next, reviewed_by: "ben" }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || `Update failed (${res.status})`);
      onChanged();
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  const aging = hoursSince(app.applied_at);
  const isStale = app.status === "new" && aging > 24;

  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        isStale
          ? "border-amber-500/40 bg-amber-500/[0.04]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-white text-lg truncate">{app.business_name}</h3>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[app.status]}`}
            >
              {app.status}
            </span>
            {isStale && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/50 bg-amber-500/15 text-amber-300">
                {Math.floor(aging)}h waiting
              </span>
            )}
          </div>
          <p className="text-sm text-slate-300">
            {app.contact_name} · <a href={`mailto:${app.email}`} className="text-sky-400 hover:underline">{app.email}</a>
            {app.phone ? ` · ${app.phone}` : ""}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {app.industry || "—"} · Applied {fmtDate(app.applied_at)}
            {app.utm_source ? ` · src=${app.utm_source}` : ""}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-4 text-xs flex-wrap">
          <Stat label="AVG" value={fmtMoney(app.avg_customer_value_cents)} />
          <Stat label="MRR" value={fmtMoney(app.monthly_revenue_cents)} />
          <Stat label="Closes/mo" value={app.current_close_rate_per_month?.toString() || "—"} />
          <Stat label="Budget" value={app.budget_confirmed ? "✓" : "✗"} accent={app.budget_confirmed} />
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-4 text-xs text-slate-400 hover:text-white transition-colors"
      >
        {open ? "▲ Hide details" : "▼ Show details, notes & actions"}
      </button>

      {open && (
        <div className="mt-5 pt-5 border-t border-white/5 space-y-4">
          {/* Free-text answers */}
          <Detail label="What they sell" value={app.what_they_sell} />
          <Detail label="Ideal customer" value={app.ideal_customer} />
          <Detail label="Current marketing" value={app.current_marketing} />
          <Detail label="Day-90 success" value={app.success_criteria} />
          {app.website && (
            <p className="text-xs text-slate-400">
              Site:{" "}
              <a
                href={app.website.startsWith("http") ? app.website : `https://${app.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline"
              >
                {app.website}
              </a>
            </p>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Internal notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What you learned on the call, follow-up actions, etc."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-colors resize-y"
            />
            <button
              onClick={() => update({ notes })}
              disabled={saving || notes === (app.notes || "")}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/40 text-violet-200 hover:bg-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving…" : "Save notes"}
            </button>
          </div>

          {/* BAM-FAM outcome tracking (Hormozi backend review A3, 2026-05-16).
              Tracks the apply-funnel from qualified → calendar sent → booked
              → call completed → outcome. Replaces the "qualified-but-ghosted"
              black hole the old qualified-state had. */}
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
                🎯 BAM-FAM tracking
              </p>
              {app.meeting_outcome && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    MEETING_OUTCOMES.find((m) => m.key === app.meeting_outcome)?.color || ""
                  }`}
                >
                  {MEETING_OUTCOMES.find((m) => m.key === app.meeting_outcome)?.label || app.meeting_outcome}
                </span>
              )}
            </div>

            {/* 4-stage progress timeline */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { key: "calendly_sent_at", label: "Calendly sent", value: app.calendly_sent_at },
                { key: "meeting_booked_at", label: "Booked", value: app.meeting_booked_at },
                { key: "meeting_completed_at", label: "Call done", value: app.meeting_completed_at },
                { key: "meeting_outcome", label: "Outcome", value: app.meeting_outcome },
              ].map((step) => (
                <div
                  key={step.key}
                  className={`rounded-lg border p-2 text-center ${
                    step.value
                      ? "border-violet-500/40 bg-violet-500/10"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div
                    className={`text-base ${step.value ? "text-violet-300" : "text-slate-600"}`}
                  >
                    {step.value ? "✓" : "○"}
                  </div>
                  <div
                    className={`text-[10px] uppercase tracking-wider mt-0.5 ${
                      step.value ? "text-violet-200" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.value && typeof step.value === "string" && step.value.includes("T") && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {fmtDate(step.value)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Stage-advancement buttons — one click per step */}
            <div className="flex flex-wrap gap-2 mb-3">
              {!app.calendly_sent_at && (
                <button
                  onClick={() => update({ calendly_sent_at: new Date().toISOString() })}
                  disabled={saving}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 disabled:opacity-50 transition-colors"
                >
                  ✉ Mark Calendly sent
                </button>
              )}
              {app.calendly_sent_at && !app.meeting_booked_at && (
                <button
                  onClick={() => update({ meeting_booked_at: new Date().toISOString() })}
                  disabled={saving}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 disabled:opacity-50 transition-colors"
                >
                  📅 Mark booked
                </button>
              )}
              {app.meeting_booked_at && !app.meeting_completed_at && (
                <button
                  onClick={() => update({ meeting_completed_at: new Date().toISOString() })}
                  disabled={saving}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 disabled:opacity-50 transition-colors"
                >
                  ☎ Mark call done
                </button>
              )}
              {/* Reset — clears the entire BAM-FAM trail. Confirmation prompt. */}
              {(app.calendly_sent_at || app.meeting_booked_at || app.meeting_completed_at) && (
                <button
                  onClick={() => {
                    if (!confirm("Clear all BAM-FAM stages on this application?")) return;
                    update({
                      calendly_sent_at: null,
                      meeting_booked_at: null,
                      meeting_completed_at: null,
                      meeting_outcome: null,
                    });
                  }}
                  disabled={saving}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 text-slate-500 hover:text-rose-300 hover:border-rose-500/40 disabled:opacity-50 transition-colors"
                >
                  ↺ Reset trail
                </button>
              )}
            </div>

            {/* Outcome dropdown — only visible once the call is marked complete */}
            {app.meeting_completed_at && (
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-400 mb-1.5">Call outcome</p>
                <div className="flex flex-wrap gap-2">
                  {MEETING_OUTCOMES.map((o) => (
                    <button
                      key={o.key}
                      onClick={() => update({ meeting_outcome: o.key })}
                      disabled={saving || app.meeting_outcome === o.key}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${o.color} hover:brightness-110`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BAM-FAM call notes — separate from the general notes above
                so the call write-up doesn't get lost in pre-call research. */}
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Call notes (BAM-FAM)
            </label>
            <textarea
              value={bamfamNotes}
              onChange={(e) => setBamfamNotes(e.target.value)}
              rows={2}
              placeholder="Save reason, objections raised, next-step commitment, etc."
              className="w-full rounded-xl border border-violet-500/20 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-colors resize-y"
            />
            <button
              onClick={() => update({ bamfam_notes: bamfamNotes })}
              disabled={saving || bamfamNotes === (app.bamfam_notes || "")}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/40 text-violet-200 hover:bg-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving…" : "Save call notes"}
            </button>
          </div>

          {/* Status actions */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1.5">Move to status</p>
            <div className="flex flex-wrap gap-2">
              {(["qualified", "called", "won", "lost", "dnq"] as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => update({ status: s })}
                  disabled={saving || app.status === s}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${STATUS_COLORS[s]} hover:brightness-110`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {saveErr && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {saveErr}
            </div>
          )}

          {app.reviewed_at && (
            <p className="text-xs text-slate-600">
              Last touched {fmtDate(app.reviewed_at)}
              {app.reviewed_by ? ` by ${app.reviewed_by}` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`font-bold tabular-nums ${accent ? "text-emerald-400" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-slate-300 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
