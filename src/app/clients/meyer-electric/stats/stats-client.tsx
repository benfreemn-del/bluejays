"use client";

import { useEffect, useState } from "react";

/**
 * Meyer Electric owner stats — password gate + live analytics.
 *
 * Password is verified SERVER-side (/api/clients/meyer-electric/stats);
 * on success it's kept in sessionStorage so a refresh doesn't
 * re-prompt. No lead data reaches the browser before auth passes.
 *
 * Brand: near-black (#0a0a0a) + Meyer yellow (#facc15) — matches the
 * public showcase. Fonts inherit from the meyer-electric layout
 * (Space Grotesk headings / Inter body).
 */

const BG = "#0a0a0a";
const CARD = "#141310";
const ACCENT = "#facc15";
const INK_DIM = "rgba(255,255,255,0.55)";
const BORDER = "1px solid rgba(255,255,255,0.08)";
const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

type PageStat = {
  path: string;
  total_views: number;
  views_30d: number;
  views_7d: number;
  last_view: string | null;
};

type Lead = {
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  service_requested: string | null;
  message: string | null;
  submitted_at: string | null;
};

type DomainInfo = {
  domain: string;
  registrar: string | null;
  status: string;
  expiresAt: string | null;
  autoManaged: boolean;
};

type StatsPayload = {
  ok: boolean;
  error?: string;
  totals?: {
    totalViews: number;
    views30d: number;
    views7d: number;
    leadCount: number;
  };
  pages?: PageStat[];
  daily?: Array<{ day: string; views: number }>;
  referrers?: Array<{ source: string; count: number }>;
  leads?: Lead[];
  domains?: DomainInfo[];
};

type ViewBucket = "day" | "week" | "month";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Aggregate daily counts into day / week (Mon-start) / month buckets. */
function bucketViews(
  daily: Array<{ day: string; views: number }>,
  bucket: ViewBucket,
): Array<{ label: string; views: number; key: string }> {
  const map = new Map<string, { label: string; views: number }>();
  for (const { day, views } of daily) {
    const d = parseDayKey(day);
    let key = day;
    let label = shortDate(d);
    if (bucket === "week") {
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      label = `${shortDate(monday)} – ${shortDate(sunday)}`;
    } else if (bucket === "month") {
      key = day.slice(0, 7);
      label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    }
    const prev = map.get(key);
    map.set(key, { label, views: (prev?.views ?? 0) + views });
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.key.localeCompare(a.key)); // newest first
}

const PW_KEY = "meyer-stats-pw";
const PAGE_SIZE = 50;

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function domainLabel(path: string): string {
  // Stored paths look like "sequimelectrician.com/" or
  // "bluejayportfolio.com/clients/meyer-electric".
  const host = path.split("/")[0] || path;
  return host;
}

