"use client";

import { useEffect, useState } from "react";

/**
 * Zenith owner stats — password gate + analytics dashboard.
 *
 * Password is verified SERVER-side (/api/clients/zenith-sports/stats);
 * on success it's kept in sessionStorage so a page refresh doesn't
 * re-prompt. No lead data reaches the browser before auth passes.
 */

const NAVY_DEEP = "#050d1f";
const NAVY_CARD = "#0d1b33";
const LIME = "#00c49a";

type PageStat = {
  path: string;
  total_views: number;
  views_30d: number;
  views_7d: number;
  last_view: string | null;
};

type Lead = {
  name: string | null;
  email: string | null;
  phone: string | null;
  audience_segment: string | null;
  funnel_status: string | null;
  source: string | null;
  created_at: string | null;
};

type StatsPayload = {
  ok: boolean;
  error?: string;
  totals?: {
    totalViews: number;
    views30d: number;
    views7d: number;
    uniqueEmails: number;
    leadCount: number;
  };
  pages?: PageStat[];
  leads?: Lead[];
};

const PW_KEY = "zenith-stats-pw";
const PAGE_SIZE = 50;

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function pageLabel(path: string): string {
  if (path === "/") return "Home";
  const seg = path.replace(/\/+$/, "").split("/").filter(Boolean);
  const last = (seg[seg.length - 1] || "").replace(/-/g, " ");
  return last.charAt(0).toUpperCase() + last.slice(1);
}

export default function StatsClient() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<StatsPayload | null>(null);
  const [leadPage, setLeadPage] = useState(0);

  async function load(password: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/clients/zenith-sports/stats", {
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
  const leads = data?.leads ?? [];
  const leadPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));
  const leadSlice = leads.slice(leadPage * PAGE_SIZE, (leadPage + 1) * PAGE_SIZE);

  return (
    <div style={{ minHeight: "100vh", background: NAVY_DEEP, color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 80px" }}>
        <header style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: LIME }}>
            Zenith Sports · TEKKY
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 4px" }}>Site Analytics</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: 0 }}>
            Live view counts + every email collected on zenithsports.org
          </p>
        </header>

        {!authed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void load(pw);
            }}
            style={{ background: NAVY_CARD, borderRadius: 14, padding: 28, maxWidth: 420, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Owner access</span>
            </div>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)",
                color: "#fff", fontSize: 15, outline: "none", marginBottom: 12,
              }}
            />
            {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <button
              type="submit"
              disabled={loading || !pw}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10, border: "none",
                background: LIME, color: NAVY_DEEP, fontWeight: 800, fontSize: 15,
                cursor: loading || !pw ? "default" : "pointer", opacity: loading || !pw ? 0.6 : 1,
              }}
            >
              {loading ? "Checking…" : "View analytics"}
            </button>
          </form>
        ) : (
          <>
            {/* Totals */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 32 }}>
              {[
                { label: "Total page views", value: totals?.totalViews ?? 0 },
                { label: "Views — last 30 days", value: totals?.views30d ?? 0 },
                { label: "Views — last 7 days", value: totals?.views7d ?? 0 },
                { label: "Emails collected", value: totals?.uniqueEmails ?? 0 },
              ].map((c) => (
                <div key={c.label} style={{ background: NAVY_CARD, borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: LIME }}>{c.value.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    {c.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Per-page views */}
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Views by page</h2>
              <div style={{ background: NAVY_CARD, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
                {pages.length === 0 ? (
                  <div style={{ padding: 24, color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
                    No views logged yet — counting starts as soon as the tracking beacon is live on the site.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        <th style={{ padding: "12px 16px" }}>Page</th>
                        <th style={{ padding: "12px 16px" }}>URL</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>7 days</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>30 days</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>All time</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>Last view</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((p) => (
                        <tr key={p.path} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 700 }}>{pageLabel(p.path)}</td>
                          <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.6)", fontFamily: "monospace", fontSize: 13 }}>{p.path}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>{Number(p.views_7d).toLocaleString()}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>{Number(p.views_30d).toLocaleString()}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: LIME }}>{Number(p.total_views).toLocaleString()}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", color: "rgba(255,255,255,0.6)" }}>{fmtDate(p.last_view)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* Emails collected */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Emails collected</h2>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  Showing {leads.length === 0 ? 0 : leadPage * PAGE_SIZE + 1}–{Math.min((leadPage + 1) * PAGE_SIZE, leads.length)} of {leads.length}
                </span>
              </div>
              <div style={{ background: NAVY_CARD, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
                {leads.length === 0 ? (
                  <div style={{ padding: 24, color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
                    No emails collected yet — camp signups and contact-form submissions will appear here.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        <th style={{ padding: "12px 16px" }}>Name</th>
                        <th style={{ padding: "12px 16px" }}>Email</th>
                        <th style={{ padding: "12px 16px" }}>Phone</th>
                        <th style={{ padding: "12px 16px" }}>Type</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadSlice.map((l, i) => (
                        <tr key={`${l.email}-${l.created_at}-${i}`} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 600 }}>{l.name || "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {l.email ? <a href={`mailto:${l.email}`} style={{ color: LIME, textDecoration: "none" }}>{l.email}</a> : "—"}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {l.phone ? <a href={`tel:${l.phone}`} style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>{l.phone}</a> : "—"}
                          </td>
                          <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                            {(l.audience_segment || l.source || "lead").replace(/-/g, " ")}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right", color: "rgba(255,255,255,0.6)" }}>{fmtDate(l.created_at)}</td>
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
                    style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", cursor: leadPage === 0 ? "default" : "pointer", opacity: leadPage === 0 ? 0.4 : 1 }}
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setLeadPage((p) => Math.min(leadPages - 1, p + 1))}
                    disabled={leadPage >= leadPages - 1}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", cursor: leadPage >= leadPages - 1 ? "default" : "pointer", opacity: leadPage >= leadPages - 1 ? 0.4 : 1 }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </section>

            <footer style={{ marginTop: 48, fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
              Built by <a href="https://bluejayportfolio.com" style={{ color: "rgba(255,255,255,0.55)" }}>BlueJays</a> — analytics update in real time
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
