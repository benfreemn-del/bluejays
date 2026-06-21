"use client";

import { useCallback, useEffect, useState } from "react";
import type { MenuItem } from "@/lib/client-shop";
import { MENU_CATEGORIES } from "@/lib/client-shop";
import {
  C, Card, Btn, Pill, Field, Modal, Loading, Empty, SectionTitle,
  inputStyle, dollarsToCents, centsToInput, SERIF,
} from "./ui";

type Edit = {
  id?: string;
  name: string;
  price: string;        // display text e.g. "$22/lb"
  note: string;
  status: string;
  category: string;
  unit_label: string;
  quantity: string;
  low_threshold: string;
  price_dollars: string; // numeric price for online checkout
  track_inventory: boolean;
  buyable: boolean;
};

function statusFromQty(q: number, t: number): string {
  if (q <= 0) return "gone";
  if (q <= t) return "low";
  return "available";
}

export default function MenuStockTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Edit | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const j = await fetch("/api/clients/kr-ranches/menu", { credentials: "include" }).then((r) => r.json());
      if (j.ok) setItems(j.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function patch(id: string, body: Record<string, unknown>) {
    setSavingId(id);
    await fetch("/api/clients/kr-ranches/menu", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }),
    });
    setTimeout(() => setSavingId(null), 500);
  }

  // inline quantity stepper — auto-flips stock status server-side
  async function bumpQty(it: MenuItem, delta: number) {
    const next = Math.max(0, (Number(it.quantity) || 0) + delta);
    const newStatus = statusFromQty(next, Number(it.low_threshold) || 3);
    setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, quantity: next, status: newStatus as MenuItem["status"] } : x)));
    await patch(it.id, { quantity: next });
  }

  async function setQty(it: MenuItem, raw: string) {
    const next = Math.max(0, Number(raw) || 0);
    const newStatus = statusFromQty(next, Number(it.low_threshold) || 3);
    setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, quantity: next, status: newStatus as MenuItem["status"] } : x)));
    await patch(it.id, { quantity: next });
  }

  function openNew() {
    setEditing({
      name: "", price: "", note: "", status: "available", category: "beef",
      unit_label: "lb", quantity: "", low_threshold: "3", price_dollars: "",
      track_inventory: false, buyable: false,
    });
  }
  function openEdit(it: MenuItem) {
    setEditing({
      id: it.id, name: it.name, price: it.price || "", note: it.note || "", status: it.status,
      category: it.category || "other", unit_label: it.unit_label || "",
      quantity: it.quantity != null ? String(it.quantity) : "",
      low_threshold: it.low_threshold != null ? String(it.low_threshold) : "3",
      price_dollars: it.price_cents != null ? centsToInput(it.price_cents) : "",
      track_inventory: !!it.track_inventory, buyable: !!it.buyable,
    });
  }

  async function save() {
    if (!editing || !editing.name.trim()) { alert("Name is required."); return; }
    if (!editing.price.trim()) { alert("Add a display price (e.g. \"$22/lb\")."); return; }
    setSaving(true);
    const qtyNum = editing.quantity.trim() === "" ? null : Math.max(0, Number(editing.quantity) || 0);
    const thr = Number(editing.low_threshold) || 3;
    const body = {
      name: editing.name.trim(),
      price: editing.price.trim(),
      note: editing.note.trim(),
      category: editing.category,
      unit_label: editing.unit_label.trim(),
      quantity: qtyNum,
      low_threshold: thr,
      price_cents: editing.price_dollars.trim() ? dollarsToCents(editing.price_dollars) : null,
      track_inventory: editing.track_inventory,
      buyable: editing.buyable,
      // if tracking + we know a qty, derive status; else keep chosen status
      status: editing.track_inventory && qtyNum != null ? statusFromQty(qtyNum, thr) : editing.status,
    };
    try {
      if (editing.id) {
        await patch(editing.id, body);
      } else {
        await fetch("/api/clients/kr-ranches/menu", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, sort_order: (items[items.length - 1]?.sort_order || 0) + 10 }),
        });
      }
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Remove "${name}" from the menu?`)) return;
    await fetch("/api/clients/kr-ranches/menu", {
      method: "DELETE", credentials: "include",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    setEditing(null);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <SectionTitle sub="Your freezer list — edit prices, set quantities, and mark what customers can buy online. Changes show on your site within a minute.">
          Menu &amp; stock
        </SectionTitle>
        <Btn onClick={openNew}>+ Add item</Btn>
      </div>

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty>No items yet. Tap “+ Add item” to build your freezer list.</Empty>
      ) : (
        <Card pad={0}>
          {items.map((it, i) => (
            <div
              key={it.id}
              style={{
                padding: "13px 16px",
                borderBottom: i < items.length - 1 ? `1px solid ${C.lineSoft}` : "none",
                display: "grid",
                gridTemplateColumns: "minmax(0,1.5fr) minmax(0,0.9fr) auto auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: C.ink2, fontSize: 15, display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                  {it.name}
                  <Pill value={it.status} />
                  {it.buyable && <span title="Sellable online" style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>🛒 online</span>}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {it.price}{it.category ? ` · ${it.category}` : ""}{savingId === it.id ? "  ✓ saved" : ""}
                </div>
              </div>

              {/* quantity stepper (only when tracking) */}
              <div>
                {it.track_inventory ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={() => bumpQty(it, -1)} style={stepBtn}>−</button>
                    <input
                      value={it.quantity ?? 0}
                      onChange={(e) => setQty(it, e.target.value)}
                      style={{ width: 50, textAlign: "center", padding: "5px 4px", border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 13, fontWeight: 700 }}
                    />
                    <button onClick={() => bumpQty(it, 1)} style={stepBtn}>+</button>
                    <span style={{ fontSize: 11, color: C.muted, marginLeft: 2 }}>{it.unit_label || ""}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: C.muted }}>not tracked</span>
                )}
              </div>

              <Btn variant="ghost" size="sm" onClick={() => openEdit(it)}>Edit</Btn>
              <button onClick={() => remove(it.id, it.name)} title="Remove" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
          ))}
        </Card>
      )}

      {editing && (
        <Modal title={editing.id ? "Edit item" : "Add item"} onClose={() => setEditing(null)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Item name *"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={inputStyle} /></Field>
            <Field label="Category">
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} style={inputStyle}>
                {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Display price *" hint='What shows on your site, e.g. "$22/lb"'>
              <input value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Unit" hint="lb, dozen, each…">
              <input value={editing.unit_label} onChange={(e) => setEditing({ ...editing, unit_label: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Note" hint="Optional, e.g. “call to confirm”">
              <input value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Stock status">
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} style={inputStyle} disabled={editing.track_inventory}>
                <option value="available">available</option>
                <option value="low">low stock</option>
                <option value="gone">gone</option>
              </select>
            </Field>
          </div>

          {/* inventory block */}
          <div style={{ marginTop: 16, padding: 14, background: "rgba(31,26,20,0.03)", borderRadius: 10, border: `1px solid ${C.lineSoft}` }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, color: C.ink2 }}>
              <input type="checkbox" checked={editing.track_inventory} onChange={(e) => setEditing({ ...editing, track_inventory: e.target.checked })} />
              Track quantity in stock (auto-marks low / gone)
            </label>
            {editing.track_inventory && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <Field label="Quantity on hand"><input value={editing.quantity} onChange={(e) => setEditing({ ...editing, quantity: e.target.value })} style={inputStyle} placeholder="0" /></Field>
                <Field label="Low-stock threshold" hint="Mark “low” at or below this"><input value={editing.low_threshold} onChange={(e) => setEditing({ ...editing, low_threshold: e.target.value })} style={inputStyle} /></Field>
              </div>
            )}
          </div>

          {/* online checkout block */}
          <div style={{ marginTop: 14, padding: 14, background: "rgba(47,93,58,0.05)", borderRadius: 10, border: "1px solid rgba(47,93,58,0.18)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, color: C.green }}>
              <input type="checkbox" checked={editing.buyable} onChange={(e) => setEditing({ ...editing, buyable: e.target.checked })} />
              🛒 Sell this online (adds it to website checkout)
            </label>
            {editing.buyable && (
              <div style={{ marginTop: 12, maxWidth: 240 }}>
                <Field label="Online price (per unit)" hint="The exact $ charged at online checkout">
                  <input value={editing.price_dollars} onChange={(e) => setEditing({ ...editing, price_dollars: e.target.value })} style={inputStyle} placeholder="22.00" />
                </Field>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
            {editing.id ? <Btn variant="danger" onClick={() => remove(editing.id!, editing.name)}>Delete</Btn> : <span />}
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

const stepBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.line}`, background: "#fff",
  cursor: "pointer", fontSize: 16, fontWeight: 700, color: C.ink2, lineHeight: 1,
};
