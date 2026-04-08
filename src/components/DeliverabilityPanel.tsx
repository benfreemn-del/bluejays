"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldWarning,
  Warning,
  ArrowClockwise,
  Envelope,
  ChartLineUp,
  Fire,
  CheckCircle,
  XCircle,
  Info,
} from "@phosphor-icons/react";

interface DeliverabilityHealth {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  openRate: number;
  clickRate: number;
  bounceRate: number;
  spamRate: number;
  domainAuth: { spf: boolean; dkim: boolean; dmarc: boolean };
  warmupStatus: "warming" | "ramping" | "full" | "not_started";
  dailySendLimit: number;
  sentToday: number;
  alerts: Array<{
    level: "critical" | "warning" | "info";
    message: string;
    metric?: string;
    value?: number;
    threshold?: number;
    timestamp: string;
  }>;
  lastUpdated: string;
}

interface BounceStats {
  totalBounces: number;
  hardBounces: number;
  softBounces: number;
  pendingRetries: number;
  resolvedBounces: number;
  pendingRetryEmails: Array<{
    email: string;
    prospectId: string;
    retryCount: number;
    maxRetries: number;
    lastBounce: string;
    reason: string;
  }>;
}

interface SendingStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  phase: string;
}

interface DeliverabilityData {
  domain: string;
  health: DeliverabilityHealth;
  sending: SendingStatus;
  bounces: BounceStats;
}

