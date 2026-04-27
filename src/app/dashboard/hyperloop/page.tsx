"use client";

import { useEffect, useState } from "react";

/**
 * /dashboard/hyperloop — operator view of the AI variant feedback loop.
 *
 * Shows:
 *   - Kill-switch toggle (10B) — pause/resume the cron without redeploy
 *   - Weekly cost cap + week-to-date AI spend
 *   - Variants table grouped by kind, with status + metrics + Wilson CIs
 *   - Recent runs panel (last 30 runs, dormant heartbeats included)
 *
 * Protected via /dashboard prefix in middleware (Ben-only access).
 */

interface Variant {
  id: string;
  kind: string;
  variant_name: string;
  content: Record<string, unknown>;
  status: "active" | "paused" | "winner" | "loser" | "archived";
  impressions: number;
  clicks: number;
  conversions: number;
  cost_usd: number | string;
  parent_variant_id: string | null;
  platform_ad_id: string | null;
  bayesian_p_better: number | null;
  retired_at: string | null;
  retired_reason: string | null;
  last_metrics_synced_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface SyncResponse {
  ok?: boolean;
  durationMs?: number;
  attempted?: number;
  synced?: number;
  failed?: number;
  skipped?: number;
  dailyRowsWritten?: number;
  byPlatform?: {
    meta: { synced: number; failed: number; configured: boolean };
    google: { synced: number; failed: number; configured: boolean };
  };
  errors?: Array<{ variantId: string; platform: string; message: string }>;
  error?: string;
}

interface Run {
  id: string;
  ran_at: string;
  active: boolean;
  gate_reason: string | null;
  variants_analyzed: number;
  winners_found: number;
  losers_found: number;
  new_variants_created: number;
  /** Stage 2 Commit C — ads auto-created on Meta + Google */
  rolled_out_count: number | null;
  rollout_failed_count: number | null;
  /** Stage 2 Commit D — losers auto-paused on Meta + Google */
  paused_on_platform_count: number | null;
  pause_failed_count: number | null;
  ai_cost_usd: number | string | null;
  week_to_date_cost_usd: number | string | null;
  cost_cap_hit: boolean;
  status: string;
  notes: string | null;
}

interface Config {
  paused: boolean;
  weekly_cost_cap_usd: number;
  min_audits_to_wake: number;
  min_paid_to_wake: number;
  updated_at?: string;
  updated_by?: string;
}

const KIND_LABELS: Record<string, string> = {
  ad_copy_meta: "Meta Ad Copy",
  ad_copy_google: "Google Ad Copy",
  audit_prompt: "Audit Prompt",
  email_subject_pitch: "Email — Pitch Subject",
  email_subject_followup: "Email — Follow-up Subject",
  cta_text_audit_buy: "CTA — Audit Buy",
  cta_text_audit_preview: "CTA — Audit Preview",
  sms_body_pitch: "SMS — Pitch",
};

const STATUS_BADGE: Record<Variant["status"], string> = {
  winner: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
  active: "bg-sky-500/15 text-sky-200 border-sky-500/40",
  paused: "bg-amber-500/15 text-amber-200 border-amber-500/40",
  loser: "bg-rose-500/15 text-rose-200 border-rose-500/40",
  archived: "bg-slate-500/15 text-slate-300 border-slate-500/40",
};

/** "2m ago" / "3h ago" / "Apr 27" — short relative timestamp for Last
 *  Synced column. Anything > 24h old falls back to a date string. */
function formatRelative(iso: string): string {
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return "—";
  const diffMs = Date.now() - ts;
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function HyperloopDashboard() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  /** Stage 2 Commit E inline ad-mapping editor — id of variant being
   *  edited + the in-progress text. Only one cell editable at a time. */
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [editingMapValue, setEditingMapValue] = useState("");

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [vRes, rRes, cRes] = await Promise.all([
        fetch("/api/hyperloop/variants"),
        fetch("/api/hyperloop/runs"),
        fetch("/api/hyperloop/config"),
      ]);
      const vJson = await vRes.json();
      const rJson = await rRes.json();
      const cJson = await cRes.json();
      setVariants(vJson.variants || []);
      setRuns(rJson.runs || []);
      setConfig(cJson);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function togglePause() {
    if (!config) return;
    const next = !config.paused;
    await fetch("/api/hyperloop/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paused: next }),
    });
    setConfig({ ...config, paused: next });
  }

