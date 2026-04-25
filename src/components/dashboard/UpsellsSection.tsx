"use client";

/**
 * UPSELLS SECTION — operator dashboard sub-component for ProspectDetail.
 *
 * Renders the list of upsell SKUs the prospect has purchased (review_blast,
 * extra_pages, gbp_setup, monthly_updates) with status + a "Mark fulfilled"
 * button per row. Sortable by purchased date (newest first by default).
 *
 * Data lives in the `upsells` Supabase table (migration
 * `20260424_upsells.sql`). Reads via GET /api/upsells/[prospectId].
 * Marks fulfilled via POST /api/upsells/[upsellId]/fulfill.
 *
 * Both endpoints are operator-only (not in middleware PUBLIC_API_PATHS).
 */

import { useEffect, useState } from "react";
import { UPSELL_CATALOG, type UpsellRecord, type UpsellSku } from "@/lib/upsells";

interface Props {
  prospectId: string;
}

function formatAmount(cents: number): string {
  if (cents % 100 === 0) return `$${cents / 100}`;
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function skuDisplayName(sku: string): string {
  if (sku in UPSELL_CATALOG) return UPSELL_CATALOG[sku as UpsellSku].displayName;
  return sku;
}

export default function UpsellsSection({ prospectId }: Props) {
  const [upsells, setUpsells] = useState<UpsellRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fulfilling, setFulfilling] = useState<string | null>(null);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/upsells/${prospectId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setUpsells((data.upsells || []) as UpsellRecord[]);
      })
      .catch(() => {
        if (!cancelled) setUpsells([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [prospectId]);

  const sorted = [...upsells].sort((a, b) => {
    const aT = new Date(a.created_at).getTime();
    const bT = new Date(b.created_at).getTime();
    return sortNewestFirst ? bT - aT : aT - bT;
  });

  async function markFulfilled(upsellId: string) {
    setFulfilling(upsellId);
    try {
      const res = await fetch(`/api/upsells/${upsellId}/fulfill`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.upsell) {
        setUpsells((prev) =>
          prev.map((row) => (row.id === upsellId ? (data.upsell as UpsellRecord) : row)),
        );
      } else {
        alert(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch {
      alert("Network error — try again.");
    } finally {
      setFulfilling(null);
    }
  }

  if (loading) {
    return (
      <section>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          Upsells
        </h3>
        <p className="text-xs text-muted">Loading…</p>
      </section>
    );
  }

  if (upsells.length === 0) {
    return (
      <section>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          Upsells
        </h3>
        <p className="text-xs text-muted">No add-on purchases yet.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
          Upsells ({upsells.length})
        </h3>
        <button
          type="button"
          onClick={() => setSortNewestFirst((prev) => !prev)}
          className="text-xs text-muted hover:text-foreground"
          title="Toggle sort order"
        >
          {sortNewestFirst ? "Newest first ↓" : "Oldest first ↑"}
        </button>
      </div>

      <div className="space-y-2">
        {sorted.map((row) => {
          const isFulfilled = row.status === "fulfilled";
          return (
            <div
              key={row.id}
              className="p-3 rounded-lg bg-surface-light border border-border flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {skuDisplayName(row.sku)}
                  </span>
                  <span className="text-xs text-muted">{formatAmount(row.amount_cents)}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isFulfilled
                        ? "bg-green-500/10 text-green-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="text-xs text-muted mt-1">
                  Purchased {formatDate(row.created_at)}
                  {row.fulfilled_at && ` · fulfilled ${formatDate(row.fulfilled_at)}`}
                </div>
              </div>
              {!isFulfilled && (
                <button
                  type="button"
                  onClick={() => markFulfilled(row.id)}
                  disabled={fulfilling === row.id}
                  className="text-xs h-8 px-3 rounded-lg bg-green-500/10 text-green-400 font-medium hover:bg-green-500/20 disabled:opacity-50 whitespace-nowrap"
                >
                  {fulfilling === row.id ? "Saving…" : "Mark fulfilled"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
