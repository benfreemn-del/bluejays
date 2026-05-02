"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { Phone, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * StickyNav — Mt View's site header with mobile hamburger.
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

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f5ef]/85 border-b border-[#1a2e1a]/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3 min-w-0">
          <img
            src={logoSrc}
            alt={businessName}
            className="h-9 sm:h-11 w-auto"
          />
          <span className="hidden md:block font-serif text-[15px] tracking-tight text-[#1a2e1a] leading-tight">
            Mountain View
            <br />
            <span className="text-[12px] tracking-[0.18em] uppercase text-[#5a6a4f]">
              Landscape &amp; Design
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
          <div className="h-16 sm:h-20 px-5 sm:px-8 flex items-center justify-between border-b border-[#1a2e1a]/10">
            <a href="#top" onClick={() => setOpen(false)} className="flex items-center gap-3">
              <img src={logoSrc} alt={businessName} className="h-9 w-auto" />
              <span className="font-serif text-[15px] tracking-tight text-[#1a2e1a]">
                Mountain View
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