export default function StatsClient() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<StatsPayload | null>(null);
  const [leadPage, setLeadPage] = useState(0);
  // Quote-request window — defaults to the last 30 days so Kyle opens
  // to what's current; "All time" one tap away.
  const [leadWindow, setLeadWindow] = useState<"30d" | "all">("30d");
  // Views-over-time granularity toggle.
  const [viewBucket, setViewBucket] = useState<ViewBucket>("week");

  async function load(password: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/clients/meyer-electric/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as StatsPayload;
      if (!res.ok || !json.ok) {
        setError(json.error || "Wrong password");
        sessionStorage.removeItem(PW_KEY);
        setAuthed(false);
        return;
      }
      sessionStorage.setItem(PW_KEY, password);
      setData(json);
      setAuthed(true);
    } catch {
      setError("Couldn't load stats — try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY);
    if (saved) void load(saved);
  }, []);

  const totals = data?.totals;
  const pages = data?.pages ?? [];
  const daily = data?.daily ?? [];
  // Newest-first buckets, capped so the Day view doesn't become a wall.
  const bucketCap = viewBucket === "day" ? 31 : viewBucket === "week" ? 26 : 24;
  const viewRows = bucketViews(daily, viewBucket).slice(0, bucketCap);
  const maxViewRow = viewRows.reduce((m, r) => Math.max(m, r.views), 0);
  const referrers = data?.referrers ?? [];
  const allLeads = data?.leads ?? [];
  const domains = data?.domains ?? [];
  const cutoff30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const leads =
    leadWindow === "30d"
      ? allLeads.filter((l) => {
          const t = l.submitted_at ? new Date(l.submitted_at).getTime() : 0;
          return t >= cutoff30;
        })
      : allLeads;
  const leadPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));
  const leadSlice = leads.slice(leadPage * PAGE_SIZE, (leadPage + 1) * PAGE_SIZE);
  const maxReferrer = referrers.length ? referrers[0].count : 0;

  const th: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
  };
  const thRight: React.CSSProperties = { ...th, textAlign: "right" };
  const td: React.CSSProperties = { padding: "12px 16px" };
  const tdRight: React.CSSProperties = { ...td, textAlign: "right" };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: FONT_BODY }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 80px" }}>
        <header style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: ACCENT,
                fontFamily: FONT_HEAD,
              }}
            >
              Meyer Electric LLC
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 4px", fontFamily: FONT_HEAD }}>
              Your Website Backend
            </h1>
            <p style={{ color: INK_DIM, fontSize: 14, margin: 0 }}>
              Live traffic, quote requests, and your domains — updated in real time
            </p>
          </div>
          <a
            href="/clients/meyer-electric"
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: INK_DIM,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "8px 12px",
              whiteSpace: "nowrap",
            }}
          >
            ← Your site
          </a>
        </header>

        {!authed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void load(pw);
            }}
            style={{ background: CARD, borderRadius: 14, padding: 28, maxWidth: 420, border: BORDER }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={ACCENT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span style={{ fontWeight: 700, fontSize: 15, fontFamily: FONT_HEAD }}>Owner access</span>
            </div>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              autoFocus
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontSize: 15,
                outline: "none",
                marginBottom: 12,
              }}
            />
            {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <button
              type="submit"
              disabled={loading || !pw}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "none",
                background: ACCENT,
                color: BG,
                fontWeight: 800,
                fontSize: 15,
                fontFamily: FONT_HEAD,
                cursor: loading || !pw ? "default" : "pointer",
                opacity: loading || !pw ? 0.6 : 1,
              }}
            >
              {loading ? "Checking…" : "View my backend"}
            </button>
          </form>
        ) : (
          <>
            {/* Totals */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 14,
                marginBottom: 18,
              }}
            >
              {[
                { label: "Total page views", value: totals?.totalViews ?? 0 },
                { label: "Views — last 30 days", value: totals?.views30d ?? 0 },
                { label: "Views — last 7 days", value: totals?.views7d ?? 0 },
                { label: "Quote requests", value: totals?.leadCount ?? 0 },
              ].map((c) => (
                <div key={c.label} style={{ background: CARD, borderRadius: 14, padding: "18px 20px", border: BORDER }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: ACCENT, fontFamily: FONT_HEAD }}>
                    {c.value.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: INK_DIM,
                      marginTop: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                    }}
                  >
                    {c.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Pre-beacon history note */}
            <div
              style={{
                background: "rgba(250,204,21,0.06)",
                border: "1px solid rgba(250,204,21,0.25)",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 13,
                color: "rgba(255,255,255,0.75)",
                marginBottom: 32,
              }}
            >
              <strong style={{ color: ACCENT }}>Tracking since launch:</strong> every visit to
              your site since it went live on May 12, 2026 is counted here.
            </div>

            {/* Views by domain */}
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, fontFamily: FONT_HEAD }}>
                Views by domain
              </h2>
              <div style={{ background: CARD, borderRadius: 14, border: BORDER, overflowX: "auto" }}>
                {pages.length === 0 ? (
                  <div style={{ padding: 24, color: INK_DIM, fontSize: 14 }}>
                    No views logged yet — counting starts as soon as visitors hit the site.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        <th style={th}>Domain</th>
                        <th style={thRight}>7 days</th>
                        <th style={thRight}>30 days</th>
                        <th style={thRight}>All time</th>
                        <th style={thRight}>Last visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((p) => (
                        <tr key={p.path} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <td style={{ ...td, fontWeight: 700 }}>{domainLabel(p.path)}</td>
                          <td style={tdRight}>{Number(p.views_7d).toLocaleString()}</td>
                          <td style={tdRight}>{Number(p.views_30d).toLocaleString()}</td>
                          <td style={{ ...tdRight, fontWeight: 700, color: ACCENT }}>
                            {Number(p.total_views).toLocaleString()}
                          </td>
                          <td style={{ ...tdRight, color: INK_DIM }}>{fmtDate(p.last_view)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* Views over time — day / week / month */}
            <section style={{ marginBottom: 40 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: FONT_HEAD }}>
                  Views over time
                </h2>
                <div style={{ display: "inline-flex", gap: 6 }}>
                  {(
                    [
                      { id: "day", label: "By day" },
                      { id: "week", label: "By week" },
                      { id: "month", label: "By month" },
                    ] as const
                  ).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setViewBucket(b.id)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        border:
                          viewBucket === b.id
                            ? `1px solid ${ACCENT}`
                            : "1px solid rgba(255,255,255,0.15)",
                        background: viewBucket === b.id ? "rgba(250,204,21,0.12)" : "transparent",
                        color: viewBucket === b.id ? ACCENT : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: CARD, borderRadius: 14, border: BORDER, padding: "8px 0", maxHeight: 420, overflowY: "auto" }}>
                {viewRows.length === 0 ? (
                  <div style={{ padding: 24, color: INK_DIM, fontSize: 14 }}>
                    View history appears here once visits start logging.
                  </div>
                ) : (
                  viewRows.map((r) => (
                    <div
                      key={r.key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "150px 1fr 60px",
                        alignItems: "center",
                        gap: 12,
                        padding: "7px 16px",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{r.label}</div>
                      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 10 }}>
                        <div
                          style={{
                            width: `${maxViewRow ? Math.max(3, (r.views / maxViewRow) * 100) : 0}%`,
                            background: ACCENT,
                            borderRadius: 6,
                            height: 10,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, textAlign: "right", color: ACCENT }}>
                        {r.views.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Referrers */}
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, fontFamily: FONT_HEAD }}>
                Where visitors came from <span style={{ fontWeight: 500, fontSize: 13, color: INK_DIM }}>· last 30 days</span>
              </h2>
              <div style={{ background: CARD, borderRadius: 14, border: BORDER, padding: "8px 0" }}>
                {referrers.length === 0 ? (
                  <div style={{ padding: 24, color: INK_DIM, fontSize: 14 }}>
                    Traffic sources appear here once visits start logging.
                  </div>
                ) : (
                  referrers.map((r) => (
                    <div
                      key={r.source}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "180px 1fr 60px",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 16px",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.source === "direct" ? "Direct / typed in" : r.source}
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 10 }}>
                        <div
                          style={{
                            width: `${maxReferrer ? Math.max(4, (r.count / maxReferrer) * 100) : 0}%`,
                            background: ACCENT,
                            borderRadius: 6,
                            height: 10,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, textAlign: "right", color: ACCENT }}>
                        {r.count.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Quote requests */}
            <section style={{ marginBottom: 40 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 12,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: FONT_HEAD }}>Quote requests</h2>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    {(
                      [
                        { id: "30d", label: "Last 30 days" },
                        { id: "all", label: "All time" },
                      ] as const
                    ).map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setLeadWindow(w.id);
                          setLeadPage(0);
                        }}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          border:
                            leadWindow === w.id
                              ? `1px solid ${ACCENT}`
                              : "1px solid rgba(255,255,255,0.15)",
                          background: leadWindow === w.id ? "rgba(250,204,21,0.12)" : "transparent",
                          color: leadWindow === w.id ? ACCENT : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  Showing {leads.length === 0 ? 0 : leadPage * PAGE_SIZE + 1}–
                  {Math.min((leadPage + 1) * PAGE_SIZE, leads.length)} of {leads.length}
                  {leadWindow === "30d" && allLeads.length > leads.length
                    ? ` · ${allLeads.length} all-time`
                    : ""}
                </span>
              </div>
              <div style={{ background: CARD, borderRadius: 14, border: BORDER, overflowX: "auto" }}>
                {leads.length === 0 ? (
                  <div style={{ padding: 24, color: INK_DIM, fontSize: 14 }}>
                    {leadWindow === "30d" && allLeads.length > 0
                      ? "No quote requests in the last 30 days — tap All time to see older ones."
                      : "No quote requests yet — website form submissions land here (and in your email)."}
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        <th style={th}>Name</th>
                        <th style={th}>Phone</th>
                        <th style={th}>Email</th>
                        <th style={th}>Service</th>
                        <th style={th}>Message</th>
                        <th style={thRight}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadSlice.map((l, i) => (
                        <tr
                          key={`${l.customer_email}-${l.submitted_at}-${i}`}
                          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <td style={{ ...td, fontWeight: 600 }}>{l.customer_name || "—"}</td>
                          <td style={td}>
                            {l.customer_phone ? (
                              <a href={`tel:${l.customer_phone}`} style={{ color: ACCENT, textDecoration: "none" }}>
                                {l.customer_phone}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td style={td}>
                            {l.customer_email ? (
                              <a
                                href={`mailto:${l.customer_email}`}
                                style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
                              >
                                {l.customer_email}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td style={{ ...td, color: INK_DIM, fontSize: 13 }}>{l.service_requested || "—"}</td>
                          <td style={{ ...td, color: INK_DIM, fontSize: 13, maxWidth: 260 }}>
                            {l.message || "—"}
                          </td>
                          <td style={{ ...tdRight, color: INK_DIM, whiteSpace: "nowrap" }}>{fmtDate(l.submitted_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {leadPages > 1 && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
                  <button
                    onClick={() => setLeadPage((p) => Math.max(0, p - 1))}
                    disabled={leadPage === 0}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "transparent",
                      color: "#fff",
                      cursor: leadPage === 0 ? "default" : "pointer",
                      opacity: leadPage === 0 ? 0.4 : 1,
                    }}
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setLeadPage((p) => Math.min(leadPages - 1, p + 1))}
                    disabled={leadPage >= leadPages - 1}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "transparent",
                      color: "#fff",
                      cursor: leadPage >= leadPages - 1 ? "default" : "pointer",
                      opacity: leadPage >= leadPages - 1 ? 0.4 : 1,
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </section>

            {/* Domains */}
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, fontFamily: FONT_HEAD }}>
                Your domains
              </h2>
              {domains.length === 0 ? (
                <div style={{ background: CARD, borderRadius: 14, border: BORDER, padding: 24, color: INK_DIM, fontSize: 14 }}>
                  Domain details are being synced — check back soon.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 14,
                  }}
                >
                  {domains.map((d) => (
                    <div key={d.domain} style={{ background: CARD, borderRadius: 14, border: BORDER, padding: "18px 20px" }}>
                      <div style={{ fontWeight: 800, fontSize: 16, fontFamily: FONT_HEAD, marginBottom: 10 }}>
                        {d.domain}
                      </div>
                      <div style={{ fontSize: 13, color: INK_DIM, display: "grid", gap: 6 }}>
                        <div>
                          Status:{" "}
                          <span style={{ color: d.status === "active" ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                            {d.status}
                          </span>
                        </div>
                        {d.expiresAt && (
                          <div>
                            Renews / expires: <span style={{ color: "#fff" }}>{fmtDate(d.expiresAt)}</span>
                          </div>
                        )}
                        {d.registrar && (
                          <div>
                            Registrar: <span style={{ color: "#fff" }}>{d.registrar}</span>
                          </div>
                        )}
                        <div>
                          {d.autoManaged
                            ? "Renewal handled for you by BlueJays ✓"
                            : "Renewal managed with BlueJays"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <footer style={{ marginTop: 48, fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
              Managed by{" "}
              <a href="https://bluejayportfolio.com" style={{ color: "rgba(255,255,255,0.55)" }}>
                BlueJays
              </a>{" "}
              — data updates in real time
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
