"use client";

import { useCallback, useEffect, useState } from "react";
import type { Customer, Order, OrderItem } from "@/lib/client-shop";
import {
  C, Card, Btn, Pill, Field, Modal, Loading, Empty, SectionTitle,
  inputStyle, fmtMoney, fmtDate, SERIF,
} from "./ui";

const SUGGESTED_TAGS = ["subscriber", "wholesale", "repeat", "whole-animal", "vip"];

type Edit = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tags: string[];
  notes: string;
};

export default function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");

  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Edit | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("sort", sort);
    params.set("limit", "500");
    try {
      const j = await fetch(`/api/clients/kr-ranches/crm?${params}`, { credentials: "include" }).then((r) => r.json());
      if (j.ok) setCustomers(j.customers || []);
    } finally {
      setLoading(false);
    }
  }, [q, sort]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing({ name: "", phone: "", email: "", address: "", tags: [], notes: "" });
  }
  function openEdit(c: Customer) {
    setEditing({ id: c.id, name: c.name, phone: c.phone || "", email: c.email || "", address: c.address || "", tags: c.tags || [], notes: c.notes || "" });
  }

  async function save() {
    if (!editing || !editing.name.trim()) { alert("Name is required."); return; }
    setSaving(true);
    const payload = {
      name: editing.name.trim(),
      phone: editing.phone.trim() || null,
      email: editing.email.trim() || null,
      address: editing.address.trim() || null,
      tags: editing.tags,
      notes: editing.notes.trim() || null,
    };
    try {
      if (editing.id) {
        await fetch(`/api/clients/kr-ranches/crm/${editing.id}`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/clients/kr-ranches/crm`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete ${name}? Their orders stay but lose the customer link.`)) return;
    await fetch(`/api/clients/kr-ranches/crm/${id}`, { method: "DELETE", credentials: "include" });
    setEditing(null);
    load();
  }

  function toggleTag(tag: string) {
    if (!editing) return;
    setEditing({
      ...editing,
      tags: editing.tags.includes(tag) ? editing.tags.filter((t) => t !== tag) : [...editing.tags, tag],
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <SectionTitle sub="Everyone who buys from you — contact info, lifetime spend, and order history.">
          Customers
        </SectionTitle>
        <Btn onClick={openNew}>+ Add customer</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <input placeholder="Search name, phone, email…" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...inputStyle, maxWidth: 280 }} />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ ...inputStyle, maxWidth: 200 }}>
          <option value="recent">Most recent order</option>
          <option value="spend">Highest spend</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : customers.length === 0 ? (
        <Empty>No customers yet. They’ll appear automatically when you log orders, or add one manually.</Empty>
      ) : (
        <Card pad={0}>
          {customers.map((c, i) => (
            <div
              key={c.id}
              onClick={() => setOpenId(c.id)}
              style={{
                padding: "13px 16px",
                borderBottom: i < customers.length - 1 ? `1px solid ${C.lineSoft}` : "none",
                display: "grid",
                gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr) auto",
                gap: 12,
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: C.ink2, fontSize: 15, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  {c.name}
                  {(c.tags || []).map((t) => <Pill key={t} value={t} />)}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {[c.phone, c.email].filter(Boolean).join(" · ") || "no contact info"}
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {c.order_count} order{c.order_count === 1 ? "" : "s"}
                <br />last {fmtDate(c.last_order_at)}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 800, color: C.green }}>{fmtMoney(c.total_spent_cents)}</div>
                <div style={{ fontSize: 11, color: C.muted }}>lifetime</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {openId && (
        <CustomerDrawer
          id={openId}
          onClose={() => setOpenId(null)}
          onEdit={(c) => { setOpenId(null); openEdit(c); }}
        />
      )}

      {editing && (
        <Modal title={editing.id ? "Edit customer" : "Add customer"} onClose={() => setEditing(null)}>
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Name *"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={inputStyle} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Phone"><input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} style={inputStyle} /></Field>
              <Field label="Email"><input value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} style={inputStyle} /></Field>
            </div>
            <Field label="Address"><input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} style={inputStyle} /></Field>
            <Field label="Tags">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SUGGESTED_TAGS.map((t) => {
                  const on = editing.tags.includes(t);
                  return (
                    <button key={t} onClick={() => toggleTag(t)} style={{
                      padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${on ? C.red : C.line}`, background: on ? "rgba(157,48,48,0.10)" : "#fff", color: on ? C.red : C.muted,
                    }}>{t}</button>
                  );
                })}
              </div>
            </Field>
            <Field label="Private notes"><textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></Field>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
            {editing.id
              ? <Btn variant="danger" onClick={() => remove(editing.id!, editing.name)}>Delete</Btn>
              : <span />}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn variant="green" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ───────────── profile drawer ───────────── */

function CustomerDrawer({ id, onClose, onEdit }: { id: string; onClose: () => void; onEdit: (c: Customer) => void }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const j = await fetch(`/api/clients/kr-ranches/crm/${id}`, { credentials: "include" }).then((r) => r.json());
        if (j.ok) { setCustomer(j.customer); setOrders(j.orders || []); }
      } finally { setLoading(false); }
    })();
  }, [id]);

  return (
    <Modal title={customer?.name || "Customer"} onClose={onClose} wide>
      {loading ? <Loading /> : !customer ? <Empty>Not found.</Empty> : (
        <div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {(customer.tags || []).map((t) => <Pill key={t} value={t} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 16 }}>
            <Card pad={12}><div style={lbl}>Lifetime spend</div><div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 800, color: C.green }}>{fmtMoney(customer.total_spent_cents)}</div></Card>
            <Card pad={12}><div style={lbl}>Orders</div><div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 800 }}>{customer.order_count}</div></Card>
            <Card pad={12}><div style={lbl}>First order</div><div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{fmtDate(customer.first_order_at)}</div></Card>
            <Card pad={12}><div style={lbl}>Last order</div><div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{fmtDate(customer.last_order_at)}</div></Card>
          </div>

          <div style={{ display: "grid", gap: 4, marginBottom: 16, fontSize: 13, color: C.ink2 }}>
            {customer.phone && <div>📞 <a href={`tel:${customer.phone}`} style={{ color: C.red }}>{customer.phone}</a></div>}
            {customer.email && <div>✉️ <a href={`mailto:${customer.email}`} style={{ color: C.red }}>{customer.email}</a></div>}
            {customer.address && <div>📍 {customer.address}</div>}
            {customer.notes && <div style={{ marginTop: 6, color: C.muted, fontStyle: "italic" }}>“{customer.notes}”</div>}
          </div>

          <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 800, margin: "8px 0 10px" }}>Order history</div>
          {orders.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13 }}>No orders yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {orders.map((o) => (
                <Card key={o.id} pad={12}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 700, color: C.ink2 }}>#{o.order_number} · {fmtDate(o.ordered_at)}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Pill value={o.payment_status} /><Pill value={o.status} />
                      <strong style={{ fontFamily: SERIF }}>{fmtMoney(o.total_cents)}</strong>
                    </div>
                  </div>
                  {o.items && o.items.length > 0 && (
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
                      {o.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <Btn onClick={() => onEdit(customer)}>Edit customer</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

const lbl: React.CSSProperties = { fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" };
