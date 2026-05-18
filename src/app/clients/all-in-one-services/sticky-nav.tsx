"use client";

import { useState, useEffect } from "react";
import { Phone, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";
import AIOSMark from "./aios-mark";

/**
 * StickyNav — All In One Service's LLC site header with mobile hamburger.
 *
 * Dark variant: pure near-black bg with a thin copper-amber accent
 * border on scroll. AIOS shield mark + "ALL IN ONE SERVICES" wordmark
 * + Licensed · Bonded · Insured eyebrow.
 *
 * Same structural pattern as Meyer Electric's sticky-nav (proven —
 * already shipped in production), recolored to the copper-amber AIOS
 * palette and re-keyed to the AIOS section anchors.
 */

const NAV_LINKS = [
  { href: "#transformations", label: "Before / After" },
  { href: "#projects", label: "Projects" },
  { href: "#services", label: "What We Build" },
  { href: "#timeline", label: "Timeline" },
  { href: "#voices", label: "Reviews" },
  { href: "#estimate", label: "Free Estimate" },
];

const PHONE_DISPLAY = "(360) 477-6859";
const PHONE_HREF = "tel:+13604776859";

// PNW Heritage palette (matches page.tsx)
const PAPER = "#f5ede0";
const ESPRESSO = "#1a1612";
const MOSS = "#2d4a35";
const COPPER = "#b45309";
const COPPER_GOLD = "#fbbf24";

export default function StickyNav() {
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
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: "rgba(245, 237, 224, 0.86)", // Paper @ 86% (translucent blur)
          borderColor: "rgba(26, 22, 18, 0.12)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
          <a
            href="#top"
            className="flex items-center gap-3 min-w-0"
            aria-label="All In One Service's LLC"
          >
            <AIOSMark size={38} className="shrink-0" />
            <span
              className="flex flex-col leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: ESPRESSO }}
            >
              <span className="text-[14px] sm:text-[16px] font-bold tracking-wide">
                ALL IN ONE SERVICES
              </span>
              <span
                className="hidden sm:block text-[10px] sm:text-[10px] tracking-[0.24em] uppercase font-medium"
                style={{ color: MOSS }}
              >
                Licensed · Bonded · Insured
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-opacity hover:opacity-65"
                style={{ color: ESPRESSO }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side: phone + CTA */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={PHONE_HREF}
              className="hidden sm:inline-flex items-center gap-2 text-[14px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: ESPRESSO }}
            >
              <Phone size={16} weight="fill" style={{ color: MOSS }} />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              href="#estimate"
              className="hidden sm:inline-flex items-center gap-2 px-5 h-10 rounded-md font-bold text-[13px] uppercase tracking-wide transition-all hover:brightness-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${COPPER_GOLD} 0%, ${COPPER} 100%)`,
                color: "#1a1612",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 4px 14px rgba(180, 83, 9, 0.30)",
              }}
            >
              Free Estimate
              <ArrowRight size={14} weight="bold" />
            </a>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md transition-opacity hover:opacity-70"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              style={{ color: ESPRESSO }}
            >
              <List size={26} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay — sibling of <header>, NOT descendant
          (Meyer-pattern fix for backdrop-filter containing-block issue).
          Recolored to PNW Heritage cream theme. */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[60] backdrop-blur-md flex flex-col"
          style={{ background: "rgba(245, 237, 224, 0.97)" }}
        >
          <div
            className="flex items-center justify-between px-5 sm:px-8 h-16 sm:h-20 border-b"
            style={{ borderColor: "rgba(26, 22, 18, 0.10)" }}
          >
            <span
              className="flex items-center gap-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: ESPRESSO }}
            >
              <AIOSMark size={32} flat />
              <span className="text-[14px] font-bold tracking-wide">
                ALL IN ONE SERVICES
              </span>
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center w-11 h-11 rounded-md transition-opacity hover:opacity-65"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              style={{ color: ESPRESSO }}
            >
              <X size={26} weight="bold" />
            </button>
          </div>

          <nav className="flex-1 flex flex-col items-stretch px-6 py-8 gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-4 text-2xl font-semibold border-b"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: ESPRESSO,
                  borderColor: "rgba(26, 22, 18, 0.10)",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div
            className="p-6 space-y-3 border-t"
            style={{ borderColor: "rgba(26, 22, 18, 0.10)" }}
          >
            <a
              href={PHONE_HREF}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-md border font-semibold transition-opacity hover:opacity-80"
              style={{
                color: ESPRESSO,
                borderColor: "rgba(26, 22, 18, 0.15)",
              }}
            >
              <Phone size={18} weight="fill" style={{ color: MOSS }} />
              {PHONE_DISPLAY}
            </a>
            <a
              href="#estimate"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-md font-bold uppercase tracking-wide"
              style={{
                background: `linear-gradient(135deg, ${COPPER_GOLD} 0%, ${COPPER} 100%)`,
                color: ESPRESSO,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Free Estimate
              <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
