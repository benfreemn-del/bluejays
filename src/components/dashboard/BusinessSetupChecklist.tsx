"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * BusinessSetupChecklist — owner-facing tax + legal + ops compliance list
 * for BlueJay Business Solutions LLC. Pulled from the 2026-05-04 audit
 * documented in `05 Internal Docs/Tax & Legal Gaps.md` and the Stripe
 * Tax / WA UBI dependency surfaced during Jake's deal close.
 *
 * Items grouped by urgency tier:
 *   🚨 blockers   — do before signing the next $9.7K contract
 *   ⚠️ this-month — required filings + tax obligations
 *   📝 30-60-day  — risk-reduction (banking, insurance, partner W-9s)
 *   🟢 someday    — nice-to-haves (trademark, attorney TOS review)
 *
 * Check-off state persists to localStorage so it survives reloads.
 * No DB write — this is Ben's personal compliance ledger, not multi-user.
 */

type Tier = "blocker" | "this-month" | "soon" | "someday";

type ChecklistItem = {
  id: string;
  title: string;
  detail: string;
  tier: Tier;
  /** Estimated hands-on time. */
  time: string;
  /** Cash cost of completing. */
  cost: string;
  /** Optional URL or phone # for the action. */
  action?: { label: string; href: string };
};

const ITEMS: ChecklistItem[] = [
  // ── 🚨 BLOCKERS ─────────────────────────────────────────────────
  {
    id: "wa-ubi",
    title: "Verify WA UBI / Master Business License is active",
    detail:
      "Stripe Tax requires a UBI number to register WA. Search 'BlueJay Business Solutions' in WA DOR. If no active UBI → file at bls.dor.wa.gov ($90 setup, 10 min).",
    tier: "blocker",
    time: "15 min",
    cost: "$0–$90",
    action: {
      label: "WA DOR login",
      href: "https://secure.dor.wa.gov/home/Login",
    },
  },
  {
    id: "wa-dor-call",
    title: "Phone WA DOR · sales-tax classification on AI Marketing System",
    detail:
      "Ask: 'I sell a $9,700 marketing service that includes website design, ad management, and an AI software dashboard. Is this Retailing or Service & Other Activities for B&O? Is sales tax due?' Get a name + reference number. This decides whether Stripe Tax goes ON for these products.",
    tier: "blocker",
    time: "10 min",
    cost: "$0",
    action: {
      label: "📞 1-800-647-7706",
      href: "tel:18006477706",
    },
  },
  {
    id: "service-agreement",
    title: "Buy + customize Service Agreement template",
    detail:
      "Empty `01 Legal & Tax/Contracts & Templates/` folder. About to sign $9,700+ deals with no agreement. Use LegalTemplates 'Web Design Service Agreement', drop in the TEKKY quarterly clause Claude drafted, save into the folder. Send to Jake with the Stripe link.",
    tier: "blocker",
    time: "45 min",
    cost: "$39",
    action: {
      label: "LegalTemplates →",
      href: "https://legaltemplates.net/form/web-design-services-agreement/",
    },
  },
  {
    id: "ein-cp575",
    title: "Verify EIN PDF is the IRS CP575 letter (not application receipt)",
    detail:
      "Open `01 Legal & Tax/Tax/EIn bluejay business.pdf`. If it says 'We assigned you Employer Identification Number...' → fine. If it's an online application acknowledgement → call IRS 1-800-829-4933, request a 147C letter (free, 10 min, mailed in 4-6 weeks). Banks need it.",
    tier: "blocker",
    time: "2 min",
    cost: "$0",
  },
  {
    id: "annual-report-status",
    title: "Check WA Annual Report status (2025 + 2026)",
    detail:
      "LLC anniversary = June 4. Annual report due every year by then. $71. Late = +$25 penalty. >2 yrs late = LLC dissolved. Search BlueJay Business Solutions in CCFS, view filing history.",
    tier: "blocker",
    time: "5 min",
    cost: "$0",
    action: {
      label: "WA SOS CCFS →",
      href: "https://ccfs.sos.wa.gov/",
    },
  },

  // ── ⚠️ THIS MONTH ──────────────────────────────────────────────
  {
    id: "annual-report-2026",
    title: "File 2026 WA Annual Report (due June 4)",
    detail:
      "$71. Set 30-day reminder for May 5 each year going forward. If 2025 was missed → file that one too with the $25 late penalty.",
    tier: "this-month",
    time: "15 min",
    cost: "$71+",
    action: {
      label: "File at CCFS →",
      href: "https://ccfs.sos.wa.gov/",
    },
  },
  {
    id: "1040-schedule-c",
    title: "File 2025 Form 1040 + Schedule C (due April 15, 2026)",
    detail:
      "Single-member LLC = pass-through. Business profit lands on personal Schedule C. If 2025 had >$400 net profit and no quarterly payments were made → expect small underpayment penalty.",
    tier: "this-month",
    time: "2 hours (or pay CPA)",
    cost: "$0–$300",
    action: {
      label: "IRS payments →",
      href: "https://www.irs.gov/payments",
    },
  },
  {
    id: "quarterly-2026",
    title: "Set up 2026 quarterly estimated tax schedule",
    detail:
      "April 15 / June 15 / Sept 15 / Jan 15. Estimate 2026 net profit × ~25% (federal + SE tax) ÷ 4 = quarterly payment. With Jake + TEKKY closes, 2026 net likely >$40K — quarterly is no longer optional.",
    tier: "this-month",
    time: "30 min",
    cost: "varies",
    action: {
      label: "IRS 1040-ES →",
      href: "https://www.irs.gov/forms-pubs/about-form-1040-es",
    },
  },
  {
    id: "147c-letter",
    title: "Request IRS 147C letter (only if EIN PDF isn't CP575)",
    detail:
      "Phone-only request. Tell agent: 'I'm the sole member of an LLC. I need a 147C letter — my original CP575 was lost.' Free, 10-min call, mailed in 4-6 weeks.",
    tier: "this-month",
    time: "10 min",
    cost: "$0",
    action: {
      label: "📞 1-800-829-4933",
      href: "tel:18008294933",
    },
  },

  // ── 📝 NEXT 30–60 DAYS ────────────────────────────────────────
  {
    id: "business-bank",
    title: "Open Mercury business bank account",
    detail:
      "Stop commingling personal + business. Court can pierce the corporate veil if BlueJays revenue/expenses still flow through a personal account. Mercury = free, online, 15 min, connect Stripe payouts directly.",
    tier: "soon",
    time: "15 min",
    cost: "$0",
    action: {
      label: "Mercury →",
      href: "https://mercury.com/start",
    },
  },
  {
    id: "eo-insurance",
    title: "Buy E&O + General Liability insurance",
    detail:
      "Service business handling client websites + content needs E&O. ~$40-60/mo with Hiscox or Next. If a client claims your work cost them revenue, E&O covers the lawsuit. Without it = personal assets exposed.",
    tier: "soon",
    time: "30 min",
    cost: "~$50/mo",
    action: {
      label: "Hiscox quote →",
      href: "https://www.hiscox.com/small-business-insurance",
    },
  },
  {
    id: "w9-process",
    title: "Add W-9 upload to /partners/apply before any partner crosses $600/yr",
    detail:
      "Once a sales partner accumulates $600+ in payouts in a calendar year, you must have their W-9 on file BEFORE the payment that crosses $600 + issue 1099-NEC by Jan 31. Build the upload field now — saves a January scramble.",
    tier: "soon",
    time: "1 hour",
    cost: "$0",
  },
  {
    id: "cpa-retainer",
    title: "Hire a CPA on retainer ($300–500/yr)",
    detail:
      "At your scale, DIY tax = penalty risk. CPA does quarterly planning + Schedule C. Pays for itself in penalty avoidance + tax-minimizing structure advice (e.g. when to elect S-corp).",
    tier: "soon",
    time: "1 hour to find one",
    cost: "$300–500/yr",
  },

  // ── 🟢 SOMEDAY ────────────────────────────────────────────────
  {
    id: "trademark",
    title: "Trademark 'BlueJays' wordmark with USPTO",
    detail:
      "Worth doing at $100K+ ARR. Protects the brand if a competitor tries the name. ~$350 USPTO fee + ~$200 attorney.",
    tier: "someday",
    time: "2 hours",
    cost: "~$550",
    action: {
      label: "USPTO TEAS →",
      href: "https://www.uspto.gov/trademarks/apply",
    },
  },
  {
    id: "tos-attorney-review",
    title: "Privacy Policy + Terms of Service attorney review",
    detail:
      "You have them on the site (likely auto-generated). Worth one attorney review at scale — checks that they actually cover what your AI Marketing System does (lead capture, AI copy generation, partner program data flows).",
    tier: "someday",
    time: "1 hour to set up",
    cost: "$200–400",
  },
];

