"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * KR Ranches admin dashboard.
 *
 * 4 tabs:
 *  - Menu      → CRUD on freezer items (live-edits the static site via API fetch)
 *  - Customers → contact-form submissions, missed calls, dedup'd email list
 *  - Email     → CSV download placeholder for now (compose-and-blast = future)
 *  - Shopify   → "Connect when ready" placeholder card
 *
 * Auth: client-portal-session cookie (set on login). On 401, bounce to login.
 */

type MenuItem = {
  id: string;
  name: string;
  price: string;
  note: string | null;
  status: "available" | "low" | "gone";
  sort_order: number;
};

type ContactForm = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  message: string | null;
  service_requested: string | null;
  submitted_at: string;
};

type MissedCall = {
  id: string;
  caller_phone: string | null;
  caller_name: string | null;
  duration_seconds: number | null;
  auto_sms_sent: boolean | null;
  called_at: string;
};

type EmailRow = {
  email: string;
  name: string | null;
  lastSeen: string;
};

type Tab = "menu" | "customers" | "email" | "shopify";

const PILL_COLOR: Record<string, { bg: string; fg: string; border: string }> = {
  available: { bg: "rgba(47, 93, 58, 0.12)", fg: "#2f5d3a", border: "#2f5d3a" },
  low: { bg: "rgba(184, 101, 28, 0.12)", fg: "#b8651c", border: "#b8651c" },
  gone: { bg: "rgba(45, 29, 16, 0.10)", fg: "#7a6f60", border: "#7a6f60" },
};

