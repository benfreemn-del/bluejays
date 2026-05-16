"use client";

import { useState } from "react";
import { trackMetaEvent } from "@/components/RetargetingPixels";

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

/**
 * Fire a fork-click telemetry event to /api/audit/[id]/cta-click.
 * Uses navigator.sendBeacon() so the request lands even when the
 * caller is about to navigate away (Buy → Stripe, Schedule → /schedule).
 * Falls back to a fire-and-forget fetch when sendBeacon isn't available.
 */
function logForkClick(auditId: string, fork: "buy" | "schedule" | "preview" | "fullsystem") {
  if (typeof window === "undefined") return;
  const url = `/api/audit/${auditId}/cta-click`;
  const payload = JSON.stringify({ fork });
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    // sendBeacon failed for some reason — fall through to fetch
  }
  // Fallback: keepalive fetch so the browser can still complete it
  // during navigation. Not as guaranteed as sendBeacon but good enough.
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

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
    // Log the fork click BEFORE the request-preview POST so even if the
    // POST fails we still capture the intent signal.
    logForkClick(auditId, "preview");
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
          message: data.error || "Something went wrong. Email ben@bluejayportfolio.com.",
        });
        return;
      }
      setRequest({
        status: "success",
        message: data.message || "Got it — you're on the list. Ben builds these personally and will have yours ready within 48 hours. Watch your email.",
        already: !!data.already,
      });

      // Retargeting: fire `Lead` only on the FIRST request (data.already
      // means we already fired it on the first click — don't double-count).
      if (!data.already) {
        trackMetaEvent("Lead", {
          content_name: "audit_preview_request",
          content_category: "deeper_intent",
        });
        const w = window as unknown as { gtag?: (...args: unknown[]) => void };
        if (typeof w.gtag === "function") {
          try {
            w.gtag("event", "audit_preview_lead", {
              event_category: "lead_magnet",
              event_label: "preview_requested",
            });
          } catch {
            // Never let analytics break user flow
          }
        }
      }
    } catch {
      setRequest({
        status: "error",
        message: "Couldn't reach the server. Try again in a moment.",
      });
    }
  }

  return (
    <section
      id="pick-your-move"
      // scroll-mt-16 / sm:scroll-mt-20 sets the scroll offset so that
      // when AuditFaqVideos (or any other in-page link) navigates to
      // #pick-your-move, the section header lands BELOW any sticky
      // top-bar instead of getting tucked under it. Matters most on
      // mobile where viewport is small and the section H2 ends up
      // partly hidden without the offset. Fixed 2026-05-16 functionality
      // review.
      className="bg-gradient-to-b from-slate-900 to-slate-950 scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pick your move.</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Most owners see this list and do nothing for 6 months. They lose tens of thousands.
            Don&apos;t be most owners.
          </p>
        </div>

        {/* ── FULL SYSTEM — featured anchor card (sets the $10K price in their
            head BEFORE they see the $997, making the website look like a
            bargain). Hormozi: "make the thing you want to sell look cheap
            by anchoring it next to something genuinely more valuable." ── */}
        <a
          href={`/schedule/${prospectId}?type=fullsystem&source=audit`}
          onClick={() => logForkClick(auditId, "fullsystem")}
          className="group relative flex flex-col md:flex-row md:items-center gap-5 rounded-2xl border-2 border-violet-500/50 bg-gradient-to-br from-violet-950/60 via-slate-900 to-indigo-950/60 p-6 md:p-7 mb-5 hover:border-violet-400 transition-all hover:scale-[1.01] shadow-[0_0_40px_rgba(139,92,246,0.2)] overflow-hidden"
        >
          {/* background glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.12),transparent_70%)]" />

          <span className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-violet-500 text-white text-[10px] font-bold uppercase tracking-wider shadow">
            Highest ROI
          </span>

          {/* left: icon + headline */}
          <div className="flex-shrink-0 text-center md:text-left">
            <div className="text-5xl mb-2">🚀</div>
            <h3 className="text-xl font-bold text-white">The Full System</h3>
            <p className="text-violet-300 font-semibold text-sm mt-0.5">A robot that books your jobs for you</p>
          </div>

          {/* center: what&apos;s included */}
          <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300">
            {[
              "Custom website (included)",
              "Google Ads that learn what works",
              "Facebook + Instagram ads that learn",
              "Auto emails, texts, voicemails",
              "SEO that grows your Google rank",
              "A free gift that catches new leads",
              "New logo if you need one",
              "A simple report every month",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-violet-400 flex-shrink-0">✓</span> {item}
              </span>
            ))}
          </div>

          {/* right: price + CTA */}
          <div className="flex-shrink-0 text-center md:text-right">
            <p className="text-2xl font-bold text-white">$10,000</p>
            <p className="text-xs text-emerald-400 mb-0.5">save $300 paying in full</p>
            <p className="text-xs text-slate-400 mb-0.5">or split 3 payments of $3,500 / $3,500 / $3,000</p>
            <p className="text-xs text-violet-300 mb-4">+ $500–1,000/mo ongoing</p>
            {/* agency comparison — Hormozi: cut the middleman, show the savings */}
            <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
              Agencies charge $3–8K/mo for this.<br/>
              You pay once + a fraction monthly.<br/>
              Saves you $25,000+ in year one alone.
            </p>
            {/* Real scarcity: BlueJays caps backend builds at 10/month —
                Ben's actual capacity, not marketing copy. Mirror of the
                same close used in the appointment-setter script. */}
            <p className="text-[10px] text-amber-300/90 mb-3 leading-relaxed font-semibold">
              Only 10 backend builds per month —<br/>
              we cap to keep quality.
            </p>
            <span className="inline-flex items-center justify-center w-full rounded-md bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white group-hover:opacity-90 transition-colors">
              Book a discovery call →
            </span>
            <p className="text-[10px] text-slate-500 mt-2">Free call · Ben handles this personally</p>
          </div>
        </a>

        {/* Funnel preview · "see it before you pay" for the AI Package
            tier. Mirrors the website's free-preview magic for the
            $10,000 product so prospects can experience the offering
            before committing. Added 2026-05-07 per Ben — single
            biggest pre-purchase trust unlock for the high-ticket tier. */}
        <a
          href={`/audit/${auditId}/funnel-preview`}
          className="block mb-4 rounded-lg border border-violet-500/30 bg-violet-950/15 px-5 py-3 hover:border-violet-400/60 hover:bg-violet-950/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">👀</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-violet-100 leading-tight">
                See your AI funnel before you pay
              </p>
              <p className="text-[11px] text-violet-300/80 leading-tight mt-0.5">
                3 audience tracks customized to your business · sample
                emails, SMS, ad headlines · 60-second look
              </p>
            </div>
            <span className="text-violet-300 text-sm">→</span>
          </div>
        </a>

        {/* divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 border-t border-white/5" />
          <p className="text-xs text-slate-500 flex-shrink-0">Or just start with the website</p>
          <div className="flex-1 border-t border-white/5" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4 md:gap-5">
          {/* 1. BUY — primary commitment */}
          <a
            href={primaryButtonUrl}
            onClick={() => logForkClick(auditId, "buy")}
            className="group relative flex flex-col items-center text-center rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-sky-500/10 p-6 hover:border-emerald-400 hover:bg-emerald-500/15 transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          >
            <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-wider shadow">
              Pays for itself week 1
            </span>
            <div className="text-4xl mb-3">🛠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Fix it now</h3>
            <p className="text-2xl font-bold text-emerald-300 mb-1">3 × $349</p>
            <p className="text-xs text-slate-400 mb-4">Or $997 once</p>
            <p className="text-xs text-slate-500 mt-auto">100% money-back · Live in 2 days flat</p>
            <span className="mt-4 inline-flex items-center justify-center w-full rounded-md bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white group-hover:opacity-90">
              Start now →
            </span>
          </a>

          {/* 2. SCHEDULE A CALL — middle commitment */}
          <a
            href={`/schedule/${prospectId}?source=audit`}
            onClick={() => logForkClick(auditId, "schedule")}
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

          {/* 3. BUILD ME MY SITE — slow-yes / lead capture */}
          <button
            onClick={handleRequestPreview}
            disabled={request.status === "loading" || request.status === "success"}
            className="group flex flex-col items-center text-center rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 hover:border-amber-400 hover:bg-amber-500/10 transition-all hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-default text-left"
          >
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-lg font-bold text-white mb-2">Build me a preview</h3>
            <p className="text-2xl font-bold text-amber-300 mb-1">Free preview</p>
            <p className="text-xs text-slate-400 mb-4">Your actual site, live in 48 hours</p>
            <p className="text-xs text-slate-500 mt-auto">No purchase · Your real content + photos</p>
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

        <div className="mt-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> 100% money-back · reply &quot;refund&quot; to any email
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> Live in 2 days flat
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> Website is one-time · no retainer
          </span>
        </div>

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
