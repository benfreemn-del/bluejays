"use client";

import { useState, useMemo } from "react";
import type {
  EmailFrequency,
  SmsFrequency,
} from "@/lib/owner-notification-prefs";

type Row = {
  clientSlug: string;
  emailFrequency: EmailFrequency;
  smsFrequency: SmsFrequency;
  dashboardSignal: boolean;
  lastEmailDigestAt: string | null;
  lastSmsDigestAt: string | null;
};

const EMAIL_OPTIONS: { value: EmailFrequency; label: string; tone: string }[] = [
  { value: "instant", label: "Instant", tone: "bg-emerald-500/15 border-emerald-500/40 text-emerald-200" },
  { value: "daily", label: "Daily", tone: "bg-blue-500/15 border-blue-500/40 text-blue-200" },
  { value: "weekly", label: "Weekly", tone: "bg-violet-500/15 border-violet-500/40 text-violet-200" },
  { value: "off", label: "Off", tone: "bg-slate-700/40 border-slate-600/60 text-slate-300" },
];

const SMS_OPTIONS: { value: SmsFrequency; label: string; tone: string }[] = [
  { value: "instant", label: "Instant", tone: "bg-emerald-500/15 border-emerald-500/40 text-emerald-200" },
  { value: "daily", label: "Daily", tone: "bg-blue-500/15 border-blue-500/40 text-blue-200" },
  { value: "off", label: "Off", tone: "bg-slate-700/40 border-slate-600/60 text-slate-300" },
];

function titleize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function formatLastSent(iso: string | null): string {
  if (!iso) return "never";
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function NotificationsClient({
  initialRows,
}: {
  initialRows: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savedTick, setSavedTick] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.clientSlug.toLowerCase().includes(q) ||
        titleize(r.clientSlug).toLowerCase().includes(q),
    );
  }, [rows, search]);

  async function savePref(slug: string, patch: Partial<Row>) {
    setSaving((s) => ({ ...s, [slug]: true }));
    setRows((prev) =>
      prev.map((r) => (r.clientSlug === slug ? { ...r, ...patch } : r)),
    );
    try {
      const res = await fetch("/api/notifications/prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientSlug: slug, ...patch }),
      });
      const j = await res.json();
      if (!j.ok) {
        console.error("save failed", j);
      } else {
        setSavedTick((t) => ({ ...t, [slug]: Date.now() }));
      }
    } catch (err) {
      console.error("save threw", err);
    } finally {
      setSaving((s) => ({ ...s, [slug]: false }));
    }
  }

  async function bulkSet(channel: "email" | "sms", value: string) {
    if (!confirm(`Set ${channel} cadence to "${value}" for ALL ${filtered.length} clients?`)) {
      return;
    }
    for (const r of filtered) {
      const patch =
        channel === "email"
          ? { emailFrequency: value as EmailFrequency }
          : { smsFrequency: value as SmsFrequency };
      await savePref(r.clientSlug, patch);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients…"
          className="w-full max-w-md rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-blue-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-muted">Bulk:</span>
          <button
            type="button"
            onClick={() => bulkSet("email", "weekly")}
            className="rounded-md border border-violet-500/40 bg-violet-500/15 px-2 py-1 text-violet-200 hover:bg-violet-500/25"
          >
            All email → Weekly
          </button>
          <button
            type="button"
            onClick={() => bulkSet("email", "instant")}
            className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-emerald-200 hover:bg-emerald-500/25"
          >
            All email → Instant
          </button>
          <button
            type="button"
            onClick={() => bulkSet("sms", "off")}
            className="rounded-md border border-slate-600/60 bg-slate-700/40 px-2 py-1 text-slate-300 hover:bg-slate-700/60"
          >
            All SMS → Off
          </button>
        </div>
      </div>

      <p className="mb-3 text-xs text-muted">
        {filtered.length} client{filtered.length === 1 ? "" : "s"}
        {search ? ` matching "${search}"` : ""} · Defaults: Instant on
        every channel.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">SMS</th>
              <th className="px-4 py-3 font-medium">Dashboard</th>
              <th className="px-4 py-3 font-medium">Last digest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((row) => {
              const isSaving = !!saving[row.clientSlug];
              const recentlySaved =
                savedTick[row.clientSlug] &&
                Date.now() - savedTick[row.clientSlug] < 2000;
              return (
                <tr key={row.clientSlug} className="hover:bg-surface/40">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{titleize(row.clientSlug)}</div>
                    <code className="text-xs text-muted">{row.clientSlug}</code>
                    {isSaving && (
                      <span className="ml-2 text-xs text-blue-400">saving…</span>
                    )}
                    {!isSaving && recentlySaved && (
                      <span className="ml-2 text-xs text-emerald-400">✓ saved</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {EMAIL_OPTIONS.map((opt) => {
                        const selected = row.emailFrequency === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              savePref(row.clientSlug, {
                                emailFrequency: opt.value,
                              })
                            }
                            className={`rounded-md border px-2 py-1 text-xs transition ${
                              selected
                                ? opt.tone + " font-medium"
                                : "border-border bg-background text-muted hover:bg-surface"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {SMS_OPTIONS.map((opt) => {
                        const selected = row.smsFrequency === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              savePref(row.clientSlug, {
                                smsFrequency: opt.value,
                              })
                            }
                            className={`rounded-md border px-2 py-1 text-xs transition ${
                              selected
                                ? opt.tone + " font-medium"
                                : "border-border bg-background text-muted hover:bg-surface"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.dashboardSignal}
                        onChange={(e) =>
                          savePref(row.clientSlug, {
                            dashboardSignal: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-border bg-background text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-xs">
                        {row.dashboardSignal ? "On" : "Off"}
                      </span>
                    </label>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-muted">
                    <div>📧 {formatLastSent(row.lastEmailDigestAt)}</div>
                    <div>📱 {formatLastSent(row.lastSmsDigestAt)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-lg border border-border bg-surface/50 p-8 text-center text-muted">
          No clients match &ldquo;{search}&rdquo;.
        </div>
      )}

      <div className="mt-8 rounded-lg border border-border bg-surface/40 p-4 text-xs text-muted">
        <p className="mb-1 font-semibold text-foreground">How it works</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>Instant</strong> — alerts fire the moment an event
            happens (new lead, booking, contact form, etc.).
          </li>
          <li>
            <strong>Daily</strong> — events get queued; one digest
            sends at 5am PT (12:00 UTC).
          </li>
          <li>
            <strong>Weekly</strong> (email only) — queued events bundle
            into one Monday morning digest.
          </li>
          <li>
            <strong>Off</strong> — alerts dropped. Events still log to
            agent_signals; you just won&apos;t be pinged.
          </li>
          <li>
            System-wide alerts (cron failures, abandoned checkouts,
            unrelated to a specific client) always fire instantly —
            never suppressed by these settings.
          </li>
        </ul>
      </div>
    </div>
  );
}