export default function DeliverabilityPanel() {
  const [data, setData] = useState<DeliverabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/email-deliverability");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch deliverability data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      <div className="bg-surface border border-border rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-border rounded w-48 mb-4" />
        <div className="h-32 bg-border rounded" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <p className="text-muted">Failed to load deliverability data.</p>
      </div>
    );
  }

  const { health, sending, bounces } = data;

  const gradeColors: Record<string, string> = {
    A: "text-green-400 bg-green-400/10 border-green-400/30",
    B: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    C: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    D: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    F: "text-red-400 bg-red-400/10 border-red-400/30",
  };

  const phaseLabels: Record<string, string> = {
    warming: "Warming Up",
    ramping: "Ramping",
    full: "Full Capacity",
    not_started: "Not Started",
  };

  return (
    <div className="space-y-4">
      {/* Health Score Header */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-blue-400" />
            <h2 className="text-lg font-bold">Email Deliverability Health</h2>
          </div>
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
          >
            <ArrowClockwise size={16} className={verifying ? "animate-spin" : ""} />
            {verifying ? "Checking..." : "Re-verify"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Overall Grade */}
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-xl text-2xl font-black border ${gradeColors[health.grade]}`}
            >
              {health.grade}
            </div>
            <p className="text-xs text-muted mt-1">Score: {health.score}/100</p>
          </div>

          {/* Open Rate */}
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{health.openRate}%</div>
            <p className="text-xs text-muted flex items-center justify-center gap-1">
              <Envelope size={12} /> Open Rate
            </p>
            {health.openRate > 0 && health.openRate < 20 && (
              <span className="text-[10px] text-orange-400">Below target</span>
            )}
          </div>

          {/* Click Rate */}
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{health.clickRate}%</div>
            <p className="text-xs text-muted flex items-center justify-center gap-1">
              <ChartLineUp size={12} /> Click Rate
            </p>
          </div>

          {/* Bounce Rate */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${health.bounceRate > 5 ? "text-red-400" : health.bounceRate > 2 ? "text-yellow-400" : "text-foreground"}`}>
              {health.bounceRate}%
            </div>
            <p className="text-xs text-muted flex items-center justify-center gap-1">
              <Warning size={12} /> Bounce Rate
            </p>
          </div>

          {/* Spam Rate */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${health.spamRate > 0.3 ? "text-red-400" : "text-foreground"}`}>
              {health.spamRate}%
            </div>
            <p className="text-xs text-muted flex items-center justify-center gap-1">
              <Fire size={12} /> Spam Rate
            </p>
          </div>
        </div>
      </div>

      {/* Domain Authentication */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ShieldWarning size={16} className="text-blue-400" />
            Domain Authentication
          </h3>
          <div className="space-y-2">
            {(["spf", "dkim", "dmarc"] as const).map((record) => (
              <div key={record} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-sm font-mono uppercase">{record}</span>
                <div className="flex items-center gap-2">
                  {health.domainAuth[record] ? (
                    <>
                      <CheckCircle size={16} className="text-green-400" weight="fill" />
                      <span className="text-xs text-green-400">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-red-400" weight="fill" />
                      <span className="text-xs text-red-400">Not Found</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-2">Domain: {data.domain}</p>
        </div>

        {/* Warm-up Status */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Envelope size={16} className="text-blue-400" />
            Warm-up Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Phase</span>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                sending.phase === "full"
                  ? "bg-green-400/10 text-green-400"
                  : sending.phase === "ramping"
                    ? "bg-yellow-400/10 text-yellow-400"
                    : "bg-blue-400/10 text-blue-400"
              }`}>
                {phaseLabels[sending.phase] || sending.phase}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Daily Limit</span>
              <span className="text-sm font-medium">{sending.limit} emails</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Sent Today</span>
              <span className="text-sm font-medium">{sending.remaining} remaining</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-border rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  sending.remaining === 0 ? "bg-red-400" : "bg-blue-400"
                }`}
                style={{
                  width: `${Math.min(100, ((sending.limit - sending.remaining) / sending.limit) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bounce Management */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Warning size={16} className="text-orange-400" />
          Bounce Management
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          <div className="text-center p-2 bg-background rounded-lg">
            <div className="text-lg font-bold">{bounces.totalBounces}</div>
            <div className="text-[10px] text-muted">Total</div>
          </div>
          <div className="text-center p-2 bg-background rounded-lg">
            <div className="text-lg font-bold text-red-400">{bounces.hardBounces}</div>
            <div className="text-[10px] text-muted">Hard</div>
          </div>
          <div className="text-center p-2 bg-background rounded-lg">
            <div className="text-lg font-bold text-yellow-400">{bounces.softBounces}</div>
            <div className="text-[10px] text-muted">Soft</div>
          </div>
          <div className="text-center p-2 bg-background rounded-lg">
            <div className="text-lg font-bold text-blue-400">{bounces.pendingRetries}</div>
            <div className="text-[10px] text-muted">Pending Retry</div>
          </div>
          <div className="text-center p-2 bg-background rounded-lg">
            <div className="text-lg font-bold text-green-400">{bounces.resolvedBounces}</div>
            <div className="text-[10px] text-muted">Resolved</div>
          </div>
        </div>

        {bounces.pendingRetryEmails && bounces.pendingRetryEmails.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs text-muted mb-2">Pending Retries:</p>
            <div className="space-y-1">
              {bounces.pendingRetryEmails.slice(0, 5).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted font-mono">{b.email}</span>
                  <span className="text-yellow-400">
                    Retry {b.retryCount}/{b.maxRetries}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {health.alerts.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Active Alerts</h3>
          <div className="space-y-2">
            {health.alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-2.5 rounded-lg text-sm ${
                  alert.level === "critical"
                    ? "bg-red-400/10 text-red-300 border border-red-400/20"
                    : alert.level === "warning"
                      ? "bg-yellow-400/10 text-yellow-300 border border-yellow-400/20"
                      : "bg-blue-400/10 text-blue-300 border border-blue-400/20"
                }`}
              >
                {alert.level === "critical" ? (
                  <XCircle size={16} className="shrink-0 mt-0.5" weight="fill" />
                ) : alert.level === "warning" ? (
                  <Warning size={16} className="shrink-0 mt-0.5" weight="fill" />
                ) : (
                  <Info size={16} className="shrink-0 mt-0.5" weight="fill" />
                )}
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
