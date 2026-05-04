"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Envelope } from "@phosphor-icons/react/dist/ssr";

/**
 * EmailCapture — minimal "name + email + intent" inline form for the
 * Zenith Sports player-challenge / training-guide / camp-finder
 * funnels.
 *
 * Per the brand voice guide PRIORITY 3 ("Email capture at every
 * section exit") and the related Pre-Launch checklist item — *no
 * visitor leaves with nothing*. Returning visitors convert at 4.5–6%
 * vs. 1–2% for first-timers, so the value of capturing the email is
 * the actual ROI engine for the 5%+ conversion target.
 *
 * Posts to the existing /api/clients/inquire endpoint with:
 *   { slug: "zenith-sports", name, email, intent }
 *
 * "intent" is the form's purpose ("Player Challenge", "Training
 * Guide download", "Camp finder", etc.) — surfaces in Ben's alert
 * email so he can tell at a glance which funnel the lead came from.
 */

type Variant = "lime" | "navy" | "white";

type Props = {
  intent: string;
  /** Headline above the form (eg. "Submit your touches"). */
  headline: string;
  /** Supporting copy under the headline. */
  body?: string;
  /** Button label after success. */
  successHeadline?: string;
  /** Body copy after success. */
  successBody?: string;
  /** Button label. */
  cta?: string;
  /** Visual treatment so the form sits right in different sections. */
  variant?: Variant;
  /** Optional badge above the headline (eg. "FREE PDF"). */
  badge?: string;
  /** If set, success state surfaces a CTA button to this URL (e.g. instant
      delivery of the Training Guide page rather than waiting for an email). */
  successCta?: { label: string; href: string };
};

const VARIANT_STYLES: Record<
  Variant,
  {
    bg: string;
    border: string;
    headline: string;
    body: string;
    inputBg: string;
    inputText: string;
    inputBorder: string;
    inputPlaceholder: string;
    btnBg: string;
    btnText: string;
    btnHover: string;
    badgeBg: string;
    badgeText: string;
    successText: string;
    successBody: string;
    successAccent: string;
  }
> = {
  lime: {
    bg: "bg-[#0a1832]",
    border: "border-white/10",
    headline: "text-white",
    body: "text-white/65",
    inputBg: "bg-white/[0.06]",
    inputText: "text-white",
    inputBorder: "border-white/15",
    inputPlaceholder: "placeholder:text-white/35",
    btnBg: "bg-[#a3e635]",
    btnText: "text-[#0a1832]",
    btnHover: "hover:bg-white",
    badgeBg: "bg-[#a3e635]/15 border border-[#a3e635]/40",
    badgeText: "text-[#a3e635]",
    successText: "text-white",
    successBody: "text-white/70",
    successAccent: "text-[#a3e635]",
  },
  navy: {
    bg: "bg-white",
    border: "border-slate-200",
    headline: "text-[#0a1832]",
    body: "text-slate-600",
    inputBg: "bg-white",
    inputText: "text-[#0a1832]",
    inputBorder: "border-slate-300",
    inputPlaceholder: "placeholder:text-slate-400",
    btnBg: "bg-[#0a1832]",
    btnText: "text-white",
    btnHover: "hover:bg-[#1d4ed8]",
    badgeBg: "bg-[#1d4ed8]/10 border border-[#1d4ed8]/25",
    badgeText: "text-[#1d4ed8]",
    successText: "text-[#0a1832]",
    successBody: "text-slate-600",
    successAccent: "text-[#1d4ed8]",
  },
  white: {
    bg: "bg-[#f5f3ee]",
    border: "border-slate-200",
    headline: "text-[#0a1832]",
    body: "text-slate-600",
    inputBg: "bg-white",
    inputText: "text-[#0a1832]",
    inputBorder: "border-slate-300",
    inputPlaceholder: "placeholder:text-slate-400",
    btnBg: "bg-[#a3e635]",
    btnText: "text-[#0a1832]",
    btnHover: "hover:bg-[#0a1832] hover:text-white",
    badgeBg: "bg-[#a3e635]/20 border border-[#a3e635]/40",
    badgeText: "text-[#0a1832]",
    successText: "text-[#0a1832]",
    successBody: "text-slate-600",
    successAccent: "text-[#1d4ed8]",
  },
};

