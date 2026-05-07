"use client";

import { useState, useEffect } from "react";
import { Phone, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";
import MeyerMark from "./meyer-mark";

/**
 * StickyNav — Meyer Electric LLC site header with mobile hamburger.
 *
 * Dark variant: pure near-black bg with a thin yellow accent border on
 * scroll. Inline lightning-bolt SVG logo (yellow) + MEYER ELECTRIC
 * wordmark (white) — matches the screenshot template's logo treatment.
 * Their existing site uses a blue plug-in-circle logo; per Ben's brief
 * we keep the brand identity but recolor to the new yellow-on-black
 * palette.
 */

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#powerwall", label: "Tesla Powerwall" },
  { href: "#generators", label: "Generators" },
  { href: "#why-us", label: "Why Us" },
  { href: "#contact", label: "Contact" },
];

const PHONE_DISPLAY = "(360) 477-2202";
const PHONE_HREF = "tel:+13604772202";
const ACCENT = "#facc15";

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
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: "rgba(10, 10, 10, 0.92)",
        borderColor: "rgba(250, 204, 21, 0.18)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
        {/* Logo lockup — Meyer plug-in-circle mark (recolored
            yellow→orange) + MEYER ELECTRIC wordmark. */}
        <a
          href="#top"
          className="flex items-center gap-3 min-w-0"
          aria-label="Meyer Electric LLC"
        >
          <MeyerMark size={36} className="shrink-0" />
          <span
            className="flex flex-col leading-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="text-[15px] sm:text-[17px] font-bold tracking-wide">
              MEYER ELECTRIC
            </span>
            <span
              className="hidden sm:block text-[10px] sm:text-[10px] tracking-[0.24em] uppercase font-medium text-white/55"
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
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side: phone + CTA */}
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href={PHONE_HREF}
            className="hidden sm:inline-flex items-center gap-2 text-white/85 hover:text-white text-[14px] font-semibold transition-colors"
          >
            <Phone size={16} weight="fill" style={{ color: ACCENT }} />
            <span>{PHONE_DISPLAY}</span>
          </a>
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-2 px-5 h-10 rounded-md font-bold text-[13px] uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.35)]"
            style={{
              background: ACCENT,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Get a Quote
            <ArrowRight size={14} weight="bold" />
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md text-white/90 hover:bg-white/10 transition-colors"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <List size={26} weight="bold" />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 backdrop-blur-md flex flex-col"
          style={{ background: "rgba(5, 5, 5, 0.97)" }}
        >
          <div className="flex items-center justify-between px-5 sm:px-8 h-16 sm:h-20 border-b border-white/10">
            <span
              className="flex items-center gap-3 text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <MeyerMark size={32} flat />
              <span className="text-[15px] font-bold tracking-wide">
                MEYER ELECTRIC
              </span>
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center w-11 h-11 rounded-md text-white/90 hover:bg-white/10"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
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
                className="block py-4 text-2xl font-semibold text-white border-b border-white/10"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="p-6 space-y-3 border-t border-white/10">
            <a
              href={PHONE_HREF}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-md text-white border border-white/15 hover:bg-white/5 font-semibold"
            >
              <Phone size={18} weight="fill" style={{ color: ACCENT }} />
              {PHONE_DISPLAY}
            </a>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-md font-bold uppercase tracking-wide text-black"
              style={{ background: ACCENT, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Get a Quote
              <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
