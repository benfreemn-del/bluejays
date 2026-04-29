"use client";

import { useState } from "react";
import Link from "next/link";

type FormState = "idle" | "submitting" | "success" | "error";

export default function PartnerApplyForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      payoutHandle: String(fd.get("payoutHandle") || ""),
      promotionChannel: String(fd.get("promotionChannel") || ""),
      knowsBen: String(fd.get("knowsBen") || ""),
    };

    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setState("error");
        return;
      }
      setCode(data.code);
      setAlreadyExists(!!data.alreadyExists);
      setExistingStatus(data.status || null);
      setState("success");
    } catch {
      setError("Network error. Try again or email ben@bluejayportfolio.com.");
      setState("error");
    }
  }

  if (state === "success") {
    const link = `https://bluejayportfolio.com/audit?ref=${code}`;
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-7 h-7 text-emerald-300"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {alreadyExists
            ? existingStatus === "approved"
              ? "You're already approved!"
              : "Application already on file"
            : "Application received"}
        </h2>
        <p className="text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
          {alreadyExists && existingStatus === "approved"
            ? "Your link is below — start sharing and you'll get $200 for every close."
            : alreadyExists
              ? "Ben already has your application. He'll review it and email you within 24 hours."
              : "Ben will review your application personally and email you within 24 hours. Once approved, you can start sharing your link below."}
        </p>

        <div className="rounded-lg bg-slate-900/80 border border-white/10 p-4 mb-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Your partner link
          </p>
          <p className="font-mono text-amber-300 text-sm break-all">{link}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(link);
          }}
          className="inline-flex items-center justify-center rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors mr-3"
        >
          Copy link
        </button>
        <Link
          href={`/partners/${code}`}
          className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950 transition-colors"
        >
          View your dashboard →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        label="Your name"
        name="name"
        placeholder="Hector Ramirez"
        required
        autoFocus
      />
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
      />
      <Field
        label="Phone (optional)"
        name="phone"
        type="tel"
        placeholder="(555) 555-5555"
      />
      <Field
        label="Venmo or Zelle handle"
        name="payoutHandle"
        placeholder="venmo: @hector-r  /  zelle: hector@email.com"
        hint="Where should Ben send the $200? You can update later."
      />
      <Field
        label="Where will you promote BlueJays?"
        name="promotionChannel"
        placeholder="My landscaping customers, Facebook, my church group"
        hint="Honest answer helps Ben approve faster."
      />
      <Textarea
        label="How do you know Ben? (optional)"
        name="knowsBen"
        placeholder="We met at the Quilcene farmers market"
        rows={3}
      />

      {error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 text-base font-bold text-amber-950 shadow-lg transition-colors"
      >
        {state === "submitting" ? "Submitting…" : "Submit application →"}
      </button>
      <p className="text-xs text-center text-slate-500">
        By submitting you agree to BlueJays&apos; honest-promotion rules
        (no spam, no fake claims).
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoFocus,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      />
      {hint && <span className="block text-xs text-slate-500 mt-1.5">{hint}</span>}
    </label>
  );
}

function Textarea({
  label,
  name,
  placeholder,
  rows = 4,
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
      />
    </label>
  );
}
