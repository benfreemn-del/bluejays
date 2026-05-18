"use client";

import { useState, useEffect } from "react";
import { Phone, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * StickyNav — Peninsula Paving & Excavating site header.
 *
 * Dark variant: pure near-black bg with a thin copper accent border on
 * scroll. Inline asphalt-roller SVG mark (copper) + PENINSULA PAVING
 * wordmark (white). Mobile hamburger pattern carried over from
 * meyer-electric/sticky-nav (lessons-learned: menu overlay must be a
 * SIBLING of <header> because backdrop-blur creates a stacking context
 * that traps fixed children).
 */

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "Our Process" },
  { href: "#why-us", label: "Why Us" },
  { href: "#service-area", label: "Service Area" },
  { href: "#contact", label: "Contact" },
];

const PHONE_DISPLAY = "(360) 477-7015";
const PHONE_HREF = "tel:+13604777015";
const ACCENT = "#ea580c";

function PavingMark({ size = 36, flat = false }: { size?: number; flat?: boolean }) {
  // Stylized asphalt-roller mark — circle "drum" with horizontal
  // motion lines representing fresh paving. Copper on dark.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {!flat && (
        <defs>
          <radialGradient id="pp-mark-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {!flat && <circle cx="24" cy="24" r="22" fill="url(#pp-mark-glow)" />}
      {/* Roller drum */}
      <circle
        cx="24"
        cy="20"
        r="11"
        stroke={ACCENT}
        strokeWidth="2.5"
        fill="none"
      />
      {/* Drum inner ring */}
      <circle cx="24" cy="20" r="5" stroke={ACCENT} strokeWidth="1.5" fill="none" />
      {/* Center dot */}
      <circle cx="24" cy="20" r="1.5" fill={ACCENT} />
      {/* Fresh asphalt lines below */}
      <rect x="6" y="35" width="36" height="2" rx="1" fill={ACCENT} opacity="0.9" />
      <rect x="10" y="40" width="28" height="1.5" rx="0.75" fill={ACCENT} opacity="0.55" />
      <rect x="14" y="44" width="20" height="1.2" rx="0.6" fill={ACCENT} opacity="0.3" />
    </svg>
  );
}

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
          background: "rgba(10, 10, 10, 0.92)",
          borderColor: "rgba(234, 88, 12, 0.18)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
          <a
            href="#top"
            className="flex items-center gap-3 min-w-0"
            aria-label="Peninsula Paving & Excavating"
          >
            <PavingMark size={36} />
            <span
              className="flex flex-col leading-tight text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="text-[15px] sm:text-[17px] font-bold tracking-wide">
                PENINSULA PAVING
              </span>
              <span className="hidden sm:block text-[10px] sm:text-[10px] tracking-[0.24em] uppercase font-medium text-white/55">
                Olympic Peninsula · Since 1985
              </span>
            </span>
          </a>

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
              className="hidden sm:inline-flex items-center gap-2 px-5 h-10 rounded-md font-bold text-[13px] uppercase tracking-wide text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(234,88,12,0.35)]"
              style={{
                background: ACCENT,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Free Estimate
              <ArrowRight size={14} weight="bold" />
            </a>

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
      </header>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[60] backdrop-blur-md flex flex-col"
          style={{ background: "rgba(5, 5, 5, 0.97)" }}
        >
          <div className="flex items-center justify-between px-5 sm:px-8 h-16 sm:h-20 border-b border-white/10">
            <span
              className="flex items-center gap-3 text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <PavingMark size={32} flat />
              <span className="text-[15px] font-bold tracking-wide">
                PENINSULA PAVING
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
              Free Estimate
              <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
