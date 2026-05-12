"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * /dashboard/backend-audit — operator-facing integration status board.
 *
 * Sister to docs/THEORETICAL_BACKEND_AUDIT.md but live. Reads from
 * /api/dashboard/backend-audit which probes each subsystem (counts +
 * env-var presence + last-run age) and returns green/yellow/red.
 *
 * Also hosts the Hyperloop cycle-time slider — operator dial for
 * MIN_IMPRESSIONS_FOR_VERDICT + MIN_IMPRESSIONS_FOR_LOSER. Backed by
 * system_settings; live within 60s of save (cache TTL).
 */

interface Subsystem {
  key: string;
  label: string;
  state: "green" | "yellow" | "red";
  detail: string;
  drilldown_href?: string;
}

interface Setting {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}

const PILL_CLASS: Record<Subsystem["state"], string> = {
  green: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
  yellow: "bg-amber-500/15 text-amber-300 border border-amber-500/40",
  red: "bg-rose-500/15 text-rose-300 border border-rose-500/40",
};

const PILL_DOT: Record<Subsystem["state"], string> = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-rose-400",
};

export default function BackendAuditPage() {
  const [subsystems, setSubsystems] = useState<Subsystem[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        fetch("/api/dashboard/backend-audit").then((r) => r.json()),
        fetch("/api/dashboard/settings").then((r) => r.json()),
      ]);
      if (a.ok) setSubsystems(a.subsystems);
      if (b.ok) setSettings(b.settings);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setSetting(key: string, value: unknown) {
    setSaving(key);
    try {
      await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value, updated_at: new Date().toISOString() } : s)),
      );
    } finally {
      setSaving(null);
    }
  }

  function getNumber(key: string, fallback: number): number {
    const s = settings.find((x) => x.key === key);
    return typeof s?.value === "number" ? s.value : Number(s?.value ?? fallback);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-10">
        <header>
          <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-2">
            BlueJays internal · operator
          </p>
          <h1 className="text-3xl font-bold mb-2">Backend audit</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Live status of every operating system. Companion to{" "}
            <code className="text-slate-300">docs/THEORETICAL_BACKEND_AUDIT.md</code> —
            that&apos;s the architectural narrative, this is the dashboard.
          </p>
        </header>

        {err && <p className="text-sm text-rose-400">{err}</p>}

        {/* ─── INTEGRATION STATUS ─── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Integrations
            </h2>
            <button
              onClick={load}
              className="text-xs text-slate-500 hover:text-white"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
          {subsystems.map((s) => (
            <div
              key={s.key}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-5 py-3 flex items-center gap-4"
            >
              <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${PILL_DOT[s.state]}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{s.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{s.detail}</p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${PILL_CLASS[s.state]}`}
              >
                {s.state}
              </span>
              {s.drilldown_href && (
                <Link
                  href={s.drilldown_href}
                  className="text-xs text-sky-400 hover:underline shrink-0"
                >
                  open →
                </Link>
              )}
            </div>
          ))}
        </section>

        {/* ─── CYCLE-TIME SLIDER ─── */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Hyperloop cycle-time
          </h2>
          <p className="text-sm text-slate-400 mb-4 max-w-2xl">
            Dial how fast the AI variant-feedback loop calls a winner /
            kills a loser. Lower = faster decisions, more variance. Higher
            = slower decisions, more confidence. Changes apply within ~60
            seconds (settings cache TTL).
          </p>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 space-y-6">
            <SliderRow
              label="Verdict threshold"
              hint="Below this many impressions, variants stay in 'testing'. Default 200."
              min={50}
              max={1000}
              step={50}
              value={getNumber("hyperloop.min_impressions_for_verdict", 200)}
              saving={saving === "hyperloop.min_impressions_for_verdict"}
              onChange={(v) => setSetting("hyperloop.min_impressions_for_verdict", v)}
            />
            <SliderRow
              label="Loser kill threshold"
              hint="Above this many impressions with zero conversions → auto-pause. Default 400."
              min={100}
              max={2000}
              step={100}
              value={getNumber("hyperloop.min_impressions_for_loser", 400)}
              saving={saving === "hyperloop.min_impressions_for_loser"}
              onChange={(v) => setSetting("hyperloop.min_impressions_for_loser", v)}
            />
          </div>

          <p className="text-[11px] text-slate-500 mt-3">
            Defaults are tuned for $50–100/day ad budgets. Scale up: pick
            higher thresholds. Scale down: pick lower.
          </p>
        </section>
      </div>
    </main>
  );
}

function SliderRow({
  label,
  hint,
  min,
  max,
  step,
  value,
  saving,
  onChange,
}: {
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  value: number;
  saving: boolean;
  onChange: (v: number) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-sm text-sky-300 tabular-nums font-bold">
          {local.toLocaleString()} impressions
          {saving && <span className="ml-2 text-xs text-slate-500">saving…</span>}
        </p>
      </div>
      <p className="text-xs text-slate-500 mb-2">{hint}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        onMouseUp={() => onChange(local)}
        onTouchEnd={() => onChange(local)}
        onKeyUp={() => onChange(local)}
        className="w-full accent-sky-500"
      />
      <div className="flex justify-between text-[10px] text-slate-500 mt-1 tabular-nums">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
