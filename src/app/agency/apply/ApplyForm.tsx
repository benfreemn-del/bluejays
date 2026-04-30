"use client";

import { useState } from "react";

// 8-question qualifying form mapped to the agency_applications
// table. Field names match the SQL column names so the API can pass
// the body straight through after light validation.
//
// Qualifying logic lives server-side (route.ts). The form just
// captures + UX-pretty-prints + handles submission state.

type FormState = {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  what_they_sell: string;
  avg_customer_value_cents: string; // string in form, parsed server-side
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
  | { kind: "review" } // submitted, Ben will personally review
  | { kind: "declined"; reason: string }
  | { kind: "error"; message: string };

export default function ApplyForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "submitting") return;

    // Minimal client-side validation — server does the real work.
    if (!form.business_name.trim() || !form.contact_name.trim() || !form.email.trim()) {
      setStatus({
        kind: "error",
        message: "Please fill in business name, your name, and email.",
      });
      return;
    }

    setStatus({ kind: "submitting" });

    try {
      // Pull UTM params off the current URL so we can attribute paid traffic
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
          message: json.error || `Submission failed (${res.status}). Try again or email ben@bluejayportfolio.com.`,
        });
        return;
      }

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
          Based on your answers, the AI Marketing System should work for you. Pick a
          time that works — Ben will come to the call having already pulled
          a target prospect count for your ICP and a rough 90-day plan.
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
          The good news: we offer a <span className="text-violet-400">$997 done-for-you website</span>{" "}
          which is a much better starting point if you&apos;re still finding product-market fit.
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

  // ─── Form ──────────────────────────────────────────────────────────

  const submitting = status.kind === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Q1 — Contact + business */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
        <h2 className="text-lg font-semibold mb-1">1. Who are you?</h2>
        <p className="text-sm text-slate-400 mb-5">
          We need a real name + email so Ben can actually call you back.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="Business name *"
            value={form.business_name}
            onChange={(v) => update("business_name", v)}
            placeholder="e.g. Clear Water Dental"
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

      {/* Q2 — Industry + what they sell */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
        <h2 className="text-lg font-semibold mb-1">2. What do you sell?</h2>
        <p className="text-sm text-slate-400 mb-5">
          One sentence. The simpler, the better.
        </p>
        <div className="space-y-4">
          <Field
            label="Industry"
            value={form.industry}
            onChange={(v) => update("industry", v)}
            placeholder="e.g. Dental, HVAC, B2B SaaS, commercial cleaning"
          />
          <TextArea
            label="What you sell"
            value={form.what_they_sell}
            onChange={(v) => update("what_they_sell", v)}
            placeholder="e.g. Premium cosmetic dentistry — veneers and Invisalign for adults 30–55."
          />
        </div>
      </section>

      {/* Q3 — Average customer value */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
        <h2 className="text-lg font-semibold mb-1">3. What&apos;s an average customer worth?</h2>
        <p className="text-sm text-slate-400 mb-5">
          Lifetime value, ballpark. We need at least $1,000 to make the math work
          on cold outreach.
        </p>
        <Field
          label="Average customer value ($)"
          type="number"
          value={form.avg_customer_value_cents}
          onChange={(v) => update("avg_customer_value_cents", v)}
          placeholder="e.g. 3500"
        />
      </section>

      {/* Q4 — Revenue + close rate */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
        <h2 className="text-lg font-semibold mb-1">4. Where are you today?</h2>
        <p className="text-sm text-slate-400 mb-5">
          Rough numbers are fine. We&apos;re not auditing your books.
        </p>
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
      </section>

      {/* Q5 — ICP */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
        <h2 className="text-lg font-semibold mb-1">5. Who&apos;s your ideal customer?</h2>
        <p className="text-sm text-slate-400 mb-5">
          One sentence. Be specific — &ldquo;everyone&rdquo; is the wrong answer.
        </p>
        <TextArea
          label="Ideal customer"
          value={form.ideal_customer}
          onChange={(v) => update("ideal_customer", v)}
          placeholder="e.g. Owner-operators of 1–5-chair dental practices in the Pacific Northwest doing $500K–$2M/yr."
        />
      </section>

      {/* Q6 — Current marketing */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
        <h2 className="text-lg font-semibold mb-1">6. What are you doing now?</h2>
        <p className="text-sm text-slate-400 mb-5">
          Tell us what&apos;s working, what&apos;s broken, what you&apos;ve tried.
        </p>
        <TextArea
          label="Current marketing"
          value={form.current_marketing}
          onChange={(v) => update("current_marketing", v)}
          placeholder="e.g. Word of mouth + Google Ads at $1.5K/mo. Tried cold email last year, got 3 calls but the list was bad."
        />
      </section>

      {/* Q7 — Budget */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
        <h2 className="text-lg font-semibold mb-1">7. Can you invest $9,700?</h2>
        <p className="text-sm text-slate-400 mb-5">
          Honest answer only. The full system is $9,700 paid upfront (save
          $300) or 3 × $3,500 split over 90 days. If that isn&apos;t on the
          table right now, the $997 website is a better starting point.
        </p>
        <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-700 bg-slate-950/40 hover:border-violet-500/40 transition-colors">
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
      </section>

      {/* Q8 — Success criteria */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
        <h2 className="text-lg font-semibold mb-1">8. What does Day 90 look like?</h2>
        <p className="text-sm text-slate-400 mb-5">
          If 90 days from now you said &ldquo;this was the best money I&apos;ve
          ever spent,&rdquo; what specifically happened?
        </p>
        <TextArea
          label="Success criteria"
          value={form.success_criteria}
          onChange={(v) => update("success_criteria", v)}
          placeholder="e.g. We added 12 new patients at $4K avg LTV, and we have a repeatable system I can keep running myself."
        />
      </section>

      {/* Submit */}
      <div className="pt-2">
        {status.kind === "error" && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {status.message}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold px-8 py-4 rounded-xl transition-colors text-base"
        >
          {submitting ? "Submitting…" : "Submit application →"}
        </button>
        <p className="text-xs text-slate-500 mt-3">
          You&apos;ll hear from Ben within 1 business day. If you qualify,
          we&apos;ll send you the calendar to book a 30-min strategy call.
        </p>
      </div>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}
      </label>
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