export default function EmailCapture({
  intent,
  headline,
  body,
  successHeadline = "You're in.",
  successBody = "We'll be in touch shortly with the details.",
  cta = "Send it to me",
  variant = "lime",
  badge,
  successCta,
}: Props) {
  const s = VARIANT_STYLES[variant];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === "submitting") return;
    if (!name.trim() || !email.trim()) {
      setStatus({ kind: "error", message: "Name and email are required." });
      return;
    }
    setStatus({ kind: "submitting" });
    try {
      const r = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: "zenith-sports",
          name: name.trim(),
          email: email.trim(),
          intent,
          source: "email-capture",
        }),
      });
      const data = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!r.ok || !data.ok) {
        setStatus({
          kind: "error",
          message: data.error || "Something went wrong. Try again?",
        });
        return;
      }
      setStatus({ kind: "ok" });
    } catch {
      setStatus({
        kind: "error",
        message: "Network blip. Mind giving it another try?",
      });
    }
  };

  if (status.kind === "ok") {
    return (
      <div
        className={`rounded-2xl border ${s.bg} ${s.border} p-6 sm:p-8 text-center`}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15 mb-4">
          <CheckCircle size={24} weight="fill" className={s.successAccent} />
        </div>
        <h3 className={`text-2xl font-black tracking-tight ${s.successText}`}>
          {successHeadline}
        </h3>
        <p className={`mt-2 text-sm leading-relaxed ${s.successBody}`}>
          {successBody}
        </p>
        {successCta && (
          <a
            href={successCta.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-md text-[12px] font-extrabold tracking-[0.18em] uppercase ${s.btnBg} ${s.btnText} ${s.btnHover} transition`}
          >
            {successCta.label}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${s.bg} ${s.border} p-6 sm:p-8`}>
      {badge && (
        <div
          className={`inline-flex items-center gap-1.5 ${s.badgeBg} ${s.badgeText} px-2.5 py-1 text-[10px] tracking-[0.22em] uppercase font-extrabold rounded-full mb-4`}
        >
          <Envelope size={11} weight="bold" />
          {badge}
        </div>
      )}
      <h3
        className={`text-2xl sm:text-3xl font-black tracking-tight ${s.headline}`}
      >
        {headline}
      </h3>
      {body && (
        <p className={`mt-3 text-[14px] leading-relaxed ${s.body}`}>{body}</p>
      )}

      <form
        onSubmit={onSubmit}
        // Stack on mobile + tablet; only go inline at lg (1024px+).
        // The CTA "SEND ME THE GUIDE" + arrow needs ~210px, which
        // doesn't leave enough room for both inputs in the rounded
        // card at <1024px widths — caused the button to overflow the
        // card edge. At lg+, the card is wide enough for the 3-col grid.
        className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_auto]"
      >
        <input
          type="text"
          name="name"
          autoComplete="name"
          required
          placeholder="First name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`px-4 py-3 rounded-md text-[14px] outline-none border ${s.inputBg} ${s.inputText} ${s.inputBorder} ${s.inputPlaceholder} focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/30 transition`}
        />
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`px-4 py-3 rounded-md text-[14px] outline-none border ${s.inputBg} ${s.inputText} ${s.inputBorder} ${s.inputPlaceholder} focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/30 transition`}
        />
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          // whitespace-nowrap prevents the CTA + arrow from wrapping
          // when the button column is narrow. Tightened tracking from
          // 0.18em → 0.1em for the same reason — the wide letter-
          // spacing was pushing two-word CTAs ("Notify me", "Send it")
          // into a 2-line wrap on tablet widths.
          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-md text-[12px] font-extrabold tracking-[0.1em] uppercase ${s.btnBg} ${s.btnText} ${s.btnHover} transition cursor-pointer disabled:opacity-60 disabled:cursor-wait`}
        >
          {status.kind === "submitting" ? "Sending…" : cta}
          {status.kind !== "submitting" && (
            <ArrowRight size={14} weight="bold" />
          )}
        </button>
      </form>
      {status.kind === "error" && (
        <p className="mt-3 text-[12px] text-rose-400 font-medium">
          {status.message}
        </p>
      )}
      <p
        className={`mt-3 text-[10px] tracking-tight ${
          variant === "lime" ? "text-white/40" : "text-slate-500"
        }`}
      >
        We&apos;ll never share your email. Unsubscribe anytime.
      </p>
    </div>
  );
}
