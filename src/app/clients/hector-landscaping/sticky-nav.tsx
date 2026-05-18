"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { Phone, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * StickyNav — Hector Landscaping's site header with mobile hamburger.
 *
 * Was a server component with `lg:hidden` on the 5 anchor links —
 * meant phones / tablets had no way to jump to Services / Work /
 * About / Service Area / Contact mid-scroll. Visual review (2026-05-02)
 * flagged this as the single biggest "Wix-template" feel on the page.
 *
 * This client-component version adds a hamburger that toggles a stacked
 * mobile menu. Closes on link tap and on ESC.
 */
type Props = {
  businessName: string;
  logoSrc: string;
  phoneDisplay: string;
  phoneHref: string;
};

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#service-area", label: "Service Area" },
  { href: "#contact", label: "Contact" },
];

export default function StickyNav({
  businessName,
  logoSrc,
  phoneDisplay,
  phoneHref,
}: Props) {
  const [open, setOpen] = useState(false);

  // ESC closes mobile menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while menu is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Logo background blend (locked 2026-05-18 — Ben polish #3):
  // The Squarespace JPG has a baked-in pure-white (255,255,255)
  // background. The header was bg-white/95 (95% opaque white over
  // dark page bg) which gave it a slightly grayish tint — visibly
  // different from the logo's pure white = "logo on a square" effect.
  //
  // Fix: header bg-white (fully opaque) + mix-blend-mode: multiply
  // on the logo. Multiply blends each logo pixel × header pixel:
  //   - white pixels (255) × white header = white (invisible)
  //   - dark green pixels × white = dark green (visible)
  // Net result: logo white background disappears entirely, only the
  // brand mark renders. Pixel-perfect color match, no JPG transparency
  // needed. Same trick used for product logos on white promo banners.
  //
  // Filter kept: nudges logo green toward header dark-green #1a2e1a.
  // Logo size: h-14/16/20 (40-80px) — bumped from h-10/12 in polish #1.
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white border-b border-[#1a2e1a]/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-20 sm:h-24 flex items-center justify-between gap-6">
        <a
          href="#top"
          className="flex items-center gap-3 sm:gap-4 min-w-0"
          aria-label={businessName}
        >
          <img
            src={logoSrc}
            alt={businessName}
            className="h-14 sm:h-16 lg:h-20 w-auto"
            style={{
              // Multiply blend = logo's white bg becomes invisible
              // against the white header. Filter chain nudges green
              // toward header dark-green #1a2e1a.
              mixBlendMode: "multiply",
              filter: "contrast(1.05) saturate(0.85) hue-rotate(-8deg)",
            }}
          />
          <span className="hidden sm:block font-serif text-[15px] sm:text-[17px] tracking-tight text-[#1a2e1a] leading-tight whitespace-nowrap">
            Hector Landscaping
            <br />
            <span className="text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#5a6a4f] font-sans">
              &amp; Design · Renton, WA
            </span>
          </span>
        </a>

        {/* Desktop anchor links — visible from lg up */}
        <nav className="hidden lg:flex items-center gap-8 text-[13px] tracking-wide text-[#1a1612]/80">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-[#1a2e1a] transition"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right rail — phone, primary CTA, hamburger (mobile only) */}
        <div className="flex items-center gap-3">
          {/* Icon-only phone tap below sm — keeps the primary CTA reachable
              in one tap on iPhone SE-width devices instead of buried in the
              hamburger menu. */}
          <a
            href={phoneHref}
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 -mr-1 text-[#1a2e1a] hover:bg-[#1a2e1a]/5 transition rounded-full"
            aria-label={`Call ${phoneDisplay}`}
          >
            <Phone size={18} weight="fill" />
          </a>
          <a
            href={phoneHref}
            className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium text-[#1a2e1a] hover:opacity-80"
          >
            <Phone size={16} weight="fill" />
            {phoneDisplay}
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 bg-[#1a2e1a] text-[#f8f5ef] px-4 py-2 text-[13px] font-medium tracking-wide hover:bg-[#0d1a0d] transition"
          >
            Get an estimate
            <ArrowRight size={14} weight="bold" />
          </a>
          {/* Hamburger — only shown below lg, where the desktop nav is hidden */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-[#1a2e1a] hover:bg-[#1a2e1a]/5 transition"
          >
            <List size={22} weight="bold" />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay — full-screen list when open */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-[#f8f5ef] flex flex-col">
          <div className="h-20 sm:h-24 px-5 sm:px-8 flex items-center justify-between border-b border-[#1a2e1a]/10">
            <a href="#top" onClick={() => setOpen(false)} className="flex items-center gap-3" aria-label={businessName}>
              <img
                src={logoSrc}
                alt={businessName}
                className="h-14 w-auto"
                style={{
                  mixBlendMode: "multiply",
                  filter: "contrast(1.05) saturate(0.85) hue-rotate(-8deg)",
                }}
              />
              <span className="font-serif text-[16px] tracking-tight text-[#1a2e1a]">
                Hector Landscaping
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center justify-center w-10 h-10 -mr-2 text-[#1a2e1a] hover:bg-[#1a2e1a]/5 transition"
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
                className="font-serif text-[28px] sm:text-[34px] text-[#1a2e1a] py-3 border-b border-[#1a2e1a]/10 hover:text-[#5a6a4f] transition"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="px-5 sm:px-8 pb-10 pt-6 border-t border-[#1a2e1a]/10 space-y-3">
            <a
              href={phoneHref}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#1a2e1a]"
            >
              <Phone size={16} weight="fill" />
              {phoneDisplay}
            </a>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#1a2e1a] text-[#f8f5ef] px-6 py-4 text-[14px] font-medium tracking-wide hover:bg-[#0d1a0d] transition"
            >
              Get a free estimate
              <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
