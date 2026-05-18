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
  // Bespoke paving mark — a perspective road (top-down view of asphalt
  // receding into the distance) with center stripes + copper edge
  // highlights. Tells the brand story in one glance, distinct from any
  // generic trade-business circle-icon. The whole point of Peninsula
  // Paving is roads, so the logo IS a road.
  const unique = flat ? "flat" : "lit";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {!flat && (
          <radialGradient id={`pp-mark-glow-${unique}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#ea580c" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>
        )}
        <linearGradient id={`pp-mark-asphalt-${unique}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="100%" stopColor="#0c0908" />
        </linearGradient>
      </defs>

      {!flat && (
        <circle cx="24" cy="24" r="22" fill={`url(#pp-mark-glow-${unique})`} />
      )}

      {/* Asphalt road — perspective trapezoid. Narrow top (vanishing
          point at the top of the badge), wide bottom (foreground). */}
      <path
        d="M 18,7 L 30,7 L 42,41 L 6,41 Z"
        fill={`url(#pp-mark-asphalt-${unique})`}
        stroke={ACCENT}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Copper edge highlight strips — paint inside the road edges,
          parallel to the asphalt sides. Reads as the warm sunset light
          catching the curb. */}
      <path
        d="M 19,10 L 10,38"
        stroke="#fb923c"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M 29,10 L 38,38"
        stroke="#fb923c"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Center-line stripes — three white dashes, tapered for
          perspective so the eye reads "road receding into distance".
          Widths: 2 → 3.5 → 5 from far to near. */}
      <rect
        x="22.75"
        y="11.5"
        width="2.5"
        height="3"
        rx="0.3"
        fill="#f8fafc"
        opacity="0.95"
      />
      <rect
        x="22.2"
        y="18.5"
        width="3.6"
        height="4"
        rx="0.4"
        fill="#f8fafc"
        opacity="0.95"
      />
      <rect
        x="21.4"
        y="27"
        width="5.2"
        height="5"
        rx="0.5"
        fill="#f8fafc"
        opacity="0.95"
      />
      <rect
        x="20.4"
        y="35.5"
        width="7.2"
        height="4.5"
        rx="0.6"
        fill="#f8fafc"
        opacity="0.92"
      />
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
          background: "rgba(254, 253, 251, 0.92)",
          borderColor: "rgba(234, 88, 12, 0.20)",
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
              className="flex flex-col leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1c1410" }}
            >
              <span className="text-[15px] sm:text-[17px] font-bold tracking-wide">
                PENINSULA PAVING
              </span>
              <span
                className="hidden sm:block text-[10px] sm:text-[10px] tracking-[0.24em] uppercase font-medium"
                style={{ color: "rgba(28, 20, 16, 0.55)" }}
              >
                Olympic Peninsula · Since 1985
              </span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors"
                style={{ color: "rgba(28, 20, 16, 0.78)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#1c1410"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(28, 20, 16, 0.78)"; }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={PHONE_HREF}
              className="hidden sm:inline-flex items-center gap-2 text-[14px] font-semibold transition-colors"
              style={{ color: "#1c1410" }}
            >
              <Phone size={16} weight="fill" style={{ color: ACCENT }} />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 px-5 h-10 rounded-md font-bold text-[13px] uppercase tracking-wide text-white transition-all hover:brightness-110 active:scale-95 shadow-[0_4px_14px_rgba(234,88,12,0.35)]"
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
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md transition-colors"
              style={{ color: "#1c1410" }}
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
          style={{ background: "rgba(254, 253, 251, 0.98)" }}
        >
          <div
            className="flex items-center justify-between px-5 sm:px-8 h-16 sm:h-20 border-b"
            style={{ borderColor: "rgba(28, 20, 16, 0.08)" }}
          >
            <span
              className="flex items-center gap-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1c1410" }}
            >
              <PavingMark size={32} flat />
              <span className="text-[15px] font-bold tracking-wide">
                PENINSULA PAVING
              </span>
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center w-11 h-11 rounded-md"
              style={{ color: "#1c1410" }}
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
                className="block py-4 text-2xl font-semibold border-b"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "#1c1410",
                  borderColor: "rgba(28, 20, 16, 0.10)",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div
            className="p-6 space-y-3 border-t"
            style={{ borderColor: "rgba(28, 20, 16, 0.10)" }}
          >
            <a
              href={PHONE_HREF}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-md border font-semibold"
              style={{
                color: "#1c1410",
                borderColor: "rgba(28, 20, 16, 0.15)",
              }}
            >
              <Phone size={18} weight="fill" style={{ color: ACCENT }} />
              {PHONE_DISPLAY}
            </a>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-md font-bold uppercase tracking-wide text-white"
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
