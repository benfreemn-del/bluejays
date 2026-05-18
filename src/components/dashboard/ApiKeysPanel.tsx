"use client";

import { useEffect, useState } from "react";
import type { ApiKeyMeta } from "@/lib/client-api-keys";

/**
 * Admin-side API key management for a client.
 *
 * Generates bearer tokens for /api/v1/clients/[slug]/* endpoints. The
 * plaintext token is shown ONCE at creation — copy + share with the
 * client. After that, only the prefix + label persist.
 *
 * Mount in /dashboard/clients/[slug].
 */

export default function ApiKeysPanel({ slug }: { slug: string }) {
  const [keys, setKeys] = useState<ApiKeyMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<{
    plaintext: string;
    label: string;
  } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/clients/${slug}/api-keys`);
      const j = await r.json();
      if (j.ok) setKeys(j.keys);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [slug]);

  async function create() {
    if (!label.trim()) return;
    setCreating(true);
    try {
      const r = await fetch(`/api/clients/${slug}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() }),
      });
      const j = await r.json();
      if (j.ok) {
        setJustCreated({ plaintext: j.key.key, label: j.key.label });
        setLabel("");
        void load();
      } else {
        alert(`Could not create: ${j.error}`);
      }
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this key? Calls using it will start failing.")) return;
    const r = await fetch(`/api/clients/${slug}/api-keys/${id}`, {
      method: "DELETE",
    });
    if (r.ok) void load();
  }

  function copy(text: string) {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 mb-6">
      <div className="rounded-2xl border border-violet-500/25 bg-violet-950/20">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg" aria-hidden>🔑</span>
            <span className="font-bold text-sm tracking-wide text-violet-100">
              API keys
            </span>
            <span className="text-[10px] uppercase tracking-wider text-violet-400/70 font-bold">
              {keys.filter((k) => !k.revoked_at).length} active
            </span>
          </div>
          <span className="text-violet-300 text-xs">
            {expanded ? "▾ Hide" : "▸ Show"}
          </span>
        </button>

        {expanded && (
          <div className="border-t border-violet-500/20 px-4 py-3 space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Bearer tokens for{" "}
              <code className="text-violet-200 bg-slate-900 px-1 rounded">
                GET /api/v1/clients/{slug}/leads
              </code>{" "}
              and other public endpoints. Plaintext shown once — copy +
              share with the client's dev team or paste into Zapier.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Key label (e.g. 'ITC ERP integration')"
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
              />
              <button
                onClick={create}
                disabled={creating || !label.trim()}
                className="text-sm font-bold bg-violet-500 hover:bg-violet-400 disabled:bg-slate-700 text-violet-950 px-4 py-2 rounded"
              >
                {creating ? "Creating…" : "+ Generate"}
              </button>
            </div>

            {justCreated && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 space-y-2">
                <p className="text-xs font-bold text-emerald-200">
                  ✓ Key created for "{justCreated.label}"
                </p>
                <div className="rounded bg-slate-950 border border-emerald-500/30 p-2 flex items-center gap-2">
                  <code className="text-emerald-200 text-xs flex-1 break-all">
                    {justCreated.plaintext}
                  </code>
                  <button
                    onClick={() => copy(justCreated.plaintext)}
                    className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-2 py-1 rounded shrink-0"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[10px] text-emerald-300/80">
                  Save this somewhere — it won't be shown again. Hit Copy
                  now, then close this banner.
                </p>
                <button
                  onClick={() => setJustCreated(null)}
                  className="text-[10px] uppercase tracking-wider text-emerald-300 underline"
                >
                  I've saved it — dismiss
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              {loading && keys.length === 0 && (
                <p className="text-xs text-slate-500 py-2">Loading…</p>
              )}
              {!loading && keys.length === 0 && (
                <p className="text-xs text-slate-500 py-2">
                  No keys yet. Generate one above when a client's dev team
                  asks for API access.
                </p>
              )}
              {keys.map((k) => (
                <div
                  key={k.id}
                  className={`rounded-lg border p-3 ${
                    k.revoked_at
                      ? "border-slate-800 bg-slate-950/40 opacity-60"
                      : "border-slate-700 bg-slate-950/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">
                        {k.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        <code className="text-violet-300">{k.key_prefix}…</code>{" "}
                        · created{" "}
                        {new Date(k.created_at).toLocaleDateString()}
                        {k.last_used_at && (
                          <>
                            {" "}
                            · last used{" "}
                            {new Date(k.last_used_at).toLocaleDateString()}
                          </>
                        )}
                        {k.revoked_at && (
                          <span className="ml-2 text-rose-300 font-bold uppercase tracking-wider text-[9px]">
                            Revoked
                          </span>
                        )}
                      </p>
                    </div>
                    {!k.revoked_at && (
                      <button
                        onClick={() => revoke(k.id)}
                        className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-rose-400 shrink-0"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <details className="text-xs">
              <summary className="cursor-pointer text-violet-300 hover:text-violet-200">
                How to use →
              </summary>
              <div className="mt-2 space-y-2 text-slate-300">
                <p>
                  Curl test (replace the token with one you generated above):
                </p>
                <pre className="rounded bg-slate-950 border border-slate-800 p-2 overflow-x-auto text-[11px] text-emerald-200">
{`curl -H 'Authorization: Bearer bj_live_…' \\
  'https://bluejayportfolio.com/api/v1/clients/${slug}/leads?since=2026-05-01'`}
                </pre>
                <p>
                  Zapier setup: create a new "Webhooks by Zapier" trigger,
                  choose "Retrieve Poll", paste the URL above, add the
                  Authorization header. Zapier dedupes on each lead&apos;s{" "}
                  <code className="text-violet-300">id</code> field.
                </p>
              </div>
            </details>
          </div>
        )}
      </div>
    </section>
  );
}
