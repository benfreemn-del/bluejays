"use client";

import { useState } from "react";

/**
 * PaymentLinksPanel — quick-paste card for the BlueJays admin dashboard.
 *
 * Three pre-stored Stripe Payment Link URLs the owner uses on sales calls:
 *   · AI Marketing System — Full-Pay $9,700
 *   · AI Marketing System — Milestone 1 of 3 ($3,500 today + invoices)
 *   · TEKKY / Zenith Sports — $2,500 / quarter (4 quarters = $10K)
 *
 * One click → URL on clipboard. No Stripe API calls — these are just stored
 * URLs that the owner pastes into the next text/email during a live call.
 */

type LinkRow = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  url: string | null;
  /** Visual accent — matches the existing dashboard palette. */
  accent: "violet" | "amber" | "emerald";
};

const PAYMENT_LINKS: LinkRow[] = [
  {
    id: "ai-system-full",
    emoji: "💎",
    title: "AI Marketing System · Full Pay",
    subtitle: "$9,700 · one-time · save $300 vs 3-pay",
    url: "https://buy.stripe.com/5kQeVf9gD60y9BlbdS04801",
    accent: "violet",
  },
  {
    id: "ai-system-milestone-1",
    emoji: "🎯",
    title: "AI Marketing System · Milestone 1 of 3",
    subtitle: "$3,500 today · then $3,500 (D30) + $3,000 (D60) via invoice",
    url: "https://buy.stripe.com/00wdRb78v4WubJt81G04802",
    accent: "amber",
  },
  {
    id: "tekky-quarterly",
    emoji: "⚽",
    title: "TEKKY / Zenith Sports · Quarterly Plan",
    subtitle: "$2,500 / qtr · 4 quarters · auto-stops at $10K",
    url: "https://buy.stripe.com/5kQ5kF2SfcoW3cX6XC04800",
    accent: "emerald",
  },
];

export default function PaymentLinksPanel() {
  const [justCopied, setJustCopied] = useState<string | null>(null);

  const copy = async (id: string, url: string | null) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setJustCopied(id);
      setTimeout(() => {
        setJustCopied((prev) => (prev === id ? null : prev));
      }, 1600);
    } catch {
      // Fallback: select-all in a temp textarea (older browsers).
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setJustCopied(id);
        setTimeout(() => setJustCopied(null), 1600);
      } catch {
        // give up silently
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-bold tracking-wider uppercase text-white">
          💳 Payment Links
        </h2>
        <a
          href="https://dashboard.stripe.com/payment-links"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
        >
          Stripe dashboard ↗
        </a>
      </div>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        One click → URL on clipboard. Paste into a text or email during a sales
        call. No customer record needed.
      </p>

      <ul className="space-y-2">
        {PAYMENT_LINKS.map((row) => {
          const accentBorder =
            row.accent === "violet"
              ? "border-violet-500/30 hover:border-violet-400"
              : row.accent === "amber"
                ? "border-amber-500/30 hover:border-amber-400"
                : "border-emerald-500/30 hover:border-emerald-400";
          const accentText =
            row.accent === "violet"
              ? "text-violet-300"
              : row.accent === "amber"
                ? "text-amber-300"
                : "text-emerald-300";
          const isCopied = justCopied === row.id;
          return (
            <li
              key={row.id}
              className={`rounded-xl border ${accentBorder} bg-slate-950/50 px-3 py-2.5 transition-colors`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">{row.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${accentText} leading-tight`}>
                    {row.title}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {row.subtitle}
                  </p>
                </div>
                {row.url ? (
                  <button
                    type="button"
                    onClick={() => copy(row.id, row.url)}
                    className={`shrink-0 text-[11px] font-bold uppercase tracking-wider rounded-md px-3 py-1.5 transition-colors ${
                      isCopied
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    {isCopied ? "✓ Copied" : "Copy URL"}
                  </button>
                ) : (
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-slate-600 italic">
                    not yet created
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[10px] text-slate-600 italic leading-relaxed mt-4">
        Stored URLs only — these are the public Stripe Payment Link URLs
        anyone with the link can pay through. To rotate or revoke, go to the
        Stripe dashboard. Update this panel after creating Milestone-1.
      </p>
    </section>
  );
}
