"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Order, OrderItem, Customer, MenuItem, OrderStatus, PaymentStatus, Fulfillment,
} from "@/lib/client-shop";
import {
  ORDER_STATUSES, PAYMENT_STATUSES, FULFILLMENTS,
} from "@/lib/client-shop";
import {
  C, Card, Btn, Pill, Field, Modal, Loading, Empty, SectionTitle,
  inputStyle, fmtMoney, fmtDate, toDateInput, dollarsToCents, centsToInput, SERIF,
} from "./ui";

const PAY_METHODS = ["", "square", "cash", "check", "other"];
const PAGE = 50;

type Line = {
  menu_item_id: string | null;
  name: string;
  unit_price: string; // dollars
  unit_label: string;
  quantity: string;
};

type FormState = {
  id?: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  fulfillment: Fulfillment;
  ordered_at: string;
  notes: string;
  items: Line[];
};

function blankForm(): FormState {
  return {
    customer_id: null,
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    status: "new",
    payment_status: "unpaid",
    payment_method: "",
    fulfillment: "pickup",
    ordered_at: toDateInput(new Date().toISOString()),
    notes: "",
    items: [{ menu_item_id: null, name: "", unit_price: "", unit_label: "", quantity: "1" }],
  };
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [q, setQ] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);

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

  useEffect(() => {
    load();
  }, [load]);

  // reference data for the form (load once)
  useEffect(() => {
    fetch("/api/clients/kr-ranches/crm?limit=500", { credentials: "include" })
      .then((r) => r.json()).then((j) => j.ok && setCustomers(j.customers || []));
    fetch("/api/clients/kr-ranches/menu", { credentials: "include" })
      .then((r) => r.json()).then((j) => j.ok && setMenu(j.items || []));
  }, []);

  function openNew() {
    setEditing(blankForm());
  }

  async function openEdit(id: string) {
    const j = await fetch(`/api/clients/kr-ranches/orders/${id}`, { credentials: "include" }).then((r) => r.json());
    if (!j.ok) return;
    const o: Order & { items: OrderItem[] } = j.order;
    setEditing({
      id: o.id,
      customer_id: o.customer_id,
      customer_name: o.customer_name || "",
      customer_phone: o.customer_phone || "",
      customer_email: o.customer_email || "",
      status: o.status,
      payment_status: o.payment_status,
      payment_method: o.payment_method || "",
      fulfillment: o.fulfillment,
      ordered_at: toDateInput(o.ordered_at),
      notes: o.notes || "",
      items: (o.items || []).map((it) => ({
        menu_item_id: it.menu_item_id,
        name: it.name,
        unit_price: centsToInput(it.unit_price_cents),
        unit_label: it.unit_label || "",
        quantity: String(it.quantity),
      })),
    });
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
    if (!editing.customer_name.trim()) {
      alert("Customer name is required.");
      return;
    }
    setSaving(true);
    const payload = {
      customer_id: editing.customer_id,
      customer_name: editing.customer_name.trim(),
      customer_phone: editing.customer_phone.trim() || null,
      customer_email: editing.customer_email.trim() || null,
      status: editing.status,
      payment_status: editing.payment_status,
      payment_method: editing.payment_method || null,
      fulfillment: editing.fulfillment,
      ordered_at: editing.ordered_at ? new Date(editing.ordered_at + "T12:00:00").toISOString() : undefined,
      notes: editing.notes.trim() || null,
      items: editing.items
        .filter((l) => l.name.trim())
        .map((l) => ({
          menu_item_id: l.menu_item_id,
          name: l.name.trim(),
          unit_price_cents: dollarsToCents(l.unit_price),
          unit_label: l.unit_label.trim() || null,
          quantity: Number(l.quantity) || 1,
        })),
    };
    try {
      if (editing.id) {
        await fetch(`/api/clients/kr-ranches/orders/${editing.id}`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/clients/kr-ranches/orders`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, source: "manual" }),
        });
      }
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
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

      {/* filters */}
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

      {/* pagination */}
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
          customers={customers}
          menu={menu}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

/* ───────────── order modal ───────────── */

function OrderModal({
  form, setForm, customers, menu, saving, onClose, onSave,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  customers: Customer[];
  menu: MenuItem[];
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const grand = useMemo(
    () => form.items.reduce((s, l) => s + dollarsToCents(l.unit_price) * (Number(l.quantity) || 0), 0),
    [form.items],
  );

  function setLine(idx: number, patch: Partial<Line>) {
    setForm({ ...form, items: form.items.map((l, i) => (i === idx ? { ...l, ...patch } : l)) });
  }
  function addLine() {
    setForm({ ...form, items: [...form.items, { menu_item_id: null, name: "", unit_price: "", unit_label: "", quantity: "1" }] });
  }
  function removeLine(idx: number) {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  }
  function pickMenu(idx: number, menuId: string) {
    if (!menuId) { setLine(idx, { menu_item_id: null }); return; }
    const m = menu.find((x) => x.id === menuId);
    if (!m) return;
    setLine(idx, {
      menu_item_id: m.id,
      name: m.name,
      unit_price: m.price_cents != null ? centsToInput(m.price_cents) : "",
      unit_label: m.unit_label || "",
    });
  }
  function pickCustomer(id: string) {
    if (!id) { setForm({ ...form, customer_id: null }); return; }
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    setForm({ ...form, customer_id: c.id, customer_name: c.name, customer_phone: c.phone || "", customer_email: c.email || "" });
  }

  return (
    <Modal title={form.id ? "Edit order" : "New order"} onClose={onClose} wide>
      {/* customer */}
      <div style={{ marginBottom: 14 }}>
        <Field label="Existing customer (optional)">
          <select value={form.customer_id || ""} onChange={(e) => pickCustomer(e.target.value)} style={inputStyle}>
            <option value="">— New / walk-in —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ""}</option>
            ))}
          </select>
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <Field label="Name *">
          <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value, customer_id: null })} style={inputStyle} />
        </Field>
        <Field label="Phone">
          <input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} style={inputStyle} />
        </Field>
        <Field label="Email">
          <input value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} style={inputStyle} />
        </Field>
        <Field label="Order date">
          <input type="date" value={form.ordered_at} onChange={(e) => setForm({ ...form, ordered_at: e.target.value })} style={inputStyle} />
        </Field>
      </div>

      {/* line items */}
      <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Items</div>
      <div style={{ display: "grid", gap: 8, marginBottom: 8 }}>
        {form.items.map((l, idx) => (
          <div key={idx} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 70px 80px 70px auto", gap: 6, alignItems: "center" }}>
            <div style={{ display: "grid", gap: 4 }}>
              <select value={l.menu_item_id || ""} onChange={(e) => pickMenu(idx, e.target.value)} style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }}>
                <option value="">— from menu —</option>
                {menu.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input placeholder="Item name" value={l.name} onChange={(e) => setLine(idx, { name: e.target.value, menu_item_id: null })} style={{ ...inputStyle, padding: "7px 9px" }} />
            </div>
            <input placeholder="$/unit" value={l.unit_price} onChange={(e) => setLine(idx, { unit_price: e.target.value })} style={{ ...inputStyle, padding: "7px 8px" }} />
            <input placeholder="unit" value={l.unit_label} onChange={(e) => setLine(idx, { unit_label: e.target.value })} style={{ ...inputStyle, padding: "7px 8px" }} />
            <input placeholder="qty" value={l.quantity} onChange={(e) => setLine(idx, { quantity: e.target.value })} style={{ ...inputStyle, padding: "7px 8px" }} />
            <button onClick={() => removeLine(idx)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        ))}
      </div>
      <button onClick={addLine} style={{ background: "none", border: `1px dashed ${C.line}`, color: C.red, padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
        + Add item
      </button>

      {/* status row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <Field label="Order status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })} style={inputStyle}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Payment">
          <select value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value as PaymentStatus })} style={inputStyle}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Pay method">
          <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} style={inputStyle}>
            {PAY_METHODS.map((m) => <option key={m} value={m}>{m || "—"}</option>)}
          </select>
        </Field>
        <Field label="Fulfillment">
          <select value={form.fulfillment} onChange={(e) => setForm({ ...form, fulfillment: e.target.value as Fulfillment })} style={inputStyle}>
            {FULFILLMENTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Notes / cut sheet">
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
      </Field>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 800 }}>
          Total: {fmtMoney(grand)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="green" onClick={onSave} disabled={saving}>{saving ? "Saving…" : form.id ? "Save changes" : "Create order"}</Btn>
        </div>
      </div>
    </Modal>
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
