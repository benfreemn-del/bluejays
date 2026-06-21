"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Order, OrderItem, Customer, MenuItem, OrderStatus, PaymentStatus, Fulfillment,
} from "@/lib/client-shop";
import { ORDER_STATUSES, PAYMENT_STATUSES, FULFILLMENTS } from "@/lib/client-shop";
import {
  C, Btn, Field, Modal, inputStyle, fmtMoney, toDateInput, dollarsToCents, centsToInput, SERIF,
} from "./ui";

const PAY_METHODS = ["", "square", "cash", "check", "other"];

export type Line = {
  menu_item_id: string | null;
  name: string;
  unit_price: string; // dollars
  unit_label: string;
  quantity: string;
};

export type FormState = {
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

export function blankForm(): FormState {
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

/** Build a prefilled new-order form from a website contact-form request. */
export function prefillFromRequest(req: {
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  message?: string | null;
  service_requested?: string | null;
}): FormState {
  const noteParts = [
    req.service_requested ? `Interested in: ${req.service_requested}` : "",
    req.message || "",
  ].filter(Boolean);
  return {
    ...blankForm(),
    customer_name: (req.customer_name || "").trim(),
    customer_phone: (req.customer_phone || "").trim(),
    customer_email: (req.customer_email || "").trim(),
    notes: noteParts.join("\n"),
  };
}

/** Build an editable form from a fetched order (with items). */
export function formFromOrder(o: Order & { items?: OrderItem[] }): FormState {
  return {
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
  };
}

/**
 * Persist a form as an order. POST (create) when no id, PATCH (edit) when id.
 * Returns { ok, error?, order? }. Validates customer name client-side.
 */
export async function saveOrder(form: FormState): Promise<{ ok: boolean; error?: string; order?: Order }> {
  if (!form.customer_name.trim()) return { ok: false, error: "Customer name is required." };
  const payload = {
    customer_id: form.customer_id,
    customer_name: form.customer_name.trim(),
    customer_phone: form.customer_phone.trim() || null,
    customer_email: form.customer_email.trim() || null,
    status: form.status,
    payment_status: form.payment_status,
    payment_method: form.payment_method || null,
    fulfillment: form.fulfillment,
    ordered_at: form.ordered_at ? new Date(form.ordered_at + "T12:00:00").toISOString() : undefined,
    notes: form.notes.trim() || null,
    items: form.items
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
    const url = form.id
      ? `/api/clients/kr-ranches/orders/${form.id}`
      : `/api/clients/kr-ranches/orders`;
    const r = await fetch(url, {
      method: form.id ? "PATCH" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.id ? payload : { ...payload, source: "manual" }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) return { ok: false, error: j.error || "Save failed. Please try again." };
    return { ok: true, order: j.order };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export function OrderModal({
  form, setForm, saving, onClose, onSave, title,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  title?: string;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetch("/api/clients/kr-ranches/crm?limit=500", { credentials: "include" })
      .then((r) => r.json()).then((j) => { if (j.ok) setCustomers(j.customers || []); }).catch(() => {});
    fetch("/api/clients/kr-ranches/menu", { credentials: "include" })
      .then((r) => r.json()).then((j) => { if (j.ok) setMenu(j.items || []); }).catch(() => {});
  }, []);

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
    <Modal title={title || (form.id ? "Edit order" : "New order")} onClose={onClose} wide>
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
        <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 800 }}>Total: {fmtMoney(grand)}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="green" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : form.id ? "Save changes" : "Create order"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
