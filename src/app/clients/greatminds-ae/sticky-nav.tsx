"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { Phone, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * StickyNav for /clients/greatminds-ae.
 *
 * Pattern lifted from wholme-naturopathy/sticky-nav. Brand colors swapped
 * to Great Minds' warm ivory + deep navy + soft terracotta palette —
 * editorial-children's-education feel, not generic "kid stuff".
 */
type Props = {
  businessName: string;
  logoSrc: string;
  phoneDisplay: string;
  phoneHref: string;
};

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#classes", label: "Classes" },
  { href: "#curriculum", label: "Curriculum" },
  { href: "#day", label: "A Day Here" },
  { href: "#visit", label: "Visit" },
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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f7f3ec]/85 border-b border-[#0f1f3a]/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3 min-w-0">
          <img
            src={logoSrc}
            alt={businessName}
            className="h-9 sm:h-11 w-auto"
          />
          <span className="hidden md:block font-serif text-[18px] tracking-tight text-[#0f1f3a] leading-tight">
            Great Minds
            <span className="block text-[10px] tracking-[0.22em] uppercase text-[#6a7185] font-sans">
              Montessori &middot; Dubai
            </span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8 text-[13px] tracking-wide text-[#0f1f3a]/80">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-[#b56240] transition"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={phoneHref}
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 -mr-1 text-[#0f1f3a] hover:bg-[#0f1f3a]/5 transition rounded-full"
            aria-label={`Call ${phoneDisplay}`}
          >
            <Phone size={18} weight="fill" />
          </a>
          <a
            href={phoneHref}
            className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium text-[#0f1f3a] hover:opacity-80"
          >
            <Phone size={16} weight="fill" />
            {phoneDisplay}
          </a>
          <a
            href="#visit"
            className="inline-flex items-center gap-1.5 bg-[#0f1f3a] text-[#f7f3ec] px-4 py-2 text-[13px] font-medium tracking-wide hover:bg-[#0a1428] transition"
          >
            Book a tour
            <ArrowRight size={14} weight="bold" />
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-[#0f1f3a] hover:bg-[#0f1f3a]/5 transition"
          >
            <List size={22} weight="bold" />
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-[#f7f3ec] flex flex-col">
          <div className="h-16 sm:h-20 px-5 sm:px-8 flex items-center justify-between border-b border-[#0f1f3a]/10">
            <a
              href="#top"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
            >
              <img src={logoSrc} alt={businessName} className="h-10 w-auto" />
              <span className="font-serif text-[18px] tracking-tight text-[#0f1f3a]">
                Great Minds
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center justify-center w-10 h-10 -mr-2 text-[#0f1f3a] hover:bg-[#0f1f3a]/5 transition"
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
                className="font-serif text-[28px] sm:text-[34px] text-[#0f1f3a] py-3 border-b border-[#0f1f3a]/10 hover:text-[#b56240] transition"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="px-5 sm:px-8 pb-10 pt-6 border-t border-[#0f1f3a]/10 space-y-3">
            <a
              href={phoneHref}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#0f1f3a]"
            >
              <Phone size={16} weight="fill" />
              {phoneDisplay}
            </a>
            <a
              href="#visit"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#0f1f3a] text-[#f7f3ec] px-6 py-4 text-[14px] font-medium tracking-wide hover:bg-[#0a1428] transition"
            >
              Book a tour
              <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
