"use client";

import { useState } from "react";

/**
 * "Sound familiar?" 4-card section on /audit, with an audience toggle.
 *
 * The Hormozi review (2026-05-17) flagged avatar sprawl on this section:
 * the four cards spoke to four DIFFERENT avatars (DTC brand,
 * manufacturer, ad-runner, multi-audience seller), so no single visitor
 * felt "this is EXACTLY me." Per-avatar copy converts measurably
 * better than one-page-for-all.
 *
 * Solution: a 3-button toggle above the cards swaps the entire leak
 * set client-side. Same URL, same form below, but the prospect sees
 * the four leaks that map to THEIR business shape.
 *
 * The three avatars match the locked manufacturer-lookalike + DTC +
 * indie-author ICPs (see CLAUDE.md "Manufacturer lookalike outreach
 * backlog" + "$10k AI System vertical-split").
 */

type AudienceKey = "manufacturer" | "dtc" | "author";

type Reason = {
  n: number;
  title: string;
  body: string;
  accent: "rose" | "amber" | "sky" | "violet";
};

const AUDIENCES: Record<
  AudienceKey,
  { label: string; reasons: Reason[] }
> = {
  manufacturer: {
    label: "I make a product",
    reasons: [
      {
        n: 1,
        title: "Your product page is a brochure, not a buy-button.",
        body: "Pretty photos. Spec sheet. No clear path to purchase, no urgency, no social proof above the fold. Visitors come, nod, leave.",
        accent: "rose",
      },
      {
        n: 2,
        title: "Your distributor owns the customer relationship — you don't.",
        body: "You make the product. They take the order, email, repeat purchase, and LTV. You're a vendor on someone else's audience. Cap on growth, cap on margin.",
        accent: "amber",
      },
      {
        n: 3,
        title: "You can't retarget the people who almost bought.",
        body: "No email capture. No Meta pixel. No SMS list. Every visitor who didn't convert is gone forever. You're paying for the same lead twice.",
        accent: "sky",
      },
      {
        n: 4,
        title: "Your funnel doesn't speak to the buyer who actually decides.",
        body: "Parents buy for kids. Coaches recommend to parents. Dealers resell to end-users. One blanket message for three audiences = converts none of them well.",
        accent: "violet",
      },
    ],
  },
  dtc: {
    label: "I run a DTC brand",
    reasons: [
      {
        n: 1,
        title: "Your product page is a brochure, not a buy-button.",
        body: "Hero is a vibe shot. CTA is below the fold. No reviews above the buy button. You're losing the impulse-buy window in the first 4 seconds.",
        accent: "rose",
      },
      {
        n: 2,
        title: "You're paying for cold traffic and converting under 1.5%.",
        body: "Ad CPMs are up 30% YoY. If your site can't convert above 3%, every Meta dollar is paying for someone else's retargeting list. The leak is the landing page, not the ads.",
        accent: "amber",
      },
      {
        n: 3,
        title: "You can't retarget the 95% who almost bought.",
        body: "No email/SMS popup. Cart-abandon emails never go out. Meta pixel fires but the audiences are tiny. Every visitor who didn't convert is gone — and you're paying $25+ CPMs to get them back.",
        accent: "sky",
      },
      {
        n: 4,
        title: "Your back-end is a single SKU — no AOV play, no repeat loop.",
        body: "No upsell on the cart page. No bundle on the thank-you. No replenishment email at 60 days. First-purchase LTV = lifetime LTV. You're leaving 40% of revenue on the floor.",
        accent: "violet",
      },
    ],
  },
  author: {
    label: "I write books",
    reasons: [
      {
        n: 1,
        title: "Your book page is an Amazon-only dead end.",
        body: "All your traffic flows to Amazon — where YOU don't own the customer. No email capture, no series funnel, no way to tell readers when book 2 drops.",
        accent: "rose",
      },
      {
        n: 2,
        title: "Readers can't find you between launches.",
        body: "Reviewers don't know where to follow. Newsletter subscribers age out. Six months of silence between books = your audience forgets you exist before the next launch.",
        accent: "amber",
      },
      {
        n: 3,
        title: "You can't retarget the people who almost bought book 1.",
        body: "No pixel. No email capture on your site. Every visitor who clicked away to 'read sample first' is gone forever — and you're paying to acquire them again next launch.",
        accent: "sky",
      },
      {
        n: 4,
        title: "Your funnel doesn't recover readers who DIDN'T finish.",
        body: "30% bounce off book 1. You have no system to re-engage them with the spinoff, the audiobook, or the prequel. One blanket newsletter for fans + drop-offs = converts neither well.",
        accent: "violet",
      },
    ],
  },
};

const ACCENT_RING: Record<string, string> = {
  rose: "border-rose-500/30 bg-rose-500/[0.04]",
  amber: "border-amber-500/30 bg-amber-500/[0.04]",
  sky: "border-sky-500/30 bg-sky-500/[0.04]",
  violet: "border-violet-500/30 bg-violet-500/[0.04]",
};
const ACCENT_NUM: Record<string, string> = {
  rose: "bg-rose-500/15 border-rose-500/40 text-rose-300",
  amber: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  sky: "bg-sky-500/15 border-sky-500/40 text-sky-300",
  violet: "bg-violet-500/15 border-violet-500/40 text-violet-300",
};

export default function FourReasonsAudience() {
  const [audience, setAudience] = useState<AudienceKey>("manufacturer");
  const { reasons } = AUDIENCES[audience];

  return (
    <section className="border-b border-white/5 bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
            Sound familiar?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Most product brands lose orders in the same 4 places.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The audit confirms which of these are leaking on YOUR site —
            ranked by dollar impact.
          </p>
        </div>

        {/* Audience toggle — kills avatar sprawl. Lets a visitor pick
            their shape so the 4 leaks below feel like THEM, not a
            generic catch-all. */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-10">
          {(Object.keys(AUDIENCES) as AudienceKey[]).map((key) => {
            const active = audience === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setAudience(key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 shadow-lg shadow-amber-500/20"
                    : "border border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500 hover:text-white"
                }`}
              >
                {AUDIENCES[key].label}
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {reasons.map((r) => (
            <div
              key={r.n}
              className={`rounded-2xl border ${ACCENT_RING[r.accent]} p-6 md:p-7`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border text-base font-black ${ACCENT_NUM[r.accent]}`}
                >
                  {r.n}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-snug">
                    {r.title}
                  </h3>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                    {r.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Anchor CTA — bounces back up to the hero form for visitors
            who scrolled before converting. */}
        <div className="mt-10 md:mt-12 text-center">
          <a
            href="#audit-top"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 font-bold text-base hover:shadow-[0_0_30px_rgba(245,158,11,0.45)] active:scale-[0.97] transition-all"
          >
            Audit my product →
          </a>
          <p className="mt-3 text-xs text-slate-500">
            60 seconds. No signup to see the result.
          </p>
        </div>
      </div>
    </section>
  );
}
