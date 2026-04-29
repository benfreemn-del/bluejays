"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin top-of-page tools for /dashboard/partners:
 *   1. "Enter workspace as Ben" — one-click bypass into /partners/work
 *      with a session cookie minted server-side.
 *   2. "Add a partner" — admin-create form (name + email + optional
 *      phone/payout). Skips the public /partners/apply flow. Auto-
 *      approved. Returns the generated code + login URL Ben can
 *      copy/text/email to the new partner.
 */
export default function PartnerAdminTopPanel() {
  const router = useRouter();

  const [enterBusy, setEnterBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdInfo, setCreatedInfo] = useState<{
    code: string;
    name: string;
    email: string;
    alreadyExists?: boolean;
  } | null>(null);

  async function enterAsBen() {
    if (enterBusy) return;
    setEnterBusy(true);
    try {
      const res = await fetch("/api/partners/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enter_as_ben" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Couldn't enter workspace.");
        setEnterBusy(false);
        return;
      }
      window.location.href = data.redirectTo || "/partners/work";
    } catch {
      alert("Network error.");
      setEnterBusy(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (createBusy) return;
    setCreateBusy(true);
    setCreateError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      action: "create",
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      payoutHandle: String(fd.get("payoutHandle") || ""),
    };

    try {
      const res = await fetch("/api/partners/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Couldn't create partner.");
        setCreateBusy(false);
        return;
      }
      setCreatedInfo({
        code: data.code,
        name: payload.name,
        email: payload.email,
        alreadyExists: !!data.alreadyExists,
      });
      router.refresh();
    } catch {
      setCreateError("Network error.");
    } finally {
      setCreateBusy(false);
    }
  }

  function resetCreate() {
    setCreatedInfo(null);
    setCreateError(null);
    setShowCreate(false);
  }

  return (
    <div className="border-b border-white/5 bg-slate-950/40">
      <div className="mx-auto max-w-6xl px-6 py-6 space-y-4">
        {/* Action row — Enter as Ben + Add a partner toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-400">
            <span className="font-semibold text-white">Admin tools</span>
            <span className="hidden sm:inline">
              {" "}— jump into the workspace yourself or onboard a new partner
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={enterAsBen}
              disabled={enterBusy}
              className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 px-4 py-2 text-sm font-bold text-emerald-950 shadow-md shadow-emerald-500/20 transition-colors"
            >
              {enterBusy ? "Entering…" : "→ Enter workspace as Ben"}
            </button>
            <button
              onClick={() => {
                setShowCreate((s) => !s);
                setCreatedInfo(null);
                setCreateError(null);
              }}
              className="rounded-md bg-amber-500 hover:bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950 shadow-md shadow-amber-500/20 transition-colors"
            >
              {showCreate ? "Cancel" : "+ Add a partner"}
            </button>
          </div>
        </div>

        {/* Create-partner form */}
        {showCreate && !createdInfo && (
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3"
          >
            <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2">
              New partner — auto-approved, gets workspace access immediately
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field
                label="Partner name"
                name="name"
                placeholder="Sarah Freeman"
                required
                autoFocus
              />
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="sarah@example.com"
                required
              />
              <Field
                label="Phone (optional)"
                name="phone"
                type="tel"
                placeholder="(555) 555-5555"
              />
              <Field
                label="Venmo / Zelle handle (optional)"
                name="payoutHandle"
                placeholder="venmo: @sarah-f"
              />
            </div>
            {createError && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {createError}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={createBusy}
                className="rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-4 py-2 text-sm font-bold text-amber-950 transition-colors"
              >
                {createBusy ? "Creating…" : "Create + auto-approve"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-xs text-slate-400 hover:text-white px-3"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Success card with copy-able onboarding link */}
        {createdInfo && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5">
            <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-2">
              {createdInfo.alreadyExists
                ? "✓ Partner already on file"
                : "✓ Partner created + approved"}
            </p>
            <p className="text-sm text-slate-200 mb-4">
              <span className="font-semibold text-white">{createdInfo.name}</span>
              {" — "}
              <span className="text-slate-400">{createdInfo.email}</span>
            </p>

            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Send them this onboarding message
            </p>
            <CopyBlock
              text={`Hey! Ben here. You're set up as a BlueJays partner. Log in here to start: https://bluejayportfolio.com/partners/login\n\nYour login:\nEmail: ${createdInfo.email}\nCode: ${createdInfo.code}\n\nQuestions: ben@bluejayportfolio.com`}
            />

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <a
                href={`/partners/${createdInfo.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-white/10 hover:border-white/30 px-3 py-1.5 text-slate-300 hover:text-white transition-colors"
              >
                View their dashboard →
              </a>
              <button
                onClick={resetCreate}
                className="rounded-md bg-amber-500 hover:bg-amber-400 px-3 py-1.5 font-bold text-amber-950 transition-colors"
              >
                Add another
              </button>
              <button
                onClick={() => setCreatedInfo(null)}
                className="text-slate-500 hover:text-slate-300 px-3"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoFocus,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      />
    </label>
  );
}

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-md border border-white/10 bg-slate-950 p-3">
      <pre className="text-xs text-slate-200 whitespace-pre-wrap break-words font-mono pr-20">
        {text}
      </pre>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
        className="absolute top-2 right-2 rounded-md bg-amber-500 hover:bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 transition-colors"
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}
