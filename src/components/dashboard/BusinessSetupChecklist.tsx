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
  // ── 🚨 BLOCKERS · do this week ────────────────────────────────
  // Today: 2026-05-06. Items that risk legal exposure, missed
  // filings, or partner-payment-without-paperwork.

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
    id: "annual-report-2026",
    title: "File 2026 WA Annual Report — due June 4 (29 days)",
    detail:
      "LLC anniversary June 4. Report is $71. Late = +$25 penalty. >2 yrs late = LLC dissolved. While in CCFS, also verify the 2025 report was filed — if missed, file with the $25 penalty NOW. Set a 30-day reminder for May 5 every future year.",
    tier: "blocker",
    time: "15 min",
    cost: "$71–$96",
    action: {
      label: "File at CCFS →",
      href: "https://ccfs.sos.wa.gov/",
    },
  },
  {
    id: "madie-paperwork",
    title: "Madie · W-9 + Independent Contractor Agreement BEFORE first payout",
    detail:
      "Madie's earning $200/website + $1k/backend close. IRS rule: W-9 must be on file BEFORE the payment that crosses the first dollar — and definitely before $600 cumulative. Get her W-9 (printable from IRS.gov) + sign a 1-page IC agreement clarifying she's a contractor (not employee), commission-only, no benefits. Save into 01 Legal & Tax/Contracts & Templates/Madie - IC Agreement.md.",
    tier: "blocker",
    time: "30 min",
    cost: "$0",
    action: {
      label: "IRS Form W-9 →",
      href: "https://www.irs.gov/pub/irs-pdf/fw9.pdf",
    },
  },
  {
    id: "business-bank",
    title: "Open Mercury business bank account",
    detail:
      "Revenue scale + multiple $9.7k closes pending = you cannot keep commingling. A court CAN pierce the LLC veil if BlueJays revenue/expenses still flow through a personal account. Mercury = free, online, 15 min. Connect Stripe payouts directly. Then route ALL future Stripe + client payments to it.",
    tier: "blocker",
    time: "15 min",
    cost: "$0",
    action: {
      label: "Mercury →",
      href: "https://mercury.com/start",
    },
  },

  // ── ⚠️ THIS MONTH · before May ends ───────────────────────────
  {
    id: "q2-tax",
    title: "Q2 2026 estimated tax payment — due June 15 (40 days)",
    detail:
      "Q1 (Apr 15) likely already passed. With TEKKY + Hector + Laser Lakes + others closing, 2026 net is tracking >$40K — quarterly tax is no longer optional. Estimate YTD net × ~25% = total tax owed YTD; pay the gap. If Q1 was missed, expect small underpayment interest (~$15-50). Pay via IRS 1040-ES.",
    tier: "this-month",
    time: "30 min",
    cost: "varies",
    action: {
      label: "IRS 1040-ES →",
      href: "https://www.irs.gov/forms-pubs/about-form-1040-es",
    },
  },
  {
    id: "bookkeeping-system",
    title: "Set up QuickBooks Self-Employed (or Wave) for 2026",
    detail:
      "DIY-spreadsheet bookkeeping breaks at the $9.7k-deal-volume tier. QuickBooks Self-Employed is $20/mo, auto-categorizes Stripe + Mercury transactions, generates the Schedule C automatically next April. Wave is free if you can manage manual category review. Pick one + back-categorize 2026 to date.",
    tier: "this-month",
    time: "2 hours setup + ongoing",
    cost: "$0–$240/yr",
    action: {
      label: "QBSE →",
      href: "https://quickbooks.intuit.com/self-employed/",
    },
  },
  {
    id: "madie-commission-ledger",
    title: "Madie · running commission ledger toward $600 1099-NEC threshold",
    detail:
      "When her cumulative 2026 commissions cross $600, you owe her a 1099-NEC by Jan 31, 2027. Track every payout in a sheet (date, deal, amount, running total). Easiest: a tab in your accounting tool tagged 'Madie' so totals auto-sum. Crossing $600 with no W-9 on file = $290 penalty per missing 1099 + IRS notice.",
    tier: "this-month",
    time: "20 min",
    cost: "$0",
  },
  {
    id: "cpa-retainer",
    title: "Hire a CPA on retainer ($300–500/yr) — interview 3, pick 1",
    detail:
      "At this scale DIY tax = penalty risk. CPA does Q2-Q4 quarterly planning, Schedule C, and tells you exactly when to elect S-corp (probably the 2027 tax year at this trajectory). Find one who specializes in solo-LLC marketing/agency businesses. Pays for itself in tax-minimizing advice alone.",
    tier: "this-month",
    time: "2 hours to find + interview",
    cost: "$300–500/yr",
  },
  {
    id: "eo-insurance",
    title: "Buy E&O + General Liability insurance",
    detail:
      "Service business handling client websites + AI-generated copy + lead-capture data needs E&O. ~$40-60/mo with Hiscox or Next. If a client claims your AI System cost them revenue (or one of Madie's prospects sues over a sales call), E&O covers the lawsuit. Without it = personal assets exposed despite the LLC.",
    tier: "this-month",
    time: "30 min",
    cost: "~$50/mo",
    action: {
      label: "Hiscox quote →",
      href: "https://www.hiscox.com/small-business-insurance",
    },
  },
  {
    id: "twofa-recovery",
    title: "Document 2FA recovery codes for all admin accounts",
    detail:
      "Single point of failure: lose your phone, lose access to Stripe, Vercel, Supabase, Google, Calendly, SendGrid, Twilio, Mercury, GitHub, Cloudflare. Print/store recovery codes in 1Password OR a sealed envelope in a fireproof safe. 30-min audit one time, prevents an existential outage. List every account with admin login + verify each has working recovery codes saved.",
    tier: "this-month",
    time: "30 min",
    cost: "$0",
  },

  // ── 📝 NEXT 30–60 DAYS ────────────────────────────────────────
  {
    id: "domain-registrar-audit",
    title: "Audit every client domain · WHOIS + auto-renew + alert email",
    detail:
      "We host ~10 client sites now (Tekky/Zenith, Hector, Tacos Yum, etc.). Each domain has a registrar account, an owner-of-record in WHOIS, and a renewal date. Audit: every domain auto-renews, the alert email is one YOU monitor (not a forgotten gmail), card on file is current. One missed renewal = client site goes dark = a very bad day.",
    tier: "soon",
    time: "1 hour",
    cost: "$0",
  },
  {
    id: "billing-audit",
    title: "Vercel + Supabase + SendGrid + Twilio billing audit",
    detail:
      "Confirm card on file for each is current + has billing alerts set ($X spike = email). Vercel surprise bills can hit $500+ when a client gets traffic spike. Supabase free tier has hard limits — if you cross, the DB freezes. Set spend caps where possible.",
    tier: "soon",
    time: "30 min",
    cost: "$0",
  },
  {
    id: "supabase-backup",
    title: "Supabase nightly backup verified + tested",
    detail:
      "Supabase Pro plan auto-backs-up daily, retains 7 days. Free tier doesn't. Verify your project is on a plan with backups + test a restore to a staging project once so you know the restore actually works. Database loss without a tested backup = end of business.",
    tier: "soon",
    time: "45 min",
    cost: "$0–$25/mo",
  },
  {
    id: "w9-self-serve",
    title: "Build W-9 upload into /partners/apply (when you onboard rep #2)",
    detail:
      "When the second sales partner joins, paperwork-by-text doesn't scale. Upload field collects W-9 PDF + IC agreement signature on the apply form. Auto-saves to a partners/{id}/legal/ folder. Build BEFORE the second hire, not during.",
    tier: "soon",
    time: "2 hours",
    cost: "$0",
  },
  {
    id: "q3-q4-tax-reminders",
    title: "Calendar reminders for Q3 (Sept 15) + Q4 (Jan 15) estimated tax",
    detail:
      "Set both NOW so neither gets missed. Each reminder fires 10 days before the due date so you have time to compute the YTD-net × 25% number. Calendar invite or phone alarm — pick the one you'll actually see.",
    tier: "soon",
    time: "5 min",
    cost: "$0",
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
      "You have them on the site (auto-generated). Worth one attorney review at scale — checks that they actually cover what your AI Marketing System does (lead capture, AI copy generation, partner program data flows, Madie's calling, voicemail recording).",
    tier: "someday",
    time: "1 hour to set up",
    cost: "$200–400",
  },
  {
    id: "s-corp-election",
    title: "S-corp election analysis (2027 tax year)",
    detail:
      "When net profit clears ~$80K/yr, electing S-corp status saves ~$5-10k/yr in self-employment tax (split income into salary + distribution). Costs ~$500/yr in extra payroll/filing complexity. CPA can run the breakeven math. Decide for the 2027 tax year by Mar 15, 2027.",
    tier: "someday",
    time: "30 min with CPA",
    cost: "varies",
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