  async function setVariantStatus(id: string, status: Variant["status"]) {
    await fetch("/api/hyperloop/variants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
  }

  /** Inline edit save — patches platform_ad_id back to the API. */
  async function saveAdMapping(variantId: string) {
    const newValue = editingMapValue.trim();
    setEditingMapId(null);
    setEditingMapValue("");
    await fetch("/api/hyperloop/variants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: variantId,
        platformAdId: newValue || null,
      }),
    });
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, platform_ad_id: newValue || null } : v,
      ),
    );
  }

  function startEditingMap(variantId: string, currentValue: string | null) {
    setEditingMapId(variantId);
    setEditingMapValue(currentValue ?? "");
  }

  async function runSyncNow() {
    if (syncing) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/hyperloop/sync", { method: "POST" });
      const json: SyncResponse = await res.json();
      setSyncResult(json);
      // Refresh variants so the new metrics + last_metrics_synced_at show up
      await loadAll();
    } catch (err) {
      setSyncResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setSyncing(false);
    }
  }

  // Group variants by kind for display
  const kinds = Array.from(new Set(variants.map((v) => v.kind))).sort();
  const variantsByKind = new Map<string, Variant[]>();
  for (const v of variants) {
    const list = variantsByKind.get(v.kind) ?? [];
    list.push(v);
    variantsByKind.set(v.kind, list);
  }

  // Week-to-date AI cost (most-recent active run)
  const lastActiveRun = runs.find((r) => r.active);
  const weekToDateCost = lastActiveRun
    ? parseFloat(String(lastActiveRun.week_to_date_cost_usd ?? 0))
    : 0;
  const lastDormantReason = runs.find((r) => !r.active)?.gate_reason;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">🔄 Hyperloop</h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              AI variant feedback loop. Weekly cron pulls performance,
              auto-pauses losers, generates new variants from winners.
              Stage 1 active — platform APIs (Meta/Google) come in Stage 2.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runSyncNow}
              disabled={syncing}
              className="rounded-md bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-default px-3 py-1.5 text-xs font-semibold text-sky-950 transition-colors"
            >
              {syncing ? "Syncing…" : "↻ Sync now"}
            </button>
            <button
              onClick={loadAll}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-md border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        {syncResult && (
          <div
            className={`mb-6 rounded-md border p-4 text-sm ${
              syncResult.error || (syncResult.failed && syncResult.failed > 0)
                ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {syncResult.error ? (
              <span>Sync failed: {syncResult.error}</span>
            ) : (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                <span>
                  ✓ Synced <strong>{syncResult.synced ?? 0}</strong> of{" "}
                  {syncResult.attempted ?? 0} variants
                </span>
                {syncResult.failed && syncResult.failed > 0 && (
                  <span className="text-amber-300">{syncResult.failed} failed</span>
                )}
                {syncResult.skipped && syncResult.skipped > 0 && (
                  <span className="text-slate-400">
                    {syncResult.skipped} skipped (no platform_ad_id)
                  </span>
                )}
                <span className="text-slate-400">
                  {syncResult.dailyRowsWritten ?? 0} daily rows written
                </span>
                {syncResult.byPlatform && (
                  <span className="text-slate-400 text-xs">
                    Meta {syncResult.byPlatform.meta.configured ? "🟢" : "⚫ mock"} ·{" "}
                    Google {syncResult.byPlatform.google.configured ? "🟢" : "⚫ mock"}
                  </span>
                )}
                {syncResult.durationMs && (
                  <span className="text-slate-500 text-xs">
                    {(syncResult.durationMs / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Config + cost cap card */}
        {config && (
          <div className="mb-8 grid md:grid-cols-3 gap-4">
            <div
              className={`rounded-xl border p-5 ${
                config.paused
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-emerald-500/40 bg-emerald-500/10"
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                Status
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-xl font-bold ${config.paused ? "text-amber-300" : "text-emerald-300"}`}>
                  {config.paused ? "⏸ Paused" : "▶ Running"}
                </span>
                <button
                  onClick={togglePause}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    config.paused
                      ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950"
                      : "bg-amber-500 hover:bg-amber-400 text-amber-950"
                  }`}
                >
                  {config.paused ? "Resume" : "Pause (kill-switch)"}
                </button>
              </div>
              {lastDormantReason && config.paused === false && (
                <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                  Last cron tick: {lastDormantReason}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                AI cost cap (week-to-date)
              </p>
              <p className="text-xl font-bold text-white">
                ${weekToDateCost.toFixed(2)}{" "}
                <span className="text-sm font-normal text-slate-500">
                  / ${config.weekly_cost_cap_usd}
                </span>
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    weekToDateCost >= config.weekly_cost_cap_usd
                      ? "bg-rose-500"
                      : weekToDateCost > config.weekly_cost_cap_usd * 0.7
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min(100, (weekToDateCost / config.weekly_cost_cap_usd) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Anthropic credits across all hyperloop runs in last 7 days. Cap
                hits → variant generation skipped, analysis still runs.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                Dormancy thresholds
              </p>
              <p className="text-sm text-slate-200">
                {config.min_audits_to_wake} ready audits +{" "}
                {config.min_paid_to_wake} paid customers
              </p>
              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                Below either threshold, the cron logs a heartbeat but skips
                analysis + generation. Edit via SQL on the hyperloop_config
                table to tune.
              </p>
            </div>
          </div>
        )}

        {/* Variants by kind */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Variants ({variants.length})</h2>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : kinds.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-8 text-center">
              <p className="text-slate-300 mb-2 font-semibold">
                No variants yet
              </p>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Per Q7A, Ben writes the first 3-5 seed variants per kind, then
                Hyperloop evolves from there. Insert seed variants directly
                into the <code className="text-xs bg-slate-800 px-1 rounded">hyperloop_variants</code> table.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {kinds.map((kind) => (
                <div key={kind} className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
                  <h3 className="font-bold text-lg mb-3">
                    {KIND_LABELS[kind] || kind}
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                        <th className="pb-2 pr-4">Name</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2 pr-4">Impressions</th>
                        <th className="pb-2 pr-4">Conv.</th>
                        <th className="pb-2 pr-4">CR</th>
                        <th className="pb-2 pr-4">Cost</th>
                        <th className="pb-2 pr-4">Last Synced</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(variantsByKind.get(kind) ?? []).map((v) => {
                        const cr = v.impressions > 0 ? (v.conversions / v.impressions) * 100 : 0;
                        return (
                          <tr key={v.id} className="border-t border-white/5">
                            <td className="py-2 pr-4 font-mono text-xs">
                              {v.variant_name}
                              {/* Stage 2 Commit E — inline platform_ad_id editor.
                                  Click to edit, Enter to save, Esc to cancel.
                                  Empty value unmaps. */}
                              <div className="text-[10px] mt-0.5">
                                {editingMapId === v.id ? (
                                  <input
                                    type="text"
                                    value={editingMapValue}
                                    onChange={(e) => setEditingMapValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveAdMapping(v.id);
                                      if (e.key === "Escape") {
                                        setEditingMapId(null);
                                        setEditingMapValue("");
                                      }
                                    }}
                                    onBlur={() => saveAdMapping(v.id)}
                                    autoFocus
                                    placeholder="paste platform ad ID"
                                    className="w-full px-1.5 py-0.5 rounded bg-slate-800 border border-blue-electric/60 text-slate-200 font-mono text-[10px]"
                                  />
                                ) : v.platform_ad_id ? (
                                  <button
                                    type="button"
                                    onClick={() => startEditingMap(v.id, v.platform_ad_id)}
                                    className="text-slate-500 hover:text-slate-300 transition-colors text-left"
                                    title="Click to edit ad mapping"
                                  >
                                    ad: {v.platform_ad_id}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => startEditingMap(v.id, null)}
                                    className="text-slate-600 hover:text-sky-400 transition-colors text-left italic"
                                  >
                                    + map an ad
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-2 pr-4">
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                  STATUS_BADGE[v.status]
                                }`}
                              >
                                {v.status}
                              </span>
                            </td>
                            <td className="py-2 pr-4 text-slate-300">{v.impressions.toLocaleString()}</td>
                            <td className="py-2 pr-4 text-slate-300">{v.conversions.toLocaleString()}</td>
                            <td className="py-2 pr-4 text-slate-300">{cr.toFixed(2)}%</td>
                            <td className="py-2 pr-4 text-slate-300">
                              ${parseFloat(String(v.cost_usd ?? 0)).toFixed(2)}
                            </td>
                            <td className="py-2 pr-4 text-[11px] text-slate-500">
                              {v.last_metrics_synced_at
                                ? formatRelative(v.last_metrics_synced_at)
                                : v.platform_ad_id
                                  ? "never"
                                  : <span className="text-slate-600">no ad mapped</span>}
                            </td>
                            <td className="py-2 text-right">
                              {v.status === "active" || v.status === "winner" ? (
                                <button
                                  onClick={() => setVariantStatus(v.id, "paused")}
                                  className="text-[11px] text-slate-400 hover:text-white"
                                >
                                  Pause
                                </button>
                              ) : v.status === "paused" ? (
                                <button
                                  onClick={() => setVariantStatus(v.id, "active")}
                                  className="text-[11px] text-emerald-400 hover:text-emerald-300"
                                >
                                  Resume
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent runs */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recent runs ({runs.length})</h2>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : runs.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No runs yet. The weekly cron fires Mondays 16:00 UTC.
            </p>
          ) : (
            <div className="rounded-xl border border-white/10 bg-slate-900/40 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-900/60">
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" title="Variants analyzed">Var.</th>
                    <th className="px-4 py-3" title="Winners promoted">Win</th>
                    <th className="px-4 py-3" title="Losers retired">Lose</th>
                    <th className="px-4 py-3" title="New variants generated">New</th>
                    <th className="px-4 py-3" title="Auto-rolled out to platform (Commit C)">⬆ Plat</th>
                    <th className="px-4 py-3" title="Auto-paused on platform (Commit D)">⏸ Plat</th>
                    <th className="px-4 py-3">AI $</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => {
                    const rolledOut = r.rolled_out_count ?? 0;
                    const rolloutFailed = r.rollout_failed_count ?? 0;
                    const paused = r.paused_on_platform_count ?? 0;
                    const pauseFailed = r.pause_failed_count ?? 0;
                    return (
                      <tr key={r.id} className="border-t border-white/5">
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(r.ran_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-wider ${
                              r.cost_cap_hit
                                ? "text-amber-300"
                                : r.active
                                  ? "text-emerald-300"
                                  : "text-slate-400"
                            }`}
                          >
                            {r.cost_cap_hit ? "Cost Cap" : r.active ? "Active" : "Dormant"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{r.variants_analyzed}</td>
                        <td className="px-4 py-3 text-emerald-300">{r.winners_found}</td>
                        <td className="px-4 py-3 text-rose-300">{r.losers_found}</td>
                        <td className="px-4 py-3 text-sky-300">{r.new_variants_created}</td>
                        <td className="px-4 py-3 text-sky-300 whitespace-nowrap">
                          {rolledOut}
                          {rolloutFailed > 0 && (
                            <span className="text-amber-400 ml-1" title="Rollout failed">
                              ⚠ {rolloutFailed}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-amber-300 whitespace-nowrap">
                          {paused}
                          {pauseFailed > 0 && (
                            <span className="text-rose-400 ml-1" title="Pause failed">
                              ⚠ {pauseFailed}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                          ${parseFloat(String(r.ai_cost_usd ?? 0)).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-md truncate">
                          {r.notes || r.gate_reason || ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
