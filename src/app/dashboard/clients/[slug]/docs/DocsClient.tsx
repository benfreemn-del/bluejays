"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { OnboardDoc } from "@/lib/onboard-docs";

type Credential = {
  id: string;
  title: string;
  category: string | null;
  username: string | null;
  password: string | null;
  password_present: boolean;
  login_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type SignedAck = {
  id: string;
  doc_key: string;
  signer_name: string;
  signer_email: string | null;
  signer_role: string | null;
  notes: string | null;
  signed_at: string;
  replies: Record<string, string>;
};

type Props = {
  slug: string;
  initialSignedAcks: SignedAck[];
  registeredDocs: OnboardDoc[];
};

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500/60 focus:ring-1 focus:ring-lime-500/30";

const labelCls =
  "block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1";

export default function DocsClient({
  slug,
  initialSignedAcks,
  registeredDocs,
}: Props) {
  const [creds, setCreds] = useState<Credential[]>([]);
  const [credsLoaded, setCredsLoaded] = useState(false);
  const [credsErr, setCredsErr] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  async function loadCreds() {
    try {
      const res = await fetch(`/api/clients/${slug}/credentials`, {
        cache: "no-store",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        credentials?: Credential[];
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setCredsErr(json.error || `Load failed (${res.status})`);
        setCredsLoaded(true);
        return;
      }
      setCreds(json.credentials ?? []);
      setCredsLoaded(true);
      setCredsErr(null);
    } catch (err) {
      setCredsErr(err instanceof Error ? err.message : "Load failed");
      setCredsLoaded(true);
    }
  }

  useEffect(() => {
    loadCreds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-2xl font-bold text-white">Docs</h1>
        <p className="text-sm text-slate-400 mt-1">
          Everything tied to this client — credentials, signed
          acknowledgments, and shareable onboarding docs.
        </p>
      </header>

      {/* ── Section 1: Credentials ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              🔑 Account credentials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Encrypted at rest. Admin-only.
            </p>
          </div>
          {!adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="h-9 px-4 rounded-full bg-lime-500 text-slate-950 font-bold text-xs hover:bg-lime-400 transition-colors"
            >
              + Add credential
            </button>
          )}
        </div>

        {adding && (
          <CredentialForm
            slug={slug}
            mode="create"
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false);
              void loadCreds();
            }}
          />
        )}

        {credsErr && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/[0.08] p-3 text-sm text-rose-200 mb-4">
            {credsErr}
          </div>
        )}

        {!credsLoaded ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : creds.length === 0 && !adding ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
            <p className="text-slate-300 font-medium">
              No credentials yet for this client.
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Add the domain registrar, hosting, email, ads accounts, and
              anything else you operate on their behalf.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {creds.map((c) =>
              editing === c.id ? (
                <li key={c.id}>
                  <CredentialForm
                    slug={slug}
                    mode="edit"
                    credential={c}
                    onCancel={() => setEditing(null)}
                    onSaved={() => {
                      setEditing(null);
                      void loadCreds();
                    }}
                  />
                </li>
              ) : (
                <CredentialRow
                  key={c.id}
                  credential={c}
                  onEdit={() => setEditing(c.id)}
                  onDelete={async () => {
                    if (
                      !confirm(
                        `Delete "${c.title}"? This can't be undone.`,
                      )
                    )
                      return;
                    await fetch(
                      `/api/clients/${slug}/credentials/${c.id}`,
                      { method: "DELETE" },
                    );
                    void loadCreds();
                  }}
                />
              ),
            )}
          </ul>
        )}
      </section>

      {/* ── Section 2: Registered onboarding docs ── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-1">
          📨 Shareable docs
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          PDFs registered for this client. Copy the sign URL to share.
          When a client submits, you get SMS + email.
        </p>
        {registeredDocs.length === 0 ? (
          <p className="text-sm text-slate-500">
            None registered yet. Add an entry to{" "}
            <code className="text-slate-300">src/lib/onboard-docs.ts</code>{" "}
            and the doc auto-wires.
          </p>
        ) : (
          <ul className="space-y-3">
            {registeredDocs.map((d) => (
              <RegisteredDocRow key={`${d.slug}-${d.doc}`} doc={d} />
            ))}
          </ul>
        )}
      </section>

      {/* ── Section 3: Signed acknowledgments ── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-1">
          ✅ Signed acknowledgments
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Most recent first. Up to 50.
        </p>
        {initialSignedAcks.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nobody has signed anything yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {initialSignedAcks.map((a) => (
              <SignedAckRow key={a.id} ack={a} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );

  // ───────────────────── inner components ─────────────────────

  function CredentialRow({
    credential,
    onEdit,
    onDelete,
  }: {
    credential: Credential;
    onEdit: () => void;
    onDelete: () => void;
  }) {
    const [revealed, setRevealed] = useState(false);
    return (
      <li className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white truncate">
                {credential.title}
              </h3>
              {credential.category && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {credential.category}
                </span>
              )}
            </div>
            {credential.login_url && (
              <a
                href={credential.login_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2 break-all"
              >
                {credential.login_url}
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-slate-300 hover:text-white underline underline-offset-2"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-xs text-rose-300 hover:text-rose-200 underline underline-offset-2"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {credential.username && (
            <FieldDisplay
              label="Username"
              value={credential.username}
              copyable
            />
          )}
          {credential.password_present && (
            <div>
              <p className={labelCls}>Password</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-white bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 truncate">
                  {revealed
                    ? credential.password ?? "(decrypt failed)"
                    : "••••••••••••"}
                </code>
                <button
                  type="button"
                  onClick={() => setRevealed((r) => !r)}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-2 whitespace-nowrap"
                >
                  {revealed ? "Hide" : "Show"}
                </button>
                {credential.password && (
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        credential.password ?? "",
                      );
                    }}
                    className="text-xs text-lime-400 hover:text-lime-300 underline underline-offset-2 whitespace-nowrap"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {credential.notes && (
          <p className="mt-3 text-xs text-slate-400 whitespace-pre-wrap">
            {credential.notes}
          </p>
        )}

        <p className="mt-2 text-[10px] text-slate-600">
          Updated {new Date(credential.updated_at).toLocaleString()}
        </p>
      </li>
    );
  }

  function FieldDisplay({
    label,
    value,
    copyable = false,
  }: {
    label: string;
    value: string;
    copyable?: boolean;
  }) {
    return (
      <div>
        <p className={labelCls}>{label}</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm font-mono text-white bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 truncate">
            {value}
          </code>
          {copyable && (
            <button
              type="button"
              onClick={() => void navigator.clipboard.writeText(value)}
              className="text-xs text-lime-400 hover:text-lime-300 underline underline-offset-2 whitespace-nowrap"
            >
              Copy
            </button>
          )}
        </div>
      </div>
    );
  }

  function RegisteredDocRow({ doc }: { doc: OnboardDoc }) {
    const [copied, setCopied] = useState(false);
    const signUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/sign/${doc.slug}/${doc.doc}`
        : `/sign/${doc.slug}/${doc.doc}`;
    return (
      <li className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="font-bold text-white">{doc.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{doc.brand}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-200 border border-sky-500/30">
            {doc.doc}
          </span>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <code className="flex-1 text-xs font-mono text-slate-300 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 truncate">
            {signUrl}
          </code>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(signUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-lime-500 text-slate-950 font-bold hover:bg-lime-400 transition-colors whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
            <a
              href={signUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full border border-slate-600 text-slate-200 hover:border-slate-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Open
            </a>
            <a
              href={doc.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full border border-slate-600 text-slate-200 hover:border-slate-400 hover:text-white transition-colors whitespace-nowrap"
            >
              PDF
            </a>
          </div>
        </div>
      </li>
    );
  }

  function SignedAckRow({ ack }: { ack: SignedAck }) {
    const replies = ack.replies ?? {};
    const hasReplies = Object.keys(replies).length > 0;
    return (
      <li className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-white">
              {ack.signer_name}
              {ack.signer_role && (
                <span className="text-slate-500 font-normal">
                  {" "}
                  · {ack.signer_role}
                </span>
              )}
            </h3>
            {ack.signer_email && (
              <p className="text-xs text-slate-500">{ack.signer_email}</p>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lime-500/15 text-lime-200 border border-lime-500/30">
            {ack.doc_key}
          </span>
        </div>
        {(hasReplies || ack.notes) && (
          <div className="mt-3 space-y-1 text-xs text-slate-300">
            {Object.entries(replies).map(([k, v]) => (
              <p key={k}>
                <span className="text-slate-500">{k}:</span>{" "}
                <span className="text-slate-100">{v}</span>
              </p>
            ))}
            {ack.notes && (
              <p className="pt-1 border-t border-slate-800 mt-2 whitespace-pre-wrap">
                {ack.notes}
              </p>
            )}
          </div>
        )}
        <p className="mt-2 text-[10px] text-slate-600">
          Signed {new Date(ack.signed_at).toLocaleString()}
        </p>
      </li>
    );
  }
}

// ───────────────────── credential add/edit form ─────────────────────
type FormMode = "create" | "edit";

type CredFormProps = {
  slug: string;
  mode: FormMode;
  credential?: Credential;
  onCancel: () => void;
  onSaved: () => void;
};

function CredentialForm({
  slug,
  mode,
  credential,
  onCancel,
  onSaved,
}: CredFormProps) {
  const [title, setTitle] = useState(credential?.title ?? "");
  const [category, setCategory] = useState(credential?.category ?? "");
  const [username, setUsername] = useState(credential?.username ?? "");
  const [password, setPassword] = useState("");
  const [clearPw, setClearPw] = useState(false);
  const [loginUrl, setLoginUrl] = useState(credential?.login_url ?? "");
  const [notes, setNotes] = useState(credential?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setErr("Title is required");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const body: Record<string, string> = {
        title: title.trim(),
        category: category.trim(),
        username: username.trim(),
        login_url: loginUrl.trim(),
        notes: notes.trim(),
      };
      // Only include password if user typed one OR explicitly cleared it.
      // Omitted = leave existing encrypted value alone (edit only).
      if (mode === "create") {
        body.password = password;
      } else if (password) {
        body.password = password;
      } else if (clearPw) {
        body.password = "";
      }
      const url =
        mode === "create"
          ? `/api/clients/${slug}/credentials`
          : `/api/clients/${slug}/credentials/${credential!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error || `Save failed (${res.status})`);
        return;
      }
      onSaved();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-lime-500/30 bg-slate-900/60 p-5 space-y-4 mb-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Namecheap (tekky.org)"
          />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
            placeholder="domain · hosting · email · ads · social"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Username / email</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
            placeholder="ben@bluejayportfolio.com"
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelCls}>
            Password{" "}
            {mode === "edit" && (
              <span className="text-slate-500 font-normal normal-case tracking-normal">
                (leave blank to keep existing)
              </span>
            )}
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls + " font-mono"}
            autoComplete="off"
          />
        </div>
      </div>

      {mode === "edit" && credential?.password_present && !password && (
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={clearPw}
            onChange={(e) => setClearPw(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-950 text-rose-500"
          />
          Clear the existing password
        </label>
      )}

      <div>
        <label className={labelCls}>Login URL</label>
        <input
          type="url"
          value={loginUrl}
          onChange={(e) => setLoginUrl(e.target.value)}
          className={inputCls}
          placeholder="https://www.namecheap.com/myaccount/login/"
        />
      </div>

      <div>
        <label className={labelCls}>Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputCls + " resize-y"}
          placeholder="Security questions, MFA backup codes, recovery email…"
        />
      </div>

      {err && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/[0.08] p-2.5 text-xs text-rose-200">
          {err}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-10 px-5 rounded-full bg-lime-500 text-slate-950 font-bold text-xs hover:bg-lime-400 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : mode === "create" ? "Save credential" : "Update"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white underline underline-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
