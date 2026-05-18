"use client";

import { useState, useEffect } from "react";
import { Phone, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";
import ThriveMark from "./thrive-mark";

/**
 * StickyNav — Thrive Church Sequim site header with mobile hamburger.
 *
 * Light variant: warm cream translucent bg with a thin deep-teal accent
 * border. ThriveMark sunrise logo + "THRIVE" wordmark + "Sequim, WA"
 * eyebrow. Structurally identical to the Meyer Electric sticky-nav
 * (proven in production), recolored to the warm-light church palette
 * and re-keyed to Thrive's section anchors.
 */

// Absolute paths so the nav works from sub-pages (e.g. /volunteer)
// as well as the homepage — browser handles same-page anchor scroll
// vs cross-page navigate-and-scroll cleanly with the absolute form.
const HOME = "/clients/thrive-church-sequim";
const NAV_LINKS = [
  { href: `${HOME}#visit`, label: "Plan a Visit" },
  { href: `${HOME}#watch`, label: "Watch" },
  { href: `${HOME}#ministries`, label: "Ministries" },
  { href: `${HOME}#preschool`, label: "Preschool" },
  { href: `${HOME}#beliefs`, label: "Beliefs" },
  { href: `${HOME}/volunteer`, label: "Volunteer" },
  { href: `${HOME}#give`, label: "Give" },
];

const PHONE_DISPLAY = "(360) 683-7981";
const PHONE_HREF = "tel:+13606837981";

// Palette (matches page.tsx)
const CREAM = "#fbf7ee";
const INK = "#1b2922";
const TEAL = "#0d4f4a";
const TEAL_DEEP = "#0a3a36";
const AMBER = "#d97706";

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
          background: "rgba(251, 247, 238, 0.88)",
          borderColor: "rgba(13, 79, 74, 0.14)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
          <a
            href={HOME}
            className="flex items-center gap-3 min-w-0"
            aria-label="Thrive Church Sequim"
          >
            <ThriveMark size={40} className="shrink-0" />
            <span
              className="flex flex-col leading-tight"
              style={{ fontFamily: "'Fraunces', serif", color: INK }}
            >
              <span className="text-[18px] sm:text-[22px] font-semibold tracking-tight">
                THRIVE
              </span>
              <span
                className="hidden sm:block text-[10px] tracking-[0.28em] uppercase font-medium"
                style={{ color: TEAL, fontFamily: "'Inter', sans-serif" }}
              >
                Sequim, WA
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[14px] font-medium transition-colors"
                style={{ color: INK, opacity: 0.78 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.78")}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side: phone + CTA */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={PHONE_HREF}
              className="hidden sm:inline-flex items-center gap-2 text-[14px] font-semibold transition-colors"
              style={{ color: INK }}
            >
              <Phone size={16} weight="fill" style={{ color: AMBER }} />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              href={`${HOME}#connect`}
              className="hidden sm:inline-flex items-center gap-2 px-5 h-10 rounded-full font-semibold text-[13px] uppercase tracking-wide transition-all hover:brightness-110 active:scale-95"
              style={{
                background: TEAL,
                color: CREAM,
                boxShadow: "0 6px 20px -8px rgba(13, 79, 74, 0.55)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              I'm New
              <ArrowRight size={14} weight="bold" />
            </a>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md transition-colors hover:bg-black/5"
              style={{ color: INK }}
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <List size={26} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay — sibling of header (NOT child), so the
          header's backdrop-blur doesn't create a containing block that
          crops the fixed overlay. Same pattern Meyer uses. */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[60] backdrop-blur-md flex flex-col"
          style={{ background: "rgba(251, 247, 238, 0.98)" }}
        >
          <div
            className="flex items-center justify-between px-5 sm:px-8 h-16 sm:h-20 border-b"
            style={{ borderColor: "rgba(13, 79, 74, 0.14)" }}
          >
            <span
              className="flex items-center gap-3"
              style={{ fontFamily: "'Fraunces', serif", color: INK }}
            >
              <ThriveMark size={34} flat />
              <span className="text-[18px] font-semibold tracking-tight">
                THRIVE
              </span>
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center w-11 h-11 rounded-md hover:bg-black/5"
              style={{ color: INK }}
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
                  color: INK,
                  borderColor: "rgba(13, 79, 74, 0.12)",
                  fontFamily: "'Fraunces', serif",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div
            className="p-6 space-y-3 border-t"
            style={{ borderColor: "rgba(13, 79, 74, 0.14)" }}
          >
            <a
              href={PHONE_HREF}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-full border font-semibold"
              style={{
                color: INK,
                borderColor: "rgba(13, 79, 74, 0.25)",
              }}
            >
              <Phone size={18} weight="fill" style={{ color: AMBER }} />
              {PHONE_DISPLAY}
            </a>
            <a
              href={`${HOME}#connect`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-full font-bold uppercase tracking-wide"
              style={{
                background: TEAL,
                color: CREAM,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              I'm New
              <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
