"use client";

import { useState } from "react";
import { trackMetaEvent, trackGoogleAdsConversion } from "@/components/RetargetingPixels";
import { readPartnerRefCookie } from "@/components/PartnerRefCapture";
import { getAttributionForSubmit } from "@/lib/attribution";

// 2026-05-15 — re-ordered + extended for the product-audit ICP rebuild.
// Manufacturer + indie-author categories now sit at the top so the
// /audit funnel's default selection is product-relevant. Service-trade
// categories remain below for /audit-classic + spillover traffic.
const CATEGORIES = [
  // Product-audit ICP (top of list)
  ["mfg-ag-equipment", "Manufacturer — Ag / Equipment"],
  ["mfg-sports-equipment", "Manufacturer — Sports / Fitness"],
  ["mfg-outdoor-gear", "Manufacturer — Outdoor / Hunting"],
  ["mfg-apparel-kids", "Manufacturer — Apparel / Kids"],
  ["mfg-auto-parts", "Manufacturer — Auto Parts"],
  ["mfg-food-bev", "Manufacturer — Food / Beverage"],
  ["indie-author", "Indie Author / Book Series"],
  ["ecommerce", "E-commerce / Shopify brand"],
  // Service trades (audit-classic)
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

export default function AuditForm({
  variant,
  ctaLabel,
  defaultCategory = "dental",
  hideCategory = false,
}: {
  /** Hero variant from middleware-set bj_audit_variant cookie. Tagged
   *  on the audit_lead conversion event so per-variant performance
   *  splits cleanly in Meta + Google Ads attribution. */
  variant?: "A" | "B" | "C";
  /** Override the submit-button text. Defaults to the legacy
   *  "Run my free audit →". The product-audit variant of /audit uses
   *  "Audit my product →" to match the new pain-led H1. */
  ctaLabel?: string;
  /** Default selected category in the dropdown. /audit (product-audit)
   *  passes "mfg-ag-equipment" so the form opens on a product-relevant
   *  option. /audit-classic accepts the "dental" fallback. */
  defaultCategory?: string;
  /** Hide the category dropdown entirely (cold-traffic quiz-funnel
   *  anti-pattern fix, landing_page_optimizer chunk 8 in
   *  frameworks_video_03). Form silently uses defaultCategory.
   *  Server can later infer real category from URL via the existing
   *  scout pipeline. Set true on /audit (cold paid traffic);
   *  leave false on /audit-classic + dashboard surfaces where
   *  operator-driven category selection still matters. */
  hideCategory?: boolean;
} = {}) {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessCategory, setBusinessCategory] = useState(defaultCategory);
  const [businessName, setBusinessName] = useState("");
  const [biggestFrustration, setBiggestFrustration] = useState("");
  const [timeline, setTimeline] = useState("");
  // BANT qualifiers added 2026-05-17 per Hormozi review. Two short
  // dropdowns let Madie walk into every audit follow-up knowing the
  // room — $997 conversation vs $10K conversation — without
  // increasing form friction (both are visible but not required).
  const [ordersPerMonth, setOrdersPerMonth] = useState("");
  const [runningAds, setRunningAds] = useState("");
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
          // Phone is required — server enforces too, but pass the
          // trimmed value through so the server can normalize it.
          phone: phone.trim(),
          businessCategory,
          businessName: businessName.trim() || undefined,
          biggestFrustration: biggestFrustration.trim() || undefined,
          timeline: timeline || undefined,
          ordersPerMonth: ordersPerMonth || undefined,
          runningAds: runningAds || undefined,
          // Attribution captured on FIRST page load (utm_*, gclid, fbclid,
          // msclkid, ttclid, referrer). Survives internal navigation +
          // 30-day return visits. parseUtmFromQuery is the legacy live-URL
          // fallback in case localStorage is disabled.
          utm: {
            ...parseUtmFromQuery(),
            ...getAttributionForSubmit(),
            // Hero variant — included in UTM bag so the dashboard can
            // split per-variant performance even if the ad UTM didn't
            // carry it (returning visitor with cookie set).
            audit_variant: variant ?? "A",
          },
          // Forward partner-referral cookie value so the server can
          // attribute this prospect to a partner (90-day window). Read
          // from `bj_partner_ref` cookie set by PartnerRefCapture.
          partnerRef: readPartnerRefCookie() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setErrorMsg(data.error || `HTTP ${res.status}`);
        return;
      }
      setState("success");

      // Fire retargeting events BEFORE redirect (the redirect kills the
      // current page; if the events fired async after, they'd race
      // against navigation and may not reach Meta/Google).
      // Meta `Lead` is the standard pixel event for mid-funnel sign-ups.
      trackMetaEvent("Lead", {
        content_name: "site_audit",
        content_category: businessCategory,
      });
      // Google Ads "Audit Lead" conversion — fires the conversion action
      // configured in the Google Ads dashboard.
      // send_to is hardcoded because env var inlining was unreliable; conversion
      // IDs are public values (visible in HTML anyway), no secret to protect.
      // Also tries env var first in case it's been re-added later.
      const auditConversionSendTo =
        process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_AUDIT ||
        "AW-18122049249/NmpCCILRv6QcEOGNosFD";
      trackGoogleAdsConversion(auditConversionSendTo, 50);
      // Also fire a custom GA4 event for funnel analysis in Google Analytics.
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (typeof w.gtag === "function") {
        try {
          w.gtag("event", "audit_lead", {
            event_category: "lead_magnet",
            event_label: businessCategory,
            // Per the May 2026 cold-traffic A/B test — tags the
            // conversion with the hero variant so Google Ads + GA4
            // can split per-hook performance.
            audit_variant: variant ?? "A",
          });
        } catch {
          // Never let analytics break user flow
        }
      }

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

      {hideCategory ? (
        // Cold-traffic mode: single email field, full-width. Category is
        // silently set from defaultCategory and the server will refine via
        // the scout pipeline. Removes the 41-row dropdown friction that
        // the landing_page_optimizer skill flagged as a quiz-funnel
        // anti-pattern (frameworks_video_03 chunk 8).
        <div className="text-left">
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
      ) : (
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
      )}

      <div className="text-left">
        <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Your phone <span className="normal-case text-emerald-400 font-medium">— Ben texts you the top 3 fixes within 1 hour</span>
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="(555) 555-5555"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={state === "submitting"}
          required
          inputMode="tel"
          autoComplete="tel"
          // Permissive but real-phone-shaped: 10+ digits after stripping
          // formatting punctuation. Prevents joke entries while still
          // accepting "(555) 555-5555", "555.555.5555", "+1 555 ...", etc.
          pattern="[\d\s\-\.\(\)\+]{10,}"
          title="Enter a real phone number — 10+ digits, formatting OK."
          className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />
      </div>

      {/* BANT qualifiers — visible by default (not behind <details>) so
          Madie gets size-of-prize signal on EVERY submission. Both are
          optional so they don't reintroduce form friction. Per the
          2026-05-17 Hormozi review: "Madie walks into every call
          knowing what room the lead is in." */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
        <div>
          <label htmlFor="ordersPerMonth" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Orders / month <span className="normal-case text-slate-500 font-normal">(optional)</span>
          </label>
          <select
            id="ordersPerMonth"
            value={ordersPerMonth}
            onChange={(e) => setOrdersPerMonth(e.target.value)}
            disabled={state === "submitting"}
            className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Pick a range…</option>
            <option value="<10">Under 10</option>
            <option value="10-50">10 – 50</option>
            <option value="50-200">50 – 200</option>
            <option value="200-1000">200 – 1,000</option>
            <option value="1000+">1,000+</option>
          </select>
        </div>
        <div>
          <label htmlFor="runningAds" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Running paid ads? <span className="normal-case text-slate-500 font-normal">(optional)</span>
          </label>
          <select
            id="runningAds"
            value={runningAds}
            onChange={(e) => setRunningAds(e.target.value)}
            disabled={state === "submitting"}
            className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Pick one…</option>
            <option value="yes-google">Yes — Google Ads</option>
            <option value="yes-meta">Yes — Meta / Instagram</option>
            <option value="yes-both">Yes — both</option>
            <option value="no">Not yet</option>
          </select>
        </div>
      </div>

      <details className="text-left text-xs text-slate-500">
        <summary className="cursor-pointer hover:text-slate-300 transition-colors">Optional: tell us more (helps us tailor your audit)</summary>
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="businessName" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Business name
            </label>
            <input
              id="businessName"
              type="text"
              placeholder="Acme Dental"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={state === "submitting"}
              className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label htmlFor="frustration" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Biggest frustration with your current site
            </label>
            <textarea
              id="frustration"
              rows={3}
              placeholder="e.g. 'phone never rings', 'looks dated', 'doesn't show on Google'"
              value={biggestFrustration}
              onChange={(e) => setBiggestFrustration(e.target.value)}
              disabled={state === "submitting"}
              className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
            />
          </div>
          <div>
            <label htmlFor="timeline" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              When do you need this fixed?
            </label>
            <select
              id="timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              disabled={state === "submitting"}
              className="w-full rounded-md bg-slate-950/80 border border-slate-700 px-4 py-3 text-base text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Select a timeline...</option>
              <option value="asap">ASAP — bleeding leads now</option>
              <option value="30days">Within 30 days</option>
              <option value="60days">Within 60 days</option>
              <option value="exploring">Just exploring for now</option>
            </select>
          </div>
        </div>
      </details>

      {state === "error" && errorMsg && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {errorMsg}
        </div>
      )}

      <p className="text-xs text-slate-500 text-center">
        You&apos;ll get your audit + 5 follow-up emails over 2 weeks. Unsubscribe anytime.
      </p>

      <button
        type="submit"
        disabled={state === "submitting" || !url.trim() || !email.trim()}
        className="w-full rounded-md bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {state === "submitting" ? "Starting your audit…" : (ctaLabel ?? "Run my free audit →")}
      </button>
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
