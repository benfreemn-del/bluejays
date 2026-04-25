"use client";

/**
 * UPSELLS PAGE — `/upsells/[id]`
 *
 * Customer-facing page for paid prospects to 1-click-buy productized
 * add-ons (Review Blast, Extra Pages, GBP Setup, Monthly Updates).
 *
 * Auth model: prospect ID in URL acts as the credential (URL-as-secret),
 * same pattern as `/client/[id]` and `/claim/[id]`. The page is rendered
 * publicly but the upsell checkout endpoint enforces
 * `prospect.status === "paid"` server-side, so a non-paid prospect can
 * load the page but the "Buy Now" button will return a 403 with a
 * friendly message.
 *
 * Visual style: light theme matching `/claim/[id]` — white card surfaces,
 * subtle borders, brand-color accent on primary CTAs. Mobile-first.
 */

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { UPSELL_CATALOG, UPSELL_SKUS, type UpsellSku } from "@/lib/upsells";

interface ProspectInfo {
  businessName: string;
  city?: string;
  state?: string;
  generatedSiteUrl?: string;
  status?: string;
  pricingTier?: "standard" | "free" | "custom";
  scrapedData?: { accentColor?: string; brandColor?: string };
}

export default function UpsellsPage() {
  const params = useParams();
  const search = useSearchParams();
  const prospectId = params.id as string;

  const [info, setInfo] = useState<ProspectInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadingSku, setLoadingSku] = useState<UpsellSku | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ?upsell=success or ?upsell=cancelled banners (Stripe redirects back here)
  const upsellResult = search.get("upsell");
  const resultSku = search.get("sku");

  useEffect(() => {
    fetch(`/api/claim/${prospectId}`)
      .then((r) => {
        if (!r.ok) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.error) {
          setNotFound(true);
          return;
        }
        setInfo({
          businessName: data.businessName,
          city: data.city,
          state: data.state,
          generatedSiteUrl: data.generatedSiteUrl,
          status: data.status,
          pricingTier: data.pricingTier,
          scrapedData: data.scrapedData,
        });
      })
      .catch(() => setNotFound(true));
  }, [prospectId]);

  const handleBuy = async (sku: UpsellSku) => {
    setError(null);
    setLoadingSku(sku);
    try {
      const res = await fetch(`/api/checkout/upsell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, sku }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(
          data.error ||
            "Couldn't start checkout. Reply to my last email and I'll set this up for you manually.",
        );
        setLoadingSku(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error — couldn't reach checkout. Try again in a moment.");
      setLoadingSku(null);
    }
  };

  if (notFound) {
    return (
      <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
          <p className="text-slate-600">
            This add-ons link is no longer valid. Reply to your last email from Ben and he&apos;ll
            send you a fresh one.
          </p>
        </div>
      </main>
    );
  }

  if (!info) {
    return (
      <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6">
        <p className="text-slate-500 text-sm">Loading…</p>
      </main>
    );
  }

  const accent =
    info.scrapedData?.accentColor || info.scrapedData?.brandColor || "#0ea5e9";
  const isPaid = info.status === "paid";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header — references the existing site so the customer has context */}
      <header className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
              Add-ons for
            </p>
            <h2 className="text-lg font-semibold">{info.businessName}</h2>
            {(info.city || info.state) && (
              <p className="text-xs text-slate-500">
                {[info.city, info.state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          {info.generatedSiteUrl && (
            <a
              href={info.generatedSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-4"
            >
              Open your site ↗
            </a>
          )}
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Add more to {info.businessName}&apos;s site
        </h1>
        <p className="text-slate-600 max-w-2xl">
          1-click add-ons. Buy what you want, when you want — no calls, no upsell pressure. Each
          one is fulfilled within 24-48 hours of purchase.
        </p>

        {!isPaid && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Add-ons unlock after your initial website purchase. Reply to your last email from Ben
            if you&apos;d like to talk through options.
          </div>
        )}

        {upsellResult === "success" && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Payment received{resultSku ? ` for ${resultSku.replace(/_/g, " ")}` : ""}! You&apos;ll get
            a confirmation email within a minute with next steps.
          </div>
        )}
        {upsellResult === "cancelled" && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Checkout cancelled — no charge made. Pick a different add-on or come back anytime.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UPSELL_SKUS.map((sku) => {
            const def = UPSELL_CATALOG[sku];
            const isLoading = loadingSku === sku;
            return (
              <article
                key={sku}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold">{def.displayName}</h3>
                  <span
                    className="text-sm font-semibold whitespace-nowrap px-3 py-1 rounded-full"
                    style={{ background: `${accent}15`, color: accent }}
                  >
                    {def.priceLabel}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">
                  {def.description}
                </p>
                <button
                  type="button"
                  disabled={!isPaid || isLoading}
                  onClick={() => handleBuy(sku)}
                  style={{
                    background: isPaid ? accent : "#cbd5e1",
                    color: "#fff",
                  }}
                  className="w-full h-11 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "Opening checkout…" : isPaid ? "Buy Now" : "Available after purchase"}
                </button>
              </article>
            );
          })}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <p className="mb-1">
            Questions? Reply to your last email from Ben — every add-on is fulfilled personally,
            not by a service desk.
          </p>
          <p className="text-xs text-slate-500">
            All add-ons are charged via Stripe. Subscriptions can be cancelled anytime via your
            billing portal link.
          </p>
        </div>
      </section>
    </main>
  );
}
