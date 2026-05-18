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
  // PP MONOGRAM MARK — highway-shield-style badge with the PP initials
  // inside + a yellow road-stripe accent along the bottom. The shield
  // shape ties to the Hwy 101 / Hwy 20 signs used on the route map,
  // and the road-stripe segment reads as paving DNA at a glance.
  // Clean, scales well at 32-36px in the nav, and reads instantly as
  // a brand mark rather than "another circle icon."
  const unique = flat ? "flat" : "lit";
  // Slightly wider than tall — same proportions as a US highway shield.
  return (
    <svg
      width={size}
      height={size * (48 / 56)}
      viewBox="0 0 56 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {!flat && (
          <radialGradient id={`pp-mark-glow-${unique}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#ea580c" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>
        )}
        <linearGradient id={`pp-mark-shield-${unique}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
      </defs>

      {!flat && (
        <ellipse cx="28" cy="24" rx="28" ry="22" fill={`url(#pp-mark-glow-${unique})`} />
      )}

      {/* Shield — US-highway-style: flat top, curved bottom that
          tapers to a point at the centre. The shape signals "road
          sign" without any explanatory ink. */}
      <path
        d="
          M 6,6
          L 50,6
          L 50,20
          Q 50,38 28,44
          Q 6,38 6,20
          Z
        "
        fill={`url(#pp-mark-shield-${unique})`}
        stroke="#ea580c"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Inner stroke for that stamped-metal road-sign feel */}
      <path
        d="
          M 9.5,9
          L 46.5,9
          L 46.5,20
          Q 46.5,35.5 28,40.8
          Q 9.5,35.5 9.5,20
          Z
        "
        fill="none"
        stroke="#ea580c"
        strokeOpacity="0.35"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* PP monogram, centered. Heavy Space Grotesk @ 22 with negative
          letter-spacing so the two P's read as a single sculpted form. */}
      <text
        x="28"
        y="29"
        textAnchor="middle"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="800"
        fontSize="20"
        letterSpacing="-1.2"
        fill="#c2410c"
      >
        PP
      </text>

      {/* Yellow road-stripe accent — 3 short dashes along the bottom
          of the shield, like a road centerline running across the
          badge. The visual hook that says "we pave roads." */}
      <rect x="14" y="37" width="6" height="1.6" rx="0.5" fill="#fbbf24" />
      <rect x="25" y="37" width="6" height="1.6" rx="0.5" fill="#fbbf24" />
      <rect x="36" y="37" width="6" height="1.6" rx="0.5" fill="#fbbf24" />
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
