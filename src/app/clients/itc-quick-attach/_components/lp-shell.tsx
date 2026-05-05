"use client";

/**
 * Shared shell for ITC Quick Attach lead-magnet landing pages. Black/amber
 * theme with a subtle brushed-steel gradient — matches itcquickattach.com's
 * "tractor accessory" feel without copying their actual design.
 *
 * Each LP imports <ItcLpShell> + drops in segment-specific copy + a
 * <LpCaptureForm audience="tym" intent="..." />. The form posts to the
 * existing /api/clients/inquire endpoint with slug=itc-quick-attach + an
 * `lp` field that detectAudience() routes to the right ClientLeadAudience.
 */

import Link from "next/link";
import { useState } from "react";

export function ItcLpShell({
  children,
  navTitle,
}: {
  children: React.ReactNode;
  navTitle: string;
}) {
  return (
    <div className="min-h-screen bg-[#0a0905] text-amber-50">
      {/* Top nav */}
      <header className="sticky top-0 z-20 backdrop-blur bg-[#0a0905]/85 border-b border-amber-900/40">
        <div className="mx-auto max-w-4xl px-5 py-3 flex items-center gap-3">
          <Link
            href="/clients/itc-quick-attach"
            className="font-black tracking-tight text-amber-300 hover:text-amber-200"
          >
            ITC<span className="text-amber-50/60 font-normal ml-1">Quick Attach</span>
          </Link>
          <span className="text-amber-50/30">·</span>
          <span className="text-[12px] uppercase tracking-[0.18em] text-amber-50/50">
            {navTitle}
          </span>
          <div className="flex-1" />
          <a
            href="https://itcquickattach.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-[0.2em] text-amber-50/40 hover:text-amber-50/80"
          >
            Shop →
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 pb-24">{children}</main>

      <footer className="mx-auto max-w-4xl px-5 py-8 border-t border-amber-900/40 text-[11px] text-amber-50/40 uppercase tracking-[0.18em]">
        <div className="flex flex-wrap gap-4 items-center">
          <span>Innovative Tractor Components · Blossvale, NY</span>
          <span className="text-amber-50/20">·</span>
          <span>American-made, in-house</span>
          <div className="flex-1" />
          <Link
            href="/clients/itc-quick-attach/login"
            className="hover:text-amber-200"
          >
            Owner login
          </Link>
        </div>
      </footer>
    </div>
  );
}

/**
 * Capture form. Posts to /api/clients/inquire with the right `lp` field so
 * the audience-segmenter routes correctly. Renders an inline thank-you on
 * success — no full-page nav so the prospect never leaves the LP they just
 * read.
 */
export function LpCaptureForm({
  audience,
  intent,
  submitLabel,
  extraFields,
}: {
  /** ITC segment label — passes through `lp` field for detectAudience */
  audience:
    | "tym"
    | "hobbyist"
    | "forester"
    | "hunter"
    | "dealer"
    | "community";
  /** Default intent recorded with the lead (e.g. "first-year setup checklist") */
  intent: string;
  submitLabel: string;
  /** Optional extra inputs (tractor model, monthly deliveries, etc.) */
  extraFields?: Array<{
    name: string;
    label: string;
    type?: "text" | "tel" | "number";
    placeholder?: string;
    required?: boolean;
  }>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: "itc-quick-attach",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          lp: audience,
          intent,
          source: `lp-${audience}`,
          ...extras,
        }),
      });
      const j = (await r.json()) as { ok: boolean; error?: string };
      if (!j.ok) {
        setError(j.error || "Something went wrong — try again.");
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-6">
        <h3 className="text-xl font-black text-emerald-300 mb-1">
          ✅ You&rsquo;re in.
        </h3>
        <p className="text-sm text-amber-50/70">
          We just routed your info to ITC. A confirmation email is on the way.
          If you don&rsquo;t see it in 5 min, check spam or email{" "}
          <a
            href="mailto:jake@itcquickattach.com"
            className="text-amber-300 underline"
          >
            jake@itcquickattach.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl border border-amber-900/40 bg-amber-950/[0.15] p-5"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-amber-50/50 block mb-1">
            Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-black/40 border border-amber-900/40 rounded-md px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
            placeholder="Jake McCall"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-amber-50/50 block mb-1">
            Email *
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            className="w-full bg-black/40 border border-amber-900/40 rounded-md px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] text-amber-50/50 block mb-1">
          Phone (optional)
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          className="w-full bg-black/40 border border-amber-900/40 rounded-md px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
          placeholder="315-555-1234"
        />
      </div>
      {extraFields?.map((f) => (
        <div key={f.name}>
          <label className="text-[10px] uppercase tracking-[0.2em] text-amber-50/50 block mb-1">
            {f.label}
            {f.required ? " *" : ""}
          </label>
          <input
            value={extras[f.name] ?? ""}
            onChange={(e) =>
              setExtras((prev) => ({ ...prev, [f.name]: e.target.value }))
            }
            type={f.type ?? "text"}
            placeholder={f.placeholder}
            required={f.required}
            className="w-full bg-black/40 border border-amber-900/40 rounded-md px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
          />
        </div>
      ))}
      {error && <p className="text-rose-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-tight py-3 rounded-md transition disabled:opacity-50"
      >
        {busy ? "Sending…" : submitLabel}
      </button>
      <p className="text-[10px] text-amber-50/30 text-center">
        We&rsquo;ll never spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
