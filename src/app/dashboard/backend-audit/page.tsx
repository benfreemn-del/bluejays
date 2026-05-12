"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Card, Pill, StatusDot, SectionLabel, Button, ErrorHint, type Tone } from "@/components/ui";

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

const TONE_FOR_STATE: Record<Subsystem["state"], Tone> = {
  green: "emerald",
  yellow: "amber",
  red: "rose",
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
    <Page max="4xl">
      <PageHeader
        eyebrow="BlueJays internal · operator"
        title="Backend audit"
        description="Live status of every operating system. Companion to docs/THEORETICAL_BACKEND_AUDIT.md — that's the architectural narrative, this is the dashboard."
      />

      {err && <ErrorHint>{err}</ErrorHint>}

      {/* ─── INTEGRATION STATUS ─── */}
      <section className="space-y-2 mb-10">
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Integrations</SectionLabel>
          <Button variant="ghost" size="sm" onClick={load}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
        {subsystems.map((s) => (
          <Card key={s.key} className="!p-4 flex items-center gap-4">
            <StatusDot tone={TONE_FOR_STATE[s.state]} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{s.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{s.detail}</p>
            </div>
            <Pill tone={TONE_FOR_STATE[s.state]}>{s.state}</Pill>
            {s.drilldown_href && (
              <Link
                href={s.drilldown_href}
                className="text-xs text-sky-400 hover:underline shrink-0"
              >
                open →
              </Link>
            )}
          </Card>
        ))}
      </section>

      {/* ─── CYCLE-TIME SLIDER ─── */}
      <section>
        <SectionLabel className="mb-2">Hyperloop cycle-time</SectionLabel>
        <p className="text-sm text-slate-400 mb-4 max-w-2xl">
          Dial how fast the AI variant-feedback loop calls a winner /
          kills a loser. Lower = faster decisions, more variance. Higher
          = slower decisions, more confidence. Changes apply within ~60
          seconds (settings cache TTL).
        </p>

        <Card className="space-y-6">
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
        </Card>

        <p className="text-[11px] text-slate-500 mt-3">
          Defaults are tuned for $50–100/day ad budgets. Scale up: pick
          higher thresholds. Scale down: pick lower.
        </p>
      </section>
    </Page>
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
