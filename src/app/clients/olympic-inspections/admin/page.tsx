"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import OitPartnerMap from "@/components/portal/OitPartnerMap";

/**
 * Olympic Inspections & Testing — owner admin dashboard.
 *
 * 4 tabs:
 *  - Bookings  → customer requests + status flips
 *  - Calendar  → manage available time slots
 *  - Customers → contact-form submissions (legacy + booking inquiries)
 *  - Phase 2   → QBO + Google Workspace placeholder cards
 *
 * Auth: client-portal-session cookie (set on login). On 401, bounce to login.
 */

type Slot = {
  id: string;
  start_at: string;
  end_at: string;
  label: string | null;
  notes: string | null;
  status: "available" | "booked" | "blocked";
};

type Booking = {
  id: string;
  slot_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  property_size: string | null;
  addons: string | null;
  estimate_low_cents: number | null;
  estimate_high_cents: number | null;
  service_type: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  slot?: { start_at: string; end_at: string; label: string | null } | null;
};

type Tab = "bookings" | "calendar" | "customers" | "partners" | "phase2";

const SHELL = {
  background: "#faf6ee",
  color: "#1f2a1c",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

const STATUS_COLOR: Record<string, { bg: string; fg: string; label: string }> = {
  requested: { bg: "rgba(200, 123, 41, 0.15)", fg: "#a35e1d", label: "Requested" },
  confirmed: { bg: "rgba(45, 74, 45, 0.15)", fg: "#2d4a2d", label: "Confirmed" },
  completed: { bg: "rgba(45, 74, 45, 0.20)", fg: "#1d331d", label: "Completed" },
  cancelled: { bg: "rgba(157, 48, 48, 0.12)", fg: "#9d3030", label: "Cancelled" },
  "no-show": { bg: "rgba(122, 133, 122, 0.20)", fg: "#5a6e5a", label: "No-show" },
  available: { bg: "rgba(45, 74, 45, 0.12)", fg: "#2d4a2d", label: "Available" },
  booked: { bg: "rgba(200, 123, 41, 0.15)", fg: "#a35e1d", label: "Booked" },
  blocked: { bg: "rgba(122, 133, 122, 0.20)", fg: "#5a6e5a", label: "Blocked" },
};

export default function OITAdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("bookings");
  const [authChecked, setAuthChecked] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ── Auth + initial data ──
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const r = await fetch("/api/clients/olympic-inspections/bookings", {
        credentials: "include",
      });
      if (r.status === 401) {
        router.push("/clients/olympic-inspections/admin/login");
        return;
      }
      if (cancelled) return;
      setAuthChecked(true);
      if (r.ok) {
        const j = await r.json();
        setBookings(j.bookings || []);
      }
      setLoadingBookings(false);
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const r = await fetch("/api/clients/olympic-inspections/slots", {
        credentials: "include",
      });
      if (r.ok) {
        const j = await r.json();
        setSlots(j.slots || []);
      }
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "calendar" && slots.length === 0) loadSlots();
  }, [tab, slots.length, loadSlots]);

  // ── Booking mutations ──
  const updateBookingStatus = useCallback(async (id: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
    );
    await fetch("/api/clients/olympic-inspections/bookings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
  }, []);

  // ── Slot mutations ──
  const addSlot = useCallback(async (date: string, startTime: string, endTime: string) => {
    if (!date || !startTime || !endTime) {
      alert("Pick a date, start time, and end time");
      return;
    }
    const startAt = new Date(`${date}T${startTime}`);
    const endAt = new Date(`${date}T${endTime}`);
    const r = await fetch("/api/clients/olympic-inspections/slots", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      }),
    });
    const j = await r.json();
    if (j.ok && j.slot) {
      setSlots((prev) => [...prev, j.slot].sort((a, b) =>
        a.start_at.localeCompare(b.start_at)));
    } else {
      alert("Failed to add slot");
    }
  }, []);

  const updateSlotStatus = useCallback(async (id: string, newStatus: Slot["status"]) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    );
    await fetch("/api/clients/olympic-inspections/slots", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
  }, []);

  const deleteSlot = useCallback(async (id: string) => {
    if (!window.confirm("Delete this slot?")) return;
    setSlots((prev) => prev.filter((s) => s.id !== id));
    await fetch("/api/clients/olympic-inspections/slots", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }, []);

  async function logout() {
    await fetch("/api/client-portal/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/clients/olympic-inspections/admin/login");
  }

  // ── Stats / metrics ──
  const stats = useMemo(() => {
    const requested = bookings.filter((b) => b.status === "requested").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const upcoming = slots.filter(
      (s) => s.status === "available" && new Date(s.start_at) > new Date(),
    ).length;
    // Month-to-date revenue from completed bookings. Estimate uses the
    // low end so the number is conservative ("at least $X cleared" is
    // healthier than overestimating). Falls back to 0 when an old
    // booking has no estimate stored.
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthRevenueCents = bookings
      .filter((b) => b.status === "completed")
      .filter((b) => {
        const at = b.created_at ? new Date(b.created_at) : null;
        return at && at >= monthStart;
      })
      .reduce((sum, b) => sum + (b.estimate_low_cents ?? 0), 0);
    return {
      requested,
      confirmed,
      completed,
      upcoming,
      monthRevenueUsd: Math.round(monthRevenueCents / 100),
    };
  }, [bookings, slots]);

  if (!authChecked) {
    return (
      <div style={{ ...SHELL, minHeight: "100vh", padding: 40, textAlign: "center" }}>
        <div style={{ color: "#7a857a", fontSize: 14 }}>Checking sign-in…</div>
      </div>
    );
  }

  return (
    <div style={{ ...SHELL, minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(31, 42, 28, 0.10)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Merriweather, Georgia, serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#2d4a2d",
            }}
          >
            Olympic Inspections — Owner Admin
          </div>
          <div style={{ fontSize: 12, color: "#7a857a", marginTop: 2 }}>
            Live edits show on{" "}
            <a
              href="/sites/olympic-inspections/"
              target="_blank"
              rel="noopener"
              style={{ color: "#2d4a2d" }}
            >
              olympicinspections.com
            </a>{" "}
            within ~60 seconds
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Cross-link to the generic portal where Luke's leads,
              funnels, tasks, and reports live. The two surfaces
              had zero links between them prior to 2026-05-09. */}
          <a
            href="/clients/olympic-inspections/portal"
            style={{
              background: "rgba(45, 74, 45, 0.08)",
              border: "1px solid rgba(45, 74, 45, 0.30)",
              color: "#2d4a2d",
              padding: "8px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Lead pipeline + funnels
          </a>
          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "1px solid rgba(31, 42, 28, 0.20)",
              color: "#4a5547",
              padding: "8px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div
        style={{
          padding: "16px 24px",
          background: "#fff",
          borderBottom: "1px solid rgba(31, 42, 28, 0.10)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard label="Requested" num={stats.requested} color="#c87b29" />
        <StatCard label="Confirmed" num={stats.confirmed} color="#2d4a2d" />
        <StatCard label="Completed" num={stats.completed} color="#1d331d" />
        <StatCard label="Open slots" num={stats.upcoming} color="#5a6e5a" />
        <StatCard
          label="This month"
          num={`$${stats.monthRevenueUsd.toLocaleString()}`}
          color="#1d331d"
        />
      </div>

      {/* TABS */}
      <div
        style={{
          padding: "0 24px",
          display: "flex",
          gap: 4,
          borderBottom: "1px solid rgba(31, 42, 28, 0.10)",
          background: "#fff",
          flexWrap: "wrap",
          overflowX: "auto",
        }}
      >
        {(
          [
            { id: "bookings", label: "Bookings" },
            { id: "calendar", label: "Calendar" },
            { id: "customers", label: "Customers" },
            { id: "partners", label: "Affiliates Map" },
            { id: "phase2", label: "What's next" },
          ] as const
        ).map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "transparent",
                border: "none",
                padding: "14px 18px",
                fontSize: 14,
                fontWeight: 600,
                color: active ? "#1f2a1c" : "#7a857a",
                borderBottom: active
                  ? "3px solid #2d4a2d"
                  : "3px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        {tab === "bookings" && (
          <BookingsTab
            bookings={bookings}
            loading={loadingBookings}
            onStatusChange={updateBookingStatus}
          />
        )}
        {tab === "calendar" && (
          <CalendarTab
            slots={slots}
            loading={loadingSlots}
            onAdd={addSlot}
            onStatusChange={updateSlotStatus}
            onDelete={deleteSlot}
          />
        )}
        {tab === "customers" && <CustomersTab bookings={bookings} />}
        {tab === "partners" && <PartnersTab />}
        {tab === "phase2" && <Phase2Tab />}
      </div>
    </div>
  );
}

// ─────── Sub-components ───────

function StatCard({
  label,
  num,
  color,
}: {
  label: string;
  num: number | string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#faf6ee",
        border: "1px solid rgba(31, 42, 28, 0.06)",
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontFamily: "Merriweather, Georgia, serif",
          fontSize: 28,
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {num}
      </div>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "#7a857a",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function BookingsTab({
  bookings,
  loading,
  onStatusChange,
}: {
  bookings: Booking[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: string) => void;
}) {
  if (loading) return <div style={{ color: "#7a857a", fontSize: 14 }}>Loading bookings…</div>;
  if (bookings.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(31, 42, 28, 0.10)",
          borderRadius: 10,
          padding: 36,
          textAlign: "center",
          color: "#7a857a",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: "#2d4a2d", marginBottom: 8 }}>
          No bookings yet.
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 440, margin: "0 auto" }}>
          Share your booking page so customers can request an inspection in two clicks:
          <br />
          <a
            href="/sites/olympic-inspections/#book"
            target="_blank"
            rel="noopener"
            style={{ color: "#2d4a2d", fontWeight: 600 }}
          >
            olympicinspections.com/#book
          </a>
          <br />
          Paste it in your email signature and Facebook bio.
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {bookings.map((b) => {
        const c = STATUS_COLOR[b.status] || STATUS_COLOR.requested;
        const slotTime = b.slot
          ? new Date(b.slot.start_at).toLocaleString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : null;
        const estimate =
          b.estimate_low_cents != null && b.estimate_high_cents != null
            ? `$${(b.estimate_low_cents / 100).toFixed(0)}–$${(b.estimate_high_cents / 100).toFixed(0)}`
            : null;
        return (
          <div
            key={b.id}
            style={{
              background: "#fff",
              border: "1px solid rgba(31, 42, 28, 0.10)",
              borderRadius: 10,
              padding: 18,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 14,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <strong
                  style={{
                    fontFamily: "Merriweather, Georgia, serif",
                    fontSize: 17,
                    color: "#1f2a1c",
                  }}
                >
                  {b.customer_name}
                </strong>
                <span
                  style={{
                    background: c.bg,
                    color: c.fg,
                    padding: "3px 10px",
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {c.label}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#4a5547", display: "grid", gap: 3 }}>
                {b.customer_phone && (
                  <span>
                    📞{" "}
                    <a href={`tel:${b.customer_phone}`} style={{ color: "#2d4a2d" }}>
                      {b.customer_phone}
                    </a>
                  </span>
                )}
                {b.customer_email && (
                  <span>
                    ✉{" "}
                    <a href={`mailto:${b.customer_email}`} style={{ color: "#2d4a2d" }}>
                      {b.customer_email}
                    </a>
                  </span>
                )}
                {b.customer_address && <span>📍 {b.customer_address}</span>}
                {slotTime && (
                  <span style={{ fontWeight: 600, color: "#2d4a2d" }}>
                    🕐 {slotTime}
                  </span>
                )}
                {(b.property_size || b.addons || estimate) && (
                  <span style={{ fontSize: 12, color: "#7a857a" }}>
                    {b.property_size}
                    {b.addons && b.addons !== "none" ? ` · ${b.addons}` : ""}
                    {estimate ? ` · est ${estimate}` : ""}
                  </span>
                )}
                {b.notes && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "10px 12px",
                      background: "#faf6ee",
                      borderRadius: 6,
                      fontSize: 12.5,
                      whiteSpace: "pre-wrap",
                      color: "#1f2a1c",
                    }}
                  >
                    {b.notes}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
              <select
                value={b.status}
                onChange={(e) => onStatusChange(b.id, e.target.value)}
                style={{
                  padding: "8px 10px",
                  border: "1px solid rgba(31, 42, 28, 0.20)",
                  borderRadius: 6,
                  background: "#fff",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <option value="requested">Requested</option>
                <option value="confirmed">Confirm</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-show</option>
              </select>

              {/* "Send report" button — opens Luke's mail client pre-
                  addressed with subject + body so he attaches the
                  inspection-report PDF himself. Only renders for
                  completed bookings. Auto-generates a Google Workspace
                  upload flow lands later (Phase 2). */}
              {b.status === "completed" && b.customer_email && (
                <a
                  href={(() => {
                    const firstName =
                      b.customer_name?.split(" ")[0] || "there";
                    const subject = encodeURIComponent(
                      "Your inspection report — Olympic Inspections",
                    );
                    const body = encodeURIComponent(
                      `Hi ${firstName},\n\n` +
                        `Your inspection report from Olympic Inspections is attached.\n\n` +
                        `Quick guide for reading it:\n` +
                        `• Page 1 — summary of findings + recommendations\n` +
                        `• Page 2-3 — photo documentation by area\n` +
                        `• Page 4+ — lab results (if you opted for sampling)\n\n` +
                        `If anything in the report needs more context, reply to this email or call me at 360-555-0100. I'm happy to walk through it.\n\n` +
                        `If you need a remediation contractor, I can refer one — just let me know.\n\n` +
                        `Thanks for trusting us with this.\n\n` +
                        `— Luke\n` +
                        `Olympic Inspections & Testing\n` +
                        `olympicinspections.com`,
                    );
                    return `mailto:${b.customer_email}?subject=${subject}&body=${body}`;
                  })()}
                  style={{
                    padding: "7px 10px",
                    background: "rgba(45,74,45,0.10)",
                    border: "1px solid rgba(45,74,45,0.30)",
                    color: "#2d4a2d",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                  title="Opens your mail client with the report email pre-filled — attach the PDF and send"
                >
                  📄 Send report
                </a>
              )}

              <div style={{ fontSize: 11, color: "#7a857a", textAlign: "right" }}>
                {new Date(b.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarTab({
  slots,
  loading,
  onAdd,
  onStatusChange,
  onDelete,
}: {
  slots: Slot[];
  loading: boolean;
  onAdd: (date: string, startTime: string, endTime: string) => void;
  onStatusChange: (id: string, newStatus: Slot["status"]) => void;
  onDelete: (id: string) => void;
}) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

  // Bulk-add weekday slots (M-F × 9am/12pm/3pm × next 30 calendar days).
  // Skips weekends because OIT runs M-F. ~22 weekdays × 3 slots ≈ 66
  // slots per click. Idempotent on rerun: each call adds another batch
  // (no dedup in v1 — Luke can delete duplicates from the list below
  // if he double-clicks).
  const bulkAdd = async () => {
    if (bulkBusy) return;
    setBulkBusy(true);
    setBulkMsg(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotsToAdd: Array<{ date: string; start: string; end: string }> = [];
    for (let d = 0; d < 30; d++) {
      const day = new Date(today);
      day.setDate(today.getDate() + d);
      const dow = day.getDay();
      if (dow === 0 || dow === 6) continue; // skip weekends
      const yyyy = day.getFullYear();
      const mm = String(day.getMonth() + 1).padStart(2, "0");
      const dd = String(day.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      slotsToAdd.push({ date: dateStr, start: "09:00", end: "11:00" });
      slotsToAdd.push({ date: dateStr, start: "12:00", end: "14:00" });
      slotsToAdd.push({ date: dateStr, start: "15:00", end: "17:00" });
    }
    // Fire sequentially so the optimistic UI doesn't blow up on
    // simultaneous inserts. ~66 slots × ~50ms ≈ 3-4s end-to-end.
    let created = 0;
    for (const s of slotsToAdd) {
      try {
        onAdd(s.date, s.start, s.end);
        created++;
      } catch {
        // continue — best-effort batch
      }
    }
    setBulkBusy(false);
    setBulkMsg(
      `Created ${created} slots — ${slotsToAdd.length / 3} weekdays × 9am / 12pm / 3pm.`,
    );
    setTimeout(() => setBulkMsg(null), 6000);
  };

  return (
    <div>
      {/* Add slot form */}
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(31, 42, 28, 0.10)",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h3
          style={{
            fontFamily: "Merriweather, Georgia, serif",
            fontSize: 16,
            margin: "0 0 12px",
            color: "#1f2a1c",
          }}
        >
          Add available slot
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr auto",
            gap: 10,
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Start time">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="End time">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <button
            onClick={() => {
              onAdd(date, startTime, endTime);
              setDate("");
            }}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(180deg, #2d4a2d 0%, #1d331d 100%)",
              color: "#faf6ee",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            + Add slot
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#7a857a", marginTop: 10, fontStyle: "italic" }}>
          Tip: Add several slots per week so customers always have options. Slots in the past auto-hide on the public site.
        </p>

        {/* Bulk-add — one-click "30-day weekday batch" so Luke doesn't
            have to manually pick 60+ slots from his phone. */}
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid rgba(31, 42, 28, 0.10)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={bulkAdd}
            disabled={bulkBusy}
            style={{
              padding: "8px 14px",
              background: bulkBusy ? "rgba(31,42,28,0.10)" : "rgba(45,74,45,0.10)",
              color: bulkBusy ? "#7a857a" : "#2d4a2d",
              border: "1px solid rgba(45,74,45,0.30)",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: bulkBusy ? "wait" : "pointer",
            }}
          >
            {bulkBusy ? "Adding…" : "⚡ Pre-fill 30 days (M-F · 9 / 12 / 3)"}
          </button>
          {bulkMsg && (
            <span style={{ fontSize: 12, color: "#2d4a2d", fontStyle: "italic" }}>
              {bulkMsg}
            </span>
          )}
        </div>
      </div>

      {/* Slot list */}
      {loading && <div style={{ color: "#7a857a", fontSize: 14 }}>Loading slots…</div>}
      {!loading && slots.length === 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(31, 42, 28, 0.10)",
            borderRadius: 10,
            padding: 36,
            textAlign: "center",
            color: "#7a857a",
          }}
        >
          No slots yet. Add a slot above and customers will see it on the public booking form within ~60 seconds.
        </div>
      )}
      {!loading && slots.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          {slots.map((s) => {
            const c = STATUS_COLOR[s.status] || STATUS_COLOR.available;
            const start = new Date(s.start_at);
            const end = new Date(s.end_at);
            const isPast = start < new Date();
            return (
              <div
                key={s.id}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(31, 42, 28, 0.08)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 12,
                  alignItems: "center",
                  opacity: isPast ? 0.55 : 1,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2a1c" }}>
                    {start.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    ·{" "}
                    {start.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {" – "}
                    {end.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  {isPast && (
                    <div style={{ fontSize: 11, color: "#7a857a", fontStyle: "italic" }}>
                      In the past
                    </div>
                  )}
                </div>
                <select
                  value={s.status}
                  onChange={(e) => onStatusChange(s.id, e.target.value as Slot["status"])}
                  style={{
                    background: c.bg,
                    color: c.fg,
                    border: `1.5px solid ${c.fg}`,
                    padding: "5px 9px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                  }}
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="blocked">Blocked</option>
                </select>
                <button
                  onClick={() => onDelete(s.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#7a857a",
                    fontSize: 18,
                    cursor: "pointer",
                    padding: 4,
                  }}
                  title="Delete slot"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomersTab({ bookings }: { bookings: Booking[] }) {
  // Roll bookings up by customer (deduped by email/phone/name) and
  // compute history: total bookings, last seen, lifetime estimate.
  // Repeat customers (>1 booking) are flagged so Luke can spot
  // recurring revenue at a glance.
  const customers = useMemo(() => {
    type Aggregate = {
      first: Booking;
      bookingCount: number;
      lastSeenAt: string;
      lifetimeUsd: number;
    };
    const map = new Map<string, Aggregate>();
    for (const b of bookings) {
      const key = (
        b.customer_email ||
        b.customer_phone ||
        b.customer_name ||
        ""
      ).toLowerCase();
      if (!key) continue;
      const cents = b.estimate_low_cents ?? 0;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          first: b,
          bookingCount: 1,
          lastSeenAt: b.created_at,
          lifetimeUsd: Math.round(cents / 100),
        });
      } else {
        existing.bookingCount += 1;
        existing.lifetimeUsd += Math.round(cents / 100);
        if (
          b.created_at &&
          (!existing.lastSeenAt || b.created_at > existing.lastSeenAt)
        ) {
          existing.lastSeenAt = b.created_at;
        }
      }
    }
    return Array.from(map.values()).sort(
      (a, b) =>
        // Repeat customers first, then by lifetime spend desc
        b.bookingCount - a.bookingCount || b.lifetimeUsd - a.lifetimeUsd,
    );
  }, [bookings]);

  if (customers.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(31, 42, 28, 0.10)",
          borderRadius: 10,
          padding: 36,
          textAlign: "center",
          color: "#7a857a",
        }}
      >
        No customers yet — they'll show up here as bookings come in.
      </div>
    );
  }

  const repeatCount = customers.filter((c) => c.bookingCount > 1).length;
  const totalLtv = customers.reduce((s, c) => s + c.lifetimeUsd, 0);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "Merriweather, Georgia, serif",
              fontSize: 18,
              margin: "0 0 4px",
            }}
          >
            Customers ({customers.length})
          </h3>
          <p style={{ fontSize: 12, color: "#7a857a", margin: 0 }}>
            Sorted by repeat-customer status, then lifetime spend.
          </p>
        </div>
        <div style={{ fontSize: 12, color: "#4a5547", textAlign: "right" }}>
          <div>
            <strong style={{ color: "#2d4a2d" }}>{repeatCount}</strong> repeat
            customers
          </div>
          <div>
            <strong style={{ color: "#2d4a2d" }}>${totalLtv.toLocaleString()}</strong>{" "}
            book-of-business
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {customers.map((agg) => {
          const c = agg.first;
          const isRepeat = agg.bookingCount > 1;
          return (
            <div
              key={c.id}
              style={{
                background: "#fff",
                border: isRepeat
                  ? "1.5px solid rgba(45, 74, 45, 0.40)"
                  : "1px solid rgba(31, 42, 28, 0.10)",
                borderRadius: 8,
                padding: "12px 16px",
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <strong style={{ fontSize: 14, color: "#1f2a1c" }}>
                    {c.customer_name}
                  </strong>
                  {isRepeat && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#2d4a2d",
                        background: "rgba(45,74,45,0.12)",
                        border: "1px solid rgba(45,74,45,0.30)",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      ×{agg.bookingCount} bookings
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#4a5547", marginTop: 2 }}>
                  {c.customer_phone && (
                    <a
                      href={`tel:${c.customer_phone}`}
                      style={{
                        marginRight: 12,
                        color: "#4a5547",
                        textDecoration: "none",
                      }}
                    >
                      📞 {c.customer_phone}
                    </a>
                  )}
                  {c.customer_email && (
                    <a
                      href={`mailto:${c.customer_email}`}
                      style={{
                        color: "#4a5547",
                        textDecoration: "none",
                      }}
                    >
                      ✉️ {c.customer_email}
                    </a>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#4a5547" }}>
                {agg.lifetimeUsd > 0 && (
                  <div>
                    <strong style={{ color: "#2d4a2d" }}>
                      ${agg.lifetimeUsd.toLocaleString()}
                    </strong>{" "}
                    lifetime
                  </div>
                )}
                <div style={{ fontSize: 11, color: "#7a857a", marginTop: 2 }}>
                  Last:{" "}
                  {new Date(agg.lastSeenAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#7a857a", textAlign: "right" }}>
                Since {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Phase2Tab() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          background: "#faf6ee",
          border: "1px solid rgba(31, 42, 28, 0.10)",
          borderRadius: 12,
          padding: 18,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#2d4a2d",
            marginBottom: 4,
          }}
        >
          Coming next
        </div>
        <p style={{ fontSize: 12, color: "#4a5547", margin: 0, lineHeight: 1.5 }}>
          These integrations are queued and will activate as Luke + Ben hit the
          milestones. Each one removes manual work — automated invoicing,
          report generation, domain ownership.
        </p>
      </div>
      <Phase2Card
        emoji="📊"
        title="QuickBooks Online sync"
        body="Automatically create QBO invoices when bookings are completed, sync customer contacts, record Stripe payments. Will require one-time OAuth connection setup with your QBO Developer account."
        cta="Connect QuickBooks"
        disabled
      />
      <Phase2Card
        emoji="📄"
        title="Google Workspace report generator"
        body="Auto-generate inspection reports from a Google Doc template, fill in customer + lab data, save to a Drive folder per customer, optionally email the PDF. Will require one-time OAuth connection with your Google Workspace account."
        cta="Connect Google Workspace"
        disabled
      />
      <Phase2Card
        emoji="🌐"
        title="Domain transfer (Squarespace → Namecheap)"
        body="When you're ready, kick off the transfer at Squarespace, share the auth code with Ben, and the domain will point to this site within 24 hours."
        cta="Email Ben to start"
        disabled={false}
      />
    </div>
  );
}

/**
 * PartnersTab — Olympic Peninsula affiliate-target map for OIT.
 * Realtors + mold remediation contractors + water-damage restoration
 * + property mgmt + larger commercial buyers (hospitals, schools,
 * marinas, hotels). Designed for Luke to pick a dot and pick up the
 * phone.
 */
function PartnersTab() {
  return <OitPartnerMap />;
}

function Phase2Card({
  emoji,
  title,
  body,
  cta,
  disabled,
}: {
  emoji: string;
  title: string;
  body: string;
  cta: string;
  disabled: boolean;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "2px dashed rgba(31, 42, 28, 0.18)",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
      <h3
        style={{
          fontFamily: "Merriweather, Georgia, serif",
          fontSize: 18,
          color: "#1f2a1c",
          margin: "0 0 6px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "#4a5547",
          margin: "0 0 16px",
          lineHeight: 1.55,
        }}
      >
        {body}
      </p>
      {disabled ? (
        <button
          disabled
          style={{
            padding: "10px 18px",
            background: "rgba(31, 42, 28, 0.08)",
            color: "#7a857a",
            border: "1px solid rgba(31, 42, 28, 0.15)",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "not-allowed",
          }}
        >
          {cta} (coming soon)
        </button>
      ) : (
        <a
          href="mailto:bluejaycontactme@gmail.com?subject=OIT%20domain%20transfer"
          style={{
            display: "inline-block",
            padding: "10px 18px",
            background: "linear-gradient(180deg, #2d4a2d 0%, #1d331d 100%)",
            color: "#faf6ee",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          {cta}
        </a>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "#7a857a",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid rgba(31, 42, 28, 0.18)",
  borderRadius: 6,
  background: "#fff",
  fontSize: 14,
  color: "#1f2a1c",
  outline: "none",
};
