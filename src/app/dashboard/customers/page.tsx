"use client";

/**
 * /dashboard/customers — post-purchase customer management.
 *
 * Focused view for prospects that have already paid. Surfaces the info
 * Ben needs to actually SHIP these builds and track them through
 * deployment: purchase date, pricing tier, onboarding state, deployment
 * stage, mgmt-sub renewal date, and admin notes.
 *
 * Status lifecycle after checkout:
 *   paid / claimed        → just purchased, needs welcome email + onboarding
 *   changes_pending       → customer requested revisions
 *   ready_to_finalize     → Ben applied changes, waiting for customer sign-off
 *   deployed              → live at real domain
 *
 * This page filters /api/prospects to those statuses only, then groups by
 * stage with counts and per-customer action rows.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Prospect, ProspectStatus } from "@/lib/types";

// Post-purchase status set (what this page shows)
const PAID_STATUSES: ProspectStatus[] = [
  "paid",
  "claimed",
  "changes_pending",
  "ready_to_finalize",
  "deployed",
];

type StageKey = "all" | "needs_kickoff" | "in_progress" | "ready" | "deployed" | "renewing_soon";

const STAGE_LABELS: Record<Exclude<StageKey, "all">, string> = {
  needs_kickoff: "Needs Kickoff",
  in_progress: "In Progress",
  ready: "Ready to Finalize",
  deployed: "Deployed",
  renewing_soon: "Renewing Soon",
};

function stageForProspect(p: Prospect): Exclude<StageKey, "all" | "renewing_soon"> {
  if (p.status === "deployed") return "deployed";
  if (p.status === "ready_to_finalize") return "ready";
  if (p.status === "changes_pending") return "in_progress";
  // paid / claimed = just purchased, nothing built yet
  return "needs_kickoff";
}

/** Annual mgmt sub renews 1 year after paidAt (all tiers). */
function renewalDate(paidAt?: string): Date | null {
  if (!paidAt) return null;
  const d = new Date(paidAt);
  if (isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

function daysUntil(d: Date | null): number | null {
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

function isRenewingSoon(p: Prospect): boolean {
  const days = daysUntil(renewalDate(p.paidAt));
  return days !== null && days >= 0 && days <= 60;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function tierBadge(tier?: Prospect["pricingTier"]): { label: string; color: string } {
  switch (tier) {
    case "free":
      return { label: "$30 Free-tier", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    case "custom":
      return { label: "$100/yr Custom", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" };
    case "standard":
    default:
      return { label: "$997 Standard", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
  }
}

function stageBadge(stage: ReturnType<typeof stageForProspect>): { label: string; color: string } {
  switch (stage) {
    case "deployed":
      return { label: "Deployed", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" };
    case "ready":
      return { label: "Ready to finalize", color: "text-sky-400 border-sky-500/40 bg-sky-500/10" };
    case "in_progress":
      return { label: "Changes pending", color: "text-amber-400 border-amber-500/40 bg-amber-500/10" };
    case "needs_kickoff":
    default:
      return { label: "Needs kickoff", color: "text-rose-400 border-rose-500/40 bg-rose-500/10" };
  }
}

export default function CustomersPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<StageKey>("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchProspects = useCallback(async () => {
    try {
      const res = await fetch("/api/prospects?limit=1000", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const all: Prospect[] = data.prospects || [];
      setProspects(all.filter((p) => PAID_STATUSES.includes(p.status)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const filtered = useMemo(() => {
    let out = prospects;
    if (stageFilter === "renewing_soon") {
      out = out.filter(isRenewingSoon);
    } else if (stageFilter !== "all") {
      out = out.filter((p) => stageForProspect(p) === stageFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (p) =>
          p.businessName.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.ownerName?.toLowerCase().includes(q)
      );
    }
    // Sort: newest purchase first, deployed last
    return [...out].sort((a, b) => {
      if (a.status === "deployed" && b.status !== "deployed") return 1;
      if (a.status !== "deployed" && b.status === "deployed") return -1;
      return (b.paidAt || "").localeCompare(a.paidAt || "");
    });
  }, [prospects, stageFilter, search]);

  const stats = useMemo(() => {
    const bucket = {
      all: prospects.length,
      needs_kickoff: 0,
      in_progress: 0,
      ready: 0,
      deployed: 0,
      renewing_soon: prospects.filter(isRenewingSoon).length,
    };
    for (const p of prospects) bucket[stageForProspect(p)]++;
    return bucket;
  }, [prospects]);

  const handleStatusChange = async (id: string, status: ProspectStatus) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/prospects/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setProspects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status } : p))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                ← Dashboard
              </Link>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Customers</h1>
            <p className="text-sm text-muted">
              {prospects.length} paying {prospects.length === 1 ? "customer" : "customers"} —
              manage post-purchase builds, deployments, and renewals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, city, email..."
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder-muted focus:border-blue-electric/60 focus:outline-none sm:w-64"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Stage filter tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "needs_kickoff", "in_progress", "ready", "deployed", "renewing_soon"] as StageKey[]).map((key) => {
            const label = key === "all" ? "All" : STAGE_LABELS[key];
            const count = stats[key];
            const isActive = stageFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStageFilter(key)}
                className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-electric text-white"
                    : "border border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive ? "bg-white/20 text-white" : "bg-white/5 text-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface/50 p-12 text-center">
            <p className="text-lg font-medium text-foreground">No customers yet</p>
            <p className="mt-2 text-sm text-muted">
              Once prospects complete checkout, they&apos;ll appear here for post-purchase
              management. Default view shows paid, changes-pending, ready-to-finalize, and
              deployed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const stage = stageForProspect(p);
              const tier = tierBadge(p.pricingTier);
              const stg = stageBadge(stage);
              const renewDate = renewalDate(p.paidAt);
              const daysToRenew = daysUntil(renewDate);
              const hasWelcome = Boolean(p.welcomeEmailSentAt);
              const hasOnboardingReminder = Boolean(p.onboardingReminderSentAt);

              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-blue-electric/30"
                >
                  {/* Top row: name + badges */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-semibold text-foreground truncate">
                          {p.businessName}
                        </h2>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${tier.color}`}
                        >
                          {tier.label}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${stg.color}`}
                        >
                          {stg.label}
                        </span>
                        {isRenewingSoon(p) && (
                          <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400">
                            Renews in {daysToRenew}d
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {[p.ownerName, p.city && `${p.city}, ${p.state}`, p.category]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>

                  {/* Timeline strip */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Metric label="Paid" value={formatDate(p.paidAt)} />
                    <Metric
                      label="Welcome email"
                      value={hasWelcome ? formatDate(p.welcomeEmailSentAt) : "Not sent"}
                      muted={!hasWelcome}
                    />
                    <Metric
                      label="Onboarding"
                      value={
                        hasOnboardingReminder
                          ? "Reminder sent"
                          : hasWelcome
                          ? "Awaiting form"
                          : "—"
                      }
                      muted={!hasOnboardingReminder && !hasWelcome}
                    />
                    <Metric
                      label="Renews"
                      value={
                        renewDate
                          ? `${formatDate(renewDate.toISOString())} (${daysToRenew}d)`
                          : "—"
                      }
                      muted={!renewDate}
                    />
                  </div>

                  {/* Admin notes preview */}
                  {p.adminNotes && (
                    <div className="mt-4 rounded-lg border border-border bg-background/50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted">
                        Admin notes
                      </p>
                      <p className="mt-1 text-sm text-foreground line-clamp-3 whitespace-pre-wrap">
                        {p.adminNotes}
                      </p>
                    </div>
                  )}

                  {/* Action row */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* View built site (custom tier has an external URL; others use /preview/[id]) */}
                    {p.pricingTier === "custom" && p.customSiteUrl ? (
                      <a
                        href={p.customSiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-blue-electric/60 inline-flex items-center"
                      >
                        View live site ↗
                      </a>
                    ) : (
                      <Link
                        href={`/preview/${p.id}`}
                        target="_blank"
                        className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-blue-electric/60 inline-flex items-center"
                      >
                        View preview ↗
                      </Link>
                    )}

                    <Link
                      href={`/onboarding/${p.id}`}
                      target="_blank"
                      className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-blue-electric/60 inline-flex items-center"
                    >
                      Onboarding form ↗
                    </Link>

                    <Link
                      href={`/lead/${p.id}`}
                      className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-blue-electric/60 inline-flex items-center"
                    >
                      Edit notes
                    </Link>

                    {/* Stripe customer link */}
                    {p.stripeCustomerId && (
                      <a
                        href={`https://dashboard.stripe.com/customers/${p.stripeCustomerId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium text-muted transition-colors hover:text-foreground inline-flex items-center"
                      >
                        Stripe ↗
                      </a>
                    )}

                    {/* Status advance buttons — each shows ONLY when it's a valid next step */}
                    <div className="ml-auto flex items-center gap-2">
                      {stage !== "deployed" && (
                        <select
                          value={p.status}
                          onChange={(e) =>
                            handleStatusChange(p.id, e.target.value as ProspectStatus)
                          }
                          disabled={updating === p.id}
                          className="h-8 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground cursor-pointer disabled:opacity-50"
                        >
                          <option value="paid">Paid</option>
                          <option value="claimed">Claimed</option>
                          <option value="changes_pending">Changes pending</option>
                          <option value="ready_to_finalize">Ready to finalize</option>
                          <option value="deployed">Deployed</option>
                        </select>
                      )}
                      {stage === "deployed" && (
                        <span className="text-xs text-muted">Final stage ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 text-sm font-medium ${muted ? "text-muted" : "text-foreground"} truncate`}>
        {value}
      </p>
    </div>
  );
}