const SHELL = {
  background: "#faf6ee",
  color: "#1f1a14",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

export default function KRAdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("menu");
  const [authChecked, setAuthChecked] = useState(false);

  // ── Menu state ──
  const [items, setItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // ── Customers state ──
  const [contactForms, setContactForms] = useState<ContactForm[]>([]);
  const [missedCalls, setMissedCalls] = useState<MissedCall[]>([]);
  const [emailList, setEmailList] = useState<EmailRow[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // ── Auth check + initial menu load ──
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const r = await fetch("/api/clients/kr-ranches/menu", {
        credentials: "include",
      });
      if (r.status === 401) {
        router.push("/clients/kr-ranches/admin/login");
        return;
      }
      if (cancelled) return;
      setAuthChecked(true);
      if (r.ok) {
        const j = await r.json();
        setItems(j.items || []);
      }
      setMenuLoading(false);
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // ── Customers fetch (lazy, when tab opens) ──
  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      const r = await fetch("/api/clients/kr-ranches/customers", {
        credentials: "include",
      });
      if (r.ok) {
        const j = await r.json();
        setContactForms(j.contactForms || []);
        setMissedCalls(j.missedCalls || []);
        setEmailList(j.emailList || []);
      }
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  useEffect(() => {
    if ((tab === "customers" || tab === "email") && contactForms.length === 0) {
      loadCustomers();
    }
  }, [tab, contactForms.length, loadCustomers]);

  // ── Menu mutations ──
  const updateItem = useCallback(
    async (id: string, patch: Partial<MenuItem>) => {
      setSavingId(id);
      // Optimistic
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      );
      try {
        await fetch("/api/clients/kr-ranches/menu", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...patch }),
        });
      } finally {
        setTimeout(() => setSavingId(null), 400);
      }
    },
    [],
  );

  const addItem = useCallback(async () => {
    const name = window.prompt("New item name (e.g. 'Pork Belly')");
    if (!name) return;
    const price = window.prompt("Price (e.g. '$15/lb')");
    if (!price) return;
    const r = await fetch("/api/clients/kr-ranches/menu", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price,
        note: "call to confirm",
        status: "available",
        sort_order: (items[items.length - 1]?.sort_order || 0) + 10,
      }),
    });
    const j = await r.json();
    if (j.ok && j.item) {
      setItems((prev) => [...prev, j.item]);
    }
  }, [items]);

  const removeItem = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from the menu?`)) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    await fetch("/api/clients/kr-ranches/menu", {
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
    router.push("/clients/kr-ranches/admin/login");
  }

  // ── Email CSV download ──
  const csvUrl = useMemo(() => {
    if (emailList.length === 0) return null;
    const csv =
      "email,name,last_seen\n" +
      emailList
        .map(
          (e) =>
            `"${e.email}","${(e.name || "").replace(/"/g, '""')}","${e.lastSeen}"`,
        )
        .join("\n");
    return "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  }, [emailList]);

  if (!authChecked) {
    return (
      <div style={{ ...SHELL, minHeight: "100vh", padding: 40, textAlign: "center" }}>
        <div style={{ color: "#7a6f60", fontSize: 14 }}>Checking sign-in…</div>
      </div>
    );
  }

  return (
    <div style={{ ...SHELL, minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(31, 26, 20, 0.10)",
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
              fontFamily: "Impact, 'Bebas Neue', sans-serif",
              fontSize: 22,
              letterSpacing: "0.06em",
            }}
          >
            KR RANCHES — OWNER ADMIN
          </div>
          <div style={{ fontSize: 12, color: "#7a6f60", marginTop: 2 }}>
            Live edits show on{" "}
            <a
              href="/sites/kr-ranches/"
              target="_blank"
              rel="noopener"
              style={{ color: "#9d3030" }}
            >
              krranches.com
            </a>{" "}
            within ~60 seconds
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            background: "transparent",
            border: "1px solid rgba(31, 26, 20, 0.20)",
            color: "#4a4035",
            padding: "8px 14px",
            borderRadius: 6,
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
          padding: "0 24px",
          display: "flex",
          gap: 8,
          borderBottom: "1px solid rgba(31, 26, 20, 0.10)",
          background: "#fff",
          flexWrap: "wrap",
        }}
      >
        {(
          [
            { id: "menu", label: "Menu" },
            { id: "customers", label: "Customers" },
            { id: "email", label: "Email list" },
            { id: "shopify", label: "Shopify" },
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
                color: active ? "#1f1a14" : "#7a6f60",
                borderBottom: active
                  ? "3px solid #9d3030"
                  : "3px solid transparent",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        {tab === "menu" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontSize: 24,
                    margin: 0,
                  }}
                >
                  This Week at the Freezer
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "#7a6f60",
                    margin: "4px 0 0",
                  }}
                >
                  Edit prices, mark items low/gone, or add new cuts. Changes
                  appear on the public site within a minute.
                </p>
              </div>
              <button
                onClick={addItem}
                style={{
                  background:
                    "linear-gradient(180deg, #a02525 0%, #6b1414 100%)",
                  color: "#f5e8c8",
                  border: "2px solid #4a0c0c",
                  padding: "10px 18px",
                  borderRadius: 6,
                  fontFamily: "Impact, sans-serif",
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                + Add item
              </button>
            </div>

            {menuLoading && (
              <div style={{ color: "#7a6f60", fontSize: 14 }}>Loading menu…</div>
            )}

            {!menuLoading && items.length === 0 && (
              <div
                style={{
                  padding: 36,
                  textAlign: "center",
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid rgba(31, 26, 20, 0.08)",
                  color: "#7a6f60",
                }}
              >
                No items yet. Tap "Add item" to start your menu.
              </div>
            )}

            {!menuLoading && items.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid rgba(31, 26, 20, 0.08)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                {items.map((it, idx) => {
                  const c = PILL_COLOR[it.status] || PILL_COLOR.available;
                  return (
                    <div
                      key={it.id}
                      style={{
                        padding: "16px 20px",
                        borderBottom:
                          idx < items.length - 1
                            ? "1px solid rgba(31, 26, 20, 0.06)"
                            : "none",
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) auto auto",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <input
                          type="text"
                          value={it.name}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((i) =>
                                i.id === it.id ? { ...i, name: e.target.value } : i,
                              ),
                            )
                          }
                          onBlur={(e) =>
                            updateItem(it.id, { name: e.target.value })
                          }
                          style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontFamily: '"Playfair Display", Georgia, serif',
                            fontSize: 17,
                            fontWeight: 700,
                            color: "#3d2a18",
                            padding: "4px 0",
                          }}
                        />
                        <input
                          type="text"
                          value={it.note || ""}
                          placeholder="(no note)"
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((i) =>
                                i.id === it.id ? { ...i, note: e.target.value } : i,
                              ),
                            )
                          }
                          onBlur={(e) =>
                            updateItem(it.id, { note: e.target.value })
                          }
                          style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontSize: 12,
                            color: "#7a6f60",
                            fontStyle: "italic",
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={it.price}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === it.id ? { ...i, price: e.target.value } : i,
                            ),
                          )
                        }
                        onBlur={(e) =>
                          updateItem(it.id, { price: e.target.value })
                        }
                        style={{
                          border: "1px solid rgba(31, 26, 20, 0.10)",
                          borderRadius: 6,
                          padding: "8px 10px",
                          fontFamily: "Impact, sans-serif",
                          fontSize: 14,
                          letterSpacing: "0.04em",
                          color: "#9d3030",
                          background: "#fff",
                        }}
                      />
                      <select
                        value={it.status}
                        onChange={(e) =>
                          updateItem(it.id, {
                            status: e.target.value as MenuItem["status"],
                          })
                        }
                        style={{
                          background: c.bg,
                          color: c.fg,
                          border: `2px solid ${c.border}`,
                          padding: "6px 10px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontFamily: "Impact, sans-serif",
                          letterSpacing: "0.10em",
                          textTransform: "uppercase",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        <option value="available">Available</option>
                        <option value="low">Low Stock</option>
                        <option value="gone">Gone</option>
                      </select>
                      <button
                        onClick={() => removeItem(it.id, it.name)}
                        title="Remove item"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#7a6f60",
                          fontSize: 18,
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        ✕
                      </button>
                      {savingId === it.id && (
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            fontSize: 11,
                            color: "#2f5d3a",
                            fontStyle: "italic",
                          }}
                        >
                          ✓ saved
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "customers" && (
          <div>
            <h2
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 24,
                margin: "0 0 6px",
              }}
            >
              Customer activity
            </h2>
            <p style={{ fontSize: 13, color: "#7a6f60", margin: "0 0 20px" }}>
              Everyone who reached out through your contact form, plus anyone who
              called and you missed.
            </p>

            {customersLoading && (
              <div style={{ color: "#7a6f60", fontSize: 14 }}>Loading…</div>
            )}

            {!customersLoading && (
              <>
                <Section
                  title={`Contact form (${contactForms.length})`}
                  empty="No form submissions yet."
                  rows={contactForms}
                  render={(c: ContactForm) => (
                    <CustomerCard
                      key={c.id}
                      title={c.customer_name || "Anonymous"}
                      lines={[
                        c.customer_phone || "",
                        c.customer_email || "",
                        c.service_requested
                          ? `Asked about: ${c.service_requested}`
                          : "",
                        c.message || "",
                      ].filter(Boolean)}
                      timestamp={c.submitted_at}
                    />
                  )}
                />

                <Section
                  title={`Missed calls (${missedCalls.length})`}
                  empty="No missed calls logged. (This shows up if you wire your business phone to BlueJays' missed-call auto-texter.)"
                  rows={missedCalls}
                  render={(m: MissedCall) => (
                    <CustomerCard
                      key={m.id}
                      title={m.caller_name || m.caller_phone || "Unknown caller"}
                      lines={[
                        m.caller_phone || "",
                        m.duration_seconds != null
                          ? `Rang for ${m.duration_seconds}s`
                          : "",
                        m.auto_sms_sent
                          ? "✓ Auto-text sent to caller"
                          : "(no auto-text)",
                      ].filter(Boolean)}
                      timestamp={m.called_at}
                    />
                  )}
                />
              </>
            )}
          </div>
        )}

        {tab === "email" && (
          <div>
            <h2
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 24,
                margin: "0 0 6px",
              }}
            >
              Email list
            </h2>
            <p style={{ fontSize: 13, color: "#7a6f60", margin: "0 0 20px" }}>
              Every email that came through your contact form, deduped. Download
              the CSV and upload to Mailchimp / Constant Contact / your tool of
              choice.
            </p>

            {customersLoading && (
              <div style={{ color: "#7a6f60", fontSize: 14 }}>Loading…</div>
            )}

            {!customersLoading && (
              <>
                <div style={{ marginBottom: 16 }}>
                  {csvUrl ? (
                    <a
                      href={csvUrl}
                      download="kr-ranches-email-list.csv"
                      style={{
                        display: "inline-block",
                        background:
                          "linear-gradient(180deg, #a02525 0%, #6b1414 100%)",
                        color: "#f5e8c8",
                        padding: "10px 18px",
                        borderRadius: 6,
                        textDecoration: "none",
                        fontFamily: "Impact, sans-serif",
                        fontSize: 13,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Download CSV ({emailList.length} emails)
                    </a>
                  ) : (
                    <div style={{ color: "#7a6f60", fontSize: 13 }}>
                      No emails captured yet.
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(31, 26, 20, 0.08)",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  {emailList.map((e, i) => (
                    <div
                      key={e.email}
                      style={{
                        padding: "10px 16px",
                        borderBottom:
                          i < emailList.length - 1
                            ? "1px solid rgba(31, 26, 20, 0.05)"
                            : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        fontSize: 13,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "#3d2a18" }}>
                          {e.email}
                        </div>
                        {e.name && (
                          <div style={{ color: "#7a6f60", fontSize: 11 }}>
                            {e.name}
                          </div>
                        )}
                      </div>
                      <div style={{ color: "#7a6f60", fontSize: 11 }}>
                        {fmtDate(e.lastSeen)}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 24,
                    padding: 16,
                    background: "rgba(200, 123, 41, 0.08)",
                    border: "1px solid rgba(200, 123, 41, 0.30)",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#4a4035",
                  }}
                >
                  <strong style={{ color: "#3d2a18" }}>Coming soon:</strong>{" "}
                  Send a "drop alert" blast straight from this page when fresh
                  meat hits the freezer. Email Ben if you want this turned on.
                </div>
              </>
            )}
          </div>
        )}

        {tab === "shopify" && (
          <div>
            <h2
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 24,
                margin: "0 0 6px",
              }}
            >
              Shopify
            </h2>
            <p style={{ fontSize: 13, color: "#7a6f60", margin: "0 0 20px" }}>
              When you're ready to take orders online with cards, we'll connect a
              Shopify store to this site so customers can buy direct.
            </p>

            <div
              style={{
                background: "#fff",
                border: "2px dashed rgba(31, 26, 20, 0.18)",
                borderRadius: 12,
                padding: 36,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 38,
                  marginBottom: 8,
                }}
                aria-hidden="true"
              >
                🛒
              </div>
              <div
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#3d2a18",
                  marginBottom: 8,
                }}
              >
                Not connected yet
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#5a4632",
                  maxWidth: 460,
                  margin: "0 auto 18px",
                  lineHeight: 1.55,
                }}
              >
                Once you have a Shopify store set up (or want help setting one
                up), email Ben with your shop domain and admin API token. We'll
                wire your menu to your Shopify products, sync inventory, and
                let customers add to cart from the site.
              </p>
              <a
                href="mailto:bluejaycontactme@gmail.com?subject=KR%20Ranches%20Shopify%20setup"
                style={{
                  display: "inline-block",
                  background:
                    "linear-gradient(180deg, #a02525 0%, #6b1414 100%)",
                  color: "#f5e8c8",
                  padding: "12px 22px",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontFamily: "Impact, sans-serif",
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Email Ben to get started
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────── helpers ───────

function Section<T>({
  title,
  empty,
  rows,
  render,
}: {
  title: string;
  empty: string;
  rows: T[];
  render: (row: T) => React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3
        style={{
          fontFamily: "Impact, sans-serif",
          fontSize: 14,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#3d2a18",
          margin: "0 0 10px",
          paddingBottom: 6,
          borderBottom: "2px solid rgba(139, 30, 30, 0.30)",
        }}
      >
        {title}
      </h3>
      {rows.length === 0 ? (
        <div style={{ color: "#7a6f60", fontSize: 13, fontStyle: "italic" }}>
          {empty}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>{rows.map(render)}</div>
      )}
    </div>
  );
}

function CustomerCard({
  title,
  lines,
  timestamp,
}: {
  title: string;
  lines: string[];
  timestamp: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(31, 26, 20, 0.08)",
        borderRadius: 8,
        padding: "14px 16px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        alignItems: "start",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 16,
            fontWeight: 700,
            color: "#3d2a18",
          }}
        >
          {title}
        </div>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{ fontSize: 13, color: "#5a4632", marginTop: 2 }}
          >
            {l}
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#7a6f60",
          fontStyle: "italic",
          whiteSpace: "nowrap",
        }}
      >
        {fmtDate(timestamp)}
      </div>
    </div>
  );
}

function fmtDate(s: string) {
  if (!s) return "";
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return s;
  }
}
