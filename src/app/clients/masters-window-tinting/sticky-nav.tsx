"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { Phone, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * StickyNav — Masters Window Tinting site header with mobile hamburger.
 *
 * Dark variant of the hector-landscaping pattern. Pure black bg with
 * a thin chrome border. Logo proxied through /api/image-proxy so the
 * Wix-style CDN that hosts it can't expire on us.
 */
type Props = {
  businessName: string;
  logoSrc: string;
  phoneDisplay: string;
  phoneHref: string;
};

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#tint", label: "Tint" },
  { href: "#ceramic", label: "Ceramic Pro" },
  { href: "#reviews", label: "Reviews" },
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
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: "rgba(10, 10, 10, 0.92)",
        borderColor: "rgba(203, 213, 225, 0.12)",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
        <a
          href="#top"
          className="flex items-center gap-3 min-w-0"
          aria-label={businessName}
        >
          <img
            src={logoSrc}
            alt={businessName}
            className="h-9 sm:h-11 w-auto object-contain"
            style={{ filter: "drop-shadow(0 0 12px rgba(14, 165, 233, 0.25))" }}
          />
          <span
            className="hidden sm:flex flex-col text-white leading-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            <span className="text-[15px] sm:text-[17px] font-bold tracking-wide uppercase">
              Masters Window Tinting
            </span>
            <span
              className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-medium"
              style={{ color: "#94a3b8" }}
            >
              West Babylon, NY · Long Island
            </span>
          </span>
        </a>

        {/* Desktop anchor links */}
        <nav
          className="hidden lg:flex items-center gap-8 text-[13px] tracking-[0.12em] uppercase font-semibold"
          style={{ color: "rgba(255, 255, 255, 0.78)" }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-white transition-colors"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right rail */}
        <div className="flex items-center gap-3">
          <a
            href={phoneHref}
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 -mr-1 rounded-full text-white"
            style={{ background: "rgba(14, 165, 233, 0.15)" }}
            aria-label={`Call ${phoneDisplay}`}
          >
            <Phone size={18} weight="fill" />
          </a>
          <a
            href={phoneHref}
            className="hidden sm:inline-flex items-center gap-2 text-[13px] font-semibold text-white hover:opacity-80 tracking-wide"
          >
            <Phone size={15} weight="fill" style={{ color: "#0ea5e9" }} />
            {phoneDisplay}
          </a>
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase px-5 py-2.5 transition-all"
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
              color: "white",
              fontFamily: "'Barlow Condensed', sans-serif",
              boxShadow: "0 4px 14px rgba(29, 78, 216, 0.4)",
            }}
          >
            Get a Quote
            <ArrowRight size={13} weight="bold" />
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-white"
          >
            <List size={22} weight="bold" />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[60] flex flex-col"
          style={{ background: "#0a0a0a" }}
        >
          <div
            className="h-16 sm:h-20 px-5 sm:px-8 flex items-center justify-between border-b"
            style={{ borderColor: "rgba(203, 213, 225, 0.12)" }}
          >
            <a
              href="#top"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
              aria-label={businessName}
            >
              <img src={logoSrc} alt={businessName} className="h-9 w-auto object-contain" />
              <span
                className="text-[15px] font-bold tracking-wide text-white uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Masters Window Tinting
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center justify-center w-10 h-10 -mr-2 text-white"
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
                className="text-[28px] sm:text-[34px] text-white py-3 border-b font-bold uppercase tracking-wide"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  borderColor: "rgba(203, 213, 225, 0.1)",
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div
            className="px-5 sm:px-8 pb-10 pt-6 border-t space-y-3"
            style={{ borderColor: "rgba(203, 213, 225, 0.12)" }}
          >
            <a
              href={phoneHref}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-white"
            >
              <Phone size={16} weight="fill" style={{ color: "#0ea5e9" }} />
              {phoneDisplay}
            </a>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 px-6 py-4 text-[14px] font-bold tracking-[0.18em] uppercase transition-all"
              style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
                color: "white",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              Get a Free Quote
              <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
