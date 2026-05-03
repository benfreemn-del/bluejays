"use client";

import { useState, useEffect } from "react";
import { ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * Sticky nav for /clients/riv-inc.
 *
 * SaaS-style — minimalist, monochrome on the wordmark, electric mint
 * accent for the CTA. Pattern matches zenith-sports/sticky-nav: mobile
 * menu rendered as a sibling of <header> (not a child) so the
 * backdrop-blur-md containing-block bug doesn't pin the menu to the
 * header height.
 */
type Props = {
  businessName: string;
};

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
  { href: "#team", label: "Team" },
];

export default function StickyNav({ businessName }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070a13]/85 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
          <a href="#top" className="flex items-center gap-2.5 min-w-0 group">
            {/* Wordmark — monogram cube + sans wordmark. Pure CSS so we
                aren't dependent on the live RIV logo asset (which lives
                behind their lazy-loaded Next image pipeline). */}
            <span
              aria-hidden
              className="inline-flex items-center justify-center w-8 h-8 rounded-md font-black text-[13px] tracking-tight text-[#070a13] transition group-hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, #7af0d4 0%, #5fd6c0 50%, #3aa890 100%)",
              }}
            >
              R
            </span>
            <div className="leading-tight">
              <div className="text-[14px] font-bold tracking-tight text-white">
                RIV
                <span className="text-[#7af0d4]">·</span>
              </div>
              <div className="text-[9px] tracking-[0.28em] uppercase text-white/45 font-semibold -mt-0.5">
                CibusCloud
              </div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] tracking-tight text-white/65 font-medium">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="hover:text-white transition"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 bg-[#7af0d4] text-[#070a13] px-4 py-2 text-[12px] font-bold tracking-tight hover:bg-white transition rounded-md"
            >
              Contact sales
              <ArrowRight size={13} weight="bold" />
            </a>
            <a
              href="#contact"
              className="sm:hidden inline-flex items-center gap-1.5 bg-[#7af0d4] text-[#070a13] px-3 py-1.5 text-[11px] font-bold tracking-tight rounded-md"
            >
              Contact
              <ArrowRight size={11} weight="bold" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-white hover:bg-white/5 transition cursor-pointer rounded-md"
            >
              <List size={20} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu rendered OUTSIDE <header> — see zenith-sports for the
          backdrop-filter containing-block rationale. */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-[#070a13] flex flex-col overflow-y-auto">
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
            <a
              href="#top"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5"
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-8 h-8 rounded-md font-black text-[13px] text-[#070a13]"
                style={{
                  background:
                    "linear-gradient(135deg, #7af0d4 0%, #5fd6c0 50%, #3aa890 100%)",
                }}
              >
                R
              </span>
              <span className="text-[14px] font-bold text-white">
                RIV<span className="text-[#7af0d4]">·</span>
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center justify-center w-10 h-10 -mr-2 text-white hover:bg-white/5 transition rounded-md"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col px-5 py-6 gap-0">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-[22px] sm:text-[28px] py-3.5 border-b border-white/10 text-white hover:text-[#7af0d4] transition font-bold tracking-tight"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="px-5 pb-10 pt-6 border-t border-white/10">
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#7af0d4] text-[#070a13] px-6 py-4 text-[14px] font-bold tracking-tight hover:bg-white transition rounded-md"
            >
              Contact sales — request a demo
              <ArrowRight size={16} weight="bold" />
            </a>
            <p className="mt-3 text-[11px] text-white/40 text-center">
              {businessName} · Tokyo, Japan
            </p>
          </div>
        </div>
      )}
    </>
  );
}
