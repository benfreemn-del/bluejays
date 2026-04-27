"use client";

import { useState } from "react";

/**
 * 3-CTA hub at the bottom of the audit page. Replaces the v6
 * single-CTA "You know the problems. Now fix them." section.
 *
 * Three forks ascending in commitment but each captures the prospect:
 *  1. BUY ($997 / 3×$349) — immediate close
 *  2. SCHEDULE A CALL (15 min) — warm them up by phone
 *  3. GET MY FREE PREVIEW — slow-yes; we build a custom preview, retarget
 *
 * Hormozi: "stack the slip" — the prospect picks their own yes.
 *
 * Per Q2A the preview path takes zero additional input — the prospect
 * already gave us email + URL + category at audit submission. One click,
 * we mark them as preview-requested and SMS Ben.
 */

type Props = {
  auditId: string;
  prospectId: string;
  primaryButtonUrl: string;   // 3 × $349 buy link
  secondaryButtonUrl: string; // $997 once buy link
};

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string; already: boolean }
  | { status: "error"; message: string };

export default function AuditCTAHub({
  auditId,
  prospectId,
  primaryButtonUrl,
  secondaryButtonUrl,
}: Props) {
  const [request, setRequest] = useState<RequestState>({ status: "idle" });

  async function handleRequestPreview() {
    if (request.status === "loading" || request.status === "success") return;
    setRequest({ status: "loading" });
    try {
      const res = await fetch(`/api/audit/${auditId}/request-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data: { ok?: boolean; already?: boolean; message?: string; error?: string } =
        await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setRequest({
          status: "error",
          message: data.error || "Something went wrong. Email bluejaycontactme@gmail.com.",
        });
        return;
      }
      setRequest({
        status: "success",
        message: data.message || "Got it. Ben will build your preview within 48 hours.",
        already: !!data.already,
      });
    } catch {
      setRequest({
        status: "error",
        message: "Couldn't reach the server. Try again in a moment.",
      });
    }
  }

  return (
    <section className="bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pick your move.</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Most owners see this list and do nothing for 6 months. They lose tens of thousands.
            Don&apos;t be most owners.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 md:gap-5">
          {/* 1. BUY — primary commitment */}
          <a
            href={primaryButtonUrl}
            className="group relative flex flex-col items-center text-center rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-sky-500/10 p-6 hover:border-emerald-400 hover:bg-emerald-500/15 transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          >
            <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-wider shadow">
              Most Popular
            </span>
            <div className="text-4xl mb-3">🛠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Fix it now</h3>
            <p className="text-2xl font-bold text-emerald-300 mb-1">3 × $349</p>
            <p className="text-xs text-slate-400 mb-4">Or $997 once</p>
            <p className="text-xs text-slate-500 mt-auto">100% money-back · 48-hr build</p>
            <span className="mt-4 inline-flex items-center justify-center w-full rounded-md bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white group-hover:opacity-90">
              Start now →
            </span>
          </a>

          {/* 2. SCHEDULE A CALL — middle commitment */}
          <a
            href={`/schedule/${prospectId}?source=audit`}
            className="group flex flex-col items-center text-center rounded-2xl border border-sky-500/30 bg-sky-500/5 p-6 hover:border-sky-400 hover:bg-sky-500/10 transition-all hover:scale-[1.02]"
          >
            <div className="text-4xl mb-3">📞</div>
            <h3 className="text-lg font-bold text-white mb-2">Schedule a call</h3>
            <p className="text-2xl font-bold text-sky-300 mb-1">15 minutes</p>
            <p className="text-xs text-slate-400 mb-4">Get your questions answered</p>
            <p className="text-xs text-slate-500 mt-auto">No pressure · Ben answers personally</p>
            <span className="mt-4 inline-flex items-center justify-center w-full rounded-md border border-sky-500/40 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-300 group-hover:bg-sky-500/20">
              Book a time →
            </span>
          </a>

          {/* 3. GET MY PREVIEW — slow-yes / lead capture */}
          <button
            onClick={handleRequestPreview}
            disabled={request.status === "loading" || request.status === "success"}
            className="group flex flex-col items-center text-center rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 hover:border-amber-400 hover:bg-amber-500/10 transition-all hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-default text-left"
          >
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-lg font-bold text-white mb-2">Get my preview</h3>
            <p className="text-2xl font-bold text-amber-300 mb-1">Free</p>
            <p className="text-xs text-slate-400 mb-4">We&apos;ll build it in 48 hours</p>
            <p className="text-xs text-slate-500 mt-auto">No purchase · See your real site live</p>
            <span
              className={`mt-4 inline-flex items-center justify-center w-full rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
                request.status === "success"
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                  : request.status === "error"
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-200"
                    : request.status === "loading"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-300/70"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-300 group-hover:bg-amber-500/20"
              }`}
            >
              {request.status === "loading" && "Sending…"}
              {request.status === "success" && (request.already ? "Already on the list ✓" : "Got it ✓")}
              {request.status === "error" && "Try again"}
              {request.status === "idle" && "Build mine →"}
            </span>
          </button>
        </div>

        {/* Status message under the cards */}
        {(request.status === "success" || request.status === "error") && (
          <p
            className={`mt-6 text-center text-sm ${
              request.status === "success" ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {request.status === "success" ? "🎉 " : "⚠️ "}
            {request.message}
          </p>
        )}

        {/* Trust strip — always visible regardless of which fork they pick */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> 100% money-back guarantee
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> 48-hour delivery
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> No retainers, no monthly fees
          </span>
        </div>

        {/* Secondary buy link — keeps the $997-once option discoverable
            without crowding the primary 3-card hub. */}
        <div className="mt-8 text-center">
          <a
            href={secondaryButtonUrl}
            className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4 transition-colors"
          >
            Prefer to pay $997 once? Click here.
          </a>
        </div>
      </div>
    </section>
  );
}
