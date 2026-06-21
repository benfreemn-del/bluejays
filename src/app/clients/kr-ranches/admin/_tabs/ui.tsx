"use client";

/**
 * Shared design system for the KR Ranches owner admin.
 * Brand: cream + ranch-red + forest, Playfair headings, Impact labels.
 * Pure client-side — no server imports (type-only imports are safe).
 */

import React from "react";

/* ───────────── tokens ───────────── */
export const C = {
  bg: "#faf6ee",
  card: "#ffffff",
  ink: "#1f1a14",
  ink2: "#3d2a18",
  muted: "#7a6f60",
  line: "rgba(31, 26, 20, 0.10)",
  lineSoft: "rgba(31, 26, 20, 0.06)",
  red: "#9d3030",
  redDeep: "#6b1414",
  green: "#2f5d3a",
  amber: "#b8651c",
  blue: "#2f4d7a",
};

export const SHELL: React.CSSProperties = {
  background: C.bg,
  color: C.ink,
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

export const SERIF = '"Playfair Display", Georgia, serif';
export const IMPACT = "Impact, 'Bebas Neue', sans-serif";

/* ───────────── formatting ───────────── */
export function fmtMoney(cents: number | null | undefined): string {
  return ((cents ?? 0) / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export function dollarsToCents(v: string): number {
  const n = parseFloat((v || "").replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
}

export function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

export function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(s);
  }
}

export function fmtDateTime(s: string | null | undefined): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return String(s);
  }
}

/** YYYY-MM-DD for <input type=date> from an ISO string. */
export function toDateInput(s: string | null | undefined): string {
  if (!s) return "";
  try {
    return new Date(s).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

/* ───────────── primitives ───────────── */

export function Card({
  children,
  style,
  pad = 18,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: number;
}) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: pad,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  size = "md",
  title,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "soft" | "green";
  type?: "button" | "submit";
  disabled?: boolean;
  size?: "sm" | "md";
  title?: string;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700,
    fontSize: size === "sm" ? 12 : 13,
    padding: size === "sm" ? "6px 11px" : "9px 16px",
    opacity: disabled ? 0.55 : 1,
    transition: "filter .15s",
    whiteSpace: "nowrap",
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(180deg, #a02525 0%, #6b1414 100%)",
      color: "#f5e8c8",
      border: "1px solid #4a0c0c",
      fontFamily: IMPACT,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    green: {
      background: "linear-gradient(180deg, #3a7049 0%, #244a2f 100%)",
      color: "#eef7ef",
      border: "1px solid #1c3a23",
      fontFamily: IMPACT,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    ghost: {
      background: "transparent",
      color: C.ink2,
      border: `1px solid ${C.line}`,
    },
    soft: {
      background: "rgba(157,48,48,0.08)",
      color: C.red,
      border: "1px solid rgba(157,48,48,0.20)",
    },
    danger: {
      background: "transparent",
      color: C.red,
      border: "1px solid rgba(157,48,48,0.35)",
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

const PILL: Record<string, { bg: string; fg: string }> = {
  // order status
  new: { bg: "rgba(47,77,122,0.12)", fg: "#2f4d7a" },
  confirmed: { bg: "rgba(184,101,28,0.14)", fg: "#b8651c" },
  ready: { bg: "rgba(47,93,58,0.14)", fg: "#2f5d3a" },
  completed: { bg: "rgba(31,26,20,0.10)", fg: "#4a4035" },
  cancelled: { bg: "rgba(157,48,48,0.10)", fg: "#9d3030" },
  // payment
  unpaid: { bg: "rgba(157,48,48,0.12)", fg: "#9d3030" },
  deposit: { bg: "rgba(184,101,28,0.14)", fg: "#b8651c" },
  paid: { bg: "rgba(47,93,58,0.16)", fg: "#2f5d3a" },
  refunded: { bg: "rgba(31,26,20,0.10)", fg: "#7a6f60" },
  // stock
  available: { bg: "rgba(47,93,58,0.12)", fg: "#2f5d3a" },
  low: { bg: "rgba(184,101,28,0.14)", fg: "#b8651c" },
  gone: { bg: "rgba(31,26,20,0.10)", fg: "#7a6f60" },
};

export function Pill({ value }: { value: string }) {
  const c = PILL[value] || { bg: "rgba(31,26,20,0.08)", fg: C.muted };
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.fg}33`,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "red" | "green" | "amber";
}) {
  const accent = tone === "green" ? C.green : tone === "amber" ? C.amber : tone === "red" ? C.red : C.ink2;
  return (
    <Card pad={16} style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 800, color: accent, marginTop: 6, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 5 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{hint}</div>}
    </label>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  background: "#fff",
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  fontSize: 14,
  color: C.ink,
  outline: "none",
};

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(31,26,20,0.45)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg,
          borderRadius: 14,
          width: "100%",
          maxWidth: wide ? 720 : 520,
          boxShadow: "0 30px 60px -20px rgba(31,26,20,0.40)",
          border: `1px solid ${C.line}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 800 }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted, lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <div style={{ color: C.muted, fontSize: 14, padding: 20 }}>{label}</div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <Card pad={34} style={{ textAlign: "center", color: C.muted, fontSize: 14 }}>
      {children}
    </Card>
  );
}

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontFamily: SERIF, fontSize: 24, margin: 0, fontWeight: 800 }}>{children}</h2>
      {sub && <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}
