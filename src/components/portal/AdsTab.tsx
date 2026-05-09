"use client";

/**
 * AdsTab — owner-facing ads dashboard inside /clients/[slug]/portal.
 *
 * Per Q3=C (locked 2026-05-08): owner sees their own ad creatives
 * AND can request changes (pause / budget / copy / image / delete)
 * via the same "request changes" model used on Ben's admin side
 * (Q2=A locked 2026-05-08).
 *
 * Three sections:
 *
 *   1. **Iteration nudges** — top-of-tab cards generated from the
 *      paid_ads_iteration AIOS skill (aios/.claude/skills/paid_ads_iteration/SKILL.md).
 *      Currently mocked from the static creative library; will hydrate
 *      from real ROAS once Meta + Google APIs are delegated.
 *
 *   2. **Audience tabs** — Parents / Coaches / Players / All. Filters
 *      the creative table.
 *
 *   3. **Creative table** — per-row: variant, platform, headline +
 *      body preview, status, "Request change" CTA.
 *
 * Change requests POST to /api/clients/[slug]/ads/request-change
 * which writes to client_tasks (no new schema). Daily cron emails
 * Ben the queue (deferred — not walkthrough-critical).
 *
 * Read-only on the owner side: no live API push to Meta/Google.
 * That stays Ben-side per the operator-discipline rule (Rule 21
 * Ship Gate). Owners request, Ben reviews, Ben pushes.
 */

import { useState, useMemo } from "react";
import {
  ZENITH_CREATIVES,
  type CreativeSeed,
  type AdAudience,
  type AdPlatform,
} from "@/lib/client-ads/zenith-creatives";
import { OIT_CREATIVES } from "@/lib/client-ads/oit-creatives";

// Per-slug creative library. Falls back to Zenith for unknown slugs
// (legacy demo behavior — should never trigger in prod since the tab
// is gated to known slugs). New tenants register their seeds here.
const CREATIVES_BY_SLUG: Record<string, CreativeSeed[]> = {
  "zenith-sports": ZENITH_CREATIVES,
  "olympic-inspections": OIT_CREATIVES,
};

// Audience filters per tenant. Zenith uses parent/coach/player; OIT
// uses homeowner/realtor/insurance.
const AUDIENCE_FILTERS_BY_SLUG: Record<
  string,
  { id: string; label: string; tone: string }[]
