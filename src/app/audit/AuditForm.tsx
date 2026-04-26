"use client";

import { useState } from "react";

const CATEGORIES = [
  ["dental", "Dental"],
  ["electrician", "Electrician"],
  ["plumber", "Plumber"],
  ["hvac", "HVAC"],
  ["roofing", "Roofing"],
  ["auto-repair", "Auto Repair"],
  ["law-firm", "Law Firm"],
  ["salon", "Salon / Beauty"],
  ["fitness", "Fitness / Gym"],
  ["real-estate", "Real Estate"],
  ["veterinary", "Veterinary"],
  ["photography", "Photography"],
  ["landscaping", "Landscaping"],
  ["cleaning", "Cleaning Service"],
  ["chiropractic", "Chiropractic"],
  ["accounting", "Accounting / Tax"],
  ["insurance", "Insurance"],
  ["interior-design", "Interior Design"],
  ["moving", "Moving Company"],
  ["pest-control", "Pest Control"],
  ["construction", "Construction"],
  ["catering", "Catering"],
  ["restaurant", "Restaurant"],
  ["med-spa", "Med Spa"],
  ["pet-services", "Pet Services"],
  ["physical-therapy", "Physical Therapy"],
  ["tutoring", "Tutoring"],
  ["church", "Church / Faith"],
  ["pool-spa", "Pool / Spa"],
  ["tattoo", "Tattoo"],
  ["florist", "Florist"],
  ["daycare", "Daycare"],
  ["martial-arts", "Martial Arts"],
  ["general", "Other / Not Listed"],
] as const;

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function AuditForm() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [businessCategory, setBusinessCategory] = useState("dental");
  const [businessName, setBusinessName] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/audit/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          email: email.trim(),
          businessCategory,
          businessName: businessName.trim() || undefined,
          utm: parseUtmFromQuery(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setErrorMsg(data.error || `HTTP ${res.status}`);
        return;
      }
      setState("success");
      // Redirect to processing page
      window.location.href = data.redirectUrl || `/audit/${data.auditId}/processing`;
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl"
    >
      <div className="text-left">
        <label htmlFor="url" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Your website URL
        </label>
        <input
          id="url"
          type="text"
          required
          placeholder="yourbusiness.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={state === "submitting"}
          className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
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
          <label htmlFor="cat" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Business category
          </label>
          <select
            id="cat"
            required
            value={businessCategory}
            onChange={(e) => setBusinessCategory(e.target.value)}
            disabled={state === "submitting"}
            className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <details className="text-left text-xs text-slate-500">
        <summary className="cursor-pointer hover:text-slate-300 transition-colors">Optional: business name (helps us personalize)</summary>
        <input
          type="text"
          placeholder="Acme Dental"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          disabled={state === "submitting"}
          className="mt-2 w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />
      </details>

      {state === "error" && errorMsg && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={state === "submitting" || !url.trim() || !email.trim()}
        className="w-full rounded-md bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {state === "submitting" ? "Starting your audit…" : "Run my free audit →"}
      </button>

      <p className="text-xs text-slate-500 text-center pt-1">
        By submitting, you agree to receive your audit + a few follow-up emails. Reply STOP anytime.
      </p>
    </form>
  );
}

function parseUtmFromQuery(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((k) => {
    const v = params.get(k);
    if (v) out[k] = v;
  });
  return out;
}
