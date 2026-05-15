"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { Phone, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * StickyNav for Family Care Cleaning.
 *
 * Warm-cream header with gold accents — mirrors the Hector pattern
 * (white header, dark CTA) but tuned for the citrus palette: cream
 * background, deep-leaf-green type, gold accent button.
 */
type Props = {
  businessName: string;
  logoSrc: string;
  phoneDisplay: string;
  phoneHref: string;
};

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#included", label: "What's Included" },
  { href: "#process", label: "How It Works" },
  { href: "#area", label: "Service Area" },
  { href: "#contact", label: "Contact" },
];

export default function StickyNav({
  businessName,
  logoSrc,
  phoneDisplay,
  phoneHref,
}: Props) {
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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#fdf8ec]/95 border-b border-[#2f5c24]/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
        <a
          href="#top"
          className="flex items-center gap-3 min-w-0"
          aria-label={businessName}
        >
          <img
            src={logoSrc}
            alt={businessName}
            className="h-11 sm:h-14 w-auto"
          />
          <span className="hidden sm:block font-serif text-[14px] sm:text-[16px] tracking-tight text-[#2f5c24] leading-tight whitespace-nowrap">
            Family Care Cleaning
            <br />
            <span className="text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#7a6a3a] font-sans">
              Cleaning with care · Olympic Peninsula
            </span>
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] tracking-wide text-[#1f2820]/75">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-[#2f5c24] transition"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right rail */}
        <div className="flex items-center gap-3">
          <a
            href={phoneHref}
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 -mr-1 text-[#2f5c24] hover:bg-[#2f5c24]/5 transition rounded-full"
            aria-label={`Call ${phoneDisplay}`}
          >
            <Phone size={18} weight="fill" />
          </a>
          <a
            href={phoneHref}
            className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium text-[#2f5c24] hover:opacity-80"
          >
            <Phone size={16} weight="fill" />
            {phoneDisplay}
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 bg-[#2f5c24] text-[#fdf8ec] px-4 py-2 text-[13px] font-medium tracking-wide hover:bg-[#1f3f17] transition rounded-full"
          >
            Free quote
            <ArrowRight size={14} weight="bold" />
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-[#2f5c24] hover:bg-[#2f5c24]/5 transition"
          >
            <List size={22} weight="bold" />
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-[#fdf8ec] flex flex-col">
          <div className="h-16 sm:h-20 px-5 sm:px-8 flex items-center justify-between border-b border-[#2f5c24]/10">
            <a
              href="#top"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
              aria-label={businessName}
            >
              <img src={logoSrc} alt={businessName} className="h-11 w-auto" />
              <span className="font-serif text-[15px] tracking-tight text-[#2f5c24]">
                Family Care Cleaning
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center justify-center w-10 h-10 -mr-2 text-[#2f5c24] hover:bg-[#2f5c24]/5 transition"
            >
              <X size={22} weight="bold" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col px-5 sm:px-8 py-8 gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-serif text-[28px] sm:text-[34px] text-[#2f5c24] py-3 border-b border-[#2f5c24]/10 hover:text-[#d99a0f] transition"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="px-5 sm:px-8 pb-10 pt-6 border-t border-[#2f5c24]/10 space-y-3">
            <a
              href={phoneHref}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#2f5c24]"
            >
              <Phone size={16} weight="fill" />
              {phoneDisplay}
            </a>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#2f5c24] text-[#fdf8ec] px-6 py-4 text-[14px] font-medium tracking-wide hover:bg-[#1f3f17] transition rounded-full"
            >
              Get a free quote
              <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
