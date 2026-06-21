"use client";

import { useEffect, useState } from "react";
import { C, Card, Loading, SectionTitle, fmtMoney, SERIF } from "./ui";

type Stats = {
  bySeason: { season: string; orders: number; revenue_cents: number }[];
  byMonth: { month: string; orders: number; revenue_cents: number }[];
  topItems: { name: string; qty: number; revenue_cents: number }[];
  topCustomers: { id: string; name: string; total_spent_cents: number; order_count: number }[];
};

const SEASON_META: Record<string, { emoji: string; color: string; label: string }> = {
  spring: { emoji: "🌱", color: "#5a8a4a", label: "Spring" },
  summer: { emoji: "☀️", color: "#c79a2e", label: "Summer" },
  fall: { emoji: "🍂", color: "#b8651c", label: "Fall" },
  winter: { emoji: "❄️", color: "#4a6f9d", label: "Winter" },
};

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "short" });
}

export default function SeasonalTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetch("/api/clients/kr-ranches/stats", { credentials: "include" }).then((r) => r.json());
        if (s.ok) setStats(s);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loading />;
  if (!stats) return <Loading label="No data yet." />;

  const seasonMax = Math.max(1, ...stats.bySeason.map((s) => s.revenue_cents));
  const monthMax = Math.max(1, ...stats.byMonth.map((m) => m.revenue_cents));

  return (
    <div>
      <SectionTitle sub="What sells when — plan your harvests and freezer drops around the demand.">
        Seasonal &amp; trends
      </SectionTitle>

      {/* season cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 22 }}>
        {["spring", "summer", "fall", "winter"].map((key) => {
          const row = stats.bySeason.find((s) => s.season === key) || { orders: 0, revenue_cents: 0 };
          const meta = SEASON_META[key];
          const pct = Math.round((row.revenue_cents / seasonMax) * 100);
          return (
            <Card key={key} pad={16}>
              <div style={{ fontSize: 13, fontWeight: 800, color: meta.color }}>
                {meta.emoji} {meta.label}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 800, marginTop: 4 }}>
                {fmtMoney(row.revenue_cents)}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>{row.orders} orders</div>
              <div style={{ height: 6, background: C.lineSoft, borderRadius: 999, marginTop: 10, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: meta.color }} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* monthly bar chart */}
      <Card style={{ marginBottom: 22 }}>
        <strong style={{ fontFamily: SERIF, fontSize: 18 }}>Last 12 months</strong>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${stats.byMonth.length || 12}, 1fr)`,
            gap: 6,
            alignItems: "end",
            height: 180,
            marginTop: 18,
          }}
        >
          {stats.byMonth.map((m) => {
            const h = Math.max(2, Math.round((m.revenue_cents / monthMax) * 150));
            return (
              <div key={m.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }} title={fmtMoney(m.revenue_cents)}>
                  {m.revenue_cents > 0 ? `$${Math.round(m.revenue_cents / 100)}` : ""}
                </div>
                <div
                  title={`${m.month}: ${fmtMoney(m.revenue_cents)} · ${m.orders} orders`}
                  style={{
                    width: "100%",
                    maxWidth: 38,
                    height: h,
                    background: m.revenue_cents > 0 ? "linear-gradient(180deg, #a02525, #6b1414)" : C.lineSoft,
                    borderRadius: "5px 5px 0 0",
                  }}
                />
                <div style={{ fontSize: 10, color: C.muted }}>{monthLabel(m.month)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* top items + customers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Card pad={0}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line}` }}>
            <strong style={{ fontFamily: SERIF, fontSize: 17 }}>Best-selling cuts</strong>
          </div>
          {stats.topItems.length === 0 ? (
            <div style={{ padding: 22, color: C.muted, fontSize: 13 }}>No sales recorded yet.</div>
          ) : (
            stats.topItems.map((it, i) => (
              <div key={it.name + i} style={rowS(i, stats.topItems.length)}>
                <span style={{ color: C.ink2, fontWeight: 600 }}>{i + 1}. {it.name}</span>
                <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{it.qty}× · {fmtMoney(it.revenue_cents)}</span>
              </div>
            ))
          )}
        </Card>
        <Card pad={0}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line}` }}>
            <strong style={{ fontFamily: SERIF, fontSize: 17 }}>Top customers</strong>
          </div>
          {stats.topCustomers.length === 0 ? (
            <div style={{ padding: 22, color: C.muted, fontSize: 13 }}>No customers yet.</div>
          ) : (
            stats.topCustomers.map((c, i) => (
              <div key={c.id} style={rowS(i, stats.topCustomers.length)}>
                <span style={{ color: C.ink2, fontWeight: 600 }}>{i + 1}. {c.name}</span>
                <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{c.order_count} orders · {fmtMoney(c.total_spent_cents)}</span>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

function rowS(i: number, len: number): React.CSSProperties {
  return {
    padding: "11px 18px",
    borderBottom: i < len - 1 ? `1px solid ${C.lineSoft}` : "none",
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 13,
  };
}
