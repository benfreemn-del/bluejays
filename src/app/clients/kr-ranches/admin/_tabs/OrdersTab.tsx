"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, OrderItem } from "@/lib/client-shop";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/client-shop";
import {
  C, Card, Btn, Loading, Empty, SectionTitle, inputStyle, fmtMoney, fmtDate, SERIF,
} from "./ui";
import { OrderModal, blankForm, formFromOrder, saveOrder, type FormState } from "./OrderModal";

const PAGE = 50;

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [q, setQ] = useState("");

  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (payment) params.set("payment_status", payment);
    if (q.trim()) params.set("q", q.trim());
    params.set("limit", String(PAGE));
    params.set("offset", String(page * PAGE));
    try {
      const j = await fetch(`/api/clients/kr-ranches/orders?${params}`, { credentials: "include" }).then((r) => r.json());
      if (j.ok) {
        setOrders(j.orders || []);
        setTotal(j.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [status, payment, q, page]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing(blankForm());
  }

  async function openEdit(id: string) {
    const j = await fetch(`/api/clients/kr-ranches/orders/${id}`, { credentials: "include" }).then((r) => r.json());
    if (!j.ok) return;
    setEditing(formFromOrder(j.order as Order & { items: OrderItem[] }));
  }

  async function quickPatch(id: string, patch: Record<string, unknown>) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } as Order : o)));
    await fetch(`/api/clients/kr-ranches/orders/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    load();
  }

  async function removeOrder(id: string, num: number) {
    if (!confirm(`Delete order #${num}? This cannot be undone.`)) return;
    await fetch(`/api/clients/kr-ranches/orders/${id}`, { method: "DELETE", credentials: "include" });
    load();
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await saveOrder(editing);
    setSaving(false);
    if (!res.ok) { alert(res.error || "Save failed."); return; }
    setEditing(null);
    load();
  }

  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <SectionTitle sub="Every order — logged by phone, in person, or placed online. Click any to edit.">
          Orders
        </SectionTitle>
        <Btn onClick={openNew}>+ New order</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <input
          placeholder="Search name, phone, email, or #…"
          value={q}
          onChange={(e) => { setPage(0); setQ(e.target.value); }}
          style={{ ...inputStyle, maxWidth: 280 }}
        />
        <select value={status} onChange={(e) => { setPage(0); setStatus(e.target.value); }} style={{ ...inputStyle, maxWidth: 160 }}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={payment} onChange={(e) => { setPage(0); setPayment(e.target.value); }} style={{ ...inputStyle, maxWidth: 160 }}>
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <Empty>No orders match. Tap “+ New order” to log one.</Empty>
      ) : (
        <Card pad={0}>
          {orders.map((o, i) => (
            <div
              key={o.id}
              style={{
                padding: "14px 16px",
                borderBottom: i < orders.length - 1 ? `1px solid ${C.lineSoft}` : "none",
                display: "grid",
                gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1.4fr) auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: 0, cursor: "pointer" }} onClick={() => openEdit(o.id)}>
                <div style={{ fontWeight: 800, color: C.ink2, fontSize: 15 }}>
                  #{o.order_number} · {o.customer_name || "—"}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {fmtDate(o.ordered_at)} · {o.fulfillment}
                  {o.source === "website" ? " · 🌐 online" : o.source === "square" ? " · 💳 square" : ""}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <select
                  value={o.status}
                  onChange={(e) => quickPatch(o.id, { status: e.target.value })}
                  style={miniSelect}
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={o.payment_status}
                  onChange={(e) => quickPatch(o.id, { payment_status: e.target.value })}
                  style={miniSelect}
                >
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
                <strong style={{ fontFamily: SERIF, fontSize: 16, minWidth: 70, textAlign: "right" }}>
                  {fmtMoney(o.total_cents)}
                </strong>
                <button onClick={() => removeOrder(o.id, o.order_number)} title="Delete order"
                  style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {total > PAGE && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 16 }}>
          <Btn variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>← Prev</Btn>
          <span style={{ fontSize: 12, color: C.muted }}>
            {page * PAGE + 1}–{Math.min(total, (page + 1) * PAGE)} of {total}
          </span>
          <Btn variant="ghost" size="sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next →</Btn>
        </div>
      )}

      {editing && (
        <OrderModal
          form={editing}
          setForm={setEditing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

const miniSelect: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${C.line}`,
  borderRadius: 6,
  padding: "5px 7px",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "capitalize",
  cursor: "pointer",
  color: C.ink2,
};
