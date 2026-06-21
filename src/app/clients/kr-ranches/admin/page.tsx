"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SHELL, C, IMPACT } from "./_tabs/ui";
import OverviewTab from "./_tabs/OverviewTab";
import OrdersTab from "./_tabs/OrdersTab";
import RequestsTab from "./_tabs/RequestsTab";
import CustomersTab from "./_tabs/CustomersTab";
import MenuStockTab from "./_tabs/MenuStockTab";
import SeasonalTab from "./_tabs/SeasonalTab";

/**
 * KR Ranches owner admin — full commerce backend.
 * Tabs: Overview · Orders · Requests · Customers · Menu & Stock · Seasonal.
 * Auth: client-portal-session cookie (set on login). On 401, bounce to login.
 */

type Tab = "overview" | "orders" | "requests" | "customers" | "menu" | "seasonal";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "requests", label: "Requests" },
  { id: "customers", label: "Customers" },
  { id: "menu", label: "Menu & Stock" },
  { id: "seasonal", label: "Seasonal" },
];

export default function KRAdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch("/api/clients/kr-ranches/stats", { credentials: "include" });
      if (cancelled) return;
      if (r.status === 401) {
        router.push("/clients/kr-ranches/admin/login");
        return;
      }
      setAuthChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    await fetch("/api/client-portal/logout", { method: "POST", credentials: "include" });
    router.push("/clients/kr-ranches/admin/login");
  }

  if (!authChecked) {
    return (
      <div style={{ ...SHELL, minHeight: "100vh", padding: 40, textAlign: "center" }}>
        <div style={{ color: C.muted, fontSize: 14 }}>Checking sign-in…</div>
      </div>
    );
  }

  return (
    <div style={{ ...SHELL, minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          background: "#fff",
          borderBottom: `1px solid ${C.line}`,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div>
          <div style={{ fontFamily: IMPACT, fontSize: 21, letterSpacing: "0.06em" }}>
            KR RANCHES — OWNER ADMIN
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>
            Live edits show on{" "}
            <a
              href="/sites/kr-ranches/index.html"
              target="_blank"
              rel="noopener"
              style={{ color: C.red }}
            >
              your website
            </a>{" "}
            within a minute
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            background: "transparent",
            border: `1px solid ${C.line}`,
            color: C.ink2,
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Sign out
        </button>
      </div>

      {/* TABS */}
      <div
        style={{
          padding: "0 12px",
          display: "flex",
          gap: 4,
          borderBottom: `1px solid ${C.line}`,
          background: "#fff",
          flexWrap: "wrap",
          position: "sticky",
          top: 60,
          zIndex: 19,
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "transparent",
                border: "none",
                padding: "13px 16px",
                fontSize: 14,
                fontWeight: 700,
                color: active ? C.ink : C.muted,
                borderBottom: active ? `3px solid ${C.red}` : "3px solid transparent",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "22px 18px 64px", maxWidth: 1160, margin: "0 auto" }}>
        {tab === "overview" && <OverviewTab onJump={(t) => setTab(t as Tab)} />}
        {tab === "orders" && <OrdersTab />}
        {tab === "requests" && <RequestsTab />}
        {tab === "customers" && <CustomersTab />}
        {tab === "menu" && <MenuStockTab />}
        {tab === "seasonal" && <SeasonalTab />}
      </div>
    </div>
  );
}
