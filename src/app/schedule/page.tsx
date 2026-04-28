"use client";

import { useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

const TIME_OPTIONS = [
  { value: "morning", label: "Morning (8am – 12pm Pacific)" },
  { value: "afternoon", label: "Afternoon (12pm – 5pm Pacific)" },
  { value: "evening", label: "Evening (5pm – 8pm Pacific)" },
  { value: "anytime", label: "Anytime — I'm flexible" },
];

export default function SchedulePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("anytime");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/schedule/audit-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          preferredTime,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setState("error");
        setErrorMsg(data.error || `Error ${res.status}`);
        return;
      }
      setState("success");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  if (state === "success") {
    return (
      <main className="min-h-screen bg-[#081424] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-emerald-400">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">You&apos;re on Ben&apos;s list.</h1>
          <p className="text-white/60 leading-relaxed">
            He&apos;ll reach out within a few hours — usually sooner. Check your phone.
          </p>
          <p className="text-white/40 text-sm mt-6">
            Questions in the meantime?{" "}
            <a href="mailto:bluejaycontactme@gmail.com" className="text-sky-400 hover:underline">
              bluejaycontactme@gmail.com
            </a>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#081424] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5">
            Free 15-Min Call
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            Let&apos;s talk through your audit.
          </h1>
          <p className="text-white/50 leading-relaxed">
            Leave your info below and Ben will call you. First 5 minutes he&apos;ll tell you
            exactly what he&apos;d fix first — no pitch, no pressure.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
        >
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Your name
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={state === "submitting"}
              className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Your email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={state === "submitting"}
              className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Your phone <span className="normal-case text-slate-500 font-normal">(optional — Ben will call or text you)</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={state === "submitting"}
              className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Best time to reach you
            </label>
            <select
              id="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              disabled={state === "submitting"}
              className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              {TIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {state === "error" && errorMsg && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={state === "submitting" || !name.trim() || !email.trim()}
            className="w-full rounded-md bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {state === "submitting" ? "Sending…" : "Request a call →"}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Ben replies within a few hours. No spam, ever.
          </p>
        </form>
      </div>
    </main>
  );
}
