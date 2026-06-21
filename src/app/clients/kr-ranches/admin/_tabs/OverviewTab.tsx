"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/client-shop";
import {
  C, Card, Stat, Pill, Loading, SectionTitle, fmtMoney, fmtDate, SERIF,
} from "./ui";

type Stats = {
  totals: {
    orders: number;
    revenue_cents: number;
    customers: number;
    unpaid_count: number;
    unpaid_cents: number;
    new_count: number;
    ready_count: number;
  };
  bySeason: { season: string; orders: number; revenue_cents: number }[];
  topItems: { name: string; qty: number; revenue_cents: number }[];
};

const SEASON_NOW = (() => {
  const m = new Date().getMonth();
  if (m <= 1 || m === 11) return "winter";
  if (m <= 4) return "spring";
  if (m <= 7) return "summer";
  return "fall";
})();

const SEASON_EMOJI: Record<string, string> = {
  spring: "🌱", summer: "☀️", fall: "🍂", winter: "❄️",
};

export default function OverviewTab({ onJump }: { onJump: (t: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, o] = await Promise.all([
          fetch("/api/clients/kr-ranches/stats", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/clients/kr-ranches/orders?limit=6", { credentials: "include" }).then((r) => r.json()),
        ]);
        if (s.ok) setStats(s);
        if (o.ok) setRecent(o.orders || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loading />;
  if (!stats) return <Loading label="No data yet." />;

  const t = stats.totals;
  const thisSeason = stats.bySeason.find((s) => s.season === SEASON_NOW);

  return (
    <div>
      <SectionTitle sub="Your ranch at a glance — revenue, orders, and what needs attention.">
        Overview
      </SectionTitle>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <Stat label="Revenue collected" value={fmtMoney(t.revenue_cents)} tone="green" sub="Paid + deposits" />
        <Stat label="Total orders" value={String(t.orders)} />
        <Stat label="Customers" value={String(t.customers)} />
        <Stat
          label="Owed to you"
          value={fmtMoney(t.unpaid_cents)}
          tone={t.unpaid_cents > 0 ? "red" : undefined}
          sub={`${t.unpaid_count} unpaid order${t.unpaid_count === 1 ? "" : "s"}`}
        />
      </div>

      {/* attention row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 22 }}>
        <Card pad={16} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>New orders to confirm</div>
            <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 800, color: t.new_count ? C.blue : C.ink2 }}>
              {t.new_count}
            </div>
          </div>
          <button onClick={() => onJump("orders")} style={linkBtn}>View →</button>
        </Card>
        <Card pad={16} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>Ready for pickup</div>
            <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 800, color: t.ready_count ? C.green : C.ink2 }}>
              {t.ready_count}
            </div>
          </div>
          <button onClick={() => onJump("orders")} style={linkBtn}>View →</button>
        </Card>
        <Card pad={16} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>
              {SEASON_EMOJI[SEASON_NOW]} This {SEASON_NOW}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 800 }}>
              {fmtMoney(thisSeason?.revenue_cents || 0)}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{thisSeason?.orders || 0} orders</div>
          </div>
          <button onClick={() => onJump("seasonal")} style={linkBtn}>Trends →</button>
        </Card>
      </div>

      {/* recent orders + top sellers */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: 16 }}>
        <Card pad={0}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontFamily: SERIF, fontSize: 17 }}>Recent orders</strong>
            <button onClick={() => onJump("orders")} style={linkBtn}>All orders →</button>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: 24, color: C.muted, fontSize: 13 }}>
              No orders yet. Head to the Orders tab to log your first one.
            </div>
          ) : (
            recent.map((o, i) => (
              <div
                key={o.id}
                style={{
                  padding: "12px 18px",
                  borderBottom: i < recent.length - 1 ? `1px solid ${C.lineSoft}` : "none",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: C.ink2, fontSize: 14 }}>
                    #{o.order_number} · {o.customer_name || "—"}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>{fmtDate(o.ordered_at)} · {o.source}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Pill value={o.payment_status} />
                  <Pill value={o.status} />
                  <strong style={{ fontFamily: SERIF, fontSize: 15, minWidth: 64, textAlign: "right" }}>
                    {fmtMoney(o.total_cents)}
                  </strong>
                </div>
              </div>
            ))
          )}
        </Card>

        <Card pad={0}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line}` }}>
            <strong style={{ fontFamily: SERIF, fontSize: 17 }}>Top sellers</strong>
          </div>
          {stats.topItems.length === 0 ? (
            <div style={{ padding: 24, color: C.muted, fontSize: 13 }}>No sales recorded yet.</div>
          ) : (
            stats.topItems.map((it, i) => (
              <div
                key={it.name + i}
                style={{
                  padding: "11px 18px",
                  borderBottom: i < stats.topItems.length - 1 ? `1px solid ${C.lineSoft}` : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <span style={{ color: C.ink2, fontWeight: 600 }}>
                  {i + 1}. {it.name}
                </span>
                <span style={{ color: C.muted, whiteSpace: "nowrap" }}>
                  {it.qty}× · {fmtMoney(it.revenue_cents)}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: C.red,
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
