"use client";

import { useEffect, useState } from "react";

interface DeliverabilityData {
  domain: string;
  health: {
    score: number;
    grade: string;
    openRate: number;
    bounceRate: number;
    spamRate: number;
    domainAuth: { spf: boolean; dkim: boolean; dmarc: boolean };
    warmupStatus: string;
    dailySendLimit: number;
    sentToday: number;
    alerts: string[];
  };
  sending: {
    allowed: boolean;
    remaining: number;
    limit: number;
    phase: number;
  };
  bounces: {
    totalHardBounces: number;
    totalSoftBounces: number;
  };
}

const GRADE_COLOR: Record<string, string> = {
  A: "text-green-400",
  B: "text-blue-400",
  C: "text-yellow-400",
  D: "text-orange-400",
  F: "text-red-400",
};

const GRADE_BG: Record<string, string> = {
  A: "bg-green-500/10 border-green-500/30",
  B: "bg-blue-500/10 border-blue-500/30",
  C: "bg-yellow-500/10 border-yellow-500/30",
  D: "bg-orange-500/10 border-orange-500/30",
  F: "bg-red-500/10 border-red-500/30",
};

function AuthBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
      }`}
    >
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}

export default function DeliverabilityWidget() {
  const [data, setData] = useState<DeliverabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/email-deliverability");
      if (res.ok) setData(await res.json());
    } catch {
      // non-critical widget
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await fetch("/api/email-deliverability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });
      await fetchData();
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted animate-pulse">
        Checking email deliverability...
      </div>
    );
  }

  if (!data) return null;

  const { health, sending, bounces } = data;
  const grade = health.grade || "F";
  const authOk = health.domainAuth.spf && health.domainAuth.dkim && health.domainAuth.dmarc;
  const sentPct = health.dailySendLimit > 0 ? (health.sentToday / health.dailySendLimit) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">Email Deliverability</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${GRADE_BG[grade] ?? GRADE_BG.F}`}
          >
            <span className={GRADE_COLOR[grade] ?? "text-red-400"}>Grade {grade}</span>
            <span className="text-muted font-normal">{health.score}/100</span>
          </span>
          {!authOk && (
            <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-xs text-red-400">
              Domain auth issues
            </span>
          )}
          {health.alerts.length > 0 && (
            <span className="rounded-full bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 text-xs text-yellow-400">
              {health.alerts.length} alert{health.alerts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {health.sentToday}/{health.dailySendLimit} sent today
          </span>
          <span className="text-xs text-muted">{collapsed ? "▾" : "▴"}</span>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-border px-4 py-4 grid sm:grid-cols-4 gap-4">
          {/* Domain auth */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted mb-1">Domain Auth</p>
            <div className="flex flex-wrap gap-1.5">
              <AuthBadge ok={health.domainAuth.spf} label="SPF" />
              <AuthBadge ok={health.domainAuth.dkim} label="DKIM" />
              <AuthBadge ok={health.domainAuth.dmarc} label="DMARC" />
            </div>
            <p className="text-xs text-muted pt-0.5">{data.domain}</p>
          </div>

          {/* Warm-up */}
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-widest text-muted mb-1">Warm-up</p>
            <p className="text-sm font-semibold capitalize">{health.warmupStatus.replace(/-/g, " ")}</p>
            <p className="text-xs text-muted">Phase {sending.phase}</p>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
              <div
                className="h-full rounded-full bg-blue-electric transition-all"
                style={{ width: `${Math.min(100, sentPct)}%` }}
              />
            </div>
            <p className="text-xs text-muted">{health.sentToday} / {health.dailySendLimit} today</p>
          </div>

          {/* Rates */}
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-widest text-muted mb-1">Rates</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Open rate</span>
                <span className={health.openRate >= 20 ? "text-green-400 font-medium" : "text-yellow-400 font-medium"}>
                  {health.openRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Bounce rate</span>
                <span className={health.bounceRate <= 2 ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                  {health.bounceRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Spam rate</span>
                <span className={health.spamRate <= 0.1 ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                  {health.spamRate.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Bounces + action */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted mb-1">Bounces</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Hard</span>
                <span className={bounces.totalHardBounces > 0 ? "text-red-400 font-medium" : "text-green-400 font-medium"}>
                  {bounces.totalHardBounces}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Soft</span>
                <span className="font-medium">{bounces.totalSoftBounces}</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleVerify(); }}
              disabled={verifying}
              className="mt-2 w-full h-8 rounded-lg border border-border text-xs font-medium hover:border-blue-electric/40 transition-colors disabled:opacity-50"
            >
              {verifying ? "Verifying…" : "Re-verify Domain"}
            </button>
          </div>
        </div>
      )}

      {/* Alerts */}
      {!collapsed && health.alerts.length > 0 && (
        <div className="border-t border-border px-4 py-3 space-y-1">
          {health.alerts.map((alert, i) => (
            <p key={i} className="text-xs text-yellow-400 flex items-start gap-1.5">
              <span className="mt-0.5">⚠</span>
              <span>{alert}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