> = {
  "zenith-sports": [
    { id: "all_filter", label: "All", tone: "border-slate-600 bg-slate-800/60 text-white" },
    { id: "parent", label: "Parents", tone: "border-amber-500/40 bg-amber-500/10 text-amber-200" },
    { id: "coach", label: "Coaches", tone: "border-sky-500/40 bg-sky-500/10 text-sky-200" },
    { id: "player", label: "Players", tone: "border-lime-500/40 bg-lime-500/10 text-lime-200" },
    { id: "all", label: "Catalog / All", tone: "border-violet-500/40 bg-violet-500/10 text-violet-200" },
  ],
  "olympic-inspections": [
    { id: "all_filter", label: "All", tone: "border-slate-600 bg-slate-800/60 text-white" },
    { id: "homeowner", label: "Homeowners", tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" },
    { id: "realtor", label: "Realtors", tone: "border-sky-500/40 bg-sky-500/10 text-sky-200" },
    { id: "insurance", label: "Insurance", tone: "border-amber-500/40 bg-amber-500/10 text-amber-200" },
  ],
};

const PLATFORM_LABELS: Record<AdPlatform, string> = {
  "meta-feed": "Meta · Feed",
  "meta-reels": "Meta · Reels",
  "meta-stories": "Meta · Stories",
  "google-search": "Google · Search",
  "google-pmax": "Google · PMax",
  "google-yt": "Google · YouTube",
};

const PLATFORM_TONES: Record<AdPlatform, string> = {
  "meta-feed": "border-sky-500/40 bg-sky-500/10 text-sky-200",
  "meta-reels": "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-200",
  "meta-stories": "border-violet-500/40 bg-violet-500/10 text-violet-200",
  "google-search": "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  "google-pmax": "border-amber-500/40 bg-amber-500/10 text-amber-200",
  "google-yt": "border-rose-500/40 bg-rose-500/10 text-rose-200",
};

type AudienceFilter = AdAudience | "all_filter" | string;

type ChangeKind = "pause" | "budget" | "copy" | "image" | "delete";

const CHANGE_KIND_LABELS: Record<ChangeKind, string> = {
  pause: "⏸ Pause",
  budget: "💰 Change budget",
  copy: "✏ Update copy",
  image: "🖼 Replace image",
  delete: "🗑 Delete",
};

type AdsTabProps = {
  slug: string;
};

/**
 * Mock iteration nudges for the walkthrough demo. Per the
 * paid_ads_iteration skill's 6-step decision algorithm, when real
 * ROAS data hydrates these populate dynamically. For now we hand-
 * curate 4 nudges that demonstrate the 4 categories of recommendation:
 * scale / iterate / kill / audit.
 */
function getMockNudges(slug: string) {
  void slug; // signature reserved for future per-client variation
  return [
    {
      kind: "scale" as const,
      icon: "🚀",
      title: "Scale: Coach · A · Outcome-led (Meta Feed)",
      detail:
        "Top performer in the coach audience. ROAS 7.2× over the last 14 days at $480 spend. Hormozi Rule 10 — when ROAS is 7+ scale until capacity caps. Recommended: increase daily budget 50%.",
      tone: "emerald" as const,
    },
    {
      kind: "iterate" as const,
      icon: "🔁",
      title: "Iterate: Parent · A · Outcome-14days (Meta Feed)",
      detail:
        "Running 14+ days unchanged at 4.3× ROAS. Hormozi Rule 2 — winners get 100 versions before you make a new ad. Suggested permutations: black-and-white variant · sepia filter · hook swap (top 3-sec from Coach winner) · headline swap.",
      tone: "amber" as const,
    },
    {
      kind: "audit" as const,
      icon: "🎯",
      title: "Audit: Retargeting gap on YouTube + TikTok",
      detail:
        "Pixels installed only on Meta + Google Display. Hormozi Rule 8 — retargeting is the highest-ROAS lever in any account, almost always positive. Recommended: install YouTube + TikTok pixels this week.",
      tone: "sky" as const,
    },
    {
      kind: "kill" as const,
      icon: "✂",
      title: "Kill: Player · C · Driveway-daily (Meta Stories)",
      detail:
        "ROAS 0.4× over 21 days, $180 spend. Hormozi Rule 10 — 1× or below = cut. Hard rule: needs operator approval (under 30-day-old creative). Confirm with Ben before pushing.",
      tone: "rose" as const,
    },
  ];
}

export default function AdsTab({ slug }: AdsTabProps) {
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>("all_filter");
  const [changeRequest, setChangeRequest] = useState<{
    creative: CreativeSeed;
    kind: ChangeKind;
  } | null>(null);

  // Per-tenant creative library + audience filters
  const creatives = CREATIVES_BY_SLUG[slug] ?? ZENITH_CREATIVES;
  const audienceFilters =
    AUDIENCE_FILTERS_BY_SLUG[slug] ?? AUDIENCE_FILTERS_BY_SLUG["zenith-sports"];

  const filteredCreatives = useMemo(() => {
    if (audienceFilter === "all_filter") return creatives;
    return creatives.filter((c) => c.audience === audienceFilter);
  }, [audienceFilter, creatives]);

  const nudges = useMemo(() => getMockNudges(slug), [slug]);

  return (
    <div className="space-y-6">
      {/* Hero / explainer */}
      <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900/50 to-slate-900/40 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300 mb-1">
              Your ad library · Hormozi-aligned
            </p>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {creatives.length} creatives running
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold rounded-full border px-2.5 py-0.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-200 whitespace-nowrap">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            Live on Meta + Google
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          See what&apos;s running, request changes (pause · budget · copy ·
          image), and review what the AI Operator recommends iterating
          this week. Ben reviews + pushes within 24 hours.
        </p>
      </section>

      {/* CONNECT BOXES — Google Ads + Meta Ads. Owner pastes account ID
          (or initiates OAuth once delegated-access lands) so live ROAS
          + spend hydrate the iteration-nudge engine. Currently
          placeholder UX — clicking opens a request-task that pings Ben
          to wire the OAuth handshake. Replaces the read-only "Ben
          pushes for you" message Luke would've seen otherwise. */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-base font-bold text-white">
            Connect your ad accounts
          </h3>
          <span className="text-[11px] text-slate-500">
            Required for live ROAS data
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <ConnectBox
            platform="google"
            slug={slug}
            label="Google Ads"
            sub="Search · PMax · YouTube"
            color="emerald"
            icon="🟢"
          />
          <ConnectBox
            platform="meta"
            slug={slug}
            label="Meta Ads"
            sub="Facebook · Instagram · Reels"
            color="sky"
            icon="🔵"
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
          Once connected, your AI Operator pulls daily ROAS + impressions
          + spend by creative — that's what powers the iteration nudges
          below. No live API push to your accounts; Ben reviews + pushes
          changes you request.
        </p>
      </section>

      {/* Iteration nudges from paid_ads_iteration skill */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-base font-bold text-white">
            This week&apos;s recommendations
          </h3>
          <span className="text-[11px] text-slate-500">
            Powered by AI Operator
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {nudges.map((nudge) => (
            <NudgeCard key={nudge.title} {...nudge} />
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
          Recommendations refresh every Monday based on the prior week&apos;s
          performance. Real ROAS / spend data hydrates once Meta + Google
          delegated access lands.
        </p>
      </section>

      {/* Audience filter */}
      <section>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mr-1">
            Filter
          </span>
          {audienceFilters.map((f) => {
            const active = audienceFilter === f.id;
            const count =
              f.id === "all_filter"
                ? creatives.length
                : creatives.filter((c) => c.audience === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setAudienceFilter(f.id)}
                className={`text-[11px] font-bold uppercase tracking-wider rounded-full border px-3 py-1 flex items-center gap-1.5 transition-colors ${
                  active
                    ? f.tone
                    : "border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white"
                }`}
              >
                <span>{f.label}</span>
                <span className="opacity-70 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Creative table */}
        <div className="rounded-xl border border-white/[0.06] bg-slate-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Variant</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Platform</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Headline</th>
                  <th className="text-right px-4 py-2.5 font-semibold">ROAS</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredCreatives.map((c, i) => (
                  <tr
                    key={`${c.audience}-${c.platform}-${c.variant_label}-${i}`}
                    className="hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-white text-sm leading-tight">
                        {c.variant_label}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
                        {c.ad_set}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex items-center text-[10px] uppercase tracking-wider font-bold rounded border px-2 py-0.5 whitespace-nowrap ${PLATFORM_TONES[c.platform]}`}
                      >
                        {PLATFORM_LABELS[c.platform]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top max-w-md">
                      <p className="text-slate-200 text-sm leading-snug">
                        {c.headline}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                        {c.body}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-right tabular-nums text-slate-500">
                      —
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {(["pause", "budget", "copy", "image"] as ChangeKind[]).map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => setChangeRequest({ creative: c, kind: k })}
                            className="text-[10px] uppercase tracking-wider font-bold rounded px-2 py-1 border border-slate-700 text-slate-400 hover:border-violet-500/50 hover:text-white transition-colors whitespace-nowrap"
                            title={CHANGE_KIND_LABELS[k]}
                          >
                            {CHANGE_KIND_LABELS[k].split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Change request modal */}
      {changeRequest && (
        <ChangeRequestModal
          slug={slug}
          creative={changeRequest.creative}
          kind={changeRequest.kind}
          onClose={() => setChangeRequest(null)}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
// Sub-components
/* ──────────────────────────────────────────────────────────────────── */

function NudgeCard({
  icon,
  title,
  detail,
  tone,
}: {
  icon: string;
  title: string;
  detail: string;
  tone: "emerald" | "amber" | "sky" | "rose";
}) {
  const cls =
    tone === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/[0.06]"
      : tone === "amber"
        ? "border-amber-500/30 bg-amber-500/[0.06]"
        : tone === "sky"
          ? "border-sky-500/30 bg-sky-500/[0.06]"
          : "border-rose-500/30 bg-rose-500/[0.06]";

  return (
    <article className={`rounded-xl border ${cls} p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0" aria-hidden="true">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm leading-tight mb-1">
            {title}
          </h4>
          <p className="text-[12px] text-slate-300 leading-relaxed">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function ChangeRequestModal({
  slug,
  creative,
  kind,
  onClose,
}: {
  slug: string;
  creative: CreativeSeed;
  kind: ChangeKind;
  onClose: () => void;
}) {
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const placeholder = (() => {
    switch (kind) {
      case "pause":
        return "Optional: why pause this one? (e.g., 'Saturating, want to test new hook')";
      case "budget":
        return "What new daily budget? (e.g., '$30 → $50')";
      case "copy":
        return "Paste the new headline + body copy here";
      case "image":
        return "Describe the new image, or paste a URL / Drive link";
      case "delete":
        return "Optional: why delete entirely vs. pause?";
    }
  })();

  const submit = async () => {
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/clients/${slug}/ads/request-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_label: creative.variant_label,
          ad_set: creative.ad_set,
          platform: creative.platform,
          audience: creative.audience,
          kind,
          details,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setSubmitted(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-bold text-white">{CHANGE_KIND_LABELS[kind]}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-lg border border-white/[0.06] bg-slate-900/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              {creative.audience} · {PLATFORM_LABELS[creative.platform]} ·{" "}
              {creative.variant_label}
            </p>
            <p className="text-sm text-slate-200 leading-snug">
              {creative.headline}
            </p>
          </div>

          {!submitted && (
            <>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Details
                </span>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-slate-900 text-sm text-slate-100 px-3 py-2 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
                  placeholder={placeholder}
                />
              </label>

              {err && (
                <p className="text-xs text-rose-300">{err}</p>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[12px] uppercase tracking-wider font-bold rounded px-3 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="text-[12px] uppercase tracking-wider font-bold rounded px-4 py-2 bg-violet-500 text-white hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Submitting…" : "Request change"}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ben reviews requests within 24 hours and pushes the change to
                Meta / Google. You&apos;ll get an email confirmation when it&apos;s
                live.
              </p>
            </>
          )}

          {submitted && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/[0.08] p-4 text-center">
              <p className="text-emerald-300 font-bold text-sm mb-1">
                ✓ Request submitted
              </p>
              <p className="text-[12px] text-slate-300 leading-relaxed">
                Ben will review and push the change within 24 hours. You&apos;ll
                get an email confirmation when it&apos;s live.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 text-[11px] uppercase tracking-wider font-bold rounded px-3 py-1.5 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ConnectBox — placeholder Google/Meta ad-account connection card.
 *
 * V1 behavior: clicking "Connect" opens a request-change task that
 * pings Ben to start the OAuth handshake server-side. Once Meta /
 * Google delegated access lands, this swaps to a real OAuth button.
 */
function ConnectBox({
  platform,
  slug,
  label,
  sub,
  color,
  icon,
}: {
  platform: "google" | "meta";
  slug: string;
  label: string;
  sub: string;
  color: "emerald" | "sky";
  icon: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const colorClass =
    color === "emerald"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
      : "border-sky-500/40 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20";

  const requestConnect = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/clients/${slug}/ads/request-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          kind: "copy",
          variant_label: `connect-${platform}`,
          message: `Owner requested to connect ${platform === "google" ? "Google Ads" : "Meta Ads"} account. Initiate OAuth handshake.`,
        }),
      });
      if (r.ok) {
        setMsg("Request sent — Ben will email you the OAuth link within 24 hours.");
      } else {
        setMsg("Couldn't send request — try again or text Ben directly.");
      }
    } catch {
      setMsg("Couldn't send request — try again.");
    }
    setBusy(false);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5" aria-hidden>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">{label}</div>
          <div className="text-[11px] text-slate-400">{sub}</div>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold rounded-full border px-2 py-0.5 border-amber-500/40 bg-amber-500/10 text-amber-200">
          Not connected
        </span>
      </div>
      <button
        type="button"
        onClick={requestConnect}
        disabled={busy}
        className={`text-[12px] font-bold uppercase tracking-wider rounded-lg border px-3 py-2 transition-colors ${colorClass} disabled:opacity-50 disabled:cursor-wait`}
      >
        {busy ? "Sending request…" : "Connect"}
      </button>
      {msg && (
        <p className="text-[11px] text-slate-300 leading-relaxed">{msg}</p>
      )}
    </div>
  );
}
