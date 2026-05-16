"use client";

import { useEffect, useState } from "react";

/**
 * EspConnectSection — Phase 1 demand-capture surface for the
 * multi-ESP integration feature. Lives inside the per-client portal
 * Campaigns tab. Renders 5 provider cards (Mailchimp / Klaviyo /
 * ConvertKit / ActiveCampaign / HubSpot) — each click hits
 * /api/client-esp-interest and registers as a demand signal.
 *
 * No OAuth, no actual ESP plumbing yet — this just collects the
 * "I want this" signal so we know which provider's full integration
 * (OAuth + list-sync + segment-push) to build first.
 *
 * Mounted unconditionally in the portal Campaigns tab — broader
 * signal beats narrow gating for a demand-validation feature.
 * Per Hormozi: validate before scale.
 */

type RequestedRow = {
  provider: string;
  request_count: number;
  requested_at: string;
};

const PROVIDERS: Array<{
  id: string;
  name: string;
  fit: string;
  accent: "amber" | "violet" | "rose" | "sky" | "orange";
}> = [
  {
    id: "mailchimp",
    name: "Mailchimp",
    fit: "Service trades · general purpose · easiest onboarding",
    accent: "amber",
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    fit: "E-commerce · DTC manufacturers · flow-heavy",
    accent: "violet",
  },
  {
    id: "convertkit",
    name: "ConvertKit",
    fit: "Indie authors · creators · newsletter-first",
    accent: "rose",
  },
  {
    id: "activecampaign",
    name: "ActiveCampaign",
    fit: "B2B · automation-heavy · CRM-aware",
    accent: "sky",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    fit: "Enterprise B2B · bigger accounts · all-in-one",
    accent: "orange",
  },
];

const ACCENT_CLASSES: Record<string, { ring: string; text: string; dot: string }> = {
  amber: {
    ring: "border-amber-500/30 group-hover:border-amber-500/60",
    text: "text-amber-300",
    dot: "bg-amber-400",
  },
  violet: {
    ring: "border-violet-500/30 group-hover:border-violet-500/60",
    text: "text-violet-300",
    dot: "bg-violet-400",
  },
  rose: {
    ring: "border-rose-500/30 group-hover:border-rose-500/60",
    text: "text-rose-300",
    dot: "bg-rose-400",
  },
  sky: {
    ring: "border-sky-500/30 group-hover:border-sky-500/60",
    text: "text-sky-300",
    dot: "bg-sky-400",
  },
  orange: {
    ring: "border-orange-500/30 group-hover:border-orange-500/60",
    text: "text-orange-300",
    dot: "bg-orange-400",
  },
};

export default function EspConnectSection({ slug }: { slug: string }) {
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/client-esp-interest?slug=${encodeURIComponent(slug)}`,
          { cache: "no-store" },
        );
        const json = (await res.json()) as {
          ok: boolean;
          requested?: RequestedRow[];
        };
        if (cancelled) return;
        if (json.ok && json.requested) {
          setRequested(new Set(json.requested.map((r) => r.provider)));
        }
      } catch {
        // Non-critical — empty state is fine
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleClick(providerId: string) {
    if (requested.has(providerId) || pending) return;
    setPending(providerId);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/client-esp-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_slug: slug, provider: providerId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || `HTTP ${res.status}`);
        return;
      }
      setRequested((prev) => new Set(prev).add(providerId));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight mb-1">
              Connect your email tool
            </h2>
            <p className="text-sm text-slate-400">
              Send campaigns through your existing ESP, segmented by category
              + funnel stage. Pick the tool you use — we&apos;ll prioritize the
              connection for you.
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold whitespace-nowrap mt-1">
            Coming soon
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {PROVIDERS.map((p) => {
          const isRequested = requested.has(p.id);
          const isPending = pending === p.id;
          const accent = ACCENT_CLASSES[p.accent];
          return (
            <button
              key={p.id}
              onClick={() => handleClick(p.id)}
              disabled={isRequested || isPending}
              className={`group rounded-xl border p-4 text-left transition-all ${
                isRequested
                  ? "border-emerald-500/40 bg-emerald-500/[0.06] cursor-default"
                  : `${accent.ring} bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer`
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRequested ? "bg-emerald-400" : accent.dot
                  }`}
                />
                <p className="text-sm font-bold text-white">{p.name}</p>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed min-h-[40px]">
                {p.fit}
              </p>
              {isRequested ? (
                <span className="text-xs text-emerald-300 font-bold">
                  ✓ Requested — we&apos;ll prioritize this
                </span>
              ) : isPending ? (
                <span className="text-xs text-slate-400">Saving…</span>
              ) : (
                <span className={`text-xs font-bold ${accent.text}`}>
                  Request priority →
                </span>
              )}
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <p className="text-xs text-rose-300 mt-3">{errorMsg}</p>
      )}

      <p className="text-xs text-slate-500 mt-4">
        Phase 1 — demand capture. We build the OAuth integration for the
        most-requested provider first. Hit the button on the tool you
        actually use to bump it to the front of the queue.
      </p>
    </div>
  );
}
