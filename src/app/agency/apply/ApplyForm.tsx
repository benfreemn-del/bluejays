"use client";

import { useEffect, useRef, useState } from "react";
import { trackMetaEvent, trackGoogleAdsConversion } from "@/components/RetargetingPixels";

// 3-step wizard for the agency_applications qualifying form.
//
// Why a wizard: the original 8-section single-screen layout had two
// problems —
//   (a) Abandonment risk was huge (12 viewport-heights on mobile, no
//       progress bar, no save-state. Refresh = lose everything.)
//   (b) Cognitive escalation was wrong: Q1=name, Q4=monthly revenue.
//       Buyers see a money question before they're warmed up, bounce.
//
// Wizard fixes both:
//   Step 1 — Contact + business (low-friction; commits them to the form)
//   Step 2 — What you sell + ICP + current marketing (warming questions)
//   Step 3 — Money + budget + Day-90 success (high-friction, but they're invested)
//
// State persistence: every keystroke saves to localStorage. After
// Step 1 we POST a draft to the server (status='draft' on insert) so
// we can email-recover abandoners.

const LS_KEY = "agency-apply-draft-v1";
const TOTAL_STEPS = 3;

type FormState = {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  what_they_sell: string;
  avg_customer_value_cents: string;
  monthly_revenue_cents: string;
  current_close_rate_per_month: string;
  ideal_customer: string;
  current_marketing: string;
  budget_confirmed: boolean;
  success_criteria: string;
};

const initial: FormState = {
  business_name: "",
  contact_name: "",
  email: "",
  phone: "",
  website: "",
  industry: "",
  what_they_sell: "",
  avg_customer_value_cents: "",
  monthly_revenue_cents: "",
  current_close_rate_per_month: "",
  ideal_customer: "",
  current_marketing: "",
  budget_confirmed: false,
  success_criteria: "",
};

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "qualified"; calendlyUrl: string }
  | { kind: "review" }
  | { kind: "declined"; reason: string }
  | { kind: "error"; message: string };

