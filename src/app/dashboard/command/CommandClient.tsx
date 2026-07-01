"use client";

/**
 * CommandClient — interactive Command-center table.
 *
 * Groups every managed domain by owner (business / client), color-codes expiry,
 * and gives Ben: Sync-from-Namecheap (bulk live expiry), per-domain RDAP refresh
 * (works for client-owned / non-Namecheap domains), add, edit, delete.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

type Bucket = "expired" | "red" | "amber" | "green" | "unknown";

type ManagedDomain = {
  id: string;
  ownerLabel: string;
  clientSlug: string | null;
  kind: "business" | "client";
  domain: string;
  registrar: string | null;
  autoManaged: boolean;
  status: string;
  registeredAt: string | null;
  expiresAt: string | null;
  hosting: string | null;
  mailboxes: string[];
  expirySource: string | null;
  expiryCheckedAt: string | null;
  notes: string | null;
};

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.ceil((t - Date.now()) / 86_400_000);
}
function bucketOf(iso: string | null): Bucket {
  const d = daysUntil(iso);
  if (d === null) return "unknown";
  if (d < 0) return "expired";
  if (d < 30) return "red";
  if (d < 60) return "amber";
  return "green";
}
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";
}

const BUCKET_STYLE: Record<Bucket, string> = {
  expired: "bg-rose-600/25 text-rose-200 border-rose-500/60",
  red: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  amber: "bg-amber-500/15 text-amber-200 border-amber-500/40",
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  unknown: "bg-slate-700/30 text-slate-400 border-slate-600/40",
};

function expiryLabel(iso: string | null): string {
  const d = daysUntil(iso);
  if (d === null) return "unknown";
  if (d < 0) return `expired ${Math.abs(d)}d ago`;
  if (d === 0) return "expires today";
  return `in ${d}d`;
}

const EMPTY_FORM = {
  domain: "",
  ownerLabel: "",
  clientSlug: "",
  kind: "client" as "business" | "client",
  registrar: "",
  hosting: "",
  expiresAt: "",
  mailboxes: "",
  notes: "",
  autoManaged: false,
  status: "active",
};
type FormState = typeof EMPTY_FORM;

export default function CommandClient() {
  const [domains, setDomains] = useState<ManagedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/managed-domains", { cache: "no-store" });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Failed to load");
      setDomains(j.domains as ManagedDomain[]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { expired: 0, red: 0, amber: 0, green: 0, unknown: 0 };
    for (const d of domains) c[bucketOf(d.expiresAt)] += 1;
    return c;
  }, [domains]);

  // Group by owner label; soonest-expiring group first.
  const groups = useMemo(() => {
    const map = new Map<string, ManagedDomain[]>();
    for (const d of domains) {
      const arr = map.get(d.ownerLabel) || [];
      arr.push(d);
      map.set(d.ownerLabel, arr);
    }
    const entries = [...map.entries()].map(([owner, list]) => {
      list.sort((a, b) => (a.expiresAt || "9999").localeCompare(b.expiresAt || "9999"));
      const soonest = list
        .map((d) => daysUntil(d.expiresAt))
        .filter((n): n is number => n !== null)
        .sort((a, b) => a - b)[0];
      return { owner, list, soonest: soonest ?? Number.POSITIVE_INFINITY, kind: list[0].kind };
    });
    entries.sort((a, b) => a.soonest - b.soonest);
    return entries;
  }, [domains]);

  async function syncNamecheap() {
    setSyncing(true);
    setBanner(null);
    try {
      const res = await fetch("/api/managed-domains/sync-namecheap", { method: "POST" });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Sync failed");
      setBanner(
        `Synced from ${j.registrar}: ${j.updated} updated, ${j.added} newly discovered (${j.total} in account).`
      );
      await load();
    } catch (e) {
      setBanner(`Sync error: ${(e as Error).message}`);
    } finally {
      setSyncing(false);
    }
  }

  async function refreshExpiry(id: string) {
    setBusyId(id);
    setBanner(null);
    try {
      const res = await fetch(`/api/managed-domains/${id}/refresh-expiry`, { method: "POST" });
      const j = await res.json();
      if (!j.ok) {
        setBanner(`RDAP: ${j.error || "no expiry found"}`);
      } else {
        setBanner(`Refreshed ${j.domain.domain} — expires ${fmtDate(j.domain.expiresAt)}.`);
      }
      await load();
    } catch (e) {
      setBanner(`Refresh error: ${(e as Error).message}`);
    } finally {
      setBusyId(null);
    }
  }

  async function removeDomain(d: ManagedDomain) {
    if (!confirm(`Stop tracking ${d.domain}? This only removes it from the Command center.`)) return;
    setBusyId(d.id);
    try {
      const res = await fetch(`/api/managed-domains/${d.id}`, { method: "DELETE" });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      await load();
    } catch (e) {
      setBanner(`Delete error: ${(e as Error).message}`);
    } finally {
      setBusyId(null);
    }
  }

  function openEdit(d: ManagedDomain) {
    setEditId(d.id);
    setShowAdd(false);
    setForm({
      domain: d.domain,
      ownerLabel: d.ownerLabel,
      clientSlug: d.clientSlug || "",
      kind: d.kind,
      registrar: d.registrar || "",
      hosting: d.hosting || "",
      expiresAt: d.expiresAt ? d.expiresAt.slice(0, 10) : "",
      mailboxes: d.mailboxes.join(", "),
      notes: d.notes || "",
      autoManaged: d.autoManaged,
      status: d.status,
    });
  }
  function openAdd() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowAdd(true);
  }
  function closeForm() {
    setShowAdd(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function saveForm() {
    setSaving(true);
    setBanner(null);
    const payload = {
      domain: form.domain.trim().toLowerCase(),
      ownerLabel: form.ownerLabel.trim(),
      clientSlug: form.clientSlug.trim() || null,
      kind: form.kind,
      registrar: form.registrar.trim() || null,
      hosting: form.hosting.trim() || null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt + "T12:00:00Z").toISOString() : null,
      mailboxes: form.mailboxes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      notes: form.notes.trim() || null,
      autoManaged: form.autoManaged,
      status: form.status,
    };
    try {
      const url = editId ? `/api/managed-domains/${editId}` : "/api/managed-domains";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Save failed");
      closeForm();
      await load();
    } catch (e) {
      setBanner(`Save error: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  const chip = (label: string, n: number, cls: string) =>
    n > 0 ? (
      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
        {n} {label}
      </span>
    ) : null;

  return (
    <div className="text-slate-100">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">🌐 Command — Domains &amp; Mailboxes</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Every domain you operate — your own businesses and every client site BlueJays manages —
            in one place. Color-coded by expiry so nothing lapses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={syncNamecheap}
            disabled={syncing}
            className="rounded-lg border border-blue-500/50 bg-blue-500/15 px-3.5 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-500/25 disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "⤵ Sync from Namecheap"}
          </button>
          <button
            onClick={openAdd}
            className="rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-3.5 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/25"
          >
            + Add domain
          </button>
        </div>
      </div>

      {/* Summary + legend */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {chip("expired", counts.expired, BUCKET_STYLE.expired)}
        {chip("<30d", counts.red, BUCKET_STYLE.red)}
        {chip("<60d", counts.amber, BUCKET_STYLE.amber)}
        {chip("healthy", counts.green, BUCKET_STYLE.green)}
        {chip("no date yet", counts.unknown, BUCKET_STYLE.unknown)}
        <span className="ml-1 text-xs text-slate-500">
          {domains.length} domain{domains.length === 1 ? "" : "s"} tracked
        </span>
      </div>

      {banner && (
        <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-200">
          {banner}
          <button onClick={() => setBanner(null)} className="ml-3 text-slate-500 hover:text-slate-300">
            ✕
          </button>
        </div>
      )}

      {(showAdd || editId) && (
        <DomainForm
          form={form}
          setForm={setForm}
          onSave={saveForm}
          onCancel={closeForm}
          saving={saving}
          isEdit={!!editId}
        />
      )}

      {loading ? (
        <p className="py-10 text-center text-slate-500">Loading domains…</p>
      ) : error ? (
        <p className="py-10 text-center text-rose-400">{error}</p>
      ) : domains.length === 0 ? (
        <p className="py-10 text-center text-slate-500">
          No domains tracked yet. Hit “Sync from Namecheap” or “Add domain”.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map(({ owner, list, kind }) => (
            <section
              key={owner}
              className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40"
            >
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/70 px-4 py-2.5">
                <span className="text-sm font-bold">{owner}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    kind === "business"
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                      : "border-cyan-500/40 bg-cyan-500/15 text-cyan-200"
                  }`}
                >
                  {kind === "business" ? "Your business" : "Client"}
                </span>
                {list[0].clientSlug && (
                  <a
                    href={`/dashboard/clients/${list[0].clientSlug}`}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    open client ↗
                  </a>
                )}
                <span className="ml-auto text-xs text-slate-500">
                  {list.length} domain{list.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="divide-y divide-slate-800/70">
                {list.map((d) => {
                  const b = bucketOf(d.expiresAt);
                  const busy = busyId === d.id;
                  return (
                    <div
                      key={d.id}
                      className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-12 sm:items-center"
                    >
                      {/* Domain + mailboxes */}
                      <div className="sm:col-span-4 min-w-0">
                        <a
                          href={`https://${d.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-blue-300 hover:underline break-all"
                        >
                          {d.domain}
                        </a>
                        {d.mailboxes.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {d.mailboxes.map((m) => (
                              <span
                                key={m}
                                className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400"
                              >
                                ✉ {m}
                              </span>
                            ))}
                          </div>
                        )}
                        {d.notes && <p className="mt-0.5 text-[11px] text-slate-500">{d.notes}</p>}
                      </div>

                      {/* Registrar + hosting */}
                      <div className="sm:col-span-2 text-xs text-slate-400">
                        <div>{d.registrar || <span className="text-slate-600">registrar?</span>}</div>
                        <div className="text-slate-500">{d.hosting || "—"}</div>
                      </div>

                      {/* Expiry */}
                      <div className="sm:col-span-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${BUCKET_STYLE[b]}`}
                        >
                          {fmtDate(d.expiresAt)} · {expiryLabel(d.expiresAt)}
                        </span>
                        <div className="mt-0.5 text-[10px] text-slate-600">
                          {d.autoManaged ? "auto-renews (Namecheap)" : "manual renewal"}
                          {d.expirySource ? ` · via ${d.expirySource}` : ""}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="sm:col-span-3 flex flex-wrap items-center gap-1.5 sm:justify-end">
                        <button
                          onClick={() => refreshExpiry(d.id)}
                          disabled={busy}
                          title="Look up live expiry via RDAP (any registrar)"
                          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                        >
                          {busy ? "…" : "↻ Expiry"}
                        </button>
                        <button
                          onClick={() => openEdit(d)}
                          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeDomain(d)}
                          disabled={busy}
                          className="rounded border border-rose-700/50 px-2 py-1 text-xs text-rose-300 hover:bg-rose-900/30 disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function DomainForm({
  form,
  setForm,
  onSave,
  onCancel,
  saving,
  isEdit,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isEdit: boolean;
}) {
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm({ ...form, [k]: v });
  const input =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none";
  const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400";

  return (
    <div className="mb-5 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <h3 className="mb-3 text-sm font-bold">{isEdit ? "Edit domain" : "Add a domain"}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>Domain</label>
          <input
            className={input}
            placeholder="example.com"
            value={form.domain}
            disabled={isEdit}
            onChange={(e) => set("domain", e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Owner / business or client name</label>
          <input
            className={input}
            placeholder="LinePlay Football"
            value={form.ownerLabel}
            onChange={(e) => set("ownerLabel", e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Kind</label>
          <select
            className={input}
            value={form.kind}
            onChange={(e) => set("kind", e.target.value as "business" | "client")}
          >
            <option value="business">Your business</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div>
          <label className={label}>Client slug (optional)</label>
          <input
            className={input}
            placeholder="mt-view-landscaping"
            value={form.clientSlug}
            onChange={(e) => set("clientSlug", e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Registrar</label>
          <input
            className={input}
            placeholder="namecheap · wix · godaddy"
            value={form.registrar}
            onChange={(e) => set("registrar", e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Hosting</label>
          <input
            className={input}
            placeholder="Vercel · Wix · Squarespace"
            value={form.hosting}
            onChange={(e) => set("hosting", e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Expiry date</label>
          <input
            type="date"
            className={input}
            value={form.expiresAt}
            onChange={(e) => set("expiresAt", e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Renewal</label>
          <label className="flex items-center gap-2 py-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.autoManaged}
              onChange={(e) => set("autoManaged", e.target.checked)}
            />
            We auto-renew this (in our Namecheap)
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Mailboxes (comma-separated)</label>
          <input
            className={input}
            placeholder="info@example.com, owner@example.com"
            value={form.mailboxes}
            onChange={(e) => set("mailboxes", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Notes</label>
          <input
            className={input}
            placeholder="Anything worth remembering"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={saving || !form.domain.trim() || !form.ownerLabel.trim()}
          className="rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add domain"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
