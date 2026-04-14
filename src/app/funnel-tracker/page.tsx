"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FunnelProspect {
  prospectId: string;
  businessName: string;
  category: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  nextStepLabel?: string;
  lastSentAt?: string;
  paused?: boolean;
  pauseReason?: string;
  completedAt?: string;
}

interface FunnelStep {
  day: number;
  label: string;
  channels: string[];
}

export default function FunnelTrackerPage() {
  const [prospects, setProspects] = useState<FunnelProspect[]>([]);
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "completed">("all");

  useEffect(() => {
    fetch("/api/funnel", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setProspects(data.prospects || []);
        setSteps(data.funnelSteps || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = prospects.filter((p) => {
    if (filter === "active") return !p.paused && !p.completedAt;
    if (filter === "paused") return p.paused;
    if (filter === "completed") return !!p.completedAt;
    return true;
  });

  const activeCount = prospects.filter((p) => !p.paused && !p.completedAt).length;
  const pausedCount = prospects.filter((p) => p.paused).length;
  const completedCount = prospects.filter((p) => !!p.completedAt).length;

  const getStageColor = (step: number, total: number) => {
    if (step === 0) return "bg-slate-500/20 text-slate-400";
    const pct = step / total;
    if (pct < 0.33) return "bg-blue-500/20 text-blue-400";
    if (pct < 0.66) return "bg-amber-500/20 text-amber-400";
    return "bg-emerald-500/20 text-emerald-400";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">BlueJays</p>
              <h1 className="text-lg font-semibold">Funnel Tracker</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <a href="/deliverability" className="text-sm text-muted hover:text-foreground transition-colors">
              Email
            </a>
            <a href="/analytics" className="text-sm text-muted hover:text-foreground transition-colors">
              Analytics
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <button onClick={() => setFilter("all")} className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${filter === "all" ? "border-blue-electric bg-blue-electric/10" : "border-border bg-surface hover:border-blue-electric/40"}`}>
            <p className="text-2xl font-bold text-foreground">{prospects.length}</p>
            <p className="text-xs text-muted mt-1">Total in Funnel</p>
          </button>
          <button onClick={() => setFilter("active")} className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${filter === "active" ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-surface hover:border-emerald-500/40"}`}>
            <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
            <p className="text-xs text-muted mt-1">Active</p>
          </button>
          <button onClick={() => setFilter("paused")} className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${filter === "paused" ? "border-amber-500 bg-amber-500/10" : "border-border bg-surface hover:border-amber-500/40"}`}>
            <p className="text-2xl font-bold text-amber-400">{pausedCount}</p>
            <p className="text-xs text-muted mt-1">Paused</p>
          </button>
          <button onClick={() => setFilter("completed")} className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${filter === "completed" ? "border-sky-500 bg-sky-500/10" : "border-border bg-surface hover:border-sky-500/40"}`}>
            <p className="text-2xl font-bold text-sky-400">{completedCount}</p>
            <p className="text-xs text-muted mt-1">Completed</p>
          </button>
        </div>

        {/* Funnel Steps Overview */}
        {steps.length > 0 && (
          <div className="mb-8 flex items-center gap-1 overflow-x-auto pb-2">
            {steps.map((step, i) => {
              const countAtStep = prospects.filter((p) => p.currentStep === i + 1 && !p.completedAt).length;
              return (
                <div key={i} className="flex items-center gap-1 shrink-0">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${countAtStep > 0 ? "bg-blue-electric/20 text-blue-400 border border-blue-electric/30" : "bg-surface border border-border text-muted"}`}>
                    {step.label} {countAtStep > 0 && <span className="ml-1 font-bold">({countAtStep})</span>}
                  </div>
                  {i < steps.length - 1 && <span className="text-muted/30 text-xs">→</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted">Loading funnel data...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted mb-2">No leads in the funnel yet.</p>
              <p className="text-xs text-muted/60">Go to the Dashboard, select leads, and click &quot;Start Funnel&quot; to begin outreach.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Sent</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.prospectId} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/preview/${p.prospectId}`} className="font-medium text-foreground hover:text-blue-electric transition-colors">
                        {p.businessName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-border capitalize">
                        {p.category?.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(p.currentStep, p.totalSteps)}`}>
                        {p.nextStepLabel || `Step ${p.currentStep}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-electric transition-all" style={{ width: `${(p.currentStep / p.totalSteps) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted">{p.currentStep}/{p.totalSteps}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.completedAt ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 font-medium">Done</span>
                      ) : p.paused ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 font-medium" title={p.pauseReason}>Paused</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {p.lastSentAt ? new Date(p.lastSentAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
