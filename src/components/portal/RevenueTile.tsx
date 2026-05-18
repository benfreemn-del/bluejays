"use client";

import { useCallback, useEffect, useState } from "react";

import { formatMoney, type RevenueAttribution, type RevenueSummary } from "@/lib/client-revenue";

/**
 * Revenue attribution tile — closes the loop on "leads → $".
 *
 * Two render modes:
 *   - mode="portal"  → owner-facing summary card (no admin actions)
 *   - mode="admin"   → admin dashboard variant with quick-add form
 *
 * Designed to read on a single tap from phone (Hormozi rule: owners check
 * leads from job sites). Period defaults to last 30 days; can be flipped
 * to 7 / 90 / YTD.
 */

type Period = "7d" | "30d" | "90d" | "ytd";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  ytd: "Year to date",
};

function periodStart(period: Period): Date {
  const d = new Date();
  if (period === "ytd") {
    return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  }
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

export default function RevenueTile({
  slug,
  mode = "portal",
}: {
  slug: string;
  mode?: "portal" | "admin";
}) {
  const [period, setPeriod] = useState<Period>("30d");
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [entries, setEntries] = useState<RevenueAttribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quick-add form state
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [productName, setProductName] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const since = periodStart(period).toISOString();
      const r = await fetch(
        `/api/clients/${slug}/revenue?since=${encodeURIComponent(since)}`,
      );
      const j = await r.json();
      if (j.ok) {
        setSummary(j.summary);
        setEntries(j.entries);
      }
    } finally {
      setLoading(false);
    }
  }, [slug, period]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitAdd() {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      alert("Enter a dollar amount greater than 0");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(`/api/clients/${slug}/revenue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_cents: cents,
          customer_name: customerName.trim() || null,
          customer_email: customerEmail.trim() || null,
          product_name: productName.trim() || null,
          notes: notes.trim() || null,
          source: "manual",
        }),
      });
      const j = await r.json();
      if (j.ok) {
        setAmount("");
        setCustomerName("");
        setCustomerEmail("");
        setProductName("");
        setNotes("");
        setShowAdd(false);
        void load();
      } else {
        alert(`Could not save: ${j.error}`);
      }
    } finally {
      setSaving(false);
    }
  }

  const isAdmin = mode === "admin";
  const s = summary;

  return (
    <section className="rounded-2xl border border-emerald-500/25 bg-emerald-950/30 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-300">
            Closed revenue
          </p>
          <h3 className="text-base font-bold text-white mt-0.5">
            What this funnel brought in
          </h3>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="bg-slate-900 border border-slate-700 rounded text-xs px-2 py-1 text-slate-200"
        >
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <option key={p} value={p}>
              {PERIOD_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {loading && !s ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : !s || s.closed_count === 0 ? (
        <div className="rounded-lg border border-dashed border-emerald-500/30 bg-slate-900/40 p-4 text-center">
          <p className="text-sm text-slate-300 mb-1">
            No revenue logged yet for this period.
          </p>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? "Log closed deals below so the ROI of this funnel shows up in the client's portal."
              : "Closed deals will appear here once your team logs them or your Stripe is connected."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
              Total
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-200 tabular-nums leading-tight mt-0.5">
              {formatMoney(s.total_cents, s.currency)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Deals
            </p>
            <p className="text-xl sm:text-2xl font-black text-white tabular-nums leading-tight mt-0.5">
              {s.closed_count}
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Avg
            </p>
            <p className="text-xl sm:text-2xl font-black text-white tabular-nums leading-tight mt-0.5">
              {formatMoney(s.avg_deal_cents, s.currency)}
            </p>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="mt-3">
          {!showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-3 py-1.5 rounded"
            >
              + Log closed deal
            </button>
          ) : (
            <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-slate-900/60 p-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Amount (USD)
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm tabular-nums"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Customer name
                  </span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm"
                  />
                </label>
              </div>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Customer email (links to existing lead if matches)"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs"
              />
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product / package (optional)"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Notes (optional)"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs"
              />
              <div className="flex gap-2">
                <button
                  onClick={submitAdd}
                  disabled={saving || !amount}
                  className="flex-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-emerald-950 px-3 py-1.5 rounded"
                >
                  {saving ? "Logging…" : "Log deal"}
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="text-xs font-bold border border-slate-700 text-slate-300 px-3 py-1.5 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {entries.length > 0 && (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-200">
            Show {entries.length} deal{entries.length === 1 ? "" : "s"} →
          </summary>
          <ul className="mt-2 space-y-1">
            {entries.slice(0, 10).map((e) => (
              <li
                key={e.id}
                className="rounded border border-slate-800 bg-slate-950/60 px-2 py-1.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-bold text-emerald-200 tabular-nums">
                    {formatMoney(e.amount_cents, e.currency)}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {e.customer_name || e.customer_email || "Unnamed deal"}
                    {e.product_name && ` · ${e.product_name}`}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 shrink-0">
                  {new Date(e.closed_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