const TIER_META: Record<
  Tier,
  { label: string; emoji: string; subtitle: string; accent: string }
> = {
  blocker: {
    label: "Blockers",
    emoji: "🚨",
    subtitle: "Do before signing the next $9.7K contract",
    accent: "border-rose-500/30 bg-rose-500/[0.04]",
  },
  "this-month": {
    label: "This month",
    emoji: "⚠️",
    subtitle: "Required filings + tax obligations",
    accent: "border-amber-500/25 bg-amber-500/[0.04]",
  },
  soon: {
    label: "Next 30–60 days",
    emoji: "📝",
    subtitle: "Risk-reduction · banking · insurance · partner ops",
    accent: "border-violet-500/25 bg-violet-500/[0.04]",
  },
  someday: {
    label: "Someday",
    emoji: "🟢",
    subtitle: "Nice-to-haves when revenue justifies",
    accent: "border-slate-500/25 bg-slate-500/[0.04]",
  },
};

const TIER_ORDER: Tier[] = ["blocker", "this-month", "soon", "someday"];

const STORAGE_KEY = "bluejays.business-setup.checked.v1";

export default function BusinessSetupChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        if (Array.isArray(arr)) setChecked(new Set(arr));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Counts per tier for the header.
  const summary = useMemo(() => {
    const out: Record<Tier, { done: number; total: number }> = {
      blocker: { done: 0, total: 0 },
      "this-month": { done: 0, total: 0 },
      soon: { done: 0, total: 0 },
      someday: { done: 0, total: 0 },
    };
    for (const item of ITEMS) {
      out[item.tier].total += 1;
      if (checked.has(item.id)) out[item.tier].done += 1;
    }
    return out;
  }, [checked]);

  const overallDone = ITEMS.filter((i) => checked.has(i.id)).length;
  const overallTotal = ITEMS.length;
  const blockerRemaining = summary.blocker.total - summary.blocker.done;

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-wider uppercase text-white">
            🏛️ BlueJays Business Setup
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tax + legal + ops compliance ledger · WA single-member LLC
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">
            <span className="text-white font-bold">{overallDone}</span> /{" "}
            {overallTotal} done
          </span>
          {blockerRemaining > 0 && (
            <span className="rounded-full px-2 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold uppercase tracking-wider">
              {blockerRemaining} blocker{blockerRemaining === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {TIER_ORDER.map((tier) => {
          const meta = TIER_META[tier];
          const items = ITEMS.filter((i) => i.tier === tier);
          const s = summary[tier];
          return (
            <div
              key={tier}
              className={`rounded-xl border ${meta.accent} p-3`}
            >
              <div className="flex items-baseline justify-between mb-2.5 flex-wrap gap-2">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-white">
                    {meta.emoji} {meta.label}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {meta.subtitle}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums">
                  {s.done} / {s.total}
                </span>
              </div>
              <ul className="space-y-1.5">
                {items.map((item) => {
                  const isChecked = checked.has(item.id);
                  return (
                    <li
                      key={item.id}
                      className={`rounded-lg border px-3 py-2.5 transition-colors ${
                        isChecked
                          ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                          : "border-white/[0.06] bg-slate-950/40 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggle(item.id)}
                          aria-label={`Mark ${item.title} ${isChecked ? "incomplete" : "complete"}`}
                          className={`shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            isChecked
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-slate-500 hover:border-white"
                          }`}
                        >
                          {isChecked && (
                            <span className="text-[10px] font-black text-slate-950 leading-none">
                              ✓
                            </span>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-3 flex-wrap">
                            <p
                              className={`text-sm font-bold leading-tight ${
                                isChecked
                                  ? "text-emerald-300/70 line-through"
                                  : "text-white"
                              }`}
                            >
                              {item.title}
                            </p>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                              {item.time} · {item.cost}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] leading-relaxed mt-1 ${
                              isChecked ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            {item.detail}
                          </p>
                          {item.action && !isChecked && (
                            <a
                              href={item.action.href}
                              target={
                                item.action.href.startsWith("tel:")
                                  ? undefined
                                  : "_blank"
                              }
                              rel="noopener noreferrer"
                              className="inline-block mt-2 text-[11px] font-bold text-violet-300 hover:text-violet-200"
                            >
                              {item.action.label}
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-600 italic leading-relaxed mt-4">
        Source: 2026-05-04 audit by Claude · `05 Internal Docs/Tax & Legal
        Gaps.md`. Check-off state persists locally — clear browser storage
        to reset.
      </p>
    </section>
  );
}
