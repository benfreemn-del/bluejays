"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { Phone, List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * StickyNav — Mt View's minimal editorial header.
 *
 * v4 redesign (2026-05-19): no filled CTA, no green accent. Wordmark on
 * the left, 4 anchors center on desktop, phone on the right. Hamburger
 * collapses the same 4 anchors below lg. Underlined hover state in
 * Moss. Pure typography header — the page itself does the selling.
 */

type Props = {
  businessName: string;
  logoSrc: string;
  phoneDisplay: string;
  phoneHref: string;
};

// Editorial nav — 4 items max. "Work" first to signal portfolio framing.
const NAV_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#practice", label: "Practice" },
  { href: "#about", label: "About" },
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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#F5F1E8]/85 border-b border-[#1C1F1A]/8">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 h-20 sm:h-24 flex items-center justify-between gap-6">
        {/* Wordmark — promoted to give the brand more presence in the header. */}
        <a href="#top" className="flex items-center gap-3 sm:gap-4 min-w-0 group">
          <img
            src={logoSrc}
            alt={businessName}
            className="h-12 sm:h-16 w-auto opacity-95 group-hover:opacity-100 transition-opacity"
          />
          <span className="hidden md:block font-[family-name:var(--font-playfair)] text-[20px] sm:text-[22px] tracking-tight text-[#1C1F1A] leading-[1.05]">
            Mountain View
            <span className="block text-[10px] tracking-[0.22em] uppercase text-[#A8A294] font-[family-name:var(--font-inter)] font-medium mt-1">
              Landscape &amp; Design
            </span>
          </span>
        </a>

        {/* Desktop anchors — quiet underline hover */}
        <nav className="hidden lg:flex items-center gap-10 font-[family-name:var(--font-inter)] text-[13px] tracking-wide text-[#1C1F1A]/75">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative hover:text-[#1C1F1A] transition-colors after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:bg-[#3E4A36] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right rail — just the phone, no filled CTA */}
        <div className="flex items-center gap-2">
          <a
            href={phoneHref}
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 -mr-1 text-[#1C1F1A] hover:bg-[#1C1F1A]/5 transition rounded-full"
            aria-label={`Call ${phoneDisplay}`}
          >
            <Phone size={17} weight="duotone" />
          </a>
          <a
            href={phoneHref}
            className="hidden sm:inline-flex items-center gap-2 font-[family-name:var(--font-inter)] text-[13px] font-medium text-[#1C1F1A] hover:text-[#3E4A36] transition-colors"
          >
            <Phone size={15} weight="duotone" />
            {phoneDisplay}
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-[#1C1F1A] hover:bg-[#1C1F1A]/5 transition"
          >
            <List size={22} weight="bold" />
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu — editorial typographic stack */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-[#F5F1E8] flex flex-col">
          <div className="h-20 sm:h-24 px-6 sm:px-10 flex items-center justify-between border-b border-[#1C1F1A]/10">
            <a
              href="#top"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
            >
              <img src={logoSrc} alt={businessName} className="h-12 w-auto" />
              <span className="font-[family-name:var(--font-playfair)] text-[16px] tracking-tight text-[#1C1F1A]">
                Mountain View
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center justify-center w-10 h-10 -mr-2 text-[#1C1F1A] hover:bg-[#1C1F1A]/5 transition"
            >
              <X size={22} weight="bold" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col px-6 sm:px-10 py-10 gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-[family-name:var(--font-playfair)] font-light text-[44px] sm:text-[56px] text-[#1C1F1A] py-3 border-b border-[#1C1F1A]/10 hover:text-[#3E4A36] transition-colors leading-none tracking-tight"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="px-6 sm:px-10 pb-10 pt-8 border-t border-[#1C1F1A]/10 space-y-4">
            <a
              href={phoneHref}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 font-[family-name:var(--font-inter)] text-[15px] font-medium text-[#1C1F1A]"
            >
              <Phone size={16} weight="duotone" />
              {phoneDisplay}
            </a>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="block font-[family-name:var(--font-inter)] text-[14px] tracking-wide text-[#3E4A36] underline underline-offset-4 decoration-1"
            >
              Request a site visit →
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
