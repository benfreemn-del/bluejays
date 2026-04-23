"use client";

import { useEffect, useState } from "react";
import type { ClientBillingInfo } from "@/app/api/billing/clients/route";
import {
  CreditCard,
  ArrowSquareOut,
  CalendarBlank,
  Clock,
  CheckCircle,
  Warning,
  XCircle,
  ArrowClockwise,
} from "@phosphor-icons/react";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount?: number) {
  if (!amount) return "$100";
  return `$${amount.toFixed(0)}`;
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function cardBrandIcon(brand?: string) {
  const b = (brand || "").toLowerCase();
  if (b === "visa") return "VISA";
  if (b === "mastercard") return "MC";
  if (b === "amex") return "AMEX";
  if (b === "discover") return "DISC";
  return brand?.toUpperCase() || "CARD";
}

function SubStatusBadge({ status, trialEndsAt }: { status?: string; trialEndsAt?: string }) {
  if (!status || status === "none") {
    return <span className="text-xs text-muted">No subscription</span>;
  }

  const days = daysUntil(trialEndsAt);
  const inTrial = status === "trialing";

  if (inTrial && days !== null) {
    const color = days <= 30 ? "text-amber-400" : "text-sky-400";
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
        <Clock size={12} />
        Trial — {days}d left
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
        <CheckCircle size={12} />
        Active
      </span>
    );
  }
  if (status === "past_due") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
        <Warning size={12} />
        Past due
      </span>
    );
  }
  if (status === "cancelled" || status === "canceled") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
        <XCircle size={12} />
        Cancelled
      </span>
    );
  }
  return <span className="text-xs text-muted capitalize">{status}</span>;
}

export default function ClientsBillingView() {
  const [clients, setClients] = useState<ClientBillingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/clients");
      if (!res.ok) throw new Error("Failed to load");
      setClients(await res.json());
    } catch {
      setError("Could not load billing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-muted text-sm">
        Loading client billing data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center text-red-400 text-sm">{error}</div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="py-16 text-center text-muted text-sm">
        No paid clients yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Paid Clients</h2>
          <p className="text-sm text-muted">{clients.length} client{clients.length !== 1 ? "s" : ""} · $100/yr renewal</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <ArrowClockwise size={14} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Business</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Paid On</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Renewal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Next Charge</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Card on File</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((c) => {
                const days = daysUntil(c.nextBillingDate);
                const urgentRenewal = days !== null && days <= 30;
                const noCard = !c.cardLast4;

                return (
                  <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                    {/* Business */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{c.businessName}</div>
                      <div className="text-xs text-muted">{c.city}, {c.state} · {c.category}</div>
                      {c.email && <div className="text-xs text-muted">{c.email}</div>}
                    </td>

                    {/* Paid on */}
                    <td className="px-4 py-3 text-muted">
                      {formatDate(c.paidAt)}
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        {c.pricingTier === "free" ? "$30 free tier" : "$997 standard"}
                      </span>
                    </td>

                    {/* Renewal status */}
                    <td className="px-4 py-3">
                      <SubStatusBadge status={c.subscriptionStatus} trialEndsAt={c.trialEndsAt} />
                    </td>

                    {/* Next charge */}
                    <td className="px-4 py-3">
                      {c.nextBillingDate ? (
                        <div className={urgentRenewal ? "text-amber-400" : "text-foreground"}>
                          <div className="flex items-center gap-1">
                            <CalendarBlank size={13} />
                            {formatDate(c.nextBillingDate)}
                          </div>
                          <div className="text-xs text-muted mt-0.5">
                            {formatAmount(c.nextBillingAmount)}/yr
                            {days !== null && (
                              <span className={urgentRenewal ? " text-amber-400" : ""}> · {days > 0 ? `in ${days}d` : "today"}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>

                    {/* Card on file */}
                    <td className="px-4 py-3">
                      {c.cardLast4 ? (
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-muted shrink-0" />
                          <div>
                            <div className="font-medium text-foreground">
                              {cardBrandIcon(c.cardBrand)} ···· {c.cardLast4}
                            </div>
                            <div className="text-xs text-muted">
                              Exp {c.cardExpMonth}/{c.cardExpYear}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                          <Warning size={14} />
                          No card
                        </div>
                      )}
                      {noCard && c.stripeCustomerId && (
                        <a
                          href={`https://dashboard.stripe.com/customers/${c.stripeCustomerId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-400 hover:underline mt-0.5 block"
                        >
                          Open in Stripe ↗
                        </a>
                      )}
                    </td>

                    {/* Preview link */}
                    <td className="px-4 py-3">
                      {c.previewUrl ? (
                        <a
                          href={c.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline"
                        >
                          Preview <ArrowSquareOut size={12} />
                        </a>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {[
          {
            label: "Total clients",
            value: clients.length,
            color: "text-foreground",
          },
          {
            label: "Active subscriptions",
            value: clients.filter((c) => c.subscriptionStatus === "active" || c.subscriptionStatus === "trialing").length,
            color: "text-emerald-400",
          },
          {
            label: "No card on file",
            value: clients.filter((c) => !c.cardLast4).length,
            color: "text-amber-400",
          },
          {
            label: "Past due",
            value: clients.filter((c) => c.subscriptionStatus === "past_due").length,
            color: "text-red-400",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