export default function ApplyForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [hydrated, setHydrated] = useState(false);
  const draftSavedRef = useRef(false);

  // ─── Load draft from localStorage on mount ────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FormState> & { _step?: number };
        setForm((prev) => ({ ...prev, ...parsed }));
        if (typeof parsed._step === "number" && parsed._step >= 1 && parsed._step <= TOTAL_STEPS) {
          setStep(parsed._step);
        }
      }
    } catch {
      // localStorage unavailable (private browsing, etc.) — proceed without
    }
    setHydrated(true);
  }, []);

  // ─── Save to localStorage on every change ─────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ ...form, _step: step }));
    } catch {
      // Quota exceeded etc. — silent
    }
  }, [form, step, hydrated]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function clearDraft() {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  }

  // ─── Step 1 → 2 transition: persist a server-side draft ───────────
  // Fires once after Step 1 completes so we have a server record of
  // any abandoner from Step 2/3 onward. Best-effort, never blocks.
  async function persistDraftIfNeeded() {
    if (draftSavedRef.current) return;
    if (!form.business_name.trim() || !form.email.trim()) return;
    draftSavedRef.current = true;
    try {
      // Reuse the same /api/agency/apply endpoint with a `_draft: true`
      // flag — backend should treat this as a no-qualify insert with
      // status='draft'. If endpoint doesn't recognize the flag (older
      // deploy), the call falls through to a regular insert which is
      // also fine — just slightly noisier in Ben's alerts.
      void fetch("/api/agency/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _draft: true }),
        keepalive: true,
      }).catch(() => {
        /* draft persistence is best-effort */
      });
    } catch {
      /* swallow */
    }
  }

  // ─── Step gating: which fields are required to advance? ──────────
  function canAdvance(): { ok: boolean; reason?: string } {
    if (step === 1) {
      if (!form.business_name.trim()) return { ok: false, reason: "Business name is required." };
      if (!form.contact_name.trim()) return { ok: false, reason: "Your name is required." };
      if (!form.email.trim()) return { ok: false, reason: "Email is required." };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        return { ok: false, reason: "Email looks off — double-check it." };
      }
      return { ok: true };
    }
    if (step === 2) {
      // Soft requirements — we'd rather have answers, but don't block hard.
      if (!form.industry.trim() && !form.what_they_sell.trim()) {
        return { ok: false, reason: "Tell us what you sell so we can route this right." };
      }
      return { ok: true };
    }
    return { ok: true };
  }

  function next() {
    const check = canAdvance();
    if (!check.ok) {
      setStatus({ kind: "error", message: check.reason || "Fill in the required fields." });
      return;
    }
    setStatus({ kind: "idle" });
    if (step === 1) {
      // Fire the draft-save side-effect right after the user commits
      // to Step 2, so we capture them before the harder revenue questions.
      void persistDraftIfNeeded();
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ─── Final submit ────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "submitting") return;

    setStatus({ kind: "submitting" });

    try {
      const search = new URLSearchParams(window.location.search);
      const utm = {
        utm_source: search.get("utm_source") || "",
        utm_medium: search.get("utm_medium") || "",
        utm_campaign: search.get("utm_campaign") || "",
        utm_referrer: document.referrer || "",
      };

      const res = await fetch("/api/agency/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...utm }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        decision?: "qualified" | "review" | "declined";
        calendlyUrl?: string;
        reason?: string;
        error?: string;
      };

      if (!res.ok || !json.ok) {
        setStatus({
          kind: "error",
          message:
            json.error ||
            `Submission failed (${res.status}). Try again or email ben@bluejayportfolio.com.`,
        });
        return;
      }

      // ─── Conversion tracking ────────────────────────────────────
      const agencyQualifiedSendTo =
        process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_AGENCY_QUALIFIED ||
        process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_AUDIT ||
        "AW-18122049249/NmpCCILRv6QcEOGNosFD";
      try {
        if (json.decision === "qualified") {
          trackMetaEvent("Lead", {
            content_name: "agency_qualified",
            content_category: form.industry || "uncategorized",
            value: 9700,
            currency: "USD",
          });
          trackGoogleAdsConversion(agencyQualifiedSendTo, 9700);
        } else if (json.decision === "review") {
          trackMetaEvent("Lead", {
            content_name: "agency_review",
            content_category: form.industry || "uncategorized",
            value: 4850,
            currency: "USD",
          });
          trackGoogleAdsConversion(agencyQualifiedSendTo, 4850);
        } else if (json.decision === "declined") {
          trackMetaEvent("CompleteRegistration", {
            content_name: "agency_declined",
            content_category: form.industry || "uncategorized",
          });
        }
        const w = window as unknown as { gtag?: (...args: unknown[]) => void };
        if (typeof w.gtag === "function") {
          try {
            w.gtag("event", "agency_apply", {
              event_category: "agency_funnel",
              event_label: json.decision || "unknown",
            });
          } catch {}
        }
      } catch {
        /* tracking failures must not block UX */
      }

      // Clear localStorage draft on terminal status
      clearDraft();

      if (json.decision === "qualified" && json.calendlyUrl) {
        setStatus({ kind: "qualified", calendlyUrl: json.calendlyUrl });
      } else if (json.decision === "declined") {
        setStatus({ kind: "declined", reason: json.reason || "Not a fit right now." });
      } else {
        setStatus({ kind: "review" });
      }
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Network error — try again.",
      });
    }
  }

  // ─── Result screens ────────────────────────────────────────────────

  if (status.kind === "qualified") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 md:p-10">
        <div className="text-emerald-400 text-sm font-semibold tracking-wider uppercase mb-3">
          ✓ You&apos;re a fit
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Book your 30-minute strategy call.
        </h2>
        <p className="text-slate-300 mb-6 leading-relaxed">
          Based on your answers, the AI Marketing System should work for you. Pick
          a time that works — Ben will come to the call having already pulled a
          target prospect count for your ICP and a rough 90-day plan.
        </p>
        <a
          href={status.calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-slate-950 font-semibold px-6 py-3.5 rounded-xl transition-colors"
        >
          Pick a time →
        </a>
        <p className="text-xs text-slate-500 mt-6">
          Heads up: we only run 1 strategy call per business per week. If your
          first-choice slot is gone, grab the next one.
        </p>
      </div>
    );
  }

  if (status.kind === "review") {
    return (
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-8 md:p-10">
        <div className="text-violet-400 text-sm font-semibold tracking-wider uppercase mb-3">
          ✓ Application received
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Thanks — Ben will personally review this.
        </h2>
        <p className="text-slate-300 leading-relaxed">
          A few of your answers need a closer look. You&apos;ll hear back from
          Ben directly within 1 business day, either with a calendar link or
          with an honest &ldquo;here&apos;s why we&apos;re not the right fit&rdquo;
          and a recommendation for what is.
        </p>
      </div>
    );
  }

  if (status.kind === "declined") {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-8 md:p-10">
        <div className="text-slate-400 text-sm font-semibold tracking-wider uppercase mb-3">
          Not a fit right now
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Honest answer: this isn&apos;t for you yet.
        </h2>
        <p className="text-slate-300 mb-4 leading-relaxed">{status.reason}</p>
        <p className="text-slate-300 leading-relaxed">
          The good news: we offer a{" "}
          <span className="text-violet-400">$997 done-for-you website</span>{" "}
          which is a much better starting point if you&apos;re still finding
          product-market fit. Plus we&apos;ll send you a few more emails over
          the next month with a smaller-stakes playbook you can run yourself.
        </p>
        <a
          href="/audit"
          className="inline-flex items-center gap-2 mt-6 bg-white text-slate-950 font-semibold px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Get a free audit instead →
        </a>
      </div>
    );
  }

  // ─── Wizard ────────────────────────────────────────────────────────

  const submitting = status.kind === "submitting";
  const stepLabel = step === 1 ? "Who you are" : step === 2 ? "What you sell" : "Where you're headed";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress bar */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
            Step {step} of {TOTAL_STEPS} — {stepLabel}
          </p>
          <p className="text-xs text-slate-500">~{step === 3 ? "1" : "2"} min left</p>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* ─── Step 1: Contact ──────────────────────────────────────── */}
      {step === 1 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 space-y-5">
          <div>
            <h2 className="text-xl font-semibold mb-1">Who are you?</h2>
            <p className="text-sm text-slate-400">
              We need a real name + email so Ben can actually call you back.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Business name *"
              value={form.business_name}
              onChange={(v) => update("business_name", v)}
              placeholder="e.g. Clear Water Dental"
              autoFocus
            />
            <Field
              label="Your name *"
              value={form.contact_name}
              onChange={(v) => update("contact_name", v)}
              placeholder="e.g. Sarah Smith"
            />
            <Field
              label="Email *"
              type="email"
              value={form.email}
              onChange={(v) => update("email", v)}
              placeholder="you@yourbusiness.com"
            />
            <Field
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              placeholder="(555) 123-4567"
            />
            <Field
              label="Website"
              value={form.website}
              onChange={(v) => update("website", v)}
              placeholder="yourbusiness.com"
              className="md:col-span-2"
            />
          </div>
        </section>
      )}

      {/* ─── Step 2: What you sell + who for + what's working now ── */}
      {step === 2 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 space-y-5">
          <div>
            <h2 className="text-xl font-semibold mb-1">What you sell + who you sell it to</h2>
            <p className="text-sm text-slate-400">
              Specific beats clever here. &ldquo;Everyone&rdquo; is the wrong
              answer.
            </p>
          </div>
          <Field
            label="Industry"
            value={form.industry}
            onChange={(v) => update("industry", v)}
            placeholder="e.g. Dental, HVAC, B2B SaaS, commercial cleaning"
            autoFocus
          />
          <TextArea
            label="What you sell"
            value={form.what_they_sell}
            onChange={(v) => update("what_they_sell", v)}
            placeholder="e.g. Premium cosmetic dentistry — veneers and Invisalign for adults 30–55."
          />
          <TextArea
            label="Your ideal customer (one sentence)"
            value={form.ideal_customer}
            onChange={(v) => update("ideal_customer", v)}
            placeholder="e.g. Owner-operators of 1–5-chair dental practices in the Pacific Northwest doing $500K–$2M/yr."
          />
          <TextArea
            label="What's working / not working in your marketing now"
            value={form.current_marketing}
            onChange={(v) => update("current_marketing", v)}
            placeholder="e.g. Word of mouth + Google Ads at $1.5K/mo. Tried cold email last year, got 3 calls but the list was bad."
          />
        </section>
      )}

      {/* ─── Step 3: Money + budget + Day-90 ──────────────────────── */}
      {step === 3 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 space-y-5">
          <div>
            <h2 className="text-xl font-semibold mb-1">Where you&apos;re headed</h2>
            <p className="text-sm text-slate-400">
              Rough numbers are fine. We&apos;re not auditing your books — we
              just need enough to know if the engine math works for you.
            </p>
          </div>
          <Field
            label="Average customer value ($) — lifetime"
            type="number"
            value={form.avg_customer_value_cents}
            onChange={(v) => update("avg_customer_value_cents", v)}
            placeholder="e.g. 3500"
            autoFocus
          />
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Monthly revenue ($)"
              type="number"
              value={form.monthly_revenue_cents}
              onChange={(v) => update("monthly_revenue_cents", v)}
              placeholder="e.g. 45000"
            />
            <Field
              label="New customers / month"
              type="number"
              value={form.current_close_rate_per_month}
              onChange={(v) => update("current_close_rate_per_month", v)}
              placeholder="e.g. 8"
            />
          </div>

          {/* Budget */}
          <div className="pt-2">
            <p className="text-sm font-semibold text-white mb-2">Can you invest $9,700?</p>
            <p className="text-xs text-slate-400 mb-3">
              Honest answer only. The full system is $9,700 paid upfront (save
              $300) or 3 × $3,500 split over 90 days. If that isn&apos;t on the
              table right now, the $997 website is a better starting point.
            </p>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-700 bg-slate-950/40 hover:border-violet-500/40 transition-colors">
              <input
                type="checkbox"
                checked={form.budget_confirmed}
                onChange={(e) => update("budget_confirmed", e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-900 text-violet-500 focus:ring-violet-500/40"
              />
              <span className="text-sm text-slate-300">
                Yes — I have $9,700 (or 3 × $3,500) liquid available to invest in
                this system if we decide on the call we&apos;re a fit for each other.
              </span>
            </label>
          </div>

          <TextArea
            label="What does Day 90 look like if this works?"
            value={form.success_criteria}
            onChange={(v) => update("success_criteria", v)}
            placeholder="e.g. We added 12 new patients at $4K avg LTV, and we have a repeatable system I can keep running myself."
          />
        </section>
      )}

      {/* ─── Error pill ─────────────────────────────────────────── */}
      {status.kind === "error" && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {status.message}
        </div>
      )}

      {/* ─── Step nav ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            disabled={submitting}
            className="text-sm text-slate-400 hover:text-white disabled:opacity-50 px-4 py-2.5 transition-colors"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={next}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Next →
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-all"
          >
            {submitting ? "Submitting…" : "Submit application →"}
          </button>
        )}
      </div>

      {step === TOTAL_STEPS && (
        <p className="text-xs text-slate-500 text-center pt-1">
          You&apos;ll hear from Ben within 1 business day. If you qualify,
          we&apos;ll send you the calendar to book a 30-min strategy call.
        </p>
      )}
    </form>
  );
}

// ─── Tiny field primitives ───────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-colors"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-colors resize-y"
      />
    </div>
  );
}
